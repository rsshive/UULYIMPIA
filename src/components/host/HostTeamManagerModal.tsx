import React, { useState } from 'react';
import { useGame } from '../../context/useGame';
import { Users, Plus, Trash2, X, RotateCcw } from 'lucide-react';

interface HostTeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HostTeamManagerModal: React.FC<HostTeamManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, dispatch } = useGame();
  const [newTeamName, setNewTeamName] = useState('');

  if (!isOpen) return null;

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      dispatch({ type: 'ADD_TEAM', name: newTeamName.trim() });
      setNewTeamName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-black text-xl text-white">
              Cấu hình danh sách đội thi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form thêm đội mới */}
        <form onSubmit={handleAddTeam} className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập tên đội mới (ví dụ: Đội Sao Băng)..."
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={!newTeamName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm đội</span>
          </button>
        </form>

        {/* Danh sách hiện tại */}
        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
          {state.teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <span className="text-sm font-semibold text-slate-200">
                  {team.name}
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  {team.score} điểm
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => dispatch({ type: 'REMOVE_TEAM', teamId: team.id })}
                  disabled={state.teams.length <= 2}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Xóa đội (tối thiểu 2 đội)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ điểm và trạng thái game về ban đầu?')) {
                dispatch({ type: 'RESET_GAME' });
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại toàn bộ game</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
