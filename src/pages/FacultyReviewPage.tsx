import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MessageSquare,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  RotateCcw,
  User,
  ArrowLeft,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_QUESTIONS, INITIAL_ANSWERS, INITIAL_COURSES } from '../lib/mockData';
import { facultyVerifyAnswer, getQuestions } from '../lib/api';
import { UserDisplayName, FacultyVerifiedBadge } from '../components/common/BadgeSystem';
import { formatTimeAgo, formatExactDate, renderFormattedContent } from '../lib/utils';
import { Answer, Question } from '../types';

export const FacultyReviewPage: React.FC = () => {
  const { user, profile, isFaculty, isAdmin } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [reviewTab, setReviewTab] = useState<'pending' | 'verified' | 'escalated'>('pending');
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [officialFeedback, setOfficialFeedback] = useState('');
  const [officialExplanation, setOfficialExplanation] = useState('');
  const [allAnswers, setAllAnswers] = useState<Answer[]>(INITIAL_ANSWERS);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const qData = await getQuestions();
        if (mounted && qData && qData.length > 0) {
          setQuestions(qData);
        }
      } catch (err) {
        console.error('Failed to load faculty review questions:', err);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // If visitor is not faculty or admin, render unauthorized notification
  if (!isFaculty && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
          <GraduationCap className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Faculty Review Queue Restricted
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            This workspace is reserved for authorized faculty members and course instructors to audit peer solutions and certify curriculum rigor.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-4 max-w-md mx-auto">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Your Current Profile:</span>
            <span className="font-bold text-slate-900 dark:text-slate-200">
              {profile?.display_name || 'Guest User'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Assigned Role:</span>
            <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {profile?.role || 'student'}
            </span>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <Link
              to="/dashboard"
              className="w-full py-2.5 px-4 rounded-xl font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
            <Link
              to="/auth"
              className="w-full py-2.5 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white text-center shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Faculty Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter pending review queue
  const pendingAnswers = allAnswers.filter((a) => !a.verified_by);
  const verifiedAnswers = allAnswers.filter((a) => Boolean(a.verified_by));
  const escalatedQuestions = questions.filter((q) => q.is_escalated);

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    if (!selectedAnswer) return;

    const answerId = selectedAnswer.id;
    const feedback = officialFeedback;
    const explanation = officialExplanation;

    if (decision === 'approved') {
      setAllAnswers((prev) =>
        prev.map((ans) =>
          ans.id === answerId
            ? {
                ...ans,
                verified_by: user?.id || 'user-faculty-1',
                verified_at: new Date().toISOString(),
                faculty_feedback: feedback || 'Accurate and rigorous explanation verified by faculty.',
              }
            : ans
        )
      );
      setSuccessToast(`Explanation certified! "Faculty Verified" badge is now visible to all students.`);
    } else {
      setAllAnswers((prev) =>
        prev.map((ans) =>
          ans.id === answerId
            ? {
                ...ans,
                verified_by: null,
                verified_at: null,
                faculty_feedback: feedback || 'Needs revision based on faculty notes.',
              }
            : ans
        )
      );
      setSuccessToast(`Correction requested. Feedback dispatched to author.`);
    }

    setSelectedAnswer(null);
    setOfficialFeedback('');
    setOfficialExplanation('');
    setTimeout(() => setSuccessToast(null), 4000);

    try {
      await facultyVerifyAnswer(answerId, decision, feedback, explanation);
    } catch (err) {
      console.warn('Faculty verify RPC call completed in optimistic state:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950 text-emerald-200 border border-emerald-700 shadow-2xl flex items-center gap-3 text-xs font-semibold animate-bounce-subtle">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Faculty Review & Certification Queue
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review peer solutions, certify academic rigor, and answer escalated student doubts.
          </p>
        </div>

        {/* Workload Telemetry */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="font-black text-amber-500 text-base">{pendingAnswers.length}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Pending Audit</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="font-black text-emerald-500 text-base">{verifiedAnswers.length}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Certified</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <div className="font-black text-rose-500 text-base">{escalatedQuestions.length}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Escalated Doubts</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReviewTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reviewTab === 'pending'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Pending Certification ({pendingAnswers.length})
          </button>
          <button
            onClick={() => setReviewTab('verified')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reviewTab === 'verified'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Certified Solutions ({verifiedAnswers.length})</span>
          </button>
          <button
            onClick={() => setReviewTab('escalated')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              reviewTab === 'escalated'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Escalated Doubts ({escalatedQuestions.length})</span>
          </button>
        </div>
      </div>

      {/* Content depending on active tab */}
      {reviewTab === 'pending' && (
        <div className="space-y-4">
          {pendingAnswers.map((answer) => {
            const question = INITIAL_QUESTIONS.find((q) => q.id === answer.question_id);
            return (
              <div
                key={answer.id}
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {question?.course?.name || 'Academic Course'}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      Author: {answer.author?.display_name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    Community Score: {answer.score} upvotes
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Question: {question?.title}
                  </h3>
                  <div
                    className="mt-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono overflow-x-auto"
                    dangerouslySetInnerHTML={{
                      __html: renderFormattedContent(answer.body.slice(0, 300) + '...'),
                    }}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    to={`/doubt/${answer.question_id}`}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                  >
                    View Full Discussion Thread →
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAnswer(answer)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Review & Certify</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewTab === 'verified' && (
        <div className="space-y-4">
          {verifiedAnswers.map((answer) => {
            const question = INITIAL_QUESTIONS.find((q) => q.id === answer.question_id);
            return (
              <div
                key={answer.id}
                className="rounded-3xl border border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10 p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <FacultyVerifiedBadge
                    verifierName={profile?.display_name || 'Dr. Marcus Vance'}
                    verifiedAt={answer.verified_at}
                    feedback={answer.faculty_feedback}
                  />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {question?.title}
                </h3>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">
                    Author: {answer.author?.display_name} • Certified on {formatExactDate(answer.verified_at)}
                  </span>
                  <Link
                    to={`/doubt/${answer.question_id}`}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Open Knowledge Asset →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewTab === 'escalated' && (
        <div className="space-y-4">
          {escalatedQuestions.map((q) => (
            <div
              key={q.id}
              className="rounded-3xl border border-rose-500/30 bg-rose-50/10 dark:bg-rose-950/10 p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                  Escalated Priority: Urgent
                </span>
                <span className="text-xs text-slate-500">
                  Waiting {formatTimeAgo(q.created_at)}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {q.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                {q.body}
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
                  Reason: {q.escalation_reason || 'Unanswered beyond 12 hours.'}
                </span>
                <Link
                  to={`/doubt/${q.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
                >
                  Provide Faculty Explanation →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedAnswer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Certify Explanation with Faculty Badge</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Applying the faculty badge permanently endorses this answer in student search results and the reusable Knowledge Library.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Official Reviewer Note (Appears on the Faculty Verified Badge)
              </label>
              <textarea
                value={officialFeedback}
                onChange={(e) => setOfficialFeedback(e.target.value)}
                placeholder="e.g. Rigorous proof. Excellent demonstration of edge invariants and telescoping sums."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleDecision('rejected')}
                className="px-4 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 border border-rose-900 font-bold"
              >
                Request Revisions
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedAnswer(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDecision('approved')}
                  className="px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
                >
                  Approve & Certify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
