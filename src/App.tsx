import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import { HostView } from './components/host/HostView';
import { PresentationView } from './components/presentation/PresentationView';
import { registerPopupWindow } from './utils/syncBridge';

export default function App() {
  const [isStandalonePresentation] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'presentation';
  });

  const openPopoutPresentation = () => {
    const url = `${window.location.origin}${window.location.pathname}?view=presentation`;
    const popup = window.open(url, 'OlympiaPresentation', 'width=1280,height=720,menubar=no,toolbar=no,location=no');
    if (popup) {
      registerPopupWindow(popup);
    }
  };

  // If this window was opened explicitly as presentation view
  if (isStandalonePresentation) {
    return (
      <GameProvider>
        <PresentationView />
      </GameProvider>
    );
  }

  return (
    <GameProvider>
      <HostView onOpenPresentationWindow={openPopoutPresentation} />
    </GameProvider>
  );
}
