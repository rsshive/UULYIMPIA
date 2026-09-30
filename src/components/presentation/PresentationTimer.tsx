import React from 'react';

interface PresentationTimerProps {
  seconds: number;
  totalSeconds: number;
  isRunning: boolean;
}

export const PresentationTimer: React.FC<PresentationTimerProps> = ({
  seconds,
  totalSeconds,
  isRunning,
}) => {
  const isUrgent = seconds <= 3 && seconds > 0;
  const isExpired = seconds === 0;

  // Percentage for circular or linear bar
  const safeTotal = totalSeconds > 0 ? totalSeconds : 12;
  const progressPercent = Math.max(0, Math.min(100, (seconds / safeTotal) * 100));

  // Circular SVG dimensions
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop for high tension */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-all duration-300 pointer-events-none ${isUrgent
              ? 'bg-rose-500/40 animate-pulse-intense'
              : isRunning
                ? 'bg-amber-400/20'
                : 'bg-transparent'
            }`}
        />

        {/* SVG Circular Countdown - Ẩn hoàn toàn bằng opacity-0 khi hết giờ */}
        <svg
          style={{ width: '140px', height: '140px' }}
          className={`-rotate-90 transform transition-all duration-500 ${
            isExpired ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
          viewBox="0 0 128 128"
        >
          {/* Background circle track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-800/80 fill-slate-950/90"
          />

          {/* Animated progress circle with ultra smooth 1s continuous linear transition */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: isRunning
                ? 'stroke-dashoffset 1s linear, stroke 0.3s ease'
                : 'stroke-dashoffset 0.3s ease-out, stroke 0.3s ease',
            }}
            className={`fill-transparent ${isUrgent
                ? 'text-rose-500'
                : isExpired
                  ? 'text-slate-700'
                  : 'text-amber-400'
              }`}
          />
        </svg>

        {/* Big Digit or HẾT GIỜ Badge in Center (Badge xuất hiện sau 500ms delay bằng CSS) */}
        <div
          style={{ width: '140px', height: '140px' }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          {isExpired ? (
            <div className="flex flex-col items-center justify-center animate-fade-in-delayed">
              <span
                style={{
                  fontFamily: 'system-ui',
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'black',
                }}
                className="px-5 py-3 rounded-full bg-amber-400 text-white shadow-lg border border-white/20 animate-pulse-subtle uppercase"
              >
                HẾT GIỜ
              </span>
            </div>
          ) : (
            <span
              style={{
                fontStyle: 'normal',
                fontWeight: 'normal',
                textDecorationLine: 'none',
                fontFamily: 'system-ui',
                textAlign: 'center',
                width: '110px',
                height: '60px',
                lineHeight: '54px',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '60px',
              }}
              className={`tracking-tighter ${isUrgent
                  ? 'text-rose-400 animate-pulse-intense'
                  : 'text-white'
                }`}
            >
              {seconds}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
