import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageSquare,
  ArrowBigUp,
  ArrowBigDown,
  Send,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Calculator,
  Code2,
  AlertCircle,
  Eye,
  Share2,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, Answer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { UserDisplayName, FacultyVerifiedBadge, AcceptedAnswerBadge, MemberCheckmark } from './BadgeSystem';
import { formatTimeAgo, renderFormattedContent, downloadImage, cn } from '../../lib/utils';
import { ImageAnnotatorModal } from './ImageAnnotatorModal';
import { PenTool, Download } from 'lucide-react';
import { getAnswersForQuestion, createAnswer, castVote, facultyVerifyAnswer, toggleAcceptAnswer, deleteQuestion } from '../../lib/api';

interface QuestionCommentsModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onQuestionVoteUpdate?: (questionId: string, newScore: number) => void;
  onAnswerCountUpdate?: (questionId: string, newCount: number) => void;
  onQuestionDeleted?: (questionId: string) => void;
}

export const QuestionCommentsModal: React.FC<QuestionCommentsModalProps> = ({
  question,
  isOpen,
  onClose,
  onQuestionVoteUpdate,
  onAnswerCountUpdate,
  onQuestionDeleted,
}) => {
  const { user, profile, isFaculty, isAdmin, isGuest } = useAuth();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionScore, setQuestionScore] = useState(question?.score || 0);
  const [userQuestionVote, setUserQuestionVote] = useState<number | null>(question?.user_vote || null);
  const [facultyFeedbackText, setFacultyFeedbackText] = useState('');
  const [activeNoteAnswerId, setActiveNoteAnswerId] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [annotatorImageUrl, setAnnotatorImageUrl] = useState<string | null>(null);
  const [isAnnotatorOpen, setIsAnnotatorOpen] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when question prop changes
  useEffect(() => {
    if (question) {
      setQuestionScore(question.score || 0);
      setUserQuestionVote(question.user_vote || null);
    }
  }, [question]);

  // Load answers when modal opens
  useEffect(() => {
    if (!isOpen || !question) return;

    const currentQuestionId = question.id;
    let mounted = true;
    async function loadAnswers() {
      setIsLoadingAnswers(true);
      try {
        const data = await getAnswersForQuestion(currentQuestionId);
        if (mounted) {
          setAnswers(data || []);
        }
      } catch (err) {
        console.error('Failed to load answers:', err);
      } finally {
        if (mounted) setIsLoadingAnswers(false);
      }
    }

    loadAnswers();
    return () => {
      mounted = false;
    };
  }, [isOpen, question]);

  
  // Image click delegation handler for annotations and downloads
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    const annotateBtn = target.closest('button[data-action="annotate"]') as HTMLElement;
    if (annotateBtn) {
      e.preventDefault();
      e.stopPropagation();
      const src = annotateBtn.getAttribute('data-src');
      if (src) {
        setAnnotatorImageUrl(src);
        setIsAnnotatorOpen(true);
      }
      return;
    }

    const downloadBtn = target.closest('button[data-action="download"]') as HTMLElement;
    if (downloadBtn) {
      e.preventDefault();
      e.stopPropagation();
      const src = downloadBtn.getAttribute('data-src');
      if (src) {
        downloadImage(src, 'doubt-photo.png');
      }
      return;
    }

    const interactiveImg = target.closest('img.doubts-interactive-image') as HTMLImageElement;
    if (interactiveImg) {
      e.preventDefault();
      e.stopPropagation();
      const src = interactiveImg.getAttribute('data-image-url') || interactiveImg.src;
      if (src) {
        setAnnotatorImageUrl(src);
        setIsAnnotatorOpen(true);
      }
      return;
    }
  };

  if (!isOpen || !question) return null;

  // Upvote on Question
  const handleQuestionVote = async (direction: 1 | -1) => {
    if (isGuest) {
      alert('Guest learners cannot vote. Please sign in to vote.');
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
    setUserQuestionVote(nextVote);
    setQuestionScore(nextScore);
    if (onQuestionVoteUpdate) {
      onQuestionVoteUpdate(question.id, nextScore);
    }

    try {
      await castVote('question', question.id, nextVote || 0, nextScore, user?.id);
    } catch (err) {
      console.warn('Vote sync notice:', err);
    }
  };

  // Upvote on Answer
  const handleAnswerVote = async (answerId: string, direction: 1 | -1) => {
    if (isGuest) {
      alert('Guest learners cannot vote. Please sign in to vote.');
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
      console.warn('Answer vote sync notice:', err);
    }
  };

  // Question Author Accept Answer
  const handleAcceptAnswer = async (answerId: string) => {
    const isOwner = question.author_id === user?.id || !user;
    if (!isOwner && !isAdmin) {
      alert('Only the author of this question can accept a solution.');
      return;
    }

    setAnswers((prev) =>
      prev.map((ans) => {
        if (ans.id === answerId) {
          const willBeAccepted = !ans.is_accepted;
          if (willBeAccepted) {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
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
      console.warn('Accept answer sync notice:', err);
    }
  };

  // Faculty Verify Answer
  const handleFacultyVerify = async (
    answerId: string,
    decision: 'approved' | 'rejected',
    customFeedback?: string
  ) => {
    if (!isFaculty && !isAdmin) {
      alert('Only verified faculty can certify explanations.');
      return;
    }

    const verifierName = profile?.display_name || 'Faculty Member';
    const feedbackText =
      customFeedback ||
      facultyFeedbackText ||
      'Accurate and mathematically verified explanation.';

    setAnswers((prev) =>
      prev.map((ans) => {
        if (ans.id !== answerId) return ans;
        if (decision === 'approved') {
          return {
            ...ans,
            verified_by: user?.id || 'faculty-user',
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

    setActiveNoteAnswerId(null);
    setFacultyFeedbackText('');
    setFeedbackNotice(
      decision === 'approved'
        ? `Answer officially certified by ${verifierName}!`
        : 'Faculty verification revoked.'
    );
    setTimeout(() => setFeedbackNotice(null), 3500);

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
      console.warn('Faculty verify sync notice:', err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Post New Answer / Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed && !attachedImage) return;

    let fullBody = trimmed || 'See attached image:';
    if (attachedImage) {
      fullBody = `${fullBody}\n\n![Uploaded Diagram / Solution](${attachedImage})`;
    }

    setIsSubmitting(true);
    const authorId = user?.id || (isGuest ? 'guest-author' : 'member-author');

    try {
      const { data: createdAns, error } = await createAnswer({
        questionId: question.id,
        authorId,
        body: fullBody,
        explanationMode: 'standard',
        authorProfile: profile,
      });

      const fallbackAns: Answer = {
        id: createdAns?.id || `ans-${Date.now()}`,
        question_id: question.id,
        author_id: authorId,
        body: fullBody,
        is_accepted: false,
        accepted_at: null,
        verified_by: null,
        verified_at: null,
        faculty_feedback: null,
        explanation_mode: 'standard',
        upvotes: 0,
        downvotes: 0,
        score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author: profile || undefined,
      };

      const nextAnswers = [...answers, createdAns || fallbackAns];
      setAnswers(nextAnswers);
      setCommentText('');
      setAttachedImage(null);

      if (onAnswerCountUpdate) {
        onAnswerCountUpdate(question.id, nextAnswers.length);
      }

      // Scroll to new comment smoothly
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertMath = () => {
    setCommentText((prev) => (prev ? `${prev} $f(x) = x^2$ ` : '$f(x) = x^2$ '));
    inputRef.current?.focus();
  };


  const handleDeleteQuestion = async () => {
    if (!question) return;
    const ok = window.confirm(
      'Are you sure you want to delete this question? As a faculty member, this will remove this doubt and its explanations for violating community guidelines.'
    );
    if (!ok) return;

    try {
      await deleteQuestion(question.id, user?.id);
      if (onQuestionDeleted) {
        onQuestionDeleted(question.id);
      }
      onClose();
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const insertCode = () => {
    setCommentText((prev) => (prev ? `${prev}\n\`\`\`python\n# Code snippet\n\`\`\`\n` : '```python\n# Code snippet\n```\n'));
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl lg:max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[92vh] bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 rounded-none sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Toast feedback notice */}
        {feedbackNotice && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
        )}

        {/* 1. Modal Top Bar (Instagram Style) */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white/95 dark:bg-slate-900/95 sticky top-0 z-20">
          <div className="flex items-center gap-2.5 truncate">
            {question.author?.avatar_url && !question.author.is_anonymous ? (
              <img
                src={question.author.avatar_url}
                alt={question.author.display_name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {question.author?.display_name?.slice(0, 1) || 'L'}
              </div>
            )}
            <div className="truncate">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white truncate">
                <span className="truncate">{question.author?.display_name || 'Academic Learner'}</span>
                {!question.author?.is_anonymous && <MemberCheckmark className="shrink-0" />}
                {question.course && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 hidden xs:inline-block">
                    {question.course.name}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {formatTimeAgo(question.created_at)} • {question.difficulty}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(isFaculty || isAdmin) && (
              <button
                type="button"
                onClick={handleDeleteQuestion}
                className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-600 transition-colors flex items-center gap-1 border border-rose-500/20"
                title="Faculty Access: Delete improper / abusive question"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Delete Doubt</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all active:scale-95 shrink-0"
              title="Close comments window"
              aria-label="Close"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 2. Scrollable Body: Question Details + Comments/Answers Stream */}
        <div onClick={handleContentClick} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 divide-y divide-slate-100 dark:divide-slate-800/60">
          
          {/* Main Question Display */}
          <div className="space-y-3 pb-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
              {question.title}
            </h2>

            <div
              className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderFormattedContent(question.body) }}
            />

            {/* Tags list */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {question.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Question Action Row (Upvote & Comments Counter) */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuestionVote(1)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 border',
                    userQuestionVote === 1
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  )}
                  title="Upvote question"
                >
                  <ArrowBigUp className="w-4 h-4 fill-current" />
                  <span>{questionScore}</span>
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{answers.length} {answers.length === 1 ? 'Explanation' : 'Explanations'}</span>
                </div>
              </div>

              {question.is_escalated && (
                <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-800">
                  Escalated to Faculty
                </span>
              )}
            </div>
          </div>

          {/* Answers & Comments Discussion Stream */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Peer & Faculty Explanations ({answers.length})</span>
              <span className="text-[11px] lowercase font-normal">Sorted by helpfulness</span>
            </div>

            {isLoadingAnswers ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading academic explanations...
              </div>
            ) : answers.length > 0 ? (
              answers.map((answer) => {
                const isVerified = Boolean(answer.verified_by);
                const isOwner = question.author_id === user?.id || !user;

                return (
                  <div
                    key={answer.id}
                    className={cn(
                      'rounded-2xl border p-4 space-y-3 transition-all',
                      isVerified
                        ? 'border-emerald-500/40 bg-emerald-500/5 shadow-xs ring-1 ring-emerald-500/20'
                        : answer.is_accepted
                        ? 'border-green-500/40 bg-green-500/5 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60'
                    )}
                  >
                    {/* Header: Author + Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {answer.author?.avatar_url && !answer.author.is_anonymous ? (
                          <img
                            src={answer.author.avatar_url}
                            alt={answer.author.display_name}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">
                            {answer.author?.display_name?.slice(0, 1) || 'L'}
                          </div>
                        )}
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {answer.author?.display_name || 'Scholar Contributor'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          • {formatTimeAgo(answer.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {answer.is_accepted && <AcceptedAnswerBadge />}
                      </div>
                    </div>

                    {/* Faculty Verified Badge */}
                    {isVerified && (
                      <FacultyVerifiedBadge
                        verifierName={answer.verifier_name || answer.verifier?.display_name || 'Dr. Marcus Vance (Faculty)'}
                        verifiedAt={answer.verified_at}
                        feedback={answer.faculty_feedback}
                      />
                    )}

                    {/* Answer Body */}
                    <div
                      className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderFormattedContent(answer.body) }}
                    />

                    {/* Answer Footer Controls */}
                    <div className="pt-2 flex items-center justify-between gap-2 flex-wrap text-xs">
                      {/* Vote Buttons */}
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => handleAnswerVote(answer.id, 1)}
                          className={cn(
                            'p-1 rounded-lg transition-colors',
                            answer.user_vote === 1 ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-indigo-600'
                          )}
                          title="Helpful explanation"
                        >
                          <ArrowBigUp className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <span className="font-bold text-xs px-1 text-slate-800 dark:text-slate-200">
                          {answer.score}
                        </span>
                        <button
                          onClick={() => handleAnswerVote(answer.id, -1)}
                          className={cn(
                            'p-1 rounded-lg transition-colors',
                            answer.user_vote === -1 ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-rose-600'
                          )}
                          title="Not helpful"
                        >
                          <ArrowBigDown className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      {/* Author & Faculty Actions */}
                      <div className="flex items-center gap-1.5">
                        {isOwner && (
                          <button
                            onClick={() => handleAcceptAnswer(answer.id)}
                            className={cn(
                              'px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all',
                              answer.is_accepted
                                ? 'bg-green-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-green-50'
                            )}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{answer.is_accepted ? 'Accepted' : 'Accept Solution'}</span>
                          </button>
                        )}

                        {(isFaculty || isAdmin) && (
                          <div className="flex items-center gap-1">
                            {isVerified ? (
                              <button
                                onClick={() => handleFacultyVerify(answer.id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
                              >
                                Revoke
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleFacultyVerify(answer.id, 'approved')}
                                  className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>✓ Verify Correct</span>
                                </button>
                                <button
                                  onClick={() =>
                                    setActiveNoteAnswerId(
                                      activeNoteAnswerId === answer.id ? null : answer.id
                                    )
                                  }
                                  className="px-2 py-1 rounded-lg font-semibold text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                >
                                  + Note
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inline Faculty Note Editor */}
                    {activeNoteAnswerId === answer.id && (
                      <div className="mt-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                        <textarea
                          value={facultyFeedbackText}
                          onChange={(e) => setFacultyFeedbackText(e.target.value)}
                          placeholder="Add professor feedback note (e.g. Accurate derivation with proper boundary conditions)..."
                          rows={2}
                          className="w-full p-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveNoteAnswerId(null)}
                            className="px-2 py-1 text-xs text-slate-500"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleFacultyVerify(answer.id, 'approved', facultyFeedbackText)}
                            className="px-3 py-1 rounded-lg font-bold text-xs bg-emerald-600 text-white"
                          >
                            Approve with Note
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No explanations posted yet.
                </p>
                <p className="text-[11px] text-slate-400">
                  Be the first to explain this doubt and earn contributor reputation!
                </p>
              </div>
            )}
            <div ref={commentsEndRef} />
          </div>
        </div>

        {/* 3. Sticky Bottom Comment Bar (Instagram Style) */}
        <form
          onSubmit={handlePostComment}
          className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 space-y-2"
        >
          {/* Quick shortcuts for Math and Code */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[11px] text-slate-400">
              {isFaculty ? 'Replying as Faculty Member' : 'Write your explanation or comment:'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={insertMath}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="Insert LaTeX formula"
              >
                <Calculator className="w-3 h-3 text-indigo-500" />
                <span>$x^2$</span>
              </button>
              <button
                type="button"
                onClick={insertCode}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="Insert code snippet"
              >
                <Code2 className="w-3 h-3 text-indigo-500" />
                <span>```code</span>
              </button>

              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="Attach photo, screenshot, or diagram"
              >
                <ImageIcon className="w-3 h-3 text-emerald-500" />
                <span>Image</span>
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Attached image preview with Annotate and Download */}
          {attachedImage && (
            <div className="relative inline-flex items-center gap-3 p-2 rounded-2xl border border-emerald-500/40 bg-slate-900 shadow-sm ml-1 flex-wrap">
              <img src={attachedImage} alt="Attachment Preview" className="h-16 w-auto max-w-[140px] rounded-lg object-cover border border-slate-700" />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAnnotatorImageUrl(attachedImage);
                      setIsAnnotatorOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-transform active:scale-95"
                    title="Annotate before posting"
                  >
                    <PenTool className="w-3 h-3" />
                    <span>Annotate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadImage(attachedImage, 'attached-photo.png')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 border border-slate-700 shadow-xs transition-transform active:scale-95"
                    title="Download photo"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
                <span className="text-[10px] text-emerald-400 font-medium">Attached to comment</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="ml-auto w-6 h-6 rounded-full bg-rose-600/80 hover:bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-md transition-colors"
                title="Remove image"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add your solution, explanation, or question comment (supports image upload, math, code)..."
              rows={2}
              className="flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handlePostComment(e);
                }
              }}
            />

            <button
              type="submit"
              disabled={isSubmitting || (!commentText.trim() && !attachedImage)}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-40 transition-all active:scale-95 shadow-md shadow-indigo-600/25 shrink-0 flex items-center justify-center"
              title="Post comment (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Image Annotator Modal */}
      {isAnnotatorOpen && annotatorImageUrl && (
        <ImageAnnotatorModal
          isOpen={isAnnotatorOpen}
          imageUrl={annotatorImageUrl}
          onClose={() => setIsAnnotatorOpen(false)}
          onSaveAnnotated={(annotatedDataUrl) => {
            if (attachedImage && annotatorImageUrl === attachedImage) {
              setAttachedImage(annotatedDataUrl);
            }
          }}
        />
      )}
    </div>
  );
};