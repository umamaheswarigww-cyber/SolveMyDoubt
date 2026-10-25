import React from 'react';
import { CheckCircle2, ShieldCheck, User as UserIcon, Sparkles, GraduationCap } from 'lucide-react';
import { cn, formatExactDate } from '../../lib/utils';
import { Profile } from '../../types';

interface MemberBadgeProps {
  profile?: Profile | null;
  isAnonymous?: boolean;
  className?: string;
  showText?: boolean;
}

/**
 * 1. Registered signed-in account badge:
 * "Show a small, elegant blue circular checkmark beside the user's displayed name.
 * Tooltip/accessibility label: 'Signed-in member'."
 */
export const MemberCheckmark: React.FC<{ className?: string }> = ({ className }) => (
  <span
    title="Signed-in member"
    aria-label="Signed-in member"
    className={cn(
      'inline-flex items-center justify-center text-blue-500 hover:text-blue-600 transition-colors ml-1 align-middle',
      className
    )}
  >
    <CheckCircle2 className="w-4 h-4 fill-blue-500/15 text-blue-500" strokeWidth={2.5} />
  </span>
);

/**
 * 2. Guest account badge:
 * "Display 'Guest' or 'Guest learner' and a neutral avatar.
 * Never show the blue member checkmark.
 * Never award member-only reputation or verification status."
 */
export const GuestBadge: React.FC<{ className?: string }> = ({ className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 select-none',
      className
    )}
  >
    <UserIcon className="w-3 h-3 text-slate-500" />
    <span>Guest learner</span>
  </span>
);

/**
 * Student account badge (on user profile / author name)
 */
export const StudentBadge: React.FC<{ className?: string }> = ({ className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 select-none shadow-2xs',
      className
    )}
  >
    <GraduationCap className="w-3 h-3 text-indigo-500" />
    <span>Student</span>
  </span>
);

/**
 * Faculty account badge (on user profile / author name)
 */
export const FacultyBadge: React.FC<{ className?: string }> = ({ className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-xs select-none',
      className
    )}
  >
    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
    <span>Faculty</span>
  </span>
);

/**
 * 3. Faculty-verified answer badge:
 * "Display a separate, more prominent but restrained badge reading 'Faculty verified'.
 * Include the reviewing faculty member's name and verification timestamp.
 * Show this badge only when the database records a valid faculty verification."
 */
export const FacultyVerifiedBadge: React.FC<{
  verifierName?: string;
  verifiedAt?: string | null;
  feedback?: string | null;
  className?: string;
}> = ({ verifierName, verifiedAt, feedback, className }) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 p-3.5 shadow-sm text-emerald-950 dark:text-emerald-100',
        className
      )}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Faculty Verified
              </span>
              <Sparkles className="w-3 h-3 text-emerald-500" />
            </div>
            {verifierName && (
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Verified by <span className="font-semibold text-slate-900 dark:text-white">{verifierName}</span>
                {verifiedAt && (
                  <span className="text-slate-500 dark:text-slate-400 ml-1.5 text-[11px]">
                    • {formatExactDate(verifiedAt)}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          Official Academic Endorsement
        </div>
      </div>
      {feedback && (
        <div className="mt-2.5 pt-2 border-t border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
          "{feedback}"
        </div>
      )}
    </div>
  );
};

/**
 * Question Owner Accepted Answer Badge
 */
export const AcceptedAnswerBadge: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30 shadow-xs',
      className
    )}
  >
    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
    <span>Accepted by Question Author</span>
  </div>
);

/**
 * Universal User Name with appropriate badge
 */
export const UserDisplayName: React.FC<{
  profile?: Profile | null;
  fallbackName?: string;
  isAnonymous?: boolean;
  className?: string;
  nameClassName?: string;
}> = ({ profile, fallbackName = 'Learner', isAnonymous = false, className, nameClassName }) => {
  const isAnon = isAnonymous || profile?.is_anonymous;
  const role = profile?.role;
  const name = profile?.display_name || fallbackName;

  return (
    <div className={cn('inline-flex items-center gap-1.5 flex-wrap', className)}>
      <span className={cn('font-semibold text-slate-900 dark:text-slate-100', nameClassName)}>
        {name}
      </span>
      {!isAnon && role === 'student' && <StudentBadge />}
      {!isAnon && role === 'faculty' && <FacultyBadge />}
      {/* If neither student nor faculty (or guest), no badge is rendered */}
    </div>
  );
};
