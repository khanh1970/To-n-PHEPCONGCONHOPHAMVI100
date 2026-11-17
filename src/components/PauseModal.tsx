import React from 'react';
import { Home, Play, RotateCcw } from 'lucide-react';

interface PauseModalProps {
  currentIndex: number;
  totalQuestions: number;
  score: number;
  onResume: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  currentIndex,
  totalQuestions,
  score,
  onResume,
  onRestart,
  onReturnTitle,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-modal-title"
      className="fixed inset-0 z-40 bg-slate-900/50 flex items-center justify-center p-4"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-lg space-y-6">
        <div className="space-y-1.5 text-center">
          <h2 id="pause-modal-title" className="font-display text-2xl font-bold text-slate-900">
            Đang tạm dừng
          </h2>
          <p className="text-sm text-slate-600 tabular-nums">
            Câu {currentIndex + 1} / {totalQuestions} · Điểm hiện tại: {score} / {totalQuestions * 10}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base cursor-pointer whitespace-nowrap transition-colors"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>Tiếp tục chơi</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm cursor-pointer whitespace-nowrap transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Chơi lại từ đầu</span>
          </button>

          <button
            type="button"
            onClick={onReturnTitle}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-medium text-sm cursor-pointer whitespace-nowrap transition-colors"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Về màn hình chính</span>
          </button>
        </div>
      </div>
    </div>
  );
};
