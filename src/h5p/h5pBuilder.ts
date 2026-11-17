import JSZip from 'jszip';
import { explainAddition, isValidCarryingAddition, MathQuestion } from '../math/questions';

export type H5pQuestionFormat = 'multichoice' | 'blanks';

export interface H5pExportConfig {
  title: string;
  format: H5pQuestionFormat;
  passPercentage: number;
  shuffleAnswers: boolean;
}

export interface H5pDependency {
  machineName: string;
  majorVersion: number;
  minorVersion: number;
}

export interface H5pManifest {
  title: string;
  language: string;
  mainLibrary: string;
  embedTypes: string[];
  license: string;
  preloadedDependencies: H5pDependency[];
}

export interface H5pPackageEntry {
  path: string;
  size: number;
}

export interface H5pPackageResult {
  filename: string;
  h5pJson: H5pManifest;
  contentJson: Record<string, unknown>;
  entries: H5pPackageEntry[];
  blob: Blob;
  buffer: Uint8Array;
}

function deterministicUuid(index: number, seed: string): string {
  const hex = Array.from(`${index}-${seed}`)
    .map((ch) => ch.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
    .padEnd(32, '0')
    .slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function buildH5pManifest(config: H5pExportConfig): H5pManifest {
  const questionDependency: H5pDependency =
    config.format === 'multichoice'
      ? { machineName: 'H5P.MultiChoice', majorVersion: 1, minorVersion: 16 }
      : { machineName: 'H5P.Blanks', majorVersion: 1, minorVersion: 14 };

  return {
    title: config.title.trim() || 'Phép cộng có nhớ trong phạm vi 100 (Toán lớp 2)',
    language: 'vi',
    mainLibrary: 'H5P.QuestionSet',
    embedTypes: ['div'],
    license: 'CC BY',
    preloadedDependencies: [
      { machineName: 'H5P.QuestionSet', majorVersion: 1, minorVersion: 20 },
      questionDependency,
      { machineName: 'H5P.Question', majorVersion: 1, minorVersion: 5 },
      { machineName: 'H5P.JoubelUI', majorVersion: 1, minorVersion: 3 },
      { machineName: 'FontAwesome', majorVersion: 4, minorVersion: 5 },
    ],
  };
}

function buildMultiChoiceQuestion(q: MathQuestion, index: number, shuffleAnswers: boolean) {
  const exp = explainAddition(q.a, q.b);
  const tip = `Đặt tính thẳng cột: ${exp.step1Text} ${exp.step2Text}`;

  return {
    library: 'H5P.MultiChoice 1.16',
    params: {
      media: { disableImageZooming: false },
      question: `<p><strong>Câu ${index + 1}:</strong> Tính kết quả phép cộng có nhớ sau:</p><p style="font-size:1.5em;"><strong>${q.a} + ${q.b} = ?</strong></p>`,
      answers: q.options.map((opt) => {
        const isCorrect = opt === exp.total;
        return {
          text: `<div>${opt}</div>`,
          correct: isCorrect,
          tipsAndFeedback: {
            tip: isCorrect ? tip : '',
            chosenFeedback: isCorrect
              ? `<div>Chính xác! ${exp.step1Text} ${exp.step2Text} ${exp.summaryText}</div>`
              : `<div>Chưa đúng rồi. Gợi ý: ${exp.step1Text} ${exp.step2Text}</div>`,
            notChosenFeedback: '',
          },
        };
      }),
      overallFeedback: [
        { from: 0, to: 99, feedback: 'Hãy đặt tính dọc và nhớ cộng thêm 1 vào hàng chục nhé!' },
        { from: 100, to: 100, feedback: 'Tuyệt vời! Bạn đã tính đúng phép cộng có nhớ.' },
      ],
      behaviour: {
        enableRetry: true,
        enableSolutionsButton: true,
        enableCheckButton: true,
        type: 'auto',
        singlePoint: true,
        randomAnswers: shuffleAnswers,
        showSolutionsRequiresInput: true,
        confirmCheckDialog: false,
        confirmRetryDialog: false,
        autoCheck: false,
        passPercentage: 100,
        showScorePoints: true,
      },
      UI: {
        checkAnswerButton: 'Kiểm tra',
        submitAnswerButton: 'Nộp bài',
        showSolutionButton: 'Xem đáp án',
        tryAgainButton: 'Làm lại',
        tipsLabel: 'Gợi ý',
        scoreBarLabel: 'Bạn đạt :num trên :total điểm',
        tipAvailable: 'Có gợi ý',
        feedbackAvailable: 'Có nhận xét',
        readFeedback: 'Đọc nhận xét',
        wrongAnswer: 'Chưa chính xác',
        correctAnswer: 'Chính xác',
        shouldCheck: 'Nên chọn đáp án này',
        shouldNotCheck: 'Không nên chọn đáp án này',
        noInput: 'Vui lòng chọn một đáp án trước khi kiểm tra!',
        a11yCheck: 'Kiểm tra đáp án',
        a11yShowSolution: 'Hiển thị đáp án đúng',
        a11yRetry: 'Làm lại câu hỏi',
      },
      confirmCheck: {
        header: 'Hoàn thành?',
        body: 'Bạn có chắc chắn muốn kiểm tra câu trả lời không?',
        cancelLabel: 'Hủy',
        confirmLabel: 'Xác nhận',
      },
      confirmRetry: {
        header: 'Làm lại?',
        body: 'Bạn muốn làm lại câu hỏi này không?',
        cancelLabel: 'Hủy',
        confirmLabel: 'Làm lại',
      },
    },
    subContentId: deterministicUuid(index + 1, `${q.a}+${q.b}-mc`),
    metadata: {
      contentType: 'Multiple Choice',
      license: 'U',
      title: `Câu ${index + 1}: ${q.a} + ${q.b}`,
    },
  };
}

function buildBlanksQuestion(q: MathQuestion, index: number) {
  const exp = explainAddition(q.a, q.b);
  const tip = `${exp.step1Text} ${exp.step2Text}`;

  return {
    library: 'H5P.Blanks 1.14',
    params: {
      media: { disableImageZooming: false },
      text: `<p><strong>Câu ${index + 1}:</strong> Điền kết quả đúng vào ô trống (phép cộng có nhớ):</p>`,
      questions: [`<p>${q.a} + ${q.b} = *${exp.total}:${tip}*</p>`],
      overallFeedback: [
        { from: 0, to: 99, feedback: `Chưa đúng. ${exp.step1Text} ${exp.step2Text} ${exp.summaryText}` },
        { from: 100, to: 100, feedback: `Giỏi lắm! ${exp.summaryText}` },
      ],
      showSolutions: 'Xem đáp án',
      tryAgain: 'Làm lại',
      checkAnswer: 'Kiểm tra',
      submitAnswer: 'Nộp bài',
      notFilledOut: 'Hãy điền số vào ô trống trước khi kiểm tra!',
      answerIsCorrect: 'Chính xác!',
      answerIsWrong: 'Chưa đúng, hãy thử tính lại nhé!',
      answeredCorrectly: 'Bạn đã trả lời đúng',
      answeredIncorrectly: 'Bạn trả lời chưa đúng',
      solutionLabel: 'Đáp án đúng:',
      inputLabel: `Ô nhập kết quả câu ${index + 1}`,
      inputHasTipLabel: 'Có gợi ý',
      tipLabel: 'Gợi ý',
      behaviour: {
        enableRetry: true,
        enableSolutionsButton: true,
        enableCheckButton: true,
        autoCheck: false,
        caseSensitive: false,
        showSolutionsRequiresInput: true,
        separateLines: false,
        confirmCheckDialog: false,
        confirmRetryDialog: false,
        acceptSpellingErrors: false,
      },
      confirmCheck: {
        header: 'Kiểm tra?',
        body: 'Bạn muốn kiểm tra đáp án vừa điền không?',
        cancelLabel: 'Hủy',
        confirmLabel: 'Kiểm tra',
      },
      confirmRetry: {
        header: 'Làm lại?',
        body: 'Bạn muốn xóa và điền lại không?',
        cancelLabel: 'Hủy',
        confirmLabel: 'Đồng ý',
      },
      scoreBarLabel: 'Bạn đạt :num trên :total điểm',
    },
    subContentId: deterministicUuid(index + 1, `${q.a}+${q.b}-blanks`),
    metadata: {
      contentType: 'Fill in the Blanks',
      license: 'U',
      title: `Câu ${index + 1}: ${q.a} + ${q.b}`,
    },
  };
}

export function buildH5pContentJson(
  questions: MathQuestion[],
  config: H5pExportConfig
): Record<string, unknown> {
  const validQuestions = questions.filter((q) => isValidCarryingAddition(q.a, q.b).valid);
  if (validQuestions.length === 0) {
    throw new Error('Không có câu hỏi hợp lệ để tạo gói .h5p');
  }

  const h5pQuestions = validQuestions.map((q, index) =>
    config.format === 'multichoice'
      ? buildMultiChoiceQuestion(q, index, config.shuffleAnswers)
      : buildBlanksQuestion(q, index)
  );

  return {
    introPage: {
      showIntroPage: true,
      startButtonText: 'Bắt đầu làm bài',
      title: config.title.trim() || 'Trò chơi Toán lớp 2: Phép cộng có nhớ trong phạm vi 100',
      introduction:
        '<p>Chào mừng các em đến với thử thách <strong>5 câu phép cộng có nhớ trong phạm vi 100</strong> (số có 2 chữ số cộng với số có 2 chữ số). Hãy tính thật cẩn thận từ hàng đơn vị trước nhé!</p>',
    },
    progressType: 'dots',
    passPercentage: config.passPercentage,
    disableBackwardsNavigation: false,
    randomQuestions: false,
    questions: h5pQuestions,
    texts: {
      prevButton: 'Câu trước',
      nextButton: 'Câu tiếp theo',
      finishButton: 'Nộp bài',
      submitButton: 'Gửi kết quả',
      textualProgress: 'Câu @current / @total',
      jumpToQuestion: 'Chuyển tới câu %d / %total',
      questionLabel: 'Câu hỏi',
      readSpeakerProgress: 'Câu hỏi @current trên @total',
      unansweredText: 'Chưa trả lời',
      answeredText: 'Đã trả lời',
      currentQuestionText: 'Câu hỏi hiện tại',
      navigationLabel: 'Các câu hỏi',
    },
    endGame: {
      showResultPage: true,
      showSolutionButton: true,
      showRetryButton: true,
      noResultMessage: 'Đã hoàn thành bài luyện tập!',
      message: 'Kết quả luyện tập của em:',
      scoreBarLabel: 'Em đạt @score trên @total điểm.',
      overallFeedback: [
        { from: 0, to: 59, feedback: 'Cố gắng thêm nhé! Em hãy xem lại cách nhớ 1 từ hàng đơn vị sang hàng chục.' },
        { from: 60, to: 99, feedback: 'Khá lắm! Em chỉ cần cẩn thận thêm một chút ở bước cộng có nhớ.' },
        { from: 100, to: 100, feedback: 'Xuất sắc! Em đã hoàn thành 5/5 câu phép cộng có nhớ!' },
      ],
      solutionButtonText: 'Xem lại đáp án',
      retryButtonText: 'Chơi lại',
      finishButtonText: 'Hoàn thành',
      submitButtonText: 'Gửi',
      showAnimations: false,
      skippable: false,
      skipButtonText: 'Bỏ qua',
    },
    override: {
      checkButton: true,
    },
  };
}

export function slugifyFilename(title: string): string {
  const normalized = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${normalized || 'phep-cong-co-nho-lop-2'}.h5p`;
}

export async function buildH5pPackage(
  questions: MathQuestion[],
  config: H5pExportConfig
): Promise<H5pPackageResult> {
  const h5pJson = buildH5pManifest(config);
  const contentJson = buildH5pContentJson(questions, config);

  const zip = new JSZip();
  const h5pStr = JSON.stringify(h5pJson, null, 2);
  const contentStr = JSON.stringify(contentJson, null, 2);

  zip.file('h5p.json', h5pStr);
  zip.file('content/content.json', contentStr);

  const buffer = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: 'application/zip' });

  const entries: H5pPackageEntry[] = [
    { path: 'h5p.json', size: new TextEncoder().encode(h5pStr).length },
    { path: 'content/content.json', size: new TextEncoder().encode(contentStr).length },
  ];

  return {
    filename: slugifyFilename(config.title),
    h5pJson,
    contentJson,
    entries,
    blob,
    buffer,
  };
}
