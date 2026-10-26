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
  X,
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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Modal Card: Native Bottom Sheet on Mobile, Centered Modal on PC */}
      <div className="relative w-full max-w-2xl max-h-[96dvh] sm:max-h-[90vh] bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        
        {/* Mobile Pull / Drag Indicator Handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 sm:p-8 space-y-4 sm:space-y-6 overscroll-contain">
          {/* Header */}
          <div className="text-center space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Welcome to DoubtsHub</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Select Your Academic Role
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Choose your profile mode for this session. To switch roles later, simply sign out and sign back in.
            </p>
          </div>

          {/* Role Cards Grid (Stack on phone, 2-column on tablet/PC) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Option 1: Student / Learner */}
            <div
              onClick={() => setSelectedRole('student')}
              className={`cursor-pointer rounded-2xl border-2 p-4 sm:p-5 transition-all relative flex flex-col justify-between select-none ${
                selectedRole === 'student'
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {selectedRole === 'student' && (
                <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              <div className="space-y-2.5 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Learner Path
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Student / Learner
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ask academic doubts, learn from peers & professors, answer questions, and climb the university leaderboard.
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
                    <span>Accept best peer solutions</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRole('student');
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs mt-3 sm:mt-4 transition-all ${
                  selectedRole === 'student'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {selectedRole === 'student' ? 'Selected as Student 🎓' : 'Choose Student'}
              </button>
            </div>

            {/* Option 2: Faculty / Educator */}
            <div
              onClick={() => setSelectedRole('faculty')}
              className={`cursor-pointer rounded-2xl border-2 p-4 sm:p-5 transition-all relative flex flex-col justify-between select-none ${
                selectedRole === 'faculty'
                  ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {selectedRole === 'faculty' && (
                <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              <div className="space-y-2.5 sm:space-y-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Educator Path
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Faculty / Professor / TA
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Review all doubts, verify accurate peer explanations with official badges, and delete improper or abusive doubts.
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
                    <span><strong>Delete improper / abusive</strong> doubts</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRole('faculty');
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs mt-3 sm:mt-4 transition-all ${
                  selectedRole === 'faculty'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {selectedRole === 'faculty' ? 'Selected as Faculty 🏛️' : 'Choose Faculty'}
              </button>
            </div>
          </div>
        </div>

        {/* ALWAYS VISIBLE PINNED BOTTOM ACTION BAR */}
        <div className="sticky bottom-0 z-30 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
          <p className="text-[11px] text-slate-400 text-center sm:text-left hidden xs:block">
            Selected: <strong className="text-slate-900 dark:text-white capitalize">{selectedRole}</strong> • Syncs immediately to profile
          </p>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${
              selectedRole === 'faculty'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30'
            }`}
          >
            <span>
              {isSaving
                ? 'Saving Role...'
                : `Continue as ${selectedRole === 'faculty' ? 'Faculty 🏛️' : 'Student 🎓'}`}
            </span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
