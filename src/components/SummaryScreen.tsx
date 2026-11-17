import React from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  FileCode2,
  Home,
  RotateCcw,
  Shuffle,
  XCircle,
} from 'lucide-react';
import { formatTimer, QuestionAttempt } from './GamePlayStage';

interface SummaryScreenProps {
  attempts: QuestionAttempt[];
  score: number;
  elapsedSeconds: number;
  isExporting: boolean;
  onPlayAgain: () => void;
  onNewRandomRound: () => void;
  onDownloadH5p: () => void;
  onOpenStudio: () => void;
  onReturnTitle: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  attempts,
  score,
  elapsedSeconds,
  isExporting,
  onPlayAgain,
  onNewRandomRound,
  onDownloadH5p,
  onOpenStudio,
  onReturnTitle,
}) => {
  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const totalCount = attempts.length;
  const maxScore = totalCount * 10;

  let praiseTitle = 'Cố gắng thêm nhé!';
  let praiseSub = 'Em hãy luyện lại bước nhớ 1 từ hàng đơn vị sang hàng chục nhé.';
  if (correctCount === totalCount) {
    praiseTitle = 'Xuất sắc! Hoàn thành 5/5 câu';
    praiseSub = 'Em đã thành thạo phép cộng có nhớ trong phạm vi 100.';
  } else if (correctCount >= Math.ceil(totalCount * 0.6)) {
    praiseTitle = 'Làm tốt lắm!';
    praiseSub = 'Em đã nắm vững phần lớn các phép cộng có nhớ trong phạm vi 100.';
  }

  return (
    <main className="min-h-screen w-full bg-[#FAF9F5] text-slate-900 flex items-center justify-center px-4 sm:px-8 py-8">
      <div className="max-w-3xl w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-amber-700" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                {praiseTitle}
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">{praiseSub}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onReturnTitle}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer whitespace-nowrap self-start sm:self-center"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Màn hình chính</span>
          </button>
        </div>

        {/* 3 Mastery Metric Tiles (tabular-nums) */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-slate-500">Số câu đúng</p>
            <p
              data-testid="summary-correct"
              className="font-mono-math text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 tabular-nums"
            >
              {correctCount}/{totalCount}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-slate-500">Tổng điểm</p>
            <p
              data-testid="summary-score"
              className="font-mono-math text-2xl sm:text-3xl font-bold text-blue-700 mt-1 tabular-nums"
            >
              {score}/{maxScore}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-xs font-medium text-slate-500">Thời gian</p>
            <p className="font-mono-math text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tabular-nums">
              {formatTimer(elapsedSeconds)}
            </p>
          </div>
        </div>

        {/* 5-Question Breakdown */}
        <div className="space-y-2.5">
          <h2 className="text-sm font-semibold text-slate-700">
            Chi tiết 5 câu đã làm
          </h2>
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
            {attempts.map((att, idx) => (
              <div
                key={att.questionId}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 w-12 tabular-nums">
                    Câu {idx + 1}
                  </span>
                  <span className="font-mono-math font-bold text-slate-900 tabular-nums">
                    {att.a} + {att.b} = {att.correctAnswer}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 tabular-nums">
                    Em chọn:{' '}
                    <strong className="font-mono-math text-slate-900">
                      {att.chosenAnswer}
                    </strong>
                  </span>
                  {att.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>Đúng (+10)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
                      <XCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Chưa đúng</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary & Export Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              data-start="true"
              onClick={onPlayAgain}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Chơi lại</span>
            </button>

            <button
              type="button"
              onClick={onNewRandomRound}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <Shuffle className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span>Đổi 5 câu mới</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenStudio}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <FileCode2 className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span>Xem cấu trúc .h5p</span>
            </button>

            <button
              type="button"
              onClick={onDownloadH5p}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold text-sm cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>{isExporting ? 'Đang tạo...' : 'Tải file .h5p'}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};
