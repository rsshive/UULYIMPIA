import React, { useState } from 'react';
import { useGame } from '../../context/useGame';
import { getCorrectOptionIndex } from '../../data/mockQuestions';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
  Trophy,
} from 'lucide-react';

export const HostQuestionControl: React.FC = () => {
  const { state, dispatch } = useGame();
  const { round1, phase, timerSeconds, isTimerRunning } = state;
  const [isPreparing1s, setIsPreparing1s] = useState(false);
  const currentQ = round1.questions[round1.currentQuestionIndex];
  const correctOptionIndex = getCorrectOptionIndex(currentQ);
  const isTimerFinished = timerSeconds === 0 || phase === 'RESULT_REVEAL';

  const isShowingScoreboard = phase === 'SHOWING_SCOREBOARD';

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header: Tiến trình câu hỏi & Điều hướng */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-display font-black text-xl text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
            CÂU {round1.currentQuestionIndex + 1} / {round1.questions.length}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Vòng 1: Khởi động (10 câu cạnh tranh)
          </span>
        </div>

        {/* Nút lùi / tiến câu hỏi */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => dispatch({ type: 'PREV_QUESTION' })}
            disabled={round1.currentQuestionIndex === 0 || isTimerRunning}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
            title="Câu trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => dispatch({ type: 'NEXT_QUESTION' })}
            disabled={round1.currentQuestionIndex === round1.questions.length - 1 || isTimerRunning}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
            title="Câu tiếp theo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-slate-800 mx-1.5" />

          {/* Nút Hiện / Ẩn Bảng Điểm trên màn hình chiếu */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SCOREBOARD' })}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isShowingScoreboard
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isShowingScoreboard ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>ẨN BẢNG ĐIỂM</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>HIỆN BẢNG ĐIỂM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Question Card with Answer Preview for Host */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
          Nội dung câu hỏi
        </div>
        <p className="font-display text-xl md:text-2xl font-bold text-white leading-snug">
          {currentQ?.question}
        </p>

        {/* Đáp án chuẩn dành riêng cho Host */}
        <div className="mt-3.5 flex items-start gap-2 bg-emerald-950/70 border border-emerald-500/50 px-3.5 py-2.5 rounded-xl text-xs">
          <span className="font-black text-emerald-400 uppercase tracking-wider shrink-0 mt-0.5">
            Đáp án chuẩn:
          </span>
          <span className="text-white font-bold text-sm leading-relaxed">
            {currentQ?.answer}
          </span>
        </div>

        {/* Options list with interactive Host click-to-reveal */}
        {currentQ?.options && currentQ.options.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              {isTimerFinished ? (
                <span className="text-amber-400 font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>HẾT GIỜ! BẤM CHỌN ĐÁP ÁN ĐỂ CÔNG BỐ LÊN MÀN HÌNH CHIẾU:</span>
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span>⏳ Đang đếm ngược ({timerSeconds}s)... Đáp án chỉ được chọn sau khi hết giờ</span>
                </span>
              )}
              {round1.selectedOptionIndex !== null && (
                <span className="text-amber-400 font-semibold normal-case">
                  (Đã công bố: {String.fromCharCode(65 + round1.selectedOptionIndex)} - {round1.lastResult === 'CORRECT' ? 'Đúng' : 'Sai'})
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQ.options.map((opt, i) => {
                const isSelected = round1.selectedOptionIndex === i;
                const isCorrectOption = i === correctOptionIndex;
                const hasResult = round1.selectedOptionIndex !== null;

                let cardStyle = 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-200';
                let badgeColor = 'bg-slate-800 text-amber-400';

                if (!isTimerFinished) {
                  cardStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60 cursor-not-allowed';
                  badgeColor = 'bg-slate-900 text-slate-600';
                } else if (hasResult) {
                  if (isSelected && isCorrectOption) {
                    cardStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 shadow-md shadow-emerald-500/10';
                    badgeColor = 'bg-emerald-500 text-black font-black';
                  } else if (isSelected && !isCorrectOption) {
                    cardStyle = 'bg-rose-950/90 border-rose-500 text-rose-100 ring-2 ring-rose-500/50 shadow-md shadow-rose-500/10';
                    badgeColor = 'bg-rose-500 text-white font-black';
                  } else if (isCorrectOption) {
                    cardStyle = 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200 border-dashed';
                    badgeColor = 'bg-emerald-500 text-black font-bold';
                  } else {
                    cardStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40';
                    badgeColor = 'bg-slate-900 text-slate-600';
                  }
                } else if (isCorrectOption) {
                  cardStyle = 'bg-slate-950/80 hover:bg-slate-850 border-emerald-500/40 hover:border-emerald-500/70 text-slate-200';
                }

                return (
                  <button
                    key={i}
                    disabled={!isTimerFinished}
                    onClick={() => dispatch({ type: 'CHOOSE_OPTION', optionIndex: i })}
                    className={`rounded-xl px-3.5 py-3 text-sm text-left flex items-start gap-3 transition-all border ${cardStyle} ${
                      !isTimerFinished ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    title={
                      !isTimerFinished
                        ? 'Đang đếm giờ, chỉ có thể chọn đáp án sau khi hết giờ'
                        : isCorrectOption
                        ? 'Đáp án đúng (Bấm để công bố)'
                        : 'Bấm để chọn đáp án này'
                    }
                  >
                    <span className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${badgeColor}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1 break-words font-medium leading-relaxed">{opt}</span>
                    {isCorrectOption && !hasResult && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 shrink-0">
                        ĐÁP ÁN ĐÚNG
                      </span>
                    )}
                    {hasResult && isSelected && isCorrectOption && (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded shrink-0">
                        ✓ ĐÚNG
                      </span>
                    )}
                    {hasResult && isSelected && !isCorrectOption && (
                      <span className="text-[10px] font-black text-rose-400 bg-rose-950 px-2 py-0.5 rounded shrink-0">
                        ✕ SAI
                      </span>
                    )}
                    {hasResult && !isSelected && isCorrectOption && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded shrink-0">
                        ĐÁP ÁN ĐÚNG
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Timer & Primary Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Timer Control */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div
            className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border transition-all relative overflow-hidden ${
              timerSeconds <= 3 && timerSeconds > 0
                ? 'bg-rose-950/60 border-rose-500 text-rose-400 animate-pulse-intense shadow-lg shadow-rose-900/30'
                : timerSeconds === 0
                ? 'bg-rose-950/40 border-rose-600/60 text-rose-400 shadow-md shadow-rose-950/30'
                : 'bg-slate-950 border-amber-500/40 text-amber-400 shadow-md shadow-amber-500/10'
            }`}
          >
            {timerSeconds === 0 ? (
              <div className="flex flex-col items-center justify-center text-center animate-fade-in">
                <span className="text-[11px] font-black uppercase tracking-wider text-white bg-rose-600 px-2 py-0.5 rounded-full shadow">
                  HẾT GIỜ
                </span>
              </div>
            ) : (
              <>
                <Clock className="w-4 h-4 mb-0.5 opacity-60" />
                <span className="font-display font-black text-3xl tracking-tighter">
                  {timerSeconds}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{phase === 'IDLE' ? 'BẮT ĐẦU CÂU HỎI' : 'TIẾP TỤC ĐẾM'}</span>
                </button>
              ) : isPreparing1s ? (
                <div className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-sm border border-amber-500/40">
                  <span>CHUẨN BỊ...</span>
                </div>
              ) : (
                <button
                  onClick={() => dispatch({ type: 'PAUSE_TIMER' })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm border border-slate-700 transition-all cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>TẠM DỪNG</span>
                </button>
              )}

              <button
                onClick={() =>
                  dispatch({
                    type: 'RESET_TIMER',
                    seconds: currentQ?.timeLimit || 10,
                  })
                }
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Đặt lại đồng hồ (10 giây)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Nút BỎ QUA CÂU: disable khi timer kết thúc */}
              <button
                onClick={() => dispatch({ type: 'SKIP_QUESTION' })}
                disabled={isTimerFinished}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                title={isTimerFinished ? 'Đã hết giờ, không thể bỏ qua câu' : 'Bỏ qua câu hỏi này'}
              >
                <SkipForward className="w-4 h-4 text-amber-400" />
                <span>BỎ QUA CÂU</span>
              </button>

              {/* Nút CÂU TIẾP THEO xuất hiện ở khu vực có đồng hồ sau khi đếm ngược xong */}
              {isTimerFinished && (
                <button
                  onClick={() => dispatch({ type: 'NEXT_QUESTION' })}
                  disabled={round1.currentQuestionIndex === round1.questions.length - 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer animate-pulse-subtle"
                  title="Chuyển sang câu tiếp theo"
                >
                  <span>CÂU TIẾP THEO</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              Phím tắt: [Space] Bật / Tạm dừng đếm ngược
            </span>
          </div>
        </div>

        {/* Điểm chuẩn cho câu đúng: Duy nhất +10 điểm */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium">Điểm khi đúng:</span>
          <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            +10 điểm
          </span>
        </div>
      </div>

      {/* Result banner if in RESULT_REVEAL */}
      {phase === 'RESULT_REVEAL' && (
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-700 rounded-xl">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-semibold text-slate-200">
              Kết quả vừa ghi nhận: {round1.lastResult} ({round1.lastPointsAwarded > 0 ? `+${round1.lastPointsAwarded}đ` : '0đ'})
            </span>
          </div>
          <button
            onClick={() => dispatch({ type: 'NEXT_QUESTION' })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-md cursor-pointer"
          >
            <span>SANG CÂU TIẾP THEO</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
