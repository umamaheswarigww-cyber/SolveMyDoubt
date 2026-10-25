import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface RoleSelectionModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (role: UserRole) => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
}) => {
  const { profile, setUserRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty'>(
    profile?.role === 'faculty' ? 'faculty' : 'student'
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await setUserRole(selectedRole);
      if (onSuccess) onSuccess(selectedRole);
      if (onClose) onClose();
    } catch (err) {
      console.error('Role selection error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to DoubtsHub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Select Your Academic Role
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Choose how you would like to participate in the learning community. You can change this role anytime in your profile settings.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Student */}
          <div
            onClick={() => setSelectedRole('student')}
            className={`cursor-pointer rounded-2xl border-2 p-5 space-y-4 transition-all relative flex flex-col justify-between ${
              selectedRole === 'student'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-lg shadow-indigo-500/10'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {selectedRole === 'student' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            )}

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Learner Path
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Student / Learner
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Ask academic doubts, learn from peers & professors, provide helpful solutions, and climb the university leaderboard.
              </p>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Ask doubts with math & code</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Answer peer questions for reputation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Accept best solutions for your doubts</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={`w-full py-2.5 rounded-xl font-bold text-xs mt-4 transition-all ${
                selectedRole === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {selectedRole === 'student' ? 'Selected as Student' : 'Choose Student'}
            </button>
          </div>

          {/* Option 2: Faculty */}
          <div
            onClick={() => setSelectedRole('faculty')}
            className={`cursor-pointer rounded-2xl border-2 p-5 space-y-4 transition-all relative flex flex-col justify-between ${
              selectedRole === 'faculty'
                ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-lg shadow-emerald-500/10'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {selectedRole === 'faculty' && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            )}

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Educator Path
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Faculty / Professor / TA
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Review all doubts, answer student questions, verify accurate explanations with official badges, and clear escalated rescue queues.
              </p>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Answer any student doubt across courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Officially <strong>Verify</strong> student answers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Manage Faculty Review & Rescue queues</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={`w-full py-2.5 rounded-xl font-bold text-xs mt-4 transition-all ${
                selectedRole === 'faculty'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {selectedRole === 'faculty' ? 'Selected as Faculty' : 'Choose Faculty'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 text-center sm:text-left">
            Your selection syncs directly to your profile and unlocks role-specific academic tools.
          </p>

          <button
            onClick={handleConfirm}
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 shrink-0"
          >
            <span>{isSaving ? 'Configuring Profile...' : `Continue as ${selectedRole === 'faculty' ? 'Faculty' : 'Student'}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
