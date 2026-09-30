import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../context/useGame';
import { HostQuestionControl } from './HostQuestionControl';
import { HostObstacleControl } from './HostObstacleControl';
import { HostScoreboardCard } from './HostScoreboardCard';
import { HostTeamManagerModal } from './HostTeamManagerModal';
import { registerPopupWindow } from '../../utils/syncBridge';
import {
  Monitor,
  Tv,
  Volume2,
  Users,
  ExternalLink,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Play,
  Layers,
  RotateCcw,
} from 'lucide-react';

interface HostViewProps {
  onOpenPresentationWindow?: () => void;
}

export const HostView: React.FC<HostViewProps> = ({ onOpenPresentationWindow }) => {
  const { state, dispatch } = useGame();
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [showPresentationOnHost, setShowPresentationOnHost] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreenIframe, setIsFullscreenIframe] = useState(false);

  // Sync state to iframe when presentation mode is toggled or when state updates
  useEffect(() => {
    if (showPresentationOnHost && iframeRef.current?.contentWindow) {
      registerPopupWindow(iframeRef.current.contentWindow, state);
    }
  }, [showPresentationOnHost, state]);

  // Escape key to exit presentation replacement mode
  useEffect(() => {
    if (!showPresentationOnHost) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPresentationOnHost(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showPresentationOnHost]);

  const toggleIframeFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreenIframe(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreenIframe(false);
    }
  };

  const handleOpenPresentation = () => {
    if (onOpenPresentationWindow) {
      onOpenPresentationWindow();
    } else {
      const url = `${window.location.origin}${window.location.pathname}?view=presentation`;
      const popup = window.open(url, 'OlympiaPresentation', 'width=1280,height=720,menubar=no,toolbar=no,location=no');
      if (popup) {
        registerPopupWindow(popup, state);
      }
    }
  };

  // Keyboard Hotkeys for Host
  useEffect(() => {
    if (showPresentationOnHost) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger hotkeys if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Space: Toggle timer
      if (e.code === 'Space') {
        e.preventDefault();
        if (state.isTimerRunning) {
          dispatch({ type: 'PAUSE_TIMER' });
        } else if (state.phase === 'QUESTION_ACTIVE') {
          dispatch({ type: 'RESUME_TIMER' });
        } else if (state.phase === 'IDLE') {
          dispatch({ type: 'START_QUESTION' });
        }
      }

      // Hotkeys 1..4: In Round 2, immediately buzz for team; in other rounds, pause timer
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'].includes(e.code)) {
        if (state.round === 2 && state.phase !== 'OBSTACLE_GUESSING' && !state.round2.obstacle.isFullyRevealed) {
          const num = parseInt(e.code.replace('Digit', '').replace('Numpad', ''), 10);
          const team = state.teams[num - 1];
          if (team && team.canGuessObstacle) {
            e.preventDefault();
            dispatch({ type: 'START_OBSTACLE_GUESS', teamId: team.id });
            return;
          }
        }
        if (state.isTimerRunning) {
          dispatch({ type: 'PAUSE_TIMER' });
        }
      }

      // Key B: In Round 2, buzz for first eligible team or trigger guess
      if (e.code === 'KeyB' && state.round === 2 && state.phase !== 'OBSTACLE_GUESSING' && !state.round2.obstacle.isFullyRevealed) {
        e.preventDefault();
        const firstEligible = state.teams.find((t) => t.canGuessObstacle);
        if (firstEligible) {
          dispatch({ type: 'START_OBSTACLE_GUESS', teamId: firstEligible.id });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, dispatch, showPresentationOnHost]);

  // Khi bật màn chiếu tại chỗ: Thay thế hoàn toàn màn hình của Host bằng iframe màn chiếu thực
  if (showPresentationOnHost) {
    const presentationUrl = `${window.location.origin}${window.location.pathname}?view=presentation`;

    return (
      <div className="fixed inset-0 w-screen h-screen z-50 bg-slate-950 overflow-hidden flex flex-col select-none">
        {/* Floating Top Control Bar */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-3 bg-slate-900/95 hover:bg-slate-900 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-2xl shadow-2xl transition-all">
          <button
            onClick={() => setShowPresentationOnHost(false)}
            className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            title="Quay lại giao diện điều khiển của Host (Phím Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại điều khiển Host</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-700" />

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-300 font-semibold tracking-wider">
              MÀN CHIẾU TẠI CHỖ (IFRAME)
            </span>
          </div>

          <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
            [Esc: Quay lại]
          </span>

          <div className="h-4 w-[1px] bg-slate-700" />

          <button
            onClick={toggleIframeFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isFullscreenIframe ? 'Thu nhỏ' : 'Toàn màn hình (F11)'}
          >
            {isFullscreenIframe ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Real iframe rendering the exact presentation view */}
        <iframe
          ref={iframeRef}
          src={presentationUrl}
          title="Màn hình chiếu Olympia"
          className="w-full h-full border-0 block"
          onLoad={() => {
            if (iframeRef.current?.contentWindow) {
              registerPopupWindow(iframeRef.current.contentWindow, state);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 sticky top-0 z-40 backdrop-blur-md flex items-center justify-between">
        {/* Round Switcher Tabs & Standby Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => dispatch({ type: 'SET_ROUND', round: 1 })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                state.round === 1
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              VÒNG 1: KHỞI ĐỘNG
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_ROUND', round: 2 })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                state.round === 2
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              VÒNG 2: VƯỢT CHƯỚNG NGẠI VẬT
            </button>
          </div>

          {/* Standby / Active Stage Toggle Button for Host */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {state.isStandby ? (
              <button
                onClick={() => dispatch({ type: 'SET_STANDBY', isStandby: false })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                title="Bắt đầu vòng thi (Chuyển màn hình chiếu từ tên vòng thi sang giao diện thi đấu)"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Bắt đầu vòng thi</span>
              </button>
            ) : (
              <button
                onClick={() => dispatch({ type: 'SET_STANDBY', isStandby: true })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all cursor-pointer"
                title="Quay lại màn hình chờ (Hiện tên vòng thi trên màn hình chiếu, ẩn câu hỏi)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Màn hình chờ</span>
              </button>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Nút Chuyển sang Màn hình chiếu (Thay thế màn hình Host bằng iframe) */}
          <button
            onClick={() => setShowPresentationOnHost(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-400 text-amber-400 hover:text-black border border-amber-500/30 hover:border-amber-400 text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Thay thế màn hình Host bằng màn hình chiếu (chạy trên iframe đồng bộ thực)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Màn chiếu tại chỗ</span>
          </button>

          {/* Mở cửa sổ trình chiếu ra màn hình thứ 2 */}
          <button
            onClick={handleOpenPresentation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all cursor-pointer"
            title="Mở màn hình chiếu trên cửa sổ riêng (dành cho máy chiếu/TV)"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Màn hình chiếu</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>

          {/* Âm thanh: Màn hình Host tắt âm, âm thanh phát ở màn hình chiếu */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-400 text-xs"
            title="Âm thanh được phát trực tiếp tại Màn hình chiếu (Presentation), Host tắt âm để tránh dội tiếng"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline text-[11px] font-medium text-slate-300">
              Loa: Màn chiếu
            </span>
          </div>

          {/* Quản lý danh sách đội */}
          <button
            onClick={() => setIsTeamModalOpen(true)}
            className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            title="Cấu hình đội thi"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Quản lý đội ({state.teams.length})</span>
          </button>

          {/* Reset toàn bộ cuộc thi */}
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn đặt lại (Reset) toàn bộ cuộc thi về ban đầu không? (Điểm số, câu hỏi và tiến trình sẽ được làm mới hoàn toàn)')) {
                dispatch({ type: 'RESET_GAME' });
              }
            }}
            className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
            title="Reset toàn bộ cuộc thi về trạng thái mới tinh"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">Reset Game</span>
          </button>
        </div>
      </header>

      {/* Main Container with Left Aside Scoreboard and Right Main Content */}
      <div className="flex-1 container w-full mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 items-start">
        {/* CỘT ASIDE BẢNG ĐIỂM CÁC ĐỘI XẾP DỌC BÊN TRÁI MÀN HÌNH */}
        <aside className="w-full lg:w-80 shrink-0 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                BẢNG ĐIỂM ({state.teams.length} ĐỘI)
              </span>
            </div>
            <div className="text-right">
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  state.phase === 'SHOWING_SCOREBOARD'
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {state.phase === 'SHOWING_SCOREBOARD' ? 'Hiện trên TV' : 'Ẩn trên TV'}
              </span>
            </div>
          </div>

          {/* Danh sách các đội xếp theo chiều dọc */}
          <div className="flex flex-col gap-2.5">
            {state.teams.map((team) => (
              <HostScoreboardCard
                key={team.id}
                team={team}
              />
            ))}
          </div>
        </aside>

        {/* Khung điều khiển chính bên phải */}
        <main className="flex-1 min-w-0 w-full flex flex-col gap-6">
          {state.round === 1 ? <HostQuestionControl /> : <HostObstacleControl />}
        </main>
      </div>

      {/* Team Manager Modal */}
      <HostTeamManagerModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />
    </div>
  );
};
