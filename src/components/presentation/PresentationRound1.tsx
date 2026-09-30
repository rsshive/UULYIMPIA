import React, { useEffect } from 'react';
import { useGame } from '../../context/useGame';
import { PresentationTimer } from './PresentationTimer';
import { getCorrectOptionIndex } from '../../data/mockQuestions';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle } from 'lucide-react';

export const PresentationRound1: React.FC = () => {
  const { state } = useGame();
  const { round1, phase, timerSeconds, isTimerRunning } = state;
  const currentQ = round1.questions[round1.currentQuestionIndex];
  const correctOptionIndex = getCorrectOptionIndex(currentQ);

  // Trigger confetti on correct answer
  useEffect(() => {
    if (phase === 'RESULT_REVEAL' && round1.lastResult === 'CORRECT') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
      });
    }
  }, [phase, round1.lastResult]);

  return (
    <div
      style={{ fontFamily: 'system-ui', fontWeight: 'normal' }}
      className="w-full h-full max-w-6xl mx-auto flex flex-col justify-between py-6 px-6 relative select-none"
    >
      {/* Top Banner: Round Name & Question Indicator */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
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
            VÒNG 1: KHỞI ĐỘNG
          </span>
        </div>

        <div
          style={{ fontWeight: 'normal', fontSize: '16px' }}
          className="bg-slate-900 border border-slate-700/80 px-4 py-1.5 rounded-full font-display text-white tracking-wide shadow-md"
        >
          CÂU {round1.currentQuestionIndex + 1} / {round1.questions.length}
        </div>
      </div>

      {/* Center Zone: Question & Big Timer with Waterfall Entrance on question change */}
      <div
        key={`q-${round1.currentQuestionIndex}`}
        className="my-auto flex flex-col items-center justify-center gap-5 md:gap-6 text-center py-2 w-full"
      >
        {/* Timer Component - Hiển thị ngay lập tức khi bắt đầu câu hỏi */}
        {phase !== 'IDLE' && (
          <div
            style={{ minHeight: '140px' }}
            className="flex items-center justify-center transition-all duration-500"
          >
            <div
              className="animate-waterfall"
              style={{ animationDelay: '0ms' }}
            >
              <PresentationTimer
                seconds={timerSeconds}
                totalSeconds={currentQ?.timeLimit || 10}
                isRunning={isTimerRunning}
              />
            </div>
          </div>
        )}

        {/* Big Question Typography - Waterfall entrance with responsive sizing for long text */}
        <div
          className="max-w-4xl px-2 animate-waterfall"
          style={{ animationDelay: '120ms' }}
        >
          <h2
            style={{ fontWeight: 'normal' }}
            className={`font-display text-white tracking-tight leading-snug drop-shadow-md transition-all ${
              (currentQ?.question.length || 0) > 130
                ? 'text-2xl sm:text-3xl md:text-4xl'
                : (currentQ?.question.length || 0) > 80
                ? 'text-3xl sm:text-3xl md:text-4xl'
                : 'text-3xl sm:text-4xl md:text-5xl'
            }`}
          >
            {currentQ?.question}
          </h2>
        </div>

        {/* Options (with direct highlight for correct/wrong answers & waterfall cascade entrance) */}
        {currentQ?.options && currentQ.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl mt-2 items-stretch">
            {currentQ.options.map((opt, i) => {
              const isSelected = round1.selectedOptionIndex === i;
              const isCorrectOption = i === correctOptionIndex;
              const hasResult = round1.selectedOptionIndex !== null;

              let optionStyle = 'bg-slate-900/90 border-slate-700/60 text-slate-200';
              let badgeStyle = 'bg-slate-800 text-amber-400';
              let statusIcon: React.ReactNode = null;

              if (hasResult) {
                if (isSelected && isCorrectOption) {
                  // Đáp án được chọn và ĐÚNG: Nổi bật màu xanh lá
                  optionStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-xl shadow-emerald-500/30 scale-[1.02] ring-2 ring-emerald-300';
                  badgeStyle = 'bg-white text-emerald-800 font-black';
                  statusIcon = <CheckCircle2 className="w-7 h-7 text-white shrink-0 ml-auto mt-0.5 animate-bounce-sm" />;
                } else if (isSelected && !isCorrectOption) {
                  // Đáp án được chọn và SAI: Nổi bật màu đỏ
                  optionStyle = 'bg-rose-600 border-rose-400 text-white shadow-xl shadow-rose-500/30 scale-[1.02] ring-2 ring-rose-300';
                  badgeStyle = 'bg-white text-rose-800 font-black';
                  statusIcon = <XCircle className="w-7 h-7 text-white shrink-0 ml-auto mt-0.5" />;
                } else if (isCorrectOption) {
                  // Khi chọn sai: TỰ ĐỘNG HIGHLIGHT LUÔN ĐÁP ÁN ĐÚNG màu xanh lá
                  optionStyle = 'bg-emerald-600/90 border-emerald-400 text-white shadow-lg ring-2 ring-emerald-400 animate-pulse-subtle';
                  badgeStyle = 'bg-emerald-400 text-black font-black';
                  statusIcon = <CheckCircle2 className="w-7 h-7 text-emerald-100 shrink-0 ml-auto mt-0.5" />;
                } else {
                  // Các đáp án khác bị làm mờ
                  optionStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500 opacity-30';
                  badgeStyle = 'bg-slate-900 text-slate-600';
                }
              }

              // Custom option pill styling: smooth rounded corners that fit both 1-line and multi-line perfectly
              const optionPillStyle: React.CSSProperties = {
                borderRadius: '1.25rem',
                animationDelay: `${200 + i * 90}ms`
              };

              // Custom badge styles for options 1, 2, 3, 4
              const badgeLetterStyle: React.CSSProperties = {
                fontWeight: 'bold',
                fontSize: '18px',
                borderRadius: '9999px',
                ...(i === 2 ? { lineHeight: '24px' } : {}),
              };

              // Custom text styles for options 1, 2, 3, 4
              const optionTextStyle: React.CSSProperties = {
                fontWeight: 'normal',
                ...(i === 2 ? { fontSize: '18px' } : {}),
              };

              return (
                <div
                  key={i}
                  style={optionPillStyle}
                  className={`animate-waterfall px-5 py-4 text-left text-base md:text-lg lg:text-xl font-bold flex items-start gap-4 transition-all duration-300 border ${optionStyle}`}
                >
                  <span
                    style={badgeLetterStyle}
                    className={`w-9 h-9 flex items-center justify-center shrink-0 mt-0.5 shadow ${badgeStyle}`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span
                    style={optionTextStyle}
                    className="flex-1 break-words leading-relaxed"
                  >
                    {opt}
                  </span>
                  {statusIcon}
                </div>
              );
            })}
          </div>
        )}

        {/* Banner hiển thị đáp án đầy đủ khi công bố kết quả */}
        {(round1.selectedOptionIndex !== null || phase === 'RESULT_REVEAL') && currentQ?.answer && (
          <div className="w-full max-w-4xl mt-3 p-4 rounded-2xl bg-emerald-950/90 border-2 border-emerald-400 text-white shadow-2xl flex items-center justify-between gap-4 animate-waterfall">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-400 text-black flex items-center justify-center font-black text-sm shrink-0 shadow">
                ✓
              </div>
              <div className="text-left">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
                  ĐÁP ÁN CHÍNH THỨC
                </span>
                <span className="text-sm sm:text-base md:text-lg font-display font-extrabold text-white">
                  {currentQ.answer}
                </span>
              </div>
            </div>
            <span className="text-xs font-black bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 shrink-0 hidden sm:inline-block">
              +10 ĐIỂM
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
