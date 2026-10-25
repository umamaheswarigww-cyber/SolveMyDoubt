import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Sparkles, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DoubtCard } from '../components/common/DoubtCard';
import { QuestionCommentsModal } from '../components/common/QuestionCommentsModal';
import { INITIAL_QUESTIONS } from '../lib/mockData';
import { Question } from '../types';

export const BookmarksPage: React.FC = () => {
  const { isGuest } = useAuth();
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS.slice(0, 3));
  const [activeModalQuestion, setActiveModalQuestion] = useState<Question | null>(null);

  if (isGuest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <Bookmark className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Saved Doubts Require a Registered Member Account
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Guest sessions cannot persist personal bookmarks across devices. Sign up in 10 seconds to save questions and formulas!
        </p>
        <Link
          to="/auth?mode=signup"
          className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs hover:bg-indigo-500"
        >
          Create Free Member Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Saved Doubts & Formula Notes
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Your bookmarked questions for revision, midterm exams, and faculty explanations. Click any doubt to view comments or add explanations.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <DoubtCard
            key={q.id}
            question={q}
            isBookmarked={true}
            onOpenComments={(selected) => setActiveModalQuestion(selected)}
            onVote={(qId, dir) => {
              setQuestions((prev) =>
                prev.map((item) =>
                  item.id === qId ? { ...item, score: item.score + dir } : item
                )
              );
            }}
          />
        ))}
      </div>

      {/* Reddit/Instagram-Style Comments & Explanations Popup Window */}
      <QuestionCommentsModal
        isOpen={Boolean(activeModalQuestion)}
        question={activeModalQuestion}
        onClose={() => setActiveModalQuestion(null)}
        onQuestionVoteUpdate={(qId, newScore) => {
          setQuestions((prev) =>
            prev.map((q) => (q.id === qId ? { ...q, score: newScore } : q))
          );
        }}
        onAnswerCountUpdate={(qId, newCount) => {
          setQuestions((prev) =>
            prev.map((q) => (q.id === qId ? { ...q, answers_count: newCount } : q))
          );
          if (activeModalQuestion && activeModalQuestion.id === qId) {
            setActiveModalQuestion((prev) =>
              prev ? { ...prev, answers_count: newCount } : null
            );
          }
        }}
      />
    </div>
  );
};
