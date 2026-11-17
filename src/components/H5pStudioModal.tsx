import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileArchive,
  Play,
  RotateCcw,
  Shuffle,
  X,
} from 'lucide-react';
import {
  buildH5pContentJson,
  buildH5pManifest,
  H5pExportConfig,
  H5pQuestionFormat,
  slugifyFilename,
} from '../h5p/h5pBuilder';
import {
  createQuestion,
  DEFAULT_QUESTIONS,
  generateQuestionSet,
  isValidCarryingAddition,
  MathQuestion,
} from '../math/questions';

interface H5pStudioModalProps {
  questions: MathQuestion[];
  exportConfig: H5pExportConfig;
  isExporting: boolean;
  lastExportMessage: string | null;
  onClose: () => void;
  onApplyQuestions: (nextQuestions: MathQuestion[], nextConfig: H5pExportConfig, startGame?: boolean) => void;
  onExportH5p: (questionsToExport: MathQuestion[], configToExport: H5pExportConfig) => void;
}

interface DraftRow {
  id: string;
  aStr: string;
  bStr: string;
}

export const H5pStudioModal: React.FC<H5pStudioModalProps> = ({
  questions,
  exportConfig,
  isExporting,
  lastExportMessage,
  onClose,
  onApplyQuestions,
  onExportH5p,
}) => {
  const [draftRows, setDraftRows] = useState<DraftRow[]>(() =>
    questions.map((q) => ({ id: q.id, aStr: String(q.a), bStr: String(q.b) }))
  );
  const [config, setConfig] = useState<H5pExportConfig>(exportConfig);
  const [activeTab, setActiveTab] = useState<'editor' | 'h5p-json' | 'content-json'>('editor');
  const [copiedTab, setCopiedTab] = useState<'h5p-json' | 'content-json' | null>(null);

  const rowEvaluations = useMemo(() => {
    return draftRows.map((row) => {
      const a = Number(row.aStr);
      const b = Number(row.bStr);
      const validation = isValidCarryingAddition(a, b);
      return {
        id: row.id,
        a,
        b,
        validation,
      };
    });
  }, [draftRows]);

  const allValid = rowEvaluations.every((r) => r.validation.valid);

  const builtQuestions: MathQuestion[] = useMemo(() => {
    if (!allValid) return questions;
    return rowEvaluations.map((r, idx) => createQuestion(`q${idx + 1}`, r.a, r.b));
  }, [allValid, questions, rowEvaluations]);

  const previewManifestJson = useMemo(() => {
    return JSON.stringify(buildH5pManifest(config), null, 2);
  }, [config]);

  const previewContentJson = useMemo(() => {
    try {
      return JSON.stringify(buildH5pContentJson(builtQuestions, config), null, 2);
    } catch {
      return '// Vui lòng sửa các câu hỏi chưa hợp lệ để xem trước content/content.json';
    }
  }, [builtQuestions, config]);

  const handleRandomize = () => {
    const fresh = generateQuestionSet(5);
    setDraftRows(fresh.map((q) => ({ id: q.id, aStr: String(q.a), bStr: String(q.b) })));
  };

  const handleResetDefault = () => {
    setDraftRows(
      DEFAULT_QUESTIONS.map((q) => ({ id: q.id, aStr: String(q.a), bStr: String(q.b) }))
    );
  };

  const handleRowChange = (idx: number, field: 'aStr' | 'bStr', val: string) => {
    setDraftRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: val } : row))
    );
  };

  const filenamePreview = slugifyFilename(config.title);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="h5p-studio-title"
      className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-xl overflow-hidden">
        {/* Studio Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <FileArchive className="w-5 h-5 text-amber-700" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2
                id="h5p-studio-title"
                className="font-display text-lg sm:text-xl font-bold text-slate-900 truncate"
              >
                Trình soạn thảo &amp; Xuất gói .h5p
              </h2>
              <p className="text-xs text-slate-600 truncate">
                Chuẩn H5P.QuestionSet (5 câu phép cộng có nhớ trong phạm vi 100)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng trình soạn thảo .h5p"
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 inline-flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div role="tablist" aria-label="Chế độ xem .h5p" className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'editor'}
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                activeTab === 'editor'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Soạn 5 câu hỏi
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'h5p-json'}
              onClick={() => setActiveTab('h5p-json')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                activeTab === 'h5p-json'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Xem h5p.json
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'content-json'}
              onClick={() => setActiveTab('content-json')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                activeTab === 'content-json'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Xem content/content.json
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono-math truncate">
            Tệp xuất: <strong className="text-slate-800">{filenamePreview}</strong>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'editor' ? (
            <>
              {/* Package Configuration Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="md:col-span-6 space-y-1.5">
                  <label htmlFor="h5p-title-input" className="block text-xs font-semibold text-slate-700">
                    Tên bài học H5P
                  </label>
                  <input
                    id="h5p-title-input"
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-4 space-y-1.5">
                  <label htmlFor="h5p-format-select" className="block text-xs font-semibold text-slate-700">
                    Dạng câu hỏi trong .h5p
                  </label>
                  <select
                    id="h5p-format-select"
                    value={config.format}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        format: e.target.value as H5pQuestionFormat,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="multichoice">Trắc nghiệm 4 đáp án (H5P.MultiChoice)</option>
                    <option value="blanks">Điền số vào ô trống (H5P.Blanks)</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label htmlFor="h5p-pass-select" className="block text-xs font-semibold text-slate-700">
                    Điểm đạt
                  </label>
                  <select
                    id="h5p-pass-select"
                    value={config.passPercentage}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        passPercentage: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value={60}>60% (3/5)</option>
                    <option value={80}>80% (4/5)</option>
                    <option value={100}>100% (5/5)</option>
                  </select>
                </div>
              </div>

              {/* Toolbar for 5 Questions */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Danh sách 5 câu hỏi (Số có 2 chữ số + Số có 2 chữ số, có nhớ, tổng ≤ 100)
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRandomize}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                    <span>Tạo 5 câu ngẫu nhiên</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetDefault}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Khôi phục câu mẫu</span>
                  </button>
                </div>
              </div>

              {/* 5 Editable Question Rows */}
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {draftRows.map((row, idx) => {
                  const ev = rowEvaluations[idx];
                  const isValid = ev.validation.valid;
                  const sum = Number.isFinite(ev.a) && Number.isFinite(ev.b) ? ev.a + ev.b : '?';

                  return (
                    <div key={row.id} className="p-4 bg-white space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-bold text-slate-600 w-12 tabular-nums">
                            Câu {idx + 1}
                          </span>

                          <div className="flex items-center gap-2">
                            <label htmlFor={`q-${idx}-a`} className="sr-only">
                              Số hạng thứ nhất câu {idx + 1}
                            </label>
                            <input
                              id={`q-${idx}-a`}
                              type="number"
                              min={10}
                              max={89}
                              value={row.aStr}
                              onChange={(e) => handleRowChange(idx, 'aStr', e.target.value)}
                              className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono-math text-base font-bold text-center text-slate-900 tabular-nums focus:border-blue-600 focus:outline-none"
                            />
                            <span className="font-mono-math text-lg font-bold text-slate-500">+</span>
                            <label htmlFor={`q-${idx}-b`} className="sr-only">
                              Số hạng thứ hai câu {idx + 1}
                            </label>
                            <input
                              id={`q-${idx}-b`}
                              type="number"
                              min={10}
                              max={89}
                              value={row.bStr}
                              onChange={(e) => handleRowChange(idx, 'bStr', e.target.value)}
                              className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono-math text-base font-bold text-center text-slate-900 tabular-nums focus:border-blue-600 focus:outline-none"
                            />
                            <span className="font-mono-math text-lg font-bold text-slate-500">=</span>
                            <span className="font-mono-math text-lg font-bold text-blue-700 w-12 tabular-nums">
                              {sum}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs font-medium">
                          {isValid ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700">
                              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                              <span>Hợp lệ (nhớ 1: {(ev.a % 10)} + {(ev.b % 10)} = {(ev.a % 10) + (ev.b % 10)})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-rose-700">
                              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                              <span>{ev.validation.reason}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : activeTab === 'h5p-json' ? (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-600">
                  Tệp <span className="font-mono-math font-semibold">h5p.json</span> khai báo thư viện gốc{' '}
                  <span className="font-mono-math font-semibold">H5P.QuestionSet</span> và các phụ thuộc cho Moodle / WordPress / Lumi:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(previewManifestJson).catch(() => {});
                    setCopiedTab('h5p-json');
                    setTimeout(() => setCopiedTab(null), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                >
                  {copiedTab === 'h5p-json' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Sao chép JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono-math overflow-x-auto leading-relaxed">
                {previewManifestJson}
              </pre>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-600">
                  Tệp <span className="font-mono-math font-semibold">content/content.json</span> chứa toàn bộ 5 câu hỏi, đáp án, gợi ý đặt tính có nhớ và giao diện tiếng Việt:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(previewContentJson).catch(() => {});
                    setCopiedTab('content-json');
                    setTimeout(() => setCopiedTab(null), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer whitespace-nowrap"
                >
                  {copiedTab === 'content-json' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Sao chép JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono-math overflow-x-auto max-h-[420px] leading-relaxed">
                {previewContentJson}
              </pre>
            </div>
          )}

          {lastExportMessage && (
            <div
              role="status"
              className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-sm text-emerald-900 flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>{lastExportMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Tệp <span className="font-mono-math font-semibold">.h5p</span> là gói ZIP chuẩn gồm{' '}
            <span className="font-mono-math">h5p.json</span> và{' '}
            <span className="font-mono-math">content/content.json</span>.
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={!allValid}
              onClick={() => onApplyQuestions(builtQuestions, config, true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-800 text-sm font-semibold cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span>Áp dụng &amp; Chơi thử</span>
            </button>

            <button
              type="button"
              disabled={!allValid || isExporting}
              onClick={() => {
                onApplyQuestions(builtQuestions, config, false);
                onExportH5p(builtQuestions, config);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>{isExporting ? 'Đang đóng gói...' : 'Tải xuống file .h5p'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
