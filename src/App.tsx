import { useCallback, useEffect, useState } from 'react';
import { GamePlayStage, QuestionAttempt } from './components/GamePlayStage';
import { H5pStudioModal } from './components/H5pStudioModal';
import { PauseModal } from './components/PauseModal';
import { SummaryScreen } from './components/SummaryScreen';
import { TitleScreen } from './components/TitleScreen';
import {
  playClickSound,
  playCorrectSound,
  playVictorySound,
  playWrongSound,
} from './game/sound';
import { buildH5pPackage, H5pExportConfig } from './h5p/h5pBuilder';
import {
  DEFAULT_QUESTIONS,
  generateQuestionSet,
  MathQuestion,
} from './math/questions';

type GameState = 'title' | 'playing' | 'paused' | 'gameover';

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'playing';
      }
    }
    return 'title';
  });

  const [questions, setQuestions] = useState<MathQuestion[]>(DEFAULT_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [score, setScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [muted, setMuted] = useState(false);

  const [studioOpen, setStudioOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [exportConfig, setExportConfig] = useState<H5pExportConfig>({
    title: 'Phép cộng có nhớ trong phạm vi 100 (Toán lớp 2)',
    format: 'multichoice',
    passPercentage: 80,
    shuffleAnswers: true,
  });

  // Sync document.body.dataset.state with the game state machine
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Game timer ticks once per second only during active playing state (and when studio is closed)
  useEffect(() => {
    if (gameState !== 'playing' || studioOpen) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [gameState, studioOpen]);

  const startNewRun = useCallback((customQuestions?: MathQuestion[]) => {
    if (customQuestions) {
      setQuestions(customQuestions);
    }
    setExportToast(null);
    setCurrentIndex(0);
    setAttempts([]);
    setScore(0);
    setElapsedSeconds(0);
    setGameState('playing');
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  const handleStartFromTitle = useCallback(() => {
    playClickSound(muted);
    startNewRun();
  }, [muted, startNewRun]);

  const handlePause = useCallback(() => {
    setGameState((prev) => (prev === 'playing' ? 'paused' : prev));
  }, []);

  const handleResume = useCallback(() => {
    playClickSound(muted);
    setGameState('playing');
  }, [muted]);

  const handleReturnTitle = useCallback(() => {
    playClickSound(muted);
    setGameState('title');
    setCurrentIndex(0);
    setAttempts([]);
    setScore(0);
    setElapsedSeconds(0);
  }, [muted]);

  const handleSubmitAnswer = useCallback(
    (chosenAnswer: number) => {
      const q = questions[currentIndex];
      if (!q || attempts[currentIndex]) return;

      const correctAnswer = q.a + q.b;
      const isCorrect = chosenAnswer === correctAnswer;

      if (isCorrect) {
        playCorrectSound(muted);
        setScore((prev) => prev + 10);
      } else {
        playWrongSound(muted);
      }

      const nextAttempt: QuestionAttempt = {
        questionId: q.id,
        a: q.a,
        b: q.b,
        correctAnswer,
        chosenAnswer,
        isCorrect,
      };

      setAttempts((prev) => {
        const copy = [...prev];
        copy[currentIndex] = nextAttempt;
        return copy;
      });
    },
    [attempts, currentIndex, muted, questions]
  );

  const handleNextQuestion = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      playClickSound(muted);
      setCurrentIndex((prev) => prev + 1);
    } else {
      playVictorySound(muted);
      setGameState('gameover');
    }
  }, [currentIndex, muted, questions.length]);

  const handleNewRandomRound = useCallback(() => {
    playClickSound(muted);
    const fresh = generateQuestionSet(5);
    startNewRun(fresh);
  }, [muted, startNewRun]);

  const handleExportH5p = useCallback(
    async (questionsToExport: MathQuestion[], configToExport: H5pExportConfig) => {
      setIsExporting(true);
      try {
        const result = await buildH5pPackage(questionsToExport, configToExport);
        triggerBrowserDownload(result.blob, result.filename);
        const kb = (result.buffer.byteLength / 1024).toFixed(1);
        setExportToast(
          `Đã xuất thành công gói ${result.filename} (${kb} KB · gồm ${result.entries.map((e) => e.path).join(', ')}).`
        );
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  // Auto-dismiss export toast when not inside the studio modal
  useEffect(() => {
    if (!exportToast || studioOpen) return;
    const id = window.setTimeout(() => setExportToast(null), 6000);
    return () => window.clearTimeout(id);
  }, [exportToast, studioOpen]);

  // Global keyboard shortcuts (Enter/Space on title, P/Escape pause, M mute, R restart)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (studioOpen) {
        if (e.key === 'Escape') {
          setStudioOpen(false);
        }
        return;
      }

      const target = e.target as HTMLElement | null;
      const isTyping =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');
      if (isTyping) return;

      if (gameState === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleStartFromTitle();
        return;
      }

      if (gameState === 'playing') {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          e.preventDefault();
          handlePause();
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          startNewRun();
        } else if (e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          setMuted((prev) => !prev);
        }
      } else if (gameState === 'paused') {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
          e.preventDefault();
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameState, handlePause, handleResume, handleStartFromTitle, startNewRun, studioOpen]);

  return (
    <>
      {gameState === 'title' && (
        <TitleScreen
          questions={questions}
          onStart={handleStartFromTitle}
          onOpenStudio={() => {
            setExportToast(null);
            setStudioOpen(true);
          }}
          onQuickDownloadH5p={() => handleExportH5p(questions, exportConfig)}
          isExporting={isExporting}
        />
      )}

      {(gameState === 'playing' || gameState === 'paused') && (
        <GamePlayStage
          questions={questions}
          currentIndex={currentIndex}
          score={score}
          elapsedSeconds={elapsedSeconds}
          attempts={attempts}
          muted={muted}
          onToggleMute={() => setMuted((prev) => !prev)}
          onPause={handlePause}
          onRestart={() => startNewRun()}
          onOpenStudio={() => {
            setExportToast(null);
            setStudioOpen(true);
          }}
          onSubmitAnswer={handleSubmitAnswer}
          onNextQuestion={handleNextQuestion}
        />
      )}

      {gameState === 'paused' && (
        <PauseModal
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          score={score}
          onResume={handleResume}
          onRestart={() => startNewRun()}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {gameState === 'gameover' && (
        <SummaryScreen
          attempts={attempts}
          score={score}
          elapsedSeconds={elapsedSeconds}
          isExporting={isExporting}
          onPlayAgain={() => startNewRun()}
          onNewRandomRound={handleNewRandomRound}
          onDownloadH5p={() => handleExportH5p(questions, exportConfig)}
          onOpenStudio={() => {
            setExportToast(null);
            setStudioOpen(true);
          }}
          onReturnTitle={handleReturnTitle}
        />
      )}

      {/* Quick Export Feedback Toast on Title / Summary */}
      {exportToast && !studioOpen && (
        <div
          role="status"
          className="fixed bottom-4 right-4 z-40 max-w-md bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-lg text-xs sm:text-sm flex items-center justify-between gap-3"
        >
          <span>{exportToast}</span>
          <button
            type="button"
            onClick={() => setExportToast(null)}
            aria-label="Đóng thông báo"
            className="text-emerald-200 hover:text-white font-semibold cursor-pointer shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {studioOpen && (
        <H5pStudioModal
          questions={questions}
          exportConfig={exportConfig}
          isExporting={isExporting}
          lastExportMessage={exportToast}
          onClose={() => setStudioOpen(false)}
          onApplyQuestions={(nextQuestions, nextConfig, shouldStart) => {
            setQuestions(nextQuestions);
            setExportConfig(nextConfig);
            if (shouldStart) {
              setStudioOpen(false);
              startNewRun(nextQuestions);
            }
          }}
          onExportH5p={handleExportH5p}
        />
      )}
    </>
  );
}
