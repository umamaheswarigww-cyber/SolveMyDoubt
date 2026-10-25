import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Bookmark,
  Share2,
  LifeBuoy,
  Eye,
  Clock,
  Sparkles,
  AlertCircle,
  Send,
  Code2,
  Calculator,
  ChevronDown,
  User,
  GraduationCap,
  Image as ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { INITIAL_QUESTIONS, INITIAL_ANSWERS } from '../lib/mockData';
import {
  getQuestionById,
  getAnswersForQuestion,
  castVote,
  toggleAcceptAnswer,
  facultyVerifyAnswer,
  escalateQuestionToFaculty,
  createAnswer,
} from '../lib/api';
import {
  UserDisplayName,
  MemberCheckmark,
  FacultyBadge,
  FacultyVerifiedBadge,
  AcceptedAnswerBadge,
} from '../components/common/BadgeSystem';
import { formatTimeAgo, formatExactDate, renderFormattedContent } from '../lib/utils';
import { Answer, Comment, ExplanationMode, Question } from '../types';

export const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, isGuest, isMember, isFaculty, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Find question with fallback
  const initialQ = INITIAL_QUESTIONS.find((q) => q.id === id) || INITIAL_QUESTIONS[1];
  const [question, setQuestion] = useState<Question>(initialQ);
  const [questionScore, setQuestionScore] = useState(initialQ.score);
  const [userQuestionVote, setUserQuestionVote] = useState<number | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>(() => {
    return INITIAL_ANSWERS.filter((a) => a.question_id === initialQ.id);
  });
  const [newAnswerBody, setNewAnswerBody] = useState('');
  const [attachedAnswerImage, setAttachedAnswerImage] = useState<string | null>(null);
  const answerImageInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedExplanationMode, setSelectedExplanationMode] = useState<ExplanationMode>('standard');
  const [isEscalated, setIsEscalated] = useState(initialQ.is_escalated);
  const [escalationModalOpen, setEscalationModalOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [activeFacultyReviewAnswerId, setActiveFacultyReviewAnswerId] = useState<string | null>(null);
  const [facultyFeedbackText, setFacultyFeedbackText] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Fetch question & answers from API
  useEffect(() => {
    let mounted = true;
    async function loadQuestionDetails() {
      if (!id) return;
      try {
        const [qData, aData] = await Promise.all([
          getQuestionById(id),
          getAnswersForQuestion(id),
        ]);
        if (mounted) {
          if (qData) {
            setQuestion(qData);
            setQuestionScore(qData.score);
            setIsEscalated(qData.is_escalated);
          }
          if (aData && aData.length > 0) {
            setAnswers(aData);
          }
        }
      } catch (err) {
        console.error('Failed to load question details:', err);
      }
    }
    loadQuestionDetails();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Voting on question
  const handleQuestionVote = async (direction: 1 | -1) => {
    if (isGuest) {
      alert('Guest learners cannot vote. Please sign in or create an account to vote.');
      return;
    }

    let nextVote: number | null = direction;
    let scoreDiff: number = direction;
    if (userQuestionVote === direction) {
      nextVote = null;
      scoreDiff = -direction;
    } else if (userQuestionVote !== null) {
      scoreDiff = 2 * direction;
    }

    const nextScore = questionScore + scoreDiff;
    // Optimistic UI update
    setUserQuestionVote(nextVote);
    setQuestionScore(nextScore);

    try {
      await castVote('question', question.id, nextVote || 0, nextScore, user?.id);
    } catch (err) {
      console.warn('Vote RPC failed, kept in optimistic state:', err);
    }
  };

  // Voting on answer
  const handleAnswerVote = async (answerId: string, direction: 1 | -1) => {
    if (isGuest) {
      alert('Guest learners cannot vote. Please sign in or create an account to vote.');
      return;
    }

    let finalVoteValue: number = direction;
    let computedNewScore = 0;
    setAnswers((prev) =>
      prev.map((ans) => {
        if (ans.id !== answerId) return ans;
        const currentVote = ans.user_vote || null;
        let newVote: number | null = direction;
        let scoreDiff: number = direction;

        if (currentVote === direction) {
          newVote = null;
          scoreDiff = -direction;
          finalVoteValue = 0;
        } else if (currentVote !== null) {
          scoreDiff = 2 * direction;
        }

        computedNewScore = ans.score + scoreDiff;
        return {
          ...ans,
          user_vote: newVote || undefined,
          score: computedNewScore,
        };
      })
    );

    try {
      await castVote('answer', answerId, finalVoteValue, computedNewScore, user?.id);
    } catch (err) {
      console.warn('Answer vote RPC failed, kept optimistic:', err);
    }
  };

  // Accept Answer (Question Author Only)
  const handleToggleAcceptAnswer = async (answerId: string) => {
    const isAuthor = question.author_id === user?.id || !user; // Allow in demo mode
    if (!isAuthor && !isAdmin) {
      alert('Only the author of this question can mark an answer as accepted.');
      return;
    }

    setAnswers((prev) =>
      prev.map((ans) => {
        if (ans.id === answerId) {
          const willBeAccepted = !ans.is_accepted;
          if (willBeAccepted) {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
          return {
            ...ans,
            is_accepted: willBeAccepted,
            accepted_at: willBeAccepted ? new Date().toISOString() : null,
          };
        }
        return { ...ans, is_accepted: false, accepted_at: null };
      })
    );

    try {
      await toggleAcceptAnswer(answerId, question.id);
    } catch (err) {
      console.warn('Accept RPC failed, kept in optimistic state:', err);
    }
  };

  // Faculty Verify Answer (Approved Faculty Only)
  const handleFacultyVerify = async (
    answerId: string,
    decision: 'approved' | 'rejected',
    customFeedback?: string
  ) => {
    if (!isFaculty && !isAdmin) {
      alert('Only approved faculty reviewers can certify explanations.');
      return;
    }

    const verifierName = profile?.display_name || 'Faculty Professor';
    const feedbackText =
      customFeedback ||
      facultyFeedbackText ||
      'Officially verified and certified accurate by faculty.';

    setAnswers((prev) =>
      prev.map((ans) => {
        if (ans.id !== answerId) return ans;
        if (decision === 'approved') {
          return {
            ...ans,
            verified_by: user?.id || 'user-faculty-1',
            verifier_name: verifierName,
            verified_at: new Date().toISOString(),
            verifier: profile || undefined,
            faculty_feedback: feedbackText,
          };
        } else {
          return {
            ...ans,
            verified_by: null,
            verifier_name: null,
            verified_at: null,
            faculty_feedback: null,
          };
        }
      })
    );

    setActiveFacultyReviewAnswerId(null);
    setFacultyFeedbackText('');
    setFeedbackNotice(
      decision === 'approved'
        ? `Answer officially certified by ${verifierName}!`
        : 'Faculty verification revoked.'
    );
    setTimeout(() => setFeedbackNotice(null), 4000);

    try {
      await facultyVerifyAnswer(
        answerId,
        decision,
        feedbackText,
        undefined,
        verifierName,
        user?.id
      );
    } catch (err) {
      console.warn('Faculty verify RPC failed, kept in optimistic state:', err);
    }
  };

  const handleAnswerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedAnswerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Answer
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newAnswerBody.trim();
    if (!trimmed && !attachedAnswerImage) {
      alert('Please provide an explanation or attach an image.');
      return;
    }

    setIsSubmittingAnswer(true);
    let bodyContent = trimmed || 'See attached explanation diagram:';
    if (attachedAnswerImage) {
      bodyContent = `${bodyContent}\n\n![Uploaded Diagram / Solution](${attachedAnswerImage})`;
    }
    const explanationMode = selectedExplanationMode;
    const authorId = user?.id || 'demo-user';

    try {
      const { data: createdAns, error } = await createAnswer({
        questionId: question.id,
        authorId,
        body: bodyContent,
        explanationMode,
        authorProfile: profile,
      });

      const fallbackAns: Answer = {
        id: createdAns?.id || `ans-${Date.now()}`,
        question_id: question.id,
        author_id: authorId,
        body: bodyContent,
        is_accepted: false,
        accepted_at: null,
        verified_by: null,
        verified_at: null,
        faculty_feedback: null,
        explanation_mode: explanationMode,
        upvotes: 0,
        downvotes: 0,
        score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: profile || undefined,
      };

      setAnswers((prev) => [...prev, createdAns || fallbackAns]);
      setNewAnswerBody('');
      setAttachedAnswerImage(null);

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });
      setFeedbackNotice('Your academic explanation has been published!');
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Escalate Doubt to Faculty
  const handleEscalateQuestion = async () => {
    setIsEscalated(true);
    setEscalationModalOpen(false);
    setFeedbackNotice('Doubt successfully escalated to the Faculty Review Queue!');
    setTimeout(() => setFeedbackNotice(null), 4000);

    try {
      await escalateQuestionToFaculty(question.id, escalationReason || 'Student requested faculty review');
    } catch (err) {
      console.warn('Escalate question RPC failed, kept in optimistic state:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Feedback Toast Notice */}
      {feedbackNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl flex items-center gap-3 text-xs font-semibold animate-bounce-subtle">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/explore" className="hover:text-indigo-600 transition-colors">
          Explore
        </Link>
        <span>/</span>
        <span className="text-slate-400">{question.course?.name || 'Course'}</span>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-xs">
          {question.title}
        </span>
      </div>

      {/* Main Question Article */}
      <article className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Top Badges & Meta Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {question.course && (
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                {question.course.name} ({question.course.course_code})
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {question.difficulty}
            </span>
            {isEscalated && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse-subtle">
                <LifeBuoy className="w-3.5 h-3.5 text-rose-500" />
                <span>Escalated to Faculty</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
              }`}
              title="Bookmark doubt"
            >
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Doubt link copied to clipboard!');
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              title="Share link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
          {question.title}
        </h1>

        {/* Question Body with KaTeX & Code syntax */}
        <div
          className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed prose dark:prose-invert max-w-none pt-2"
          dangerouslySetInnerHTML={{ __html: renderFormattedContent(question.body) }}
        />

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2">
            {question.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer Meta: Voting, Author & Escalation */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 flex-wrap text-xs">
          {/* Voting widget */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => handleQuestionVote(1)}
              className={`p-1.5 rounded-lg transition-colors ${
                userQuestionVote === 1
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-indigo-600'
              }`}
              title="Upvote this question"
            >
              <ArrowBigUp className="w-5 h-5 fill-current" />
            </button>
            <span className="font-extrabold text-xs px-2 text-slate-900 dark:text-slate-100">
              {questionScore}
            </span>
            <button
              onClick={() => handleQuestionVote(-1)}
              className={`p-1.5 rounded-lg transition-colors ${
                userQuestionVote === -1
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-500 hover:text-rose-600'
              }`}
              title="Downvote"
            >
              <ArrowBigDown className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Author Badge */}
          <div className="flex items-center gap-2.5">
            {question.author?.avatar_url && !question.author.is_anonymous ? (
              <img
                src={question.author.avatar_url}
                alt={question.author.display_name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                {question.author?.display_name?.slice(0, 1) || 'L'}
              </div>
            )}
            <div>
              <UserDisplayName
                profile={question.author}
                isAnonymous={question.author?.is_anonymous}
                nameClassName="text-xs font-bold"
              />
              <div className="text-[10px] text-slate-400">
                Asked {formatTimeAgo(question.created_at)}
              </div>
            </div>
          </div>

          {/* Doubt Escalation Action */}
          {!isEscalated && (
            <button
              onClick={() => setEscalationModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Escalate to Faculty Review</span>
            </button>
          )}
        </div>
      </article>

      {/* Escalation Confirmation Modal */}
      {escalationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 max-w-md w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <LifeBuoy className="w-5 h-5" />
              <span>Escalate Doubt to Faculty</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Questions that remain unresolved or require expert curriculum guidance can be escalated directly to the faculty queue.
            </p>
            <textarea
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              placeholder="Provide a brief explanation of why this doubt needs faculty clarification..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 font-sans"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEscalationModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateQuestion}
                className="px-4 py-2 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Answers Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            <span>{answers.length} Academic Explanations</span>
          </h2>
          <span className="text-xs text-slate-400">Sorted by Helpful Peer Score</span>
        </div>

        {/* Answers List */}
        <div className="space-y-6">
          {answers.map((answer) => {
            const hasVerified = Boolean(answer.verified_by);
            const isOwner = question.author_id === user?.id || !user;

            return (
              <div
                key={answer.id}
                className={`rounded-3xl border transition-all p-6 sm:p-7 space-y-5 bg-white/95 dark:bg-slate-900/95 ${
                  hasVerified
                    ? 'border-emerald-500/40 shadow-emerald-500/5 shadow-md ring-1 ring-emerald-500/20'
                    : answer.is_accepted
                    ? 'border-green-500/40 shadow-green-500/5 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800/80 shadow-2xs'
                }`}
              >
                {/* Header: Author + Accepted / Faculty Badges */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    {answer.author?.avatar_url && !answer.author.is_anonymous ? (
                      <img
                        src={answer.author.avatar_url}
                        alt={answer.author.display_name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {answer.author?.display_name?.slice(0, 1) || 'L'}
                      </div>
                    )}
                    <div>
                      <UserDisplayName
                        profile={answer.author}
                        isAnonymous={answer.author?.is_anonymous}
                        nameClassName="text-xs font-bold"
                      />
                      <div className="text-[10px] text-slate-400">
                        Answered {formatTimeAgo(answer.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {answer.is_accepted && <AcceptedAnswerBadge />}
                    {answer.explanation_mode && answer.explanation_mode !== 'standard' && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                        {answer.explanation_mode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Faculty Verified Badge Display (Restrained, Prominent) */}
                {hasVerified && (
                  <FacultyVerifiedBadge
                    verifierName={answer.verifier?.display_name || 'Dr. Marcus Vance'}
                    verifiedAt={answer.verified_at}
                    feedback={answer.faculty_feedback}
                  />
                )}

                {/* Answer Content */}
                <div
                  className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed prose dark:prose-invert max-w-none pt-1"
                  dangerouslySetInnerHTML={{ __html: renderFormattedContent(answer.body) }}
                />

                {/* Answer Controls Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap text-xs">
                  {/* Voting */}
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                    <button
                      onClick={() => handleAnswerVote(answer.id, 1)}
                      className={`p-1 rounded-lg transition-colors ${
                        answer.user_vote === 1
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-500 hover:text-indigo-600'
                      }`}
                      title="Helpful explanation"
                    >
                      <ArrowBigUp className="w-4 h-4 fill-current" />
                    </button>
                    <span className="font-bold text-xs px-1.5 text-slate-900 dark:text-slate-100">
                      {answer.score}
                    </span>
                    <button
                      onClick={() => handleAnswerVote(answer.id, -1)}
                      className={`p-1 rounded-lg transition-colors ${
                        answer.user_vote === -1
                          ? 'bg-rose-600 text-white'
                          : 'text-slate-500 hover:text-rose-600'
                      }`}
                      title="Not helpful"
                    >
                      <ArrowBigDown className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Actions for Author & Faculty */}
                  <div className="flex items-center gap-2">
                    {/* Question Author Accept Toggle */}
                    {isOwner && (
                      <button
                        onClick={() => handleToggleAcceptAnswer(answer.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                          answer.is_accepted
                            ? 'bg-green-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-green-50 hover:text-green-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{answer.is_accepted ? 'Accepted Answer' : 'Accept Solution'}</span>
                      </button>
                    )}

                    {/* Authorized Faculty Verification Action */}
                    {(isFaculty || isAdmin) && (
                      <div className="flex items-center gap-1.5">
                        {hasVerified ? (
                          <button
                            onClick={() => handleFacultyVerify(answer.id, 'rejected')}
                            className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-all"
                            title="Remove faculty verification from this answer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Revoke Verification</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleFacultyVerify(answer.id, 'approved')}
                              className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/25 transition-all active:scale-95"
                              title="Instantly certify this student answer as accurate"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>✓ Verify as Correct</span>
                            </button>
                            <button
                              onClick={() =>
                                setActiveFacultyReviewAnswerId(
                                  activeFacultyReviewAnswerId === answer.id ? null : answer.id
                                )
                              }
                              className="px-2.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-all"
                              title="Add custom faculty feedback or pedagogy notes"
                            >
                              <span>+ Note</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Faculty Review Modal/Input */}
                {activeFacultyReviewAnswerId === answer.id && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Official Faculty Review Feedback</span>
                    </div>
                    <textarea
                      value={facultyFeedbackText}
                      onChange={(e) => setFacultyFeedbackText(e.target.value)}
                      placeholder="Add an official note on why this explanation is mathematically and pedagogically correct..."
                      rows={2}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setActiveFacultyReviewAnswerId(null)}
                        className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleFacultyVerify(answer.id, 'approved')}
                        className="px-4 py-1.5 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                      >
                        Approve & Apply Badge
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Answer Submission Form */}
      <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-500" />
            <span>Contribute Your Explanation</span>
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Explanation Mode:</span>
            <select
              value={selectedExplanationMode}
              onChange={(e) => setSelectedExplanationMode(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs"
            >
              <option value="standard">Standard Academic</option>
              <option value="step-by-step">Step-by-Step Proof</option>
              <option value="beginner">Intuitive / Beginner</option>
              <option value="practical">Practical Code Example</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleAnswerSubmit} className="space-y-4">
          <textarea
            value={newAnswerBody}
            onChange={(e) => setNewAnswerBody(e.target.value)}
            rows={6}
            placeholder="Write a clear, structured explanation. Use $E=mc^2$ for formulas or ```python for code blocks, or attach diagram images below..."
            className="w-full p-4 rounded-xl text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 leading-relaxed placeholder:text-slate-400 placeholder:font-sans"
          />

          {/* Attached image preview */}
          {attachedAnswerImage && (
            <div className="relative inline-block rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-900 shadow-md">
              <img src={attachedAnswerImage} alt="Attachment Preview" className="max-h-48 w-auto object-contain rounded-2xl" />
              <button
                type="button"
                onClick={() => setAttachedAnswerImage(null)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-md"
                title="Remove image"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 text-slate-500 text-[11px] flex-wrap">
              <button
                type="button"
                onClick={() => answerImageInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-300/60 dark:border-emerald-800/60 transition-colors"
                title="Attach an image or diagram to your explanation"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>{attachedAnswerImage ? 'Change Image' : 'Attach Image / Diagram'}</span>
              </button>
              <input
                ref={answerImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAnswerImageUpload}
              />

              <span className="flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                <span>KaTeX Enabled ($...$)</span>
              </span>
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Code Blocks</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmittingAnswer || (!newAnswerBody.trim() && !attachedAnswerImage)}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmittingAnswer ? 'Publishing...' : 'Submit Explanation'}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
