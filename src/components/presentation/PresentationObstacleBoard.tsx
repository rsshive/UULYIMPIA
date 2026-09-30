import React, { useEffect, useCallback } from 'react';
import { useGame } from '../../context/useGame';
import { calculateObstaclePoints } from '../../utils/gameRules';
import { playObstacleBuzzer } from '../../utils/audio';
import { PresentationTimer } from './PresentationTimer';
import confetti from 'canvas-confetti';
import { Sparkles, Bell, Lock, Award } from 'lucide-react';

export const PresentationObstacleBoard: React.FC = () => {
  const { state, dispatch } = useGame();
  const { round2, phase, timerSeconds, isTimerRunning, activeTeamId, teams, scoreModifier } = state;
  const { obstacle, activeClueId, obstacleSolvedBy } = round2;

  const activeClue = obstacle.clues.find((c) => c.id === activeClueId);
  const activeTeam = teams.find((t) => t.id === activeTeamId);
  const winningTeam = teams.find((t) => t.id === obstacleSolvedBy);

  // Điểm Chướng ngại vật hiện tại
  const rulePoints = calculateObstaclePoints(round2);
  const currentPoints = phase === 'OBSTACLE_GUESSING' ? scoreModifier : rulePoints;
  const playedCount = round2.playedClueIds?.length || 0;
  const currentStep = Math.min(4, Math.max(1, playedCount || (activeClueId !== null ? 1 : 1)));

  // Thí sinh bấm chuông trả lời CNV
  const handleTeamBuzz = useCallback((teamId: string) => {
    playObstacleBuzzer();
    dispatch({ type: 'START_OBSTACLE_GUESS', teamId, pointsOverride: currentPoints });
  }, [dispatch, currentPoints]);

  // Keyboard shortcut for contestants (Keys 1..4 on Presentation screen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (phase === 'OBSTACLE_GUESSING' || obstacle.isFullyRevealed) return;

      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad4'].includes(e.code)) {
        const num = parseInt(e.code.replace('Digit', '').replace('Numpad', ''), 10);
        const team = teams[num - 1];
        if (team && team.canGuessObstacle) {
          e.preventDefault();
          handleTeamBuzz(team.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teams, phase, obstacle.isFullyRevealed, handleTeamBuzz]);

  // Trigger confetti when obstacle is solved
  useEffect(() => {
    if (obstacle.isFullyRevealed && obstacleSolvedBy) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;

      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        confetti({
          particleCount: 50,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.2,
          },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [obstacle.isFullyRevealed, obstacleSolvedBy]);

  return (
    <div
      style={{ fontFamily: 'system-ui', fontWeight: 'normal' }}
      className="w-full h-full container mx-auto flex flex-col justify-between items-center py-6 px-6 relative select-none"
    >
      {/* Top Banner */}
      <div className="flex items-center max-w-6xl w-full self-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          <span
            style={{
              color: '#ffffff',
              fontFamily: 'system-ui',
              fontWeight: 'normal',
              fontSize: '16px',
            }}
            className="tracking-widest uppercase"
          >
            VÒNG 2: VƯỢT CHƯỚNG NGẠI VẬT
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!obstacle.isFullyRevealed && (
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/50 text-amber-300 font-display text-xs md:text-sm uppercase tracking-wider shadow-md animate-pulse-subtle">
              <Award className="w-4 h-4 text-amber-400" />
              <span>GIẢI MÃ: <strong className="text-white font-black">{currentPoints} ĐIỂM</strong> (HÀNG {currentStep}/4)</span>
            </div>
          )}

          {obstacle.isFullyRevealed ? (
            <span
              style={{ fontWeight: 'normal', fontSize: '16px' }}
              className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-display uppercase tracking-wider shadow-md"
            >
              ĐÃ GIẢI MÃ
            </span>
          ) : (
            <span
              style={{ fontWeight: 'normal', fontSize: '16px' }}
              className="px-4 py-1.5 rounded-full bg-slate-900 text-white border border-slate-700/80 font-display uppercase tracking-wider shadow-md hidden sm:inline-block"
            >
              4 MẢNH GHÉP ẨN
            </span>
          )}
        </div>
      </div>

      {/* Center Zone: Puzzle Board and Word Grid side-by-side */}
      <div className="my-auto flex flex-col lg:flex-row items-center justify-center gap-8 py-3 w-full">
        {/* Left: Puzzle Board Image with 4 pieces */}
        <div
          style={{
            borderRadius: '12px',
            borderWidth: '2px',
          }}
          className="relative w-full max-w-lg aspect-[4/3] overflow-hidden shadow-2xl border-slate-800 bg-slate-950 shrink-0"
        >
          {/* Background Revealed Image */}
          <img
            src={obstacle.imageUrl}
            alt="Chướng ngại vật"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* 4 Quadrant Puzzle Overlay */}
          <div
            style={{
              paddingLeft: '0px',
              paddingRight: '0px',
              paddingTop: '0px',
              paddingBottom: '0px',
            }}
            className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 bg-slate-950/40"
          >
            {obstacle.clues.map((clue) => {
              const isRevealed = clue.isRevealed || obstacle.isFullyRevealed;
              return (
                <div
                  key={clue.id}
                  className={`relative flex items-center justify-center transition-all duration-700 ease-in-out ${
                    isRevealed
                      ? 'opacity-0 pointer-events-none scale-95'
                      : 'opacity-100 bg-slate-900/95 backdrop-blur-md'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <span
                      style={{
                        borderRadius: '9999px',
                        fontWeight: 'normal',
                        fontSize: '18px',
                      }}
                      className="w-11 h-11 bg-amber-400 text-black font-display flex items-center justify-center shadow-lg shadow-amber-400/20"
                    >
                      {clue.id}
                    </span>
                    <span
                      style={{ fontWeight: 'normal', fontSize: '13px' }}
                      className="text-slate-300 tracking-wider uppercase"
                    >
                      GỢI Ý {clue.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Centerpiece Crest / Star */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`w-16 h-16 rounded-full border-2 border-amber-400 bg-slate-950/90 flex items-center justify-center shadow-2xl transition-all duration-700 ${
                obstacle.isFullyRevealed
                  ? 'opacity-0 scale-50'
                  : 'opacity-90 scale-100'
              }`}
            >
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
          </div>

          {/* Final Revealed Banner on Puzzle */}
          {obstacle.isFullyRevealed && (
            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex flex-col items-center text-center animate-scale-up">
              <span
                style={{ fontWeight: 'normal', fontSize: '13px' }}
                className="uppercase tracking-widest text-amber-400"
              >
                CHƯỚNG NGẠI VẬT ĐÃ ĐƯỢC GIẢI MÃ
              </span>
              <h3
                style={{ fontWeight: 'normal' }}
                className="font-display text-3xl md:text-4xl text-white tracking-tight drop-shadow-lg mt-1"
              >
                {obstacle.keyword}
              </h3>
              {winningTeam && (
                <div
                  style={{ borderRadius: '9999px' }}
                  className="mt-2 flex items-center gap-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-sm"
                >
                  <span style={{ fontWeight: 'normal' }}>Chiến thắng bởi:</span>
                  <span style={{ fontWeight: 'normal' }} className="text-white">
                    {winningTeam.name}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Word Board with Clue Letters Rows */}
        <div
          style={{
            borderWidth: '0px',
            borderRadius: '0px',
            paddingTop: '0px',
            paddingLeft: '0px',
            paddingBottom: '0px',
            paddingRight: '0px',
          }}
          className="flex-1 w-full flex flex-col justify-center bg-transparent shadow-none"
        >
          {/* Header pill displaying number of letters in CNV */}
          <div
            style={{
              marginBottom: '20px',
              paddingBottom: '0px',
            }}
            className="flex items-center justify-between"
          >
            <span
              style={{
                borderRadius: '9999px',
                fontWeight: 'normal',
                fontSize: '14px',
                padding: '6px 16px',
              }}
              className="bg-sky-500/15 border border-sky-400/30 text-sky-300 font-display tracking-wider uppercase inline-flex items-center gap-2 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              CHƯỚNG NGẠI VẬT CÓ {obstacle.keyword.replace(/\s+/g, '').length} CHỮ CÁI
            </span>
          </div>

          {/* Letter Boxes for each clue row */}
          <div className="flex flex-col gap-3.5">
            {obstacle.clues.map((clue) => {
              const cleanAnswer = clue.answer.replace(/\s+/g, '');
              const letters = Array.from(cleanAnswer);
              const isRevealed = clue.isRevealed || obstacle.isFullyRevealed;
              const isActive = clue.id === activeClueId;

              return (
                <div
                  key={clue.id}
                  className={`flex items-center justify-between gap-3 p-2 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-slate-800/80 ring-1 ring-amber-400/50'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  {/* Row of styled letter boxes */}
                  <div className="flex flex-wrap items-center gap-2">
                    {letters.map((char, charIdx) => (
                      <div
                        key={charIdx}
                        style={{
                          fontSize: '32px',
                          lineHeight: '32px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          width: '50px',
                          height: '60px',
                          borderWidth: '0px',
                        }}
                        className={`flex items-center justify-center font-display transition-all duration-500 shadow-md ${
                          isRevealed
                            ? 'bg-emerald-600 text-white animate-scale-up'
                            : 'bg-slate-800 text-transparent hover:bg-slate-750'
                        }`}
                      >
                        {isRevealed ? char : ''}
                      </div>
                    ))}
                  </div>

                  {/* Clue Index Badge on the Right */}
                  <span
                    style={{
                      borderRadius: '9999px',
                      fontWeight: 'normal',
                      fontSize: '14px',
                    }}
                    className={`w-9 h-9 shrink-0 flex items-center justify-center font-display transition-colors border ${
                      isRevealed
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                        : isActive
                        ? 'bg-amber-400 border-amber-300 text-slate-950 font-medium'
                        : 'bg-slate-800/90 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    {clue.id}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Area: Clue Question Panel or Emergency Obstacle Guess Takeover */}
      <div className="w-full max-w-6xl flex flex-col gap-4">
        {/* Emergency Mode: Team Guessing Obstacle */}
        {phase === 'OBSTACLE_GUESSING' && activeTeam ? (
          <div
            style={{ borderRadius: '24px', borderColor: activeTeam.color }}
            className="w-full bg-gradient-to-r from-rose-950/90 via-slate-900/95 to-rose-950/90 border-2 shadow-2xl animate-pulse-subtle flex flex-col items-center justify-center p-6 text-center gap-3 backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-amber-400 animate-bounce" />
              <span
                style={{ fontWeight: 800, fontSize: '15px' }}
                className="tracking-widest text-amber-400 uppercase"
              >
                CÓ TÍN HIỆU BẤM CHUÔNG GIẢI MÃ CHƯỚNG NGẠI VẬT!
              </span>
            </div>

            <h2
              style={{ fontWeight: 900, color: activeTeam.color }}
              className="font-display text-3xl md:text-5xl tracking-wide drop-shadow-lg"
            >
              {activeTeam.name.toUpperCase()}
            </h2>

            <div className="flex items-center gap-3 flex-wrap justify-center mt-1">
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-display font-black text-sm tracking-wider shadow-sm">
                ĐOÁN ĐÚNG: +{scoreModifier} ĐIỂM
              </span>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium">
                Nếu sai sẽ bị khóa quyền đoán CNV
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Active Clue Panel */}
            {activeClue ? (
              <div
                style={{ borderRadius: '24px', paddingTop: '22px', paddingBottom: '22px' }}
                className="bg-slate-900/90 border border-slate-700/60 shadow-xl px-7 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex-1 text-left">
                  <div
                    style={{ marginBottom: '8px', marginLeft: '0px' }}
                    className="flex items-center gap-3"
                  >
                    <span
                      style={{
                        fontWeight: 'normal',
                        fontSize: '14px',
                        borderRadius: '9999px',
                        borderWidth: '0px',
                        paddingTop: '6px',
                        paddingLeft: '10px',
                        paddingRight: '10px',
                        paddingBottom: '6px',
                      }}
                      className="bg-amber-400/20 text-amber-400 uppercase tracking-wider"
                    >
                      {activeClue.rowLabel}
                    </span>
                    {phase === 'TEAM_ANSWERING' && activeTeam && (
                      <span
                        style={{ backgroundColor: activeTeam.color, borderRadius: '9999px', fontWeight: 'normal', fontSize: '14px' }}
                        className="px-3 py-0.5 text-white shadow"
                      >
                        {activeTeam.name} ĐANG TRẢ LỜI
                      </span>
                    )}
                  </div>
                  <h3
                    style={{ fontWeight: 'normal' }}
                    className="font-display text-xl md:text-2xl text-white tracking-tight"
                  >
                    {activeClue.question}
                  </h3>
                </div>

                {/* Timer */}
                <div className="shrink-0 min-w-[140px] flex items-center justify-center">
                  <div className="animate-waterfall">
                    <PresentationTimer
                      seconds={timerSeconds}
                      totalSeconds={activeClue.timeLimit}
                      isRunning={isTimerRunning}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Contestant Buzzer Station (Always available unless CNV solved) */}
            {!obstacle.isFullyRevealed && (
              <div className="w-full flex flex-col items-center gap-2 pt-1">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                  <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce-sm" />
                  <span>Bấm chuông trả lời Chướng ngại vật bất cứ lúc nào (Đúng: +{currentPoints} điểm)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 w-full">
                  {teams.map((team, idx) => {
                    const canGuess = team.canGuessObstacle;
                    return (
                      <button
                        key={team.id}
                        disabled={!canGuess}
                        onClick={() => handleTeamBuzz(team.id)}
                        style={{
                          borderColor: canGuess ? `${team.color}70` : '#334155',
                          boxShadow: canGuess ? `0 0 16px ${team.color}20` : 'none',
                        }}
                        className={`flex items-center justify-between px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                          canGuess
                            ? 'bg-slate-900/90 hover:bg-slate-800 text-white hover:scale-[1.02] active:scale-95'
                            : 'bg-slate-950/60 text-slate-500 opacity-50 cursor-not-allowed border-slate-800'
                        }`}
                        title={canGuess ? `Đội ${idx + 1} bấm chuông (Phím ${idx + 1})` : `${team.name} đã mất quyền`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: canGuess ? team.color : '#64748b' }}
                          />
                          <span className="truncate">{team.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {canGuess ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                              Phím {idx + 1}
                            </span>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-rose-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
