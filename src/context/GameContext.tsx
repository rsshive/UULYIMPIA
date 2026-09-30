import React, { useEffect, useReducer, useRef } from 'react';
import type { GameAction, GameState, Team } from '../types/game';
import { GameContext } from './context';
import {
  INITIAL_TEAMS,
  MOCK_OBSTACLE_DATA,
  MOCK_ROUND1_QUESTIONS,
  getCorrectOptionIndex,
} from '../data/mockQuestions';
import {
  playCorrect,
  playTick,
  playVictory,
  playWarning,
  playWrong,
  playObstacleBuzzer,
  startTimerSoundtrack,
  stopTimerSoundtrack,
  pauseTimerSoundtrack,
  resumeTimerSoundtrack,
} from '../utils/audio';
import {
  broadcastGameState,
  subscribeToRemoteUpdates,
  STORAGE_KEY,
} from '../utils/syncBridge';
import { calculateObstaclePoints } from '../utils/gameRules';

const INITIAL_STATE: GameState = {
  round: 1,
  phase: 'IDLE',
  isStandby: true, // Mặc định mở dự án ở màn hình chờ
  teams: INITIAL_TEAMS,
  activeTeamId: null,
  timerSeconds: MOCK_ROUND1_QUESTIONS[0].timeLimit,
  isTimerRunning: false,
  scoreModifier: 10,
  round1: {
    currentQuestionIndex: 0,
    questions: MOCK_ROUND1_QUESTIONS,
    selectedOptionIndex: null,
    lastResult: null,
    lastPointsAwarded: 0,
  },
  round2: {
    obstacle: MOCK_OBSTACLE_DATA,
    activeClueId: null,
    playedClueIds: [],
    obstacleSolvedBy: null,
    lastResult: null,
    lastPointsAwarded: 0,
  },
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SYNC_STATE':
      return action.state;

    case 'SET_STANDBY':
      return {
        ...state,
        isStandby: action.isStandby,
        isTimerRunning: false, // Dừng timer khi về standby
      };

    case 'SET_ROUND': {
      const newRound = action.round;
      const initialTimer = newRound === 1 
        ? state.round1.questions[state.round1.currentQuestionIndex]?.timeLimit || 10
        : 15;
      return {
        ...state,
        round: newRound,
        phase: 'IDLE',
        isStandby: true, // Khi chuyển vòng, tự động chuyển về màn hình chờ của vòng đó
        activeTeamId: null,
        isTimerRunning: false,
        timerSeconds: initialTimer,
        scoreModifier: newRound === 1 ? 10 : 10,
      };
    }

    case 'START_QUESTION': {
      let seconds = 10;
      if (state.round === 1) {
        seconds = state.round1.questions[state.round1.currentQuestionIndex]?.timeLimit || 10;
      } else if (state.round === 2 && state.round2.activeClueId !== null) {
        const clue = state.round2.obstacle.clues.find(c => c.id === state.round2.activeClueId);
        seconds = clue?.timeLimit || 15;
      }
      return {
        ...state,
        phase: 'QUESTION_ACTIVE',
        isStandby: false, // Tự động thoát màn hình chờ khi bắt đầu đọc câu hỏi
        activeTeamId: null,
        timerSeconds: seconds,
        isTimerRunning: true, // Bắt đầu timer ngay lập tức
        isTimerIntroDelaying: false,
        scoreModifier: 10,
        round1: {
          ...state.round1,
          selectedOptionIndex: null,
          lastResult: null,
          lastPointsAwarded: 0,
        },
        round2: {
          ...state.round2,
          lastResult: null,
          lastPointsAwarded: 0,
        },
      };
    }

    case 'BEGIN_COUNTDOWN':
      return {
        ...state,
        isTimerIntroDelaying: false,
        isTimerRunning: true,
      };

    case 'CHOOSE_OPTION': {
      const currentQ = state.round1.questions[state.round1.currentQuestionIndex];
      const correctIdx = getCorrectOptionIndex(currentQ);
      const isCorrect = action.optionIndex === correctIdx;
      if (isCorrect) {
        playCorrect();
      } else {
        playWrong();
      }
      return {
        ...state,
        phase: 'RESULT_REVEAL',
        isTimerRunning: false,
        isTimerIntroDelaying: false,
        round1: {
          ...state.round1,
          selectedOptionIndex: action.optionIndex,
          lastResult: isCorrect ? 'CORRECT' : 'WRONG',
          lastPointsAwarded: isCorrect ? 10 : 0,
        },
      };
    }

    case 'PAUSE_TIMER':
      return { ...state, isTimerRunning: false, isTimerIntroDelaying: false };

    case 'RESUME_TIMER':
      return { ...state, isTimerRunning: true, isTimerIntroDelaying: false };

    case 'RESET_TIMER':
      return {
        ...state,
        timerSeconds: action.seconds,
        isTimerRunning: false,
        isTimerIntroDelaying: false,
      };

    case 'TICK_TIMER': {
      if (!state.isTimerRunning) return state;
      if (state.timerSeconds <= 1) {
        // Hết giờ: không cắt ngang âm thanh, để soundtrack tiếp tục phát đến hết file!
        return {
          ...state,
          timerSeconds: 0,
          isTimerRunning: false,
          isTimerIntroDelaying: false,
          phase: 'RESULT_REVEAL',
          round1: {
            ...state.round1,
            lastResult: 'TIMEOUT',
            lastPointsAwarded: 0,
          },
          round2: {
            ...state.round2,
            lastResult: 'TIMEOUT',
            lastPointsAwarded: 0,
          },
        };
      }
      const newSec = state.timerSeconds - 1;
      if (newSec <= 3 && newSec > 0) {
        playWarning();
      } else {
        playTick();
      }
      return { ...state, timerSeconds: newSec };
    }

    case 'SELECT_TEAM_FOR_ANSWER':
      // Dừng timer khi host chọn đội giơ tay
      return {
        ...state,
        activeTeamId: action.teamId,
        phase: 'TEAM_ANSWERING',
        isTimerRunning: false,
      };

    case 'SUBMIT_ANSWER': {
      const points = action.pointsOverride ?? state.scoreModifier;
      const { isCorrect } = action;

      let updatedTeams = [...state.teams];
      if (isCorrect && state.activeTeamId) {
        playCorrect();
        updatedTeams = updatedTeams.map(t =>
          t.id === state.activeTeamId ? { ...t, score: t.score + points } : t
        );
      } else {
        playWrong();
      }

      // Nếu ở vòng 2 và đúng: tự động reveal mảnh ghép của gợi ý đang chọn
      let updatedObstacle = { ...state.round2.obstacle };
      if (state.round === 2 && isCorrect && state.round2.activeClueId !== null) {
        updatedObstacle = {
          ...updatedObstacle,
          clues: updatedObstacle.clues.map(c =>
            c.id === state.round2.activeClueId ? { ...c, isRevealed: true } : c
          ),
        };
      }

      return {
        ...state,
        teams: updatedTeams,
        phase: 'RESULT_REVEAL',
        isTimerRunning: false,
        round1: {
          ...state.round1,
          lastResult: isCorrect ? 'CORRECT' : 'WRONG',
          lastPointsAwarded: isCorrect ? points : 0,
        },
        round2: {
          ...state.round2,
          obstacle: updatedObstacle,
          lastResult: isCorrect ? 'CORRECT' : 'WRONG',
          lastPointsAwarded: isCorrect ? points : 0,
        },
      };
    }

    case 'SKIP_QUESTION':
      return {
        ...state,
        phase: 'RESULT_REVEAL',
        isTimerRunning: false,
        activeTeamId: null,
        round1: {
          ...state.round1,
          lastResult: 'SKIPPED',
          lastPointsAwarded: 0,
        },
        round2: {
          ...state.round2,
          lastResult: 'SKIPPED',
          lastPointsAwarded: 0,
        },
      };

    case 'NEXT_QUESTION': {
      if (state.round === 1) {
        const nextIdx = Math.min(state.round1.currentQuestionIndex + 1, state.round1.questions.length - 1);
        const nextTime = state.round1.questions[nextIdx]?.timeLimit || 10;
        return {
          ...state,
          phase: 'IDLE',
          activeTeamId: null,
          isTimerRunning: false,
          timerSeconds: nextTime,
          scoreModifier: 10,
          round1: {
            ...state.round1,
            currentQuestionIndex: nextIdx,
            selectedOptionIndex: null,
            lastResult: null,
            lastPointsAwarded: 0,
          },
        };
      }
      return { ...state, phase: 'IDLE', activeTeamId: null, isTimerRunning: false };
    }

    case 'PREV_QUESTION': {
      if (state.round === 1) {
        const prevIdx = Math.max(state.round1.currentQuestionIndex - 1, 0);
        const prevTime = state.round1.questions[prevIdx]?.timeLimit || 10;
        return {
          ...state,
          phase: 'IDLE',
          activeTeamId: null,
          isTimerRunning: false,
          timerSeconds: prevTime,
          round1: {
            ...state.round1,
            currentQuestionIndex: prevIdx,
            selectedOptionIndex: null,
            lastResult: null,
            lastPointsAwarded: 0,
          },
        };
      }
      return state;
    }

    case 'TOGGLE_SCOREBOARD':
      return {
        ...state,
        phase: state.phase === 'SHOWING_SCOREBOARD' ? 'IDLE' : 'SHOWING_SCOREBOARD',
      };

    case 'UPDATE_TEAM_SCORE':
      return {
        ...state,
        teams: state.teams.map(t =>
          t.id === action.teamId ? { ...t, score: Math.max(0, t.score + action.delta) } : t
        ),
      };

    case 'SET_SCORE_MODIFIER':
      return {
        ...state,
        scoreModifier: action.points,
      };

    case 'UPDATE_TEAM_NAME':
      return {
        ...state,
        teams: state.teams.map(t =>
          t.id === action.teamId ? { ...t, name: action.name } : t
        ),
      };

    case 'ADD_TEAM': {
      const colors = ['#3B82F6', '#EAB308', '#EF4444', '#10B981', '#8B5CF6', '#EC4899'];
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name: action.name || `Đội ${state.teams.length + 1}`,
        score: 0,
        canGuessObstacle: true,
        color: colors[state.teams.length % colors.length],
      };
      return { ...state, teams: [...state.teams, newTeam] };
    }

    case 'REMOVE_TEAM':
      return {
        ...state,
        teams: state.teams.filter(t => t.id !== action.teamId),
      };

    // Round 2
    case 'SELECT_CLUE': {
      const clue = state.round2.obstacle.clues.find(c => c.id === action.clueId);
      const prevPlayed = state.round2.playedClueIds || [];
      const updatedPlayed = prevPlayed.includes(action.clueId)
        ? prevPlayed
        : [...prevPlayed, action.clueId];
      return {
        ...state,
        phase: 'IDLE',
        activeTeamId: null,
        isTimerRunning: false,
        timerSeconds: clue?.timeLimit || 15,
        scoreModifier: 10,
        round2: {
          ...state.round2,
          activeClueId: action.clueId,
          playedClueIds: updatedPlayed,
          lastResult: null,
          lastPointsAwarded: 0,
        },
      };
    }

    case 'REVEAL_CLUE_PIECE': {
      const prevPlayed = state.round2.playedClueIds || [];
      const updatedPlayed = prevPlayed.includes(action.clueId)
        ? prevPlayed
        : [...prevPlayed, action.clueId];
      return {
        ...state,
        round2: {
          ...state.round2,
          playedClueIds: updatedPlayed,
          obstacle: {
            ...state.round2.obstacle,
            clues: state.round2.obstacle.clues.map(c =>
              c.id === action.clueId ? { ...c, isRevealed: true } : c
            ),
          },
        },
      };
    }

    case 'START_OBSTACLE_GUESS': {
      playObstacleBuzzer();
      const currentPoints = action.pointsOverride ?? calculateObstaclePoints(state.round2);
      return {
        ...state,
        phase: 'OBSTACLE_GUESSING',
        activeTeamId: action.teamId,
        isTimerRunning: false,
        scoreModifier: currentPoints,
      };
    }

    case 'SUBMIT_OBSTACLE_GUESS': {
      const { isCorrect } = action;
      const points = action.pointsOverride ?? state.scoreModifier;

      if (isCorrect && state.activeTeamId) {
        playVictory();
        return {
          ...state,
          phase: 'RESULT_REVEAL',
          teams: state.teams.map(t =>
            t.id === state.activeTeamId ? { ...t, score: t.score + points } : t
          ),
          round2: {
            ...state.round2,
            obstacleSolvedBy: state.activeTeamId,
            obstacle: {
              ...state.round2.obstacle,
              isFullyRevealed: true,
              clues: state.round2.obstacle.clues.map(c => ({ ...c, isRevealed: true })),
            },
            lastResult: 'CORRECT',
            lastPointsAwarded: points,
          },
        };
      }

      // Đoán sai chướng ngại vật: Đội bị loại khỏi quyền đoán chướng ngại vật!
      playWrong();
      return {
        ...state,
        phase: 'RESULT_REVEAL',
        teams: state.teams.map(t =>
          t.id === state.activeTeamId ? { ...t, canGuessObstacle: false } : t
        ),
        round2: {
          ...state.round2,
          lastResult: 'WRONG',
          lastPointsAwarded: 0,
        },
      };
    }

    case 'REVEAL_FULL_OBSTACLE':
      playVictory();
      return {
        ...state,
        round2: {
          ...state.round2,
          obstacle: {
            ...state.round2.obstacle,
            isFullyRevealed: true,
            clues: state.round2.obstacle.clues.map(c => ({ ...c, isRevealed: true })),
          },
        },
      };

    case 'RESET_GAME': {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_KEY.replace('_v2', '_v1'));
        } catch {
          // ignore
        }
      }
      return {
        ...INITIAL_STATE,
        isStandby: true,
        phase: 'IDLE',
        activeTeamId: null,
        isTimerRunning: false,
        round1: {
          ...INITIAL_STATE.round1,
          currentQuestionIndex: 0,
          selectedOptionIndex: null,
          lastResult: null,
          lastPointsAwarded: 0,
        },
        round2: {
          ...INITIAL_STATE.round2,
          activeClueId: null,
          playedClueIds: [],
          obstacleSolvedBy: null,
          lastResult: null,
          lastPointsAwarded: 0,
          obstacle: {
            ...INITIAL_STATE.round2.obstacle,
            isFullyRevealed: false,
            clues: INITIAL_STATE.round2.obstacle.clues.map(c => ({ ...c, isRevealed: false })),
          },
        },
      };
    }

    default:
      return state;
  }
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, rawDispatch] = useReducer(gameReducer, INITIAL_STATE, (defaultState) => {
    if (typeof window === 'undefined') return defaultState;
    try {
      // Clear out any old session key from prior versions
      localStorage.removeItem('olympia_trivia_game_state_v1');
      localStorage.removeItem('olympia_trivia_game_state_v2');
      localStorage.removeItem('olympia_trivia_game_state_v3');
      localStorage.removeItem('olympia_trivia_last_update');
      localStorage.removeItem('olympia_trivia_last_update_v3');
      
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.round1.questions = MOCK_ROUND1_QUESTIONS;
        return parsed;
      }
    } catch {
      // ignore
    }
    return defaultState;
  });

  const isApplyingRemoteUpdateRef = useRef(false);
  const stateRef = useRef(state);

  const isPresentationView = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('view') === 'presentation';

  // Keep stateRef up to date for sync requests
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Subscribe to updates from other windows/popups/tabs via syncBridge
  useEffect(() => {
    const unsubscribe = subscribeToRemoteUpdates(
      (remoteState) => {
        isApplyingRemoteUpdateRef.current = true;

        // If this window is the presentation view, play the corresponding audio effect
        if (isPresentationView) {
          const prevState = stateRef.current;
          // Check for buzzer sound when a team guesses obstacle
          if (remoteState.phase === 'OBSTACLE_GUESSING' && prevState.phase !== 'OBSTACLE_GUESSING') {
            playObstacleBuzzer();
          }
          // Check for newly revealed result (Round 1 or Round 2)
          else if (remoteState.phase === 'RESULT_REVEAL' && prevState.phase !== 'RESULT_REVEAL') {
            const r1Res = remoteState.round1.lastResult;
            const r2Res = remoteState.round2.lastResult;
            if (remoteState.round === 1) {
              if (r1Res === 'CORRECT') playCorrect();
              else if (r1Res === 'WRONG') playWrong();
            } else if (remoteState.round === 2) {
              if (remoteState.round2.obstacleSolvedBy && !prevState.round2.obstacleSolvedBy) {
                playVictory();
              } else if (r2Res === 'CORRECT') {
                playCorrect();
              } else if (r2Res === 'WRONG') {
                playWrong();
              }
            }
          } else if (
            remoteState.round2?.obstacle?.isFullyRevealed &&
            !prevState.round2?.obstacle?.isFullyRevealed
          ) {
            playVictory();
          }
        }

        rawDispatch({ type: 'SYNC_STATE', state: remoteState });
      },
      () => stateRef.current
    );
    return unsubscribe;
  }, [isPresentationView]);

  // Broadcast state changes unless they originated from remote
  useEffect(() => {
    if (isApplyingRemoteUpdateRef.current) {
      isApplyingRemoteUpdateRef.current = false;
      return;
    }
    broadcastGameState(state);
  }, [state]);

  // Central Timer Interval - ONLY executed on the host, never on presentation receiver
  useEffect(() => {
    if (isPresentationView) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    if (state.isTimerRunning && state.timerSeconds > 0) {
      interval = setInterval(() => {
        rawDispatch({ type: 'TICK_TIMER' });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isTimerRunning, state.timerSeconds, isPresentationView]);

  // Synchronize timer soundtrack with running state: start immediately on start/resume, pause if paused
  useEffect(() => {
    if (state.isTimerRunning && state.timerSeconds > 0) {
      if (state.timerSeconds >= 9.5) {
        startTimerSoundtrack();
      } else {
        resumeTimerSoundtrack();
      }
    } else if (!state.isTimerRunning) {
      // Khi tạm dừng hoặc câu hỏi bị dừng giữa chừng (nhưng KHÔNG ngắt khi timerSeconds === 0 để nhạc chạy hết file)
      if (state.timerSeconds > 0) {
        pauseTimerSoundtrack();
      }
    }
  }, [state.isTimerRunning, state.timerSeconds]);

  // Stop soundtrack ONLY when switching questions, clues, entering standby, or resetting game
  useEffect(() => {
    if (state.isStandby || state.phase === 'IDLE') {
      stopTimerSoundtrack();
    }
  }, [state.isStandby, state.phase, state.round1.currentQuestionIndex, state.round2.activeClueId]);

  return (
    <GameContext.Provider value={{ state, dispatch: rawDispatch }}>
      {children}
    </GameContext.Provider>
  );
};
