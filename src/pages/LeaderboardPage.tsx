import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Medal,
  Flame,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Star,
  Zap,
} from 'lucide-react';
import { INITIAL_LEADERBOARD, INITIAL_COURSES } from '../lib/mockData';
import { getLeaderboard } from '../lib/api';
import { LeaderboardUser } from '../types';
import { MemberCheckmark, FacultyBadge, GuestBadge } from '../components/common/BadgeSystem';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'all_time' | 'weekly'>('all_time');
  const [category, setCategory] = useState<'all' | 'verified' | 'accepted'>('all');

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getLeaderboard();
        if (mounted && data && data.length > 0) {
          setLeaderboard(data);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredLeaderboard = [...leaderboard].sort((a, b) => {
    if (category === 'verified') {
      return b.verified_answers_count - a.verified_answers_count;
    }
    if (category === 'accepted') {
      return b.accepted_answers_count - a.accepted_answers_count;
    }
    return b.reputation - a.reputation;
  });

  return (
    <div className="w-full space-y-6 sm:space-y-8 min-w-0">
      {/* Header */}
      <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-950/30 via-slate-900/60 to-purple-950/30 p-6 sm:p-10 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-500 text-white shadow-xs">
            <Trophy className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Academic Honor Roll
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Contributor Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
          Celebrating scholars who consistently clear student doubts, provide mathematically sound solutions, and rescue unanswered academic inquiries.
        </p>

        {/* Podium Top 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {filteredLeaderboard.slice(0, 3).map((scholar, idx) => {
            const ranks = ['1st Place', '2nd Place', '3rd Place'];
            const colors = [
              'border-amber-500/40 bg-amber-500/10 text-amber-400',
              'border-slate-400/40 bg-slate-400/10 text-slate-300',
              'border-amber-700/40 bg-amber-700/10 text-amber-600',
            ];
            return (
              <div
                key={scholar.id}
                className={`rounded-2xl border p-4 text-center space-y-2.5 backdrop-blur-md ${colors[idx]}`}
              >
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 font-black text-xs">
                  #{idx + 1}
                </div>
                {scholar.avatar_url && (
                  <img
                    src={scholar.avatar_url}
                    alt={scholar.display_name}
                    className="w-12 h-12 rounded-xl object-cover mx-auto ring-2 ring-white/10"
                  />
                )}
                <div>
                  <div className="flex items-center justify-center gap-1 font-bold text-sm text-white">
                    <span>{scholar.display_name}</span>
                    <MemberCheckmark />
                  </div>
                  <div className="text-[11px] text-slate-400">{scholar.badge}</div>
                </div>
                <div className="pt-1 text-base font-black text-white">
                  {scholar.reputation} <span className="text-xs font-normal text-slate-400">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              category === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All-Round Reputation
          </button>
          <button
            onClick={() => setCategory('accepted')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              category === 'accepted'
                ? 'bg-green-600 text-white'
                : 'text-slate-500 hover:text-green-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Most Solutions Accepted</span>
          </button>
          <button
            onClick={() => setCategory('verified')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              category === 'verified'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Faculty Verified Answers</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Calculated via Verified DB Events</span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/40">
              <th className="py-3.5 px-6">Rank</th>
              <th className="py-3.5 px-6">Scholar</th>
              <th className="py-3.5 px-6">Department</th>
              <th className="py-3.5 px-6 text-center">Accepted</th>
              <th className="py-3.5 px-6 text-center">Faculty Verified</th>
              <th className="py-3.5 px-6 text-right">Reputation Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {filteredLeaderboard.map((user, idx) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-4 px-6 font-bold text-slate-500">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-500/20 text-amber-500'
                        : idx === 1
                        ? 'bg-slate-300/20 text-slate-400'
                        : idx === 2
                        ? 'bg-amber-700/20 text-amber-700'
                        : ''
                    }`}
                  >
                    #{idx + 1}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                        {user.display_name[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100">
                        <span>{user.display_name}</span>
                        <MemberCheckmark />
                      </div>
                      <span className="text-[10px] text-slate-400">{user.badge}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                  {user.department}
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {user.accepted_answers_count}
                  </span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {user.verified_answers_count}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                    {user.reputation}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">pts</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
