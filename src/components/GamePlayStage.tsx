import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  FileCode2,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import { explainAddition, MathQuestion } from '../math/questions';
import { VerticalAdditionBoard } from './VerticalAdditionBoard';

export interface QuestionAttempt {
  questionId: string;
  a: number;
  b: number;
  correctAnswer: number;
  chosenAnswer: number;
  isCorrect: boolean;
}

interface GamePlayStageProps {
  questions: MathQuestion[];
  currentIndex: number;
  score: number;
  elapsedSeconds: number;
  attempts: QuestionAttempt[];
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onOpenStudio: () => void;
  onSubmitAnswer: (chosen: number) => void;
  onNextQuestion: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const GamePlayStage: React.FC<GamePlayStageProps> = ({
  questions,
  currentIndex,
  score,
  elapsedSeconds,
  attempts,
  muted,
  onToggleMute,
  onPause,
  onRestart,
  onOpenStudio,
  onSubmitAnswer,
  onNextQuestion,
}) => {
  const currentQuestion = questions[currentIndex];
  const currentAttempt = attempts[currentIndex];
  const isRevealed = Boolean(currentAttempt);

  const [answerMode, setAnswerMode] = useState<'choice' | 'input'>('choice');
  const [typedValue, setTypedValue] = useState('');
  const [inputError, setInputError] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Reset per-question UI state when advancing
  useEffect(() => {
    setTypedValue('');
    setInputError('');
    setShowHint(false);
  }, [currentIndex, currentQuestion?.id]);

  // Keyboard shortcuts during gameplay (1-4 to pick option, Enter for next)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingInInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if (isTypingInInput) {
        return;
      }

