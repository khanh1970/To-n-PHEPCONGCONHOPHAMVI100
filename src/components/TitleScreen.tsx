import React, { useState } from 'react';
import { Download, FileCode2, Play, Sparkles } from 'lucide-react';
import { MathQuestion } from '../math/questions';

interface TitleScreenProps {
  questions: MathQuestion[];
  onStart: () => void;
  onOpenStudio: () => void;
  onQuickDownloadH5p: () => void;
  isExporting: boolean;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  questions,
  onStart,
  onOpenStudio,
  onQuickDownloadH5p,
  isExporting,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <main className="min-h-screen w-full bg-[#FAF9F5] text-slate-900 flex flex-col justify-between px-6 py-8 md:px-12 lg:py-10">
      <div className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        {/* Left Zone: Title Lockup, 5-Question Preview, Primary CTAs */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          {/* Custom Inline SVG Crest Lockup */}
          <div className="flex items-center gap-3">
            <svg
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="shrink-0"
            >
              <rect x="2" y="2" width="40" height="40" rx="10" fill="#1E293B" />
              <rect x="5" y="5" width="34" height="34" rx="7" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
              <path d="M12 16H32M12 28H32" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
              <circle cx="17" cy="16" r="3.5" fill="#2563EB" />
              <circle cx="26" cy="16" r="3.5" fill="#2563EB" />
              <circle cx="16" cy="28" r="3.5" fill="#D97706" />
              <circle cx="24" cy="28" r="3.5" fill="#D97706" />
              <circle cx="31" cy="28" r="3.5" fill="#059669" />
            </svg>
            <div>
              <p className="text-sm font-semibold tracking-wide text-amber-700">
                Toán Lớp 2 · Chủ đề Phép Cộng
              </p>
              <p className="text-xs text-slate-500">
                Gói bài tập tương tác chuẩn H5P
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-bold leading-[1.12] tracking-tight text-slate-900 [text-wrap:balance]">
              Phép cộng có nhớ trong phạm vi 100
            </h1>
            <p className="text-sm text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Số có 2 chữ số với số có 2 chữ số</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{questions.length} câu hỏi</span>
              <span aria-hidden="true">·</span>
              <span>Định dạng xuất .h5p</span>
            </p>
          </div>

          <p className="text-base text-slate-700 leading-relaxed max-w-xl">
            Các em luyện tập đặt tính dọc, cộng hàng đơn vị rồi nhớ 1 sang hàng chục qua 5 thử thách trực quan. Giáo viên có thể tùy chỉnh bộ câu hỏi và tải xuống tệp <span className="font-mono-math font-semibold text-slate-900">.h5p</span> để đưa lên Moodle hoặc hệ thống LMS.
          </p>

          {/* 5-Question Preview Strip (clean grid tiles, zero pill clutter) */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500">
              Bộ {questions.length} câu hỏi hiện tại
            </p>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-2.5 text-center"
                >
                  <div className="text-[11px] font-medium text-slate-500">
                    Câu {idx + 1}
                  </div>
                  <div className="font-mono-math text-sm font-semibold text-slate-900 mt-0.5 tabular-nums whitespace-nowrap">
                    {q.a} + {q.b}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Menu Actions (<= 3 actions) */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              data-start="true"
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:translate-y-px text-white font-semibold text-base shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>Bắt đầu chơi</span>
            </button>

            <button
              type="button"
              onClick={onQuickDownloadH5p}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold text-sm shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>{isExporting ? 'Đang đóng gói...' : 'Tải file .h5p'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenStudio}
              className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
            >
              <FileCode2 className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span>Soạn &amp; sửa 5 câu .h5p</span>
            </button>
          </div>
        </div>

        {/* Right Zone: Generated Classroom Artwork */}
        <div className="lg:col-span-6 flex">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-sm flex flex-col">
            <div className="relative flex-1 min-h-[280px] sm:min-h-[360px] rounded-xl overflow-hidden bg-amber-50">
              {!imgError ? (
                <img
                  src="/src/assets/images/math_blocks_hero_1794902256738.jpg"
                  alt="Bộ thanh chục, khối đơn vị bằng gỗ và vở ô ly toán lớp 2 trên bàn học"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-amber-50 to-blue-50">
                  <Sparkles className="w-10 h-10 text-amber-600 mb-3" aria-hidden="true" />
                  <p className="font-display text-lg font-semibold text-slate-800">
                    Bàn học Toán Lớp 2
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Mô hình que tính chục và đơn vị
                  </p>
                </div>
              )}
            </div>
            <div className="pt-3 px-1 flex items-center justify-between text-xs text-slate-500">
              <span>Phương pháp đặt tính dọc kết hợp khối chục &amp; đơn vị</span>
              <span className="font-mono-math tabular-nums text-slate-700 font-medium">
                10 đv = 1 chục
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom flat control hint */}
      <div className="max-w-6xl w-full mx-auto pt-6 text-center text-xs text-slate-500">
        <span>Enter hoặc Space Bắt đầu</span>
        <span className="mx-1" aria-hidden="true"> · </span>
        <span>Phím 1–4 Chọn đáp án</span>
        <span className="mx-1" aria-hidden="true"> · </span>
        <span>P Tạm dừng</span>
        <span className="mx-1" aria-hidden="true"> · </span>
        <span>M Bật/tắt âm thanh</span>
      </div>
    </main>
  );
};
