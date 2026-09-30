import type { GameState } from '../types/game';

export const STORAGE_KEY = 'olympia_trivia_game_state_v4';
export const STORAGE_TIME_KEY = 'olympia_trivia_last_update_v4';
export const BROADCAST_CHANNEL_NAME = 'olympia_trivia_channel_v4';

export const WINDOW_ID = typeof window !== 'undefined'
  ? Math.random().toString(36).substring(2, 9)
  : 'server';

interface SyncPayload {
  type: 'OLYMPIA_STATE_UPDATE' | 'OLYMPIA_REQUEST_SYNC' | 'OLYMPIA_ACK_SYNC';
  payload?: GameState;
  senderId: string;
  timestamp: number;
}

// Set of connected popup windows opened from this window
const connectedPopups = new Set<Window>();

export function registerPopupWindow(win: Window | null, currentState?: GameState) {
  if (!win || win.closed) return;
  connectedPopups.add(win);

  // Send immediate sync to newly opened window
  if (currentState) {
    try {
      win.postMessage(
        {
          type: 'OLYMPIA_STATE_UPDATE',
          payload: currentState,
          senderId: WINDOW_ID,
          timestamp: Date.now(),
        } satisfies SyncPayload,
        '*'
      );
    } catch {
      // Ignore cross-origin error if any
    }
  }
}

let latestLocalTimestamp = 0;
let channel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch {
    channel = null;
  }
}

/**
 * Broadcast game state to all possible channels:
 * 1. BroadcastChannel (same origin)
 * 2. localStorage + storage event (same origin)
 * 3. Connected popup windows via postMessage (bypasses iframe partition)
 * 4. Window.opener via postMessage (if this is the popup)
 */
export function broadcastGameState(state: GameState, customTimestamp?: number) {
  if (typeof window === 'undefined') return;

  const timestamp = customTimestamp || Date.now();
  latestLocalTimestamp = timestamp;

  const message: SyncPayload = {
    type: 'OLYMPIA_STATE_UPDATE',
    payload: state,
    senderId: WINDOW_ID,
    timestamp,
  };

  // 1. LocalStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(STORAGE_TIME_KEY, String(timestamp));
  } catch {
    // ignore quota errors
  }

  // 2. BroadcastChannel
  if (channel) {
    try {
      channel.postMessage(message);
    } catch {
      // ignore
    }
  }

  // 3. Post to registered popups
  connectedPopups.forEach((popup) => {
    if (popup.closed) {
      connectedPopups.delete(popup);
    } else {
      try {
        popup.postMessage(message, '*');
      } catch {
        // ignore
      }
    }
  });

  // 4. Post to opener if we are the child window
  if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
    try {
      window.opener.postMessage(message, '*');
    } catch {
      // ignore
    }
  }

  // 5. Post to parent if we are inside an iframe
  if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
    try {
      window.parent.postMessage(message, '*');
    } catch {
      // ignore
    }
  }
}

/**
 * Subscribe to state updates from other windows/tabs.
 */
export function subscribeToRemoteUpdates(
  onUpdate: (state: GameState, timestamp: number) => void,
  getCurrentState: () => GameState
): () => void {
  if (typeof window === 'undefined') return () => {};

  let lastAppliedTimestamp = latestLocalTimestamp;

  const handleIncomingMessage = (data: unknown, source?: MessageEventSource | null) => {
    if (!data || typeof data !== 'object') return;
    const msg = data as Partial<SyncPayload>;

    // Ignore messages from self
    if (msg.senderId === WINDOW_ID) return;

    if (msg.type === 'OLYMPIA_REQUEST_SYNC') {
      // Someone requested current state, respond with our state
      const current = getCurrentState();
      const response: SyncPayload = {
        type: 'OLYMPIA_STATE_UPDATE',
        payload: current,
        senderId: WINDOW_ID,
        timestamp: Date.now(),
      };

      if (source && 'postMessage' in source) {
        try {
          (source as Window).postMessage(response, '*');
        } catch {}
      } else if (channel) {
        try {
          channel.postMessage(response);
        } catch {}
      }
      return;
    }

    if (msg.type === 'OLYMPIA_STATE_UPDATE' && msg.payload && typeof msg.timestamp === 'number') {
      if (msg.timestamp > lastAppliedTimestamp) {
        lastAppliedTimestamp = msg.timestamp;
        latestLocalTimestamp = msg.timestamp;
        onUpdate(msg.payload, msg.timestamp);
      }
    }
  };

  // 1. Listen on window.postMessage
  const onWindowMessage = (event: MessageEvent) => {
    // If message came from a popup or opener, track it
    if (event.source && typeof window !== 'undefined') {
      if (event.source === window.opener) {
        // Opener sent message
      } else if (event.source !== window) {
        try {
          connectedPopups.add(event.source as Window);
        } catch {}
      }
    }
    handleIncomingMessage(event.data, event.source);
  };
  window.addEventListener('message', onWindowMessage);

  // 2. Listen on BroadcastChannel
  let onChannelMessage: ((event: MessageEvent) => void) | null = null;
  if (channel) {
    onChannelMessage = (event: MessageEvent) => {
      handleIncomingMessage(event.data);
    };
    channel.addEventListener('message', onChannelMessage);
  }

  // 3. Listen on storage events (fires across same-origin tabs/windows)
  const onStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        const timeVal = parseInt(localStorage.getItem(STORAGE_TIME_KEY) || '0', 10) || Date.now();
        if (timeVal > lastAppliedTimestamp) {
          lastAppliedTimestamp = timeVal;
          latestLocalTimestamp = timeVal;
          onUpdate(parsed, timeVal);
        }
      } catch {
        // ignore parse error
      }
    }
  };
  window.addEventListener('storage', onStorageChange);

  // 4. Fallback interval check for storage timestamp
  const pollInterval = setInterval(() => {
    try {
      const storedTime = parseInt(localStorage.getItem(STORAGE_TIME_KEY) || '0', 10);
      if (storedTime > lastAppliedTimestamp) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          lastAppliedTimestamp = storedTime;
          latestLocalTimestamp = storedTime;
          onUpdate(parsed, storedTime);
        }
      }
    } catch {
      // ignore
    }
  }, 400);

  // Request sync immediately on mount
  const requestMsg: SyncPayload = {
    type: 'OLYMPIA_REQUEST_SYNC',
    senderId: WINDOW_ID,
    timestamp: Date.now(),
  };

  if (channel) {
    try {
      channel.postMessage(requestMsg);
    } catch {}
  }
  if (window.opener && !window.opener.closed) {
    try {
      window.opener.postMessage(requestMsg, '*');
    } catch {}
  }

  return () => {
    window.removeEventListener('message', onWindowMessage);
    if (channel && onChannelMessage) {
      channel.removeEventListener('message', onChannelMessage);
    }
    window.removeEventListener('storage', onStorageChange);
    clearInterval(pollInterval);
  };
}
