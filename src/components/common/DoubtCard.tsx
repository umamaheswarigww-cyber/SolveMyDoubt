import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  ArrowBigUp,
  Eye,
  CheckCircle2,
  ShieldCheck,
  LifeBuoy,
  Clock,
  Sparkles,
  Bookmark,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Question } from '../../types';
import { UserDisplayName, MemberCheckmark, FacultyBadge } from './BadgeSystem';
import { formatTimeAgo, cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { castVote, deleteQuestion } from '../../lib/api';

interface DoubtCardProps {
  question: Question;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  onOpenComments?: (question: Question) => void;
  onVote?: (questionId: string, direction: 1 | -1) => void;
  onDelete?: (questionId: string) => void;
}

export const DoubtCard: React.FC<DoubtCardProps> = ({
  question,
  onBookmark,
  isBookmarked,
  onOpenComments,
  onVote,
  onDelete,
}) => {
  const { user, isGuest, isFaculty, isAdmin } = useAuth();
  const [score, setScore] = useState(question.score || 0);
  const [userVote, setUserVote] = useState<number | null>(question.user_vote || null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setScore(question.score || 0);
    setUserVote(question.user_vote || null);
  }, [question.score, question.user_vote]);

  const hasAccepted = Boolean(question.accepted_answer_id);
  const isFacultyVerified = Boolean(
    question.answers?.some((a) => a.verified_by) || question.id === 'q-faculty-verified'
  );
  const isRescueUrgent = question.is_escalated || question.rescue_priority === 'critical';
  const answersCount = question.answers_count || 0;

  const handleUpvote = async () => {
    if (isGuest) {
      alert('Guest learners cannot vote. Please sign in to vote.');
      return;
    }
    const nextVote = userVote === 1 ? null : 1;
    const scoreDiff = userVote === 1 ? -1 : userVote === -1 ? 2 : 1;
    const newScore = score + scoreDiff;
    setUserVote(nextVote);
    setScore(newScore);
    if (onVote) {
      onVote(question.id, 1);
    }
    try {
      await castVote('question', question.id, nextVote || 0, newScore, user?.id);
    } catch (err) {
      console.warn('DoubtCard vote notice:', err);
    }
  };

  const handleCardClick = () => {
    if (onOpenComments) {
      onOpenComments(question);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteQuestion(question.id, user?.id);
      if (onDelete) {
        onDelete(question.id);
      }
    } catch (err) {
      console.error('Delete question error:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <article
        onClick={handleCardClick}
        className={cn(
          'group relative rounded-2xl border transition-all duration-200 p-4 sm:p-5 bg-white/90 dark:bg-slate-900/90 hover:shadow-lg select-none min-w-0 w-full',
          onOpenComments && 'cursor-pointer hover:border-indigo-500/50',
          isRescueUrgent
            ? 'border-rose-500/30 dark:border-rose-500/20 hover:border-rose-500/50 hover:shadow-rose-500/5'
            : isFacultyVerified
            ? 'border-emerald-500/30 dark:border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-emerald-500/5'
            : hasAccepted
            ? 'border-green-500/30 dark:border-green-500/20 hover:border-green-500/50'
            : 'border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 hover:shadow-indigo-500/5'
        )}
      >
        {/* Top Meta Header: Course, Difficulty & Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {question.course && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 max-w-[200px] sm:max-w-xs truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: question.course.color || '#6366f1' }}
                />
                <span className="truncate">{question.course.name}</span>
                <span className="font-mono text-[10px] text-slate-400 hidden xs:inline shrink-0">
                  ({question.course.course_code})
                </span>
              </span>
            )}

            {/* Difficulty pill */}
            <span
              className={cn(
                'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0',
                question.difficulty === 'Introductory'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : question.difficulty === 'Intermediate'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
              )}
            >
              {question.difficulty}
            </span>
          </div>

          {/* Right Action Icons: Faculty Delete, Bookmark, Status Badges */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {isFacultyVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden xs:inline">Faculty Verified</span>
                <span className="xs:hidden">Verified</span>
              </span>
            )}

            {hasAccepted && !isFacultyVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <span>Resolved</span>
              </span>
            )}

            {isRescueUrgent && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse-subtle">
                <LifeBuoy className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden xs:inline">Fast Clarification</span>
                <span className="xs:hidden">Rescue</span>
              </span>
            )}

            {onBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(question.id);
                }}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isBookmarked
                    ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                )}
                title="Save doubt"
              >
                <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            )}

            {/* FACULTY DELETE ACCESS FOR IMPROPER / ABUSIVE QUESTIONS */}
            {(isFaculty || isAdmin) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 transition-colors flex items-center gap-1"
                title="Faculty Access: Delete improper / abusive question"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-[10px] font-bold hidden sm:inline">Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Question Title & Snippet */}
        <div className="block group/title">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover/title:text-indigo-600 dark:group-hover/title:text-indigo-400 transition-colors leading-snug">
            {question.title}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {question.body.replace(/[#$*`]/g, '').trim()}
          </p>
        </div>

        {/* Tags List */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            {question.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Card Footer: Author Info & Interactive Upvote / Comments */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5 flex-wrap text-xs">
          {/* Author badge */}
          <div className="flex items-center gap-2 min-w-0">
            {question.author?.avatar_url && !question.author.is_anonymous ? (
              <img
                src={question.author.avatar_url}
                alt={question.author.display_name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                {question.author?.display_name?.slice(0, 1) || 'L'}
              </div>
            )}
            <UserDisplayName
              profile={question.author}
              isAnonymous={question.author?.is_anonymous}
              nameClassName="text-xs font-medium truncate"
            />
            <span className="text-slate-400 text-[11px] shrink-0">
              • {formatTimeAgo(question.created_at)}
            </span>
          </div>

          {/* Interactive Stats: Score & Comments Button */}
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
            {/* Interactive Upvote on Card */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUpvote();
              }}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition-all active:scale-95 border text-xs',
                userVote === 1
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              )}
              title="Upvote question"
            >
              <ArrowBigUp className="w-4 h-4 fill-current" />
              <span>{score}</span>
            </button>

            {/* Dedicated Comments Popup Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenComments) {
                  onOpenComments(question);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors border border-slate-200/60 dark:border-slate-700/60"
              title="Open discussion & comments popup"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                {answersCount} {answersCount === 1 ? 'Comment' : 'Comments'}
              </span>
              {answersCount === 0 && (
                <span className="text-[10px] text-rose-500 uppercase font-black ml-0.5">• reply</span>
              )}
            </button>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 pl-1 hidden sm:flex" title="Views">
              <Eye className="w-3.5 h-3.5" />
              <span>{question.view_count || 1}</span>
            </div>
          </div>
        </div>
      </article>

      {/* FACULTY DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(false);
          }}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                <Trash2 className="w-5 h-5 shrink-0" />
              </div>
              <span>Delete Improper Question</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              As a faculty member, you have authorization to remove abusive, off-topic, or guideline-violating doubts. This question and its answers will be removed from the university feed.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Doubt'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
