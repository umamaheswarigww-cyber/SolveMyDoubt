import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  LifeBuoy,
  BookOpenCheck,
  Trophy,
  Bookmark,
  GraduationCap,
  Shield,
  PlusCircle,
  TrendingUp,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export const Sidebar: React.FC = () => {
  const { isFaculty, isAdmin, isGuest, profile } = useAuth();

  const primaryItems = [
    { name: 'Dashboard', to: '/dashboard', icon: Layers },
    { name: 'Explore Doubts', to: '/explore', icon: Compass },
    {
      name: 'Rescue Queue',
      to: '/rescue',
      icon: LifeBuoy,
      badge: 'Urgent',
      badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    },
    { name: 'Knowledge Library', to: '/library', icon: BookOpenCheck },
    { name: 'Leaderboard', to: '/leaderboard', icon: Trophy },
    { name: 'Saved Doubts', to: '/bookmarks', icon: Bookmark },
  ];

  const roleItems = [
    ...(isFaculty
      ? [
          {
            name: 'Faculty Review',
            to: '/faculty',
            icon: GraduationCap,
            badge: 'Queue',
            badgeColor: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20',
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            name: 'Administration',
            to: '/admin',
            icon: Shield,
            badge: 'Admin',
            badgeColor: 'bg-purple-500/15 text-purple-600 border border-purple-500/20',
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block sticky top-20 self-start space-y-6 select-none">
      {/* Ask Doubt CTA Button */}
      <NavLink
        to="/ask"
        className="group relative flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <PlusCircle className="w-5 h-5" />
        <span>Ask a Doubt</span>
        <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
      </NavLink>

      {/* Main Nav Navigation */}
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Main Workspace
        </div>
        {primaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-900/60'
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Role-Specific Items (Faculty & Admin) */}
      {roleItems.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Authorized Workspaces
          </div>
          {roleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-900/60'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider',
                      item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      )}

      {/* Unanswered Rescue Mini Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-rose-500/10 border border-indigo-200/50 dark:border-indigo-800/40 text-xs space-y-2">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
          <LifeBuoy className="w-4 h-4 text-rose-500 animate-spin-slow" />
          <span>Rescue Mission</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Doubts unanswered after 12h escalate to faculty. Help a peer today & earn +15 bonus reputation!
        </p>
        <NavLink
          to="/rescue"
          className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline text-[11px]"
        >
          <span>View Unresolved Doubts</span>
          <span>→</span>
        </NavLink>
      </div>

      {/* Guest registration prompt */}
      {isGuest && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
          <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guest Sandbox</span>
          </div>
          <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
            Register your university email to unlock voting, answer acceptance, and faculty verification!
          </p>
          <NavLink
            to="/auth?mode=signup"
            className="block text-center w-full py-1.5 px-3 rounded-lg font-bold text-[11px] bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-2xs"
          >
            Create Free Account
          </NavLink>
        </div>
      )}
    </aside>
  );
};
