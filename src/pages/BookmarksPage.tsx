import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const handleDeletedEvent = (e: any) => {
      const qId = e.detail?.questionId;
      if (qId) {
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
        if (activeModalQuestion?.id === qId) {
          setActiveModalQuestion(null);
        }
      }
    };
    window.addEventListener('doubt_deleted', handleDeletedEvent);
    return () => {
      window.removeEventListener('doubt_deleted', handleDeletedEvent);
    };
  }, [activeModalQuestion]);

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (activeModalQuestion?.id === id) {
      setActiveModalQuestion(null);
    }
  };

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
    <div className="w-full space-y-6 min-w-0">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Saved Doubts & Formula Notes
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Your bookmarked questions for revision, midterm exams, and faculty explanations. Click any doubt to view comments or add explanations.
        </p>
      </div>

      <div className="space-y-4">
        {questions.length > 0 ? (
          questions.map((q) => (
            <DoubtCard
              key={q.id}
              question={q}
              isBookmarked={true}
              onOpenComments={(selected) => setActiveModalQuestion(selected)}
              onDelete={removeQuestion}
              onVote={(qId, dir) => {
                setQuestions((prev) =>
                  prev.map((item) =>
                    item.id === qId ? { ...item, score: item.score + dir } : item
                  )
                );
              }}
            />
          ))
        ) : (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
            <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              No bookmarks saved yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the bookmark icon on any doubt in Explore or Home to save it for quick review.
            </p>
          </div>
        )}
      </div>

      {/* Reddit/Instagram-Style Comments & Explanations Popup Window */}
      <QuestionCommentsModal
        isOpen={Boolean(activeModalQuestion)}
        question={activeModalQuestion}
        onClose={() => setActiveModalQuestion(null)}
        onQuestionDeleted={removeQuestion}
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
