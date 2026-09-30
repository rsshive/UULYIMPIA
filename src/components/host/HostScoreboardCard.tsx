import React, { useState } from 'react';
import type { Team } from '../../types/game';
import { useGame } from '../../context/useGame';
import { playCorrect } from '../../utils/audio';
import { Plus, Minus, Edit2, Check, ShieldAlert } from 'lucide-react';

interface HostScoreboardCardProps {
  team: Team;
  disabled?: boolean;
}

export const HostScoreboardCard: React.FC<HostScoreboardCardProps> = ({
  team,
  disabled,
}) => {
  const { dispatch, state } = useGame();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(team.name);
  const [justAwarded, setJustAwarded] = useState(false);

  const handleSaveName = () => {
    if (editName.trim()) {
      dispatch({ type: 'UPDATE_TEAM_NAME', teamId: team.id, name: editName.trim() });
    }
    setIsEditingName(false);
  };

  const handleAddScore = (e: React.MouseEvent, amount: number) => {
    e.stopPropagation();
    dispatch({ type: 'UPDATE_TEAM_SCORE', teamId: team.id, delta: amount });
  };

  // Double click awards exactly +10 points and pauses timer if running
  const handleDoubleClick = () => {
    if (disabled) return;
    if (state.isTimerRunning) {
      dispatch({ type: 'PAUSE_TIMER' });
    }
    dispatch({ type: 'UPDATE_TEAM_SCORE', teamId: team.id, delta: 10 });
    playCorrect();

    setJustAwarded(true);
    setTimeout(() => setJustAwarded(false), 800);
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      title="Nhấp đúp (Double-click) để cộng 10 điểm"
      className={`relative p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none group ${
        justAwarded
          ? 'bg-emerald-950/70 border-emerald-400 ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/20 scale-[1.02]'
          : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Floating "+10" indicator when double clicked */}
      {justAwarded && (
        <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black text-xs shadow-lg animate-bounce-sm z-20">
          +10 ĐIỂM!
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: team.color }}
          />
          {isEditingName ? (
            <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="bg-slate-950 border border-slate-600 rounded px-2 py-0.5 text-xs text-white w-full outline-none focus:border-amber-400"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="p-1 hover:text-emerald-400 text-slate-300"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-sm truncate text-slate-200 group-hover:text-white transition-colors">
                {team.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingName(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-200 transition-opacity"
                title="Sửa tên đội"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Điểm số */}
        <div className="text-right">
          <div className="font-display font-extrabold text-2xl text-amber-400 tracking-tight">
            {team.score}
            <span className="text-xs font-normal text-slate-400 ml-0.5">đ</span>
          </div>
        </div>
      </div>

      {/* Trạng thái vòng 2: Khóa quyền đoán CNV */}
      {state.round === 2 && !team.canGuessObstacle && (
        <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
          <ShieldAlert className="w-3 h-3 shrink-0" />
          <span>Bị khóa đoán CNV</span>
        </div>
      )}

      {/* Footer bar of card: Quick buttons */}
      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-end text-xs">
        {/* Nút thao tác nhanh điểm: Chỉ có -10 và +10 */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleAddScore(e, -10)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/50 border border-slate-700/60 text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
            title="Trừ 10 điểm"
          >
            <Minus className="w-3 h-3 inline mr-0.5" />
            10
          </button>
          <button
            onClick={(e) => handleAddScore(e, 10)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-950/60 hover:text-emerald-300 hover:border-emerald-800/50 border border-slate-700/60 text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
            title="Cộng 10 điểm"
          >
            <Plus className="w-3 h-3 inline mr-0.5" />
            10
          </button>
        </div>
      </div>
    </div>
  );
};