      if (!isRevealed && answerMode === 'choice') {
        const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
        if (e.key in keyMap) {
          const opt = currentQuestion.options[keyMap[e.key]];
          if (typeof opt === 'number') {
            e.preventDefault();
            onSubmitAnswer(opt);
          }
        }
      } else if (isRevealed && e.key === 'Enter') {
        e.preventDefault();
        onNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answerMode, currentQuestion, isRevealed, onNextQuestion, onSubmitAnswer]);

  if (!currentQuestion) return null;

  const exp = explainAddition(currentQuestion.a, currentQuestion.b);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealed) return;
    const parsed = Number(typedValue.trim());
    if (!typedValue.trim() || !Number.isInteger(parsed) || parsed < 0 || parsed > 200) {
      setInputError('Vui lòng nhập một số nguyên hợp lệ (ví dụ: 42).');
      return;
    }
    setInputError('');
    onSubmitAnswer(parsed);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F5] text-slate-900 flex flex-col">
      {/* Compact Game Shell Perimeter HUD */}
      <div className="border-b border-slate-200 bg-white/95 px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left HUD: Progress */}
          <div className="flex items-center gap-4">
            <span className="font-display font-bold text-base text-slate-900 whitespace-nowrap">
              Toán Lớp 2
            </span>
            <div className="flex items-center gap-2" aria-label={`Tiến độ câu ${currentIndex + 1} trên ${questions.length}`}>
              <span className="text-xs font-semibold text-slate-600 tabular-nums whitespace-nowrap">
                Câu {currentIndex + 1} / {questions.length}
              </span>
              <div className="flex items-center gap-1.5">
                {questions.map((q, idx) => {
                  const att = attempts[idx];
                  const isCurrent = idx === currentIndex;
                  let boxClass = 'bg-slate-100 border-slate-300 text-slate-500';
                  if (att) {
                    boxClass = att.isCorrect
                      ? 'bg-emerald-600 border-emerald-700 text-white'
                      : 'bg-rose-600 border-rose-700 text-white';
                  } else if (isCurrent) {
                    boxClass = 'bg-blue-600 border-blue-700 text-white';
                  }
                  return (
                    <span
                      key={q.id}
                      className={`w-6 h-6 rounded-md border text-xs font-bold tabular-nums inline-flex items-center justify-center ${boxClass}`}
                    >
                      {idx + 1}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right HUD: Score, Timer, Utility Controls */}
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-medium text-slate-500">Điểm</span>
                <span
                  data-testid="hud-score"
                  className="font-mono-math text-lg font-bold text-slate-900 tabular-nums"
                >
                  {score}/{questions.length * 10}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-medium text-slate-500">Thời gian</span>
                <span className="font-mono-math text-sm font-semibold text-slate-700 tabular-nums">
                  {formatTimer(elapsedSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleMute();
                }}
                aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                title={muted ? 'Bật âm thanh (M)' : 'Tắt âm thanh (M)'}
                className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 inline-flex items-center justify-center cursor-pointer transition-colors"
              >
                {muted ? (
                  <VolumeX className="w-4 h-4 text-slate-500" aria-hidden="true" />
                ) : (
                  <Volume2 className="w-4 h-4 text-slate-700" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onPause();
                }}
                aria-label="Tạm dừng trò chơi"
                title="Tạm dừng (P)"
                className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 inline-flex items-center justify-center cursor-pointer transition-colors"
              >
                <Pause className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onRestart();
                }}
                aria-label="Chơi lại từ đầu"
                title="Chơi lại (R)"
                className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 inline-flex items-center justify-center cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onOpenStudio}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                <FileCode2 className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                <span>Xuất .h5p</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Zone Learning Arena */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Zone on Desktop / Below on Mobile: Vertical Addition & Base-10 Visual Helper */}
          <div className="order-2 lg:order-1 lg:col-span-5 flex flex-col">
            <VerticalAdditionBoard
              a={currentQuestion.a}
              b={currentQuestion.b}
              showHint={showHint}
              isRevealed={isRevealed}
              onToggleHint={() => setShowHint((prev) => !prev)}
            />
          </div>

          {/* Right Zone on Desktop / Top on Mobile: Question Prompt & Interactive Answer Deck */}
          <section
            aria-label={`Câu hỏi ${currentIndex + 1}`}
            className="order-1 lg:order-2 lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              {/* Top Row: Question label + Interactive Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">
                  Câu hỏi {currentIndex + 1} trên {questions.length} · Phép cộng có nhớ
                </p>

                <div
                  role="group"
                  aria-label="Chọn kiểu trả lời"
                  className="inline-flex items-center p-1 bg-slate-100 rounded-lg"
                >
                  <button
                    type="button"
                    onClick={() => setAnswerMode('choice')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      answerMode === 'choice'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Chọn đáp án
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswerMode('input')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      answerMode === 'input'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tự nhập số
                  </button>
                </div>
              </div>

              {/* Primary Math Prompt */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-6 text-center">
                <p className="text-sm font-medium text-slate-600 mb-2">
                  Tính kết quả của phép cộng sau:
                </p>
                <div
                  data-testid="question-expression"
                  className="font-mono-math text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight tabular-nums"
                >
                  {currentQuestion.a} + {currentQuestion.b} ={' '}
                  <span className={isRevealed ? 'text-emerald-700' : 'text-blue-600'}>
                    {isRevealed ? exp.total : '?'}
                  </span>
                </div>
              </div>

              {/* Answer Input Area */}
              {answerMode === 'choice' ? (
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  {currentQuestion.options.map((option, idx) => {
                    const isChosen = currentAttempt?.chosenAnswer === option;
                    const isRightOption = option === exp.total;

                    let cardStyle =
                      'bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-900';

                    if (isRevealed) {
                      if (isRightOption) {
                        cardStyle =
                          'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-600';
                      } else if (isChosen && !isRightOption) {
                        cardStyle =
                          'bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-500';
                      } else {
                        cardStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-75';
                      }
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={isRevealed}
                        onClick={() => onSubmitAnswer(option)}
                        aria-label={`Đáp án ${OPTION_LETTERS[idx]}: ${option}`}
                        className={`min-h-[72px] px-5 py-4 rounded-xl border-2 flex items-center justify-between transition-colors cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${cardStyle}`}
                      >
                        <span className="inline-flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-display font-bold text-sm inline-flex items-center justify-center shrink-0">
                            {OPTION_LETTERS[idx]}
                          </span>
                          <span className="font-mono-math text-2xl sm:text-3xl font-bold tabular-nums">
                            {option}
                          </span>
                        </span>

                        {isRevealed && isRightOption && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                            <span>Đúng</span>
                          </span>
                        )}
                        {isRevealed && isChosen && !isRightOption && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                            <XCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                            <span>Sai</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <form onSubmit={handleManualSubmit} className="space-y-3 pt-1">
                  <label
                    htmlFor="manual-answer-input"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Nhập kết quả phép tính {currentQuestion.a} + {currentQuestion.b}:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      id="manual-answer-input"
                      type="number"
                      inputMode="numeric"
                      min={10}
                      max={100}
                      disabled={isRevealed}
                      value={typedValue}
                      onChange={(e) => {
                        setTypedValue(e.target.value);
                        if (inputError) setInputError('');
                      }}
                      placeholder="Nhập số (vd: 42)"
                      className="flex-1 px-4 py-3.5 rounded-xl border-2 border-slate-300 focus:border-blue-600 focus:outline-none font-mono-math text-2xl font-bold text-slate-900 tabular-nums disabled:bg-slate-100"
                    />
                    <button
                      type="submit"
                      disabled={isRevealed}
                      className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-base cursor-pointer whitespace-nowrap shrink-0 transition-colors"
                    >
                      Kiểm tra
                    </button>
                  </div>
                  {inputError && (
                    <p role="alert" className="text-sm font-medium text-rose-700">
                      {inputError}
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Feedback & Next Step Footer */}
            <div className="pt-2 border-t border-slate-100">
              {isRevealed ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div
                    role="status"
                    className={`flex items-start gap-2.5 text-sm ${
                      currentAttempt.isCorrect ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {currentAttempt.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
                    )}
                    <div>
                      <p className="font-bold">
                        {currentAttempt.isCorrect
                          ? 'Chính xác! +10 điểm'
                          : `Chưa chính xác (em chọn ${currentAttempt.chosenAnswer}). Đáp án đúng là ${exp.total}.`}
                      </p>
                      <p className="text-slate-700 mt-0.5">
                        {exp.step1Text} {exp.step2Text}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onNextQuestion}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm cursor-pointer whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <span>
                      {currentIndex + 1 < questions.length
                        ? 'Câu tiếp theo'
                        : 'Xem kết quả'}
                    </span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Mẹo: Nếu quên bước cộng nhớ, bấm <strong className="text-slate-700">Gợi ý nhớ 1</strong> ở bảng đặt tính bên trái hoặc nhấn phím <strong className="text-slate-700">1–4</strong> để chọn nhanh.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
