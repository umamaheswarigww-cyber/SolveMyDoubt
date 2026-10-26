import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Layers,
  Compass,
  PlusCircle,
  LifeBuoy,
  Bookmark,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { INITIAL_RESCUE_METRICS } from '../../lib/mockData';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user, isFaculty } = useAuth();

  // Hide bottom nav on full-screen auth page or landing page for guests
  const isAuthPage = location.pathname.startsWith('/auth');
  const isLandingPage = location.pathname === '/' && !user;
  if (isAuthPage || isLandingPage) return null;

  const urgentCount = INITIAL_RESCUE_METRICS.totalUnanswered;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Dashboard / Feed */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all active:scale-95 min-w-[56px]',
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Layers className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold tracking-tight">Home</span>
            </>
          )}
        </NavLink>

        {/* 2. Explore */}
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all active:scale-95 min-w-[56px]',
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Compass className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold tracking-tight">Explore</span>
            </>
          )}
        </NavLink>

        {/* 3. Primary Center Action: Ask a Doubt (+) */}
        <NavLink
          to="/ask"
          className="flex flex-col items-center justify-center -mt-4 active:scale-95 transition-transform"
          aria-label="Ask a Doubt"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/35 flex items-center justify-center">
            <div className="w-full h-full bg-indigo-600 hover:bg-indigo-500 rounded-[14px] flex items-center justify-center text-white transition-colors">
              <PlusCircle className="w-6 h-6 stroke-[2.3]" />
            </div>
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
            Ask
          </span>
        </NavLink>

        {/* 4. Rescue Queue (Urgent Doubts) */}
        <NavLink
          to="/rescue"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all active:scale-95 min-w-[56px]',
              isActive
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-rose-500'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <LifeBuoy className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                {urgentCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
                )}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-600 dark:bg-rose-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-semibold tracking-tight">Rescue</span>
            </>
          )}
        </NavLink>

        {/* 5. Bookmarks or Faculty Queue */}
        {isFaculty ? (
          <NavLink
            to="/faculty"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all active:scale-95 min-w-[56px]',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <GraduationCap className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                  )}
                </div>
                <span className="text-[10px] mt-1 font-semibold tracking-tight">Faculty</span>
              </>
            )}
          </NavLink>
        ) : (
          <NavLink
            to="/bookmarks"
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all active:scale-95 min-w-[56px]',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Bookmark className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </div>
                <span className="text-[10px] mt-1 font-semibold tracking-tight">Saved</span>
              </>
            )}
          </NavLink>
        )}
      </div>
    </nav>
  );
};
