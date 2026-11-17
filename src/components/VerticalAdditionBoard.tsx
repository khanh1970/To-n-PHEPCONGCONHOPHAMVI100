import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { explainAddition } from '../math/questions';

interface VerticalAdditionBoardProps {
  a: number;
  b: number;
  showHint: boolean;
  isRevealed: boolean;
  onToggleHint: () => void;
}

export const VerticalAdditionBoard: React.FC<VerticalAdditionBoardProps> = ({
  a,
  b,
  showHint,
  isRevealed,
  onToggleHint,
}) => {
  const exp = explainAddition(a, b);
  const showCarryVisual = showHint || isRevealed;

  return (
    <section
      aria-label="Bảng đặt tính rồi tính"
      className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900">
            Đặt tính rồi tính
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cộng từ phải sang trái (hàng đơn vị trước)
          </p>
        </div>

        {!isRevealed && (
          <button
            type="button"
            onClick={onToggleHint}
            aria-pressed={showHint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {showHint ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span>Ẩn gợi ý</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span>Gợi ý nhớ 1</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Notebook Grid Vertical Addition */}
      <div className="notebook-grid border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center">
        <div className="w-full max-w-[240px]">
          {/* Column Headers */}
          <div className="grid grid-cols-3 text-center text-[11px] font-semibold text-slate-500 mb-2">
            <span aria-hidden="true" />
            <span>Chục</span>
            <span>Đơn vị</span>
          </div>

          {/* Carry Row */}
          <div className="grid grid-cols-3 items-center h-7 mb-1">
            <span aria-hidden="true" />
            <div className="flex justify-center">
              {showCarryVisual ? (
                <span
                  data-testid="carry-indicator"
                  className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800 font-mono-math text-xs font-bold"
                >
                  nhớ +{exp.carry}
                </span>
              ) : (
                <span className="text-xs text-slate-300 font-mono-math">?</span>
              )}
            </div>
            <span aria-hidden="true" />
          </div>

          {/* First Number */}
          <div className="grid grid-cols-3 items-center text-center font-mono-math text-4xl font-bold text-slate-900 leading-tight">
            <span aria-hidden="true" />
            <span className="py-1">{exp.aTens}</span>
            <span
              className={`py-1 rounded-md transition-colors ${
                showCarryVisual ? 'bg-amber-50 text-amber-900' : ''
              }`}
            >
              {exp.aOnes}
            </span>
          </div>

          {/* Second Number + Plus Sign */}
          <div className="grid grid-cols-3 items-center text-center font-mono-math text-4xl font-bold text-slate-900 leading-tight mt-1">
            <span className="text-blue-600 text-3xl">+</span>
            <span className="py-1">{exp.bTens}</span>
            <span
              className={`py-1 rounded-md transition-colors ${
                showCarryVisual ? 'bg-amber-50 text-amber-900' : ''
              }`}
            >
              {exp.bOnes}
            </span>
          </div>

          {/* Addition Line */}
          <div className="border-t-2 border-slate-800 my-2.5" />

          {/* Result Row */}
          <div className="grid grid-cols-3 items-center text-center font-mono-math text-4xl font-bold leading-tight">
            <span aria-hidden="true" />
            <span className={isRevealed ? 'text-emerald-700' : 'text-slate-300'}>
              {isRevealed ? Math.floor(exp.total / 10) : '?'}
            </span>
            <span
              className={
                isRevealed
                  ? 'text-emerald-700'
                  : showHint
                    ? 'text-amber-700'
                    : 'text-slate-300'
              }
            >
              {isRevealed || showHint ? exp.onesDigit : '?'}
            </span>
          </div>
        </div>
      </div>

      {/* Step-by-step Guidance or Base-10 Visual Blocks */}
      {showCarryVisual ? (
        <div
          data-testid="hint-explanation"
          className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm text-slate-800 space-y-1.5"
        >
          <p className="font-semibold text-amber-900">
            Bước 1 (Hàng đơn vị): {exp.aOnes} + {exp.bOnes} = {exp.onesSum} → viết{' '}
            <span className="font-mono-math font-bold">{exp.onesDigit}</span>, nhớ{' '}
            <span className="font-mono-math font-bold">{exp.carry}</span>.
          </p>
          {isRevealed ? (
            <p className="font-semibold text-emerald-800">
              Bước 2 (Hàng chục): {exp.aTens} + {exp.bTens} = {exp.aTens + exp.bTens}, thêm{' '}
              {exp.carry} bằng{' '}
              <span className="font-mono-math font-bold">{exp.tensSum}</span> → Kết quả:{' '}
              <span className="font-mono-math font-bold">{exp.total}</span>.
            </p>
          ) : (
            <p className="text-slate-700">
              Bước 2 (Hàng chục): Em cộng {exp.aTens} + {exp.bTens} rồi nhớ cộng thêm{' '}
              <span className="font-mono-math font-bold">{exp.carry}</span> nhé!
            </p>
          )}
        </div>
      ) : (
        /* Visual Base-10 Ten-Rods and Unit Cubes Preview */
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Mô hình thanh chục &amp; khối đơn vị</span>
            <span className="font-mono-math text-slate-500">
              {a} và {b}
            </span>
          </div>
          <div className="space-y-2">
            {/* Row for number a */}
            <div className="flex items-center gap-2">
              <span className="font-mono-math text-xs font-semibold text-slate-700 w-7">
                {a}:
              </span>
              <div className="flex flex-wrap items-center gap-1" aria-label={`${exp.aTens} thanh chục và ${exp.aOnes} khối đơn vị`}>
                {Array.from({ length: exp.aTens }).map((_, i) => (
                  <span
                    key={`at-${i}`}
                    className="inline-block w-2.5 h-5 rounded-xs bg-blue-600"
                    title="1 chục"
                  />
                ))}
                <span className="w-1" />
                {Array.from({ length: exp.aOnes }).map((_, i) => (
                  <span
                    key={`ao-${i}`}
                    className="inline-block w-2.5 h-2.5 rounded-xs bg-amber-500"
                    title="1 đơn vị"
                  />
                ))}
              </div>
            </div>
            {/* Row for number b */}
            <div className="flex items-center gap-2">
              <span className="font-mono-math text-xs font-semibold text-slate-700 w-7">
                {b}:
              </span>
              <div className="flex flex-wrap items-center gap-1" aria-label={`${exp.bTens} thanh chục và ${exp.bOnes} khối đơn vị`}>
                {Array.from({ length: exp.bTens }).map((_, i) => (
                  <span
                    key={`bt-${i}`}
                    className="inline-block w-2.5 h-5 rounded-xs bg-blue-600"
                    title="1 chục"
                  />
                ))}
                <span className="w-1" />
                {Array.from({ length: exp.bOnes }).map((_, i) => (
                  <span
                    key={`bo-${i}`}
                    className="inline-block w-2.5 h-2.5 rounded-xs bg-amber-500"
                    title="1 đơn vị"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
