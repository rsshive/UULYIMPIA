import React from 'react';

interface PresentationStandbyScreenProps {
  round: 1 | 2;
}

export const PresentationStandbyScreen: React.FC<PresentationStandbyScreenProps> = ({ round }) => {
  const roundTitle = round === 1 ? 'KHỞI ĐỘNG' : 'VƯỢT CHƯỚNG NGẠI VẬT';

  return (
    <div
      style={{ fontFamily: 'system-ui', fontWeight: 'normal' }}
      className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* Soft Ambient Radial Glow Layers */}
      <div
        className="absolute w-[620px] h-[620px] rounded-full blur-[140px] pointer-events-none opacity-40 transition-all duration-1000 animate-pulse"
        style={{
          background:
            round === 1
              ? 'radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(30,58,138,0.15) 60%, transparent 80%)'
              : 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(180,83,9,0.15) 60%, transparent 80%)',
          animationDuration: '6s',
        }}
      />

      <div
        className="absolute w-[360px] h-[360px] rounded-full blur-[90px] pointer-events-none opacity-30"
        style={{
          background:
            round === 1
              ? 'radial-gradient(circle, rgba(14,165,233,0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 70%)',
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        {/* Decorative Top Accent Light Dot */}
        <div className="flex items-center gap-2 mb-6 opacity-75">
          <span
            className={`w-2 h-2 rounded-full ${
              round === 1 ? 'bg-sky-400' : 'bg-amber-400'
            } animate-ping`}
            style={{ animationDuration: '3s' }}
          />
        </div>

        {/* Round Title Only */}
        <h1
          style={{
            letterSpacing: '0.06em',
            fontWeight: 800,
          }}
          className={`font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider uppercase drop-shadow-2xl transition-all duration-700 ${
            round === 1
              ? 'bg-gradient-to-b from-white via-sky-100 to-sky-300 bg-clip-text text-transparent'
              : 'bg-gradient-to-b from-white via-amber-100 to-amber-300 bg-clip-text text-transparent'
          }`}
        >
          {roundTitle}
        </h1>

        {/* Subtle Horizontal Glow Line */}
        <div
          className={`mt-8 h-[2px] w-32 md:w-48 rounded-full ${
            round === 1
              ? 'bg-gradient-to-r from-transparent via-sky-400/60 to-transparent'
              : 'bg-gradient-to-r from-transparent via-amber-400/60 to-transparent'
          } shadow-sm`}
        />
      </div>
    </div>
  );
};
