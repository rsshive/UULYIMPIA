import React from 'react';
import { useGame } from '../../context/useGame';
import { Crown } from 'lucide-react';

export const PresentationScoreboard: React.FC = () => {
  const { state } = useGame();
  
  // Sort teams descending by score
  const sortedTeams = [...state.teams].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...state.teams.map((t) => t.score), 10);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-black flex items-center justify-center font-display font-black text-lg shadow-lg shadow-amber-400/30">
            <Crown className="w-5 h-5 fill-current" />
          </div>
        );
      case 1:
        return (
          <div className="w-9 h-9 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center font-display font-bold text-base shadow">
            2
          </div>
        );
      case 2:
        return (
          <div className="w-9 h-9 rounded-full bg-amber-700 text-amber-100 flex items-center justify-center font-display font-bold text-base shadow">
            3
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-display font-semibold text-sm">
            {index + 1}
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-6 px-4">
      {/* Header: title only 'BẢNG XẾP HẠNG', trượt waterfall xuống từ trên */}
      <div className="text-center mb-8 animate-waterfall" style={{ animationDelay: '50ms' }}>
        <h2 className="font-display font-medium text-3xl md:text-5xl text-white/90 tracking-tight">
          BẢNG XẾP HẠNG
        </h2>
      </div>

      {/* Leaderboard Cards: mỗi thẻ trượt thác nước so le nhau */}
      <div className="w-full flex flex-col gap-4">
        {sortedTeams.map((team, idx) => {
          const percentage = Math.max(12, Math.min(100, (team.score / maxScore) * 100));

          // Card styles matching top 1 with CSS 2 and CSS 9 applied
          const cardStyle: React.CSSProperties = {
            borderRadius: '9999px',
            paddingBottom: '20px',
            paddingTop: '20px',
            paddingRight: '20px',
            height: '80px',
            animationDelay: `${150 + idx * 100}ms`,
          };

          return (
            <div
              key={team.id}
              style={cardStyle}
              className="relative overflow-hidden border border-white/20 transition-all duration-500 flex items-center animate-waterfall"
            >
              {/* Dynamic Score Bar in Background */}
              <div
                className="absolute inset-y-0 left-0 bg-slate-800/50 pointer-events-none transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />

              <div className="relative w-full px-6 flex items-center justify-between gap-4">
                {/* Left: Rank & Team Identity (without team color label) */}
                <div className="flex items-center gap-4">
                  {getRankBadge(idx)}

                  <div>
                    <h3
                      style={{ fontWeight: 'normal', fontSize: '22px' }}
                      className="font-display text-white tracking-tight"
                    >
                      {team.name}
                    </h3>
                    {state.round === 2 && !team.canGuessObstacle && (
                      <span className="text-[11px] text-rose-400 font-medium">
                        Đã mất quyền đoán CNV
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Score (matching top 1 styling) */}
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-black text-3xl md:text-5xl tracking-tighter text-amber-400">
                    {team.score}
                  </span>
                  <span className="text-sm font-bold text-white/60">ĐIỂM</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
