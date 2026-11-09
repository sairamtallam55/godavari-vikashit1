import React, { useState } from 'react';
import { QuizQuestion, Language } from '../types';
import { assessQuizSubmission, QuizResultAssessment } from '../utils/heritageLogic';
import { getUIText } from '../i18n/translations';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Crown,
  Compass,
} from 'lucide-react';

interface Props {
  questions: QuizQuestion[];
  lang: Language;
  onBadgeUnlocked?: (badge: { id: string; title: string }) => void;
}

export const EducationQuizPage: React.FC<Props> = ({
  questions,
  lang,
  onBadgeUnlocked,
}) => {
  const [levelFilter, setLevelFilter] = useState<'all' | 'beginner' | 'advanced'>('all');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [assessment, setAssessment] = useState<QuizResultAssessment | null>(null);

  const activeQuestions = questions.filter((q) => {
    if (levelFilter === 'all') return true;
    return q.level === levelFilter;
  });

  const currentQ = activeQuestions[currentQuestionIndex] || activeQuestions[0];
  const total = activeQuestions.length;
  const isSelected = userAnswers[currentQ?.id] !== undefined;

  const handleSelectOption = (idx: number) => {
    if (hasSubmittedCurrent) return; // locked after checking
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: idx,
    }));
  };

  const handleVerifyCurrent = () => {
    setHasSubmittedCurrent(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < total - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setHasSubmittedCurrent(false);
    } else {
      // Completed all questions
      const result = assessQuizSubmission(userAnswers, activeQuestions);
      setAssessment(result);
      setQuizCompleted(true);
      if (result.earnedBadge && onBadgeUnlocked) {
        onBadgeUnlocked(result.earnedBadge);
      }
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setHasSubmittedCurrent(false);
    setQuizCompleted(false);
    setAssessment(null);
  };

  const handleFilterChange = (lvl: 'all' | 'beginner' | 'advanced') => {
    setLevelFilter(lvl);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setHasSubmittedCurrent(false);
    setQuizCompleted(false);
    setAssessment(null);
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Cultural Education & Trivia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heritage text-white">
              {getUIText('quizTitle', lang)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {getUIText('quizSubtitle', lang)}
            </p>
          </div>

          {/* Level Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto text-xs">
            {(['all', 'beginner', 'advanced'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleFilterChange(lvl)}
                className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition ${
                  levelFilter === lvl
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Quiz Flow */}
      {!quizCompleted ? (
        currentQ ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
            {/* Progress Bar & Counter */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>
                  Question {currentQuestionIndex + 1} of {total}
                </span>
                <span className="uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                  {currentQ.level} • {currentQ.category}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {currentQ.question[lang] || currentQ.question.en}
              </h2>
            </div>

            {/* Options List */}
            <div className="flex flex-col gap-3">
              {currentQ.options.map((opt, idx) => {
                const isUserChoice = userAnswers[currentQ.id] === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = 'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-700';

                if (hasSubmittedCurrent) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-950/50 text-emerald-200 font-bold';
                  } else if (isUserChoice && !isCorrect) {
                    btnStyle = 'border-red-500 bg-red-950/50 text-red-200';
                  } else {
                    btnStyle = 'border-slate-800 bg-slate-950/40 text-slate-500';
                  }
                } else if (isUserChoice) {
                  btnStyle = 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold shadow-md';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={hasSubmittedCurrent}
                    className={`p-4 rounded-xl border text-left text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt[lang] || opt.en}</span>
                    </div>

                    {hasSubmittedCurrent && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {hasSubmittedCurrent && isUserChoice && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Drawer after checking */}
            {hasSubmittedCurrent && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 uppercase tracking-wider mb-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{getUIText('explanation', lang)}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {currentQ.explanation[lang] || currentQ.explanation.en}
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {isSelected ? 'Answer selected' : 'Please select an option'}
              </span>

              {!hasSubmittedCurrent ? (
                <button
                  type="button"
                  onClick={handleVerifyCurrent}
                  disabled={!isSelected}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md disabled:opacity-40 disabled:pointer-events-none transition"
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition"
                >
                  <span>{currentQuestionIndex < total - 1 ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">No questions available for this level.</div>
        )
      ) : (
        /* QUIZ COMPLETION SUMMARY SCREEN */
        <div className="rounded-3xl border border-amber-500/40 bg-slate-900/90 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-6 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="p-5 rounded-full bg-amber-500/20 text-amber-400 shadow-inner">
            <Award className="w-16 h-16" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-heritage text-white">
              Quiz Completed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Here is your performance in the Godavari Pushkaralu Cultural Learning Assessment:
            </p>
          </div>

          {/* Score Card */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 w-full max-w-sm flex items-center justify-around">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-amber-400">
                {assessment?.score} / {assessment?.total}
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">
                {getUIText('score', lang)}
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800" />

            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                {assessment?.percentage}%
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">
                Accuracy Rate
              </div>
            </div>
          </div>

          {/* Earned Badge Showcase */}
          {assessment?.earnedBadge && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/50 max-w-md w-full text-center flex flex-col items-center gap-2">
              <Crown className="w-8 h-8 text-amber-400 animate-bounce" />
              <div className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                New Achievement Badge Unlocked!
              </div>
              <div className="text-lg font-heritage font-bold text-white">
                {assessment.earnedBadge.title}
              </div>
              <p className="text-xs text-slate-300 max-w-xs">
                {assessment.earnedBadge.description}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResetQuiz}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{getUIText('retryQuiz', lang)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
