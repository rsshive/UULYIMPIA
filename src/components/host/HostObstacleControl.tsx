import React, { useState } from 'react';
import { useGame } from '../../context/useGame';
import { calculateObstaclePoints } from '../../utils/gameRules';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Eye,
  EyeOff,
  Unlock,
  Bell,
  Lock,
  Award,
} from 'lucide-react';

export const HostObstacleControl: React.FC = () => {
  const { state, dispatch } = useGame();
  const { round2, phase, timerSeconds, isTimerRunning, activeTeamId, teams, scoreModifier } = state;
  const { obstacle, activeClueId } = round2;

  const [isPreparing1s, setIsPreparing1s] = useState(false);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState(false);
  const activeClue = obstacle.clues.find((c) => c.id === activeClueId);
  const activeTeam = teams.find((t) => t.id === activeTeamId);
  const isShowingScoreboard = phase === 'SHOWING_SCOREBOARD';
  const eligibleTeams = teams.filter((t) => t.canGuessObstacle);

  // Tính số điểm CNV hiện tại theo số lượng hàng ngang đã/đang tham gia
  const ruleCalculatedPoints = calculateObstaclePoints(round2);
  const playedCount = round2.playedClueIds?.length || 0;
  const currentStep = Math.min(4, Math.max(1, playedCount || (activeClueId !== null ? 1 : 1)));

  const handleStartObstacleGuess = (teamId: string, customPoints?: number) => {
    const pointsToAward = customPoints ?? (scoreModifier > 0 && [60, 50, 40, 30].includes(scoreModifier) ? scoreModifier : ruleCalculatedPoints);
    dispatch({ type: 'START_OBSTACLE_GUESS', teamId, pointsOverride: pointsToAward });
    setIsGuessModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header Vòng 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm gap-3">
        <div className="flex items-center gap-3">
          <span className="font-display font-black text-xl text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
            VÒNG 2: VƯỢT CHƯỚNG NGẠI VẬT
          </span>
          <span className="text-xs text-slate-400 font-medium hidden md:inline">
            Thí sinh có thể bấm chuông trả lời Chướng ngại vật bất cứ lúc nào
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Đoán Chướng ngại vật khẩn cấp */}
          <button
            onClick={() => setIsGuessModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer animate-pulse-subtle"
            title="Mở danh sách chọn đội bấm chuông (Phím tắt B)"
          >
            <Bell className="w-4 h-4 fill-current animate-bounce-sm" />
            <span>CÓ ĐỘI BẤM CHUÔNG! (Phím B)</span>
          </button>

          {/* Toggle scoreboard */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SCOREBOARD' })}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isShowingScoreboard
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isShowingScoreboard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{isShowingScoreboard ? 'ẨN BẢNG ĐIỂM' : 'HIỆN BẢNG ĐIỂM'}</span>
          </button>
        </div>
      </div>

      {/* Thanh quy định & chọn mức điểm CNV */}
      <div className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Award className="w-4 h-4" />
            <span>LUẬT ĐIỂM CNV:</span>
          </div>
          <span className="text-slate-300">
            Mức hiện tại: <strong className="text-emerald-400 text-sm font-black">+{ruleCalculatedPoints} điểm</strong> (Hàng ngang {currentStep}/4)
          </span>
        </div>

        {/* 4 Mức điểm tương ứng 4 hàng ngang */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] mr-1">Chuyển mức điểm:</span>
          {[
            { points: 60, label: 'Hàng 1 (60đ)' },
            { points: 50, label: 'Hàng 2 (50đ)' },
            { points: 40, label: 'Hàng 3 (40đ)' },
            { points: 30, label: 'Hàng 4 (30đ)' },
          ].map((item) => {
            const isCurrent = (scoreModifier === item.points) || (phase !== 'OBSTACLE_GUESSING' && ruleCalculatedPoints === item.points);
            return (
              <button
                key={item.points}
                onClick={() => dispatch({ type: 'SET_SCORE_MODIFIER', points: item.points })}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-400 text-black shadow-sm font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
                title={`Đặt mức điểm trả lời đúng Chướng ngại vật thành ${item.points}đ`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Thanh nút bấm chuông nhanh cho từng đội (1 click trực tiếp từ Host) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Bell className="w-4 h-4 text-amber-400" />
          <span>BẤM CHUÔNG NHANH (Phím 1-4):</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
          {teams.map((team, idx) => {
            const canGuess = team.canGuessObstacle;
            return (
              <button
                key={team.id}
                disabled={!canGuess}
                onClick={() => handleStartObstacleGuess(team.id)}
                style={{
                  borderColor: canGuess ? team.color : '#334155',
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  canGuess
                    ? 'bg-slate-800/90 hover:bg-slate-700 text-white shadow-sm hover:scale-[1.02] active:scale-95'
                    : 'bg-slate-900/60 text-slate-500 opacity-50 cursor-not-allowed border-slate-800'
                }`}
                title={canGuess ? `Đội ${idx + 1} bấm chuông giải CNV` : `${team.name} đã mất quyền đoán CNV`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: canGuess ? team.color : '#64748b' }}
                />
                <span className="truncate max-w-[90px]">{team.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">[{idx + 1}]</span>
                {!canGuess && <Lock className="w-3 h-3 text-rose-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Host Secret Solution Card */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Chướng ngại vật bí mật (Chỉ Host thấy)</span>
            </div>
            <div className="font-display font-black text-2xl md:text-3xl text-white tracking-tight">
              {obstacle.keyword}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {obstacle.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!obstacle.isFullyRevealed ? (
              <button
                onClick={() => dispatch({ type: 'REVEAL_FULL_OBSTACLE' })}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Lật toàn bộ mảnh ghép khi hết 4 gợi ý"
              >
                <Unlock className="w-4 h-4 text-amber-400" />
                <span>MỞ TẤT CẢ MẢNH</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-xs font-bold">
                ✓ ĐÃ LẬT TOÀN BỘ TRANH
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danh sách 4 Clues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {obstacle.clues.map((clue) => {
          const isSelected = activeClueId === clue.id;
          return (
            <div
              key={clue.id}
              onClick={() => dispatch({ type: 'SELECT_CLUE', clueId: clue.id })}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative select-none ${
                isSelected
                  ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                  : clue.isRevealed
                  ? 'bg-slate-900/60 border-emerald-900/40 opacity-80'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-sm ${
                      clue.isRevealed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isSelected
                        ? 'bg-amber-400 text-black'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {clue.id}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{clue.rowLabel}</h4>
                    <span className="text-[11px] text-slate-400">
                      {clue.isRevealed ? 'Đã mở mảnh ghép' : 'Chưa mở'}
                    </span>
                  </div>
                </div>

                {clue.isRevealed && (
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    ĐÃ MỞ
                  </span>
                )}
              </div>

              <p className="mt-3 text-xs text-slate-300 line-clamp-2">
                {clue.question}
              </p>

              {/* Host Answer Preview */}
              <div className="mt-2 text-xs font-semibold text-emerald-400">
                Đáp án: <span className="font-bold">{clue.answer}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Điều khiển Gợi ý đang chọn & Timer */}
      {activeClue && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Đang điều khiển: {activeClue.rowLabel}
            </span>
            <div className="text-xs text-slate-400">
              Thời gian: {activeClue.timeLimit}s
            </div>
          </div>

          <p className="font-display text-lg font-bold text-white">
            {activeClue.question}
          </p>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800">
            {/* Timer Controller */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center font-display font-black text-2xl border transition-all ${
                  timerSeconds <= 3 && timerSeconds > 0
                    ? 'bg-rose-950/60 border-rose-500 text-rose-400 animate-pulse-intense'
                    : timerSeconds === 0
                    ? 'bg-rose-950/40 border-rose-600/60 text-rose-400'
                    : 'bg-slate-950 border-amber-500/40 text-amber-400'
                }`}
              >
                {timerSeconds === 0 ? (
                  <span className="text-[9px] font-black uppercase text-rose-300 text-center leading-tight">
                    HẾT<br/>GIỜ
                  </span>
                ) : (
                  timerSeconds
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isTimerRunning && !isPreparing1s ? (
                  <button
                    onClick={() => {
                      if (phase === 'IDLE' || phase === 'RESULT_REVEAL') {
                        setIsPreparing1s(true);
                        setTimeout(() => {
                          dispatch({ type: 'START_QUESTION' });
                          setIsPreparing1s(false);
                        }, 1000);
                      } else {
                        dispatch({ type: 'RESUME_TIMER' });
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{phase === 'IDLE' ? 'BẮT ĐẦU ĐẾM' : 'TIẾP TỤC'}</span>
                  </button>
                ) : isPreparing1s ? (
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/40">
                    <span>CHUẨN BỊ...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => dispatch({ type: 'PAUSE_TIMER' })}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs border border-slate-700 transition-all cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>DỪNG</span>
                  </button>
                )}

                <button
                  onClick={() =>
                    dispatch({ type: 'RESET_TIMER', seconds: activeClue.timeLimit })
                  }
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Đặt lại timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thao tác mở mảnh ghép & hướng dẫn tính điểm */}
            <div className="flex items-center gap-3">
              {!activeClue.isRevealed ? (
                <button
                  onClick={() => dispatch({ type: 'REVEAL_CLUE_PIECE', clueId: activeClue.id })}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  title="Mở mảnh ghép này trên màn hình chiếu"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>MỞ MẢNH GHÉP NÀY</span>
                </button>
              ) : (
                <div className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800/60">
                  ✓ Mảnh ghép đã được mở
                </div>
              )}
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                • Double-click thẻ đội ở cột bên trái để +10đ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Modal: Có đội đoán Chướng ngại vật */}
      {isGuessModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <Bell className="w-7 h-7 shrink-0 animate-bounce-sm text-amber-400" />
              <div>
                <h3 className="font-display font-black text-xl text-white">
                  Đoán Chướng Ngại Vật
                </h3>
                <p className="text-xs text-slate-300">
                  Mức thưởng: <strong className="text-emerald-400 font-black">+{ruleCalculatedPoints} điểm</strong> (Hàng ngang {currentStep}/4)
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {eligibleTeams.map((team, idx) => (
                <button
                  key={team.id}
                  onClick={() => handleStartObstacleGuess(team.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                    <span className="font-bold text-sm text-slate-100 group-hover:text-white">
                      {team.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">[Phím {idx + 1}]</span>
                  </div>
                  <span className="text-xs font-semibold text-amber-400">
                    {team.score}đ
                  </span>
                </button>
              ))}

              {eligibleTeams.length === 0 && (
                <div className="text-center py-4 text-xs text-rose-400 font-semibold">
                  Tất cả các đội đã bị khóa quyền đoán Chướng ngại vật!
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsGuessModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluating Obstacle Guess (When in OBSTACLE_GUESSING phase) */}
      {phase === 'OBSTACLE_GUESSING' && activeTeam && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-2 border-rose-500 rounded-2xl p-6 shadow-2xl animate-pulse-subtle">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-rose-400">
              TRẠNG THÁI KHẨN CẤP: ĐOÁN CHƯỚNG NGẠI VẬT
            </span>
          </div>

          <div className="font-display font-black text-2xl text-white">
            {activeTeam.name} đang giải đáp chướng ngại vật!
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Từ khóa bí mật: <strong className="text-amber-400">{obstacle.keyword}</strong>. Lắng nghe câu trả lời trực tiếp của đội.
          </p>

          <div className="mt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
              <span>Đoán đúng:</span>
              <div className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700">
                {[60, 50, 40, 30].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => dispatch({ type: 'SET_SCORE_MODIFIER', points: pts })}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                      scoreModifier === pts
                        ? 'bg-emerald-500 text-black font-black'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    +{pts}đ
                  </button>
                ))}
              </div>
              <span className="text-slate-400">
                | Đoán sai: <strong className="text-rose-400">Khóa quyền đoán CNV</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={() =>
                  dispatch({ type: 'SUBMIT_OBSTACLE_GUESS', isCorrect: false })
                }
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>SAI (Khóa quyền)</span>
              </button>

              <button
                onClick={() =>
                  dispatch({
                    type: 'SUBMIT_OBSTACLE_GUESS',
                    isCorrect: true,
                    pointsOverride: scoreModifier,
                  })
                }
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ĐÚNG (+{scoreModifier}đ & MỞ TOÀN BỘ)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
