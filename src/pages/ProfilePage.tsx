import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Award,
  BookOpen,
  Calendar,
  Edit3,
  Save,
  MessageSquare,
  ArrowBigUp,
  Flame,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_QUESTIONS, INITIAL_ANSWERS } from '../lib/mockData';
import { MemberCheckmark, GuestBadge, FacultyBadge } from '../components/common/BadgeSystem';
import { DoubtCard } from '../components/common/DoubtCard';
import { formatExactDate } from '../lib/utils';

export const ProfilePage: React.FC = () => {
  const { user, profile, isGuest, isMember, isFaculty, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [department, setDepartment] = useState(profile?.department || 'Computer Science');
  const [yearOfStudy, setYearOfStudy] = useState(profile?.year_of_study || '3rd Year');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // User questions
  const userQuestions = INITIAL_QUESTIONS.filter((q) => q.author_id === user?.id || q.author_id === 'user-student-1');

  // User answers
  const userAnswers = INITIAL_ANSWERS.filter((a) => a.author_id === user?.id || a.author_id === 'user-student-3');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      alert('Guest profiles are temporary. Please sign up to customize your persistent academic profile.');
      return;
    }

    await updateProfile({
      display_name: displayName,
      bio,
      department,
      year_of_study: yearOfStudy,
    });

    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 min-w-0">
      {/* Profile Card Header */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {profile?.avatar_url && !isGuest ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-2xl border border-indigo-200 dark:border-indigo-800">
                {isGuest ? <User className="w-8 h-8 text-slate-400" /> : profile?.display_name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {profile?.display_name || 'Learner'}
                </h1>
                {isGuest ? (
                  <GuestBadge />
                ) : (
                  <>
                    <MemberCheckmark />
                    {isFaculty && <FacultyBadge />}
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {isGuest ? 'Anonymous Guest Session' : `@${profile?.username || 'member'}`}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                <span>{profile?.department || 'General Studies'}</span>
                <span>•</span>
                <span>{profile?.year_of_study || 'Student'}</span>
              </div>
            </div>
          </div>

          {!isGuest && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          )}
        </div>

        {/* Bio */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
          {profile?.bio || 'Passionate about academic problem-solving, algorithmic thinking, and peer mentorship.'}
        </p>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white">Update Permitted Profile Fields</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Bio / Research Interests
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-medium"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl font-bold bg-indigo-600 text-white shadow-xs"
              >
                Save Profile
              </button>
            </div>
          </form>
        )}

        {/* Academic Stats Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {isGuest ? 0 : profile?.reputation || 25}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Reputation
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-xl font-black text-green-600 dark:text-green-400">
              {isGuest ? 0 : 3}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Accepted Answers
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {isGuest ? 0 : 1}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Faculty Endorsed
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-xl font-black text-rose-500">
              {isGuest ? 0 : 2}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Doubts Rescued
            </div>
          </div>
        </div>
      </div>

      {/* Activity Sections: Doubts Asked by User */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>Doubts & Contributions ({userQuestions.length})</span>
        </h2>
        <div className="space-y-4">
          {userQuestions.map((q) => (
            <DoubtCard key={q.id} question={q} />
          ))}
        </div>
      </div>
    </div>
  );
};
