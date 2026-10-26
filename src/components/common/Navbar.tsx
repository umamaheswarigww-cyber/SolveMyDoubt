import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Sun,
  Moon,
  LifeBuoy,
  LogOut,
  ChevronDown,
  Layers,
  Compass,
  Trophy,
  BookOpenCheck,
  Shield,
  User,
  GraduationCap,
  Menu,
  X,
  Sparkles,
  Bookmark,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MemberCheckmark, GuestBadge, FacultyBadge } from './BadgeSystem';
import { RoleSelectionModal } from './RoleSelectionModal';
import { cn } from '../../lib/utils';
import { INITIAL_RESCUE_METRICS } from '../../lib/mockData';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ darkMode, setDarkMode, onOpenSearch }) => {
  const { user, profile, isGuest, isMember, isFaculty, isAdmin, signOut, needsRoleSelection, setNeedsRoleSelection } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Role switching disabled while active session - role selection only on sign-in
  const navigate = useNavigate();
  const location = useLocation();

  const desktopNavLinks = [
    { label: 'Explore', href: '/explore', icon: Compass },
    {
      label: 'Rescue Queue',
      href: '/rescue',
      icon: LifeBuoy,
      highlight: true,
      badgeCount: INITIAL_RESCUE_METRICS.totalUnanswered,
    },
    { label: 'Library', href: '/library', icon: BookOpenCheck },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    ...(isFaculty ? [{ label: 'Faculty Review', href: '/faculty', icon: GraduationCap }] : []),
    ...(isAdmin ? [{ label: 'Admin', href: '/admin', icon: Shield }] : []),
  ];

  const allMobileNavLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: Layers },
    { label: 'Explore Doubts', href: '/explore', icon: Compass },
    {
      label: 'Rescue Queue',
      href: '/rescue',
      icon: LifeBuoy,
      highlight: true,
      badgeCount: INITIAL_RESCUE_METRICS.totalUnanswered,
    },
    { label: 'Saved Doubts', href: '/bookmarks', icon: Bookmark },
    { label: 'Knowledge Library', href: '/library', icon: BookOpenCheck },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    ...(isFaculty ? [{ label: 'Faculty Review', href: '/faculty', icon: GraduationCap }] : []),
    ...(isAdmin ? [{ label: 'Admin', href: '/admin', icon: Shield }] : []),
  ];

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3 min-w-0">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a6 6 0 0 0-6 6c0 3 3 4 3 6v1" />
                  <circle cx="12" cy="18" r="0.5" fill="currentColor" />
                  <path d="M7 14c-3 0-5 2.5-5 5.5S4 22 7 22h10c3 0 5-2.5 5-5.5s-2-5.5-5-5.5" opacity="0.65" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-slate-100 dark:to-indigo-300 bg-clip-text text-transparent">
                DoubtsHub
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1 sm:px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 inline-block">
                HUB
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search + Primary Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-2 min-w-0">
          <button
            onClick={onOpenSearch || (() => navigate('/explore'))}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/80 hover:bg-slate-100 dark:bg-slate-900/70 dark:hover:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl transition-all shadow-2xs group min-w-0"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
              <span className="truncate">Search doubts, courses, formulas...</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-400 shrink-0">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden xl:flex items-center gap-1 shrink-0">
          {desktopNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/80',
                  link.highlight &&
                    !isActive &&
                    'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5 shrink-0', link.highlight && 'text-rose-500')} />
                <span>{link.label}</span>
                {link.badgeCount !== undefined && link.badgeCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
                    {link.badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions, Theme, Role, User */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile search trigger */}
          <button
            onClick={onOpenSearch || (() => navigate('/explore'))}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 md:hidden shrink-0"
            aria-label="Search doubts"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Ask a Doubt CTA */}
          <Link
            to="/ask"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-sm shadow-indigo-500/25 active:scale-95 transition-all shrink-0 whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Ask a Doubt</span>
            <span className="sm:hidden">Ask</span>
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors shrink-0"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Verified Session Role Badge (Locked for active session) */}
          {user && (
            <div
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 shadow-xs',
                isFaculty
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
              )}
              title={`Logged in as ${isFaculty ? 'Faculty Member' : 'Student Scholar'}`}
            >
              {isFaculty ? (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Faculty</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Student</span>
                </>
              )}
            </div>
          )}

          {/* User Profile / Auth State */}
          {user ? (
            <div className="relative shrink-0">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                aria-label="User account menu"
              >
                {profile?.avatar_url && !isGuest ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {isGuest ? (
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      profile?.display_name?.slice(0, 1).toUpperCase() || 'U'
                    )}
                  </div>
                )}
                <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-900 dark:text-slate-100 max-w-[120px] truncate">
                  <span className="truncate">{profile?.display_name || 'Learner'}</span>
                  {isMember && <MemberCheckmark className="shrink-0" />}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 truncate">
                      <span className="truncate">{profile?.display_name}</span>
                      {isMember && <MemberCheckmark className="shrink-0" />}
                      {isFaculty && <FacultyBadge className="shrink-0" />}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {isGuest ? 'Attributable Guest Session' : user.email || `@${profile?.username}`}
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile & Stats</span>
                  </Link>

                  <Link
                    to="/bookmarks"
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium"
                  >
                    <Bookmark className="w-4 h-4 text-slate-400" />
                    <span>Saved Doubts</span>
                  </Link>

                  {isFaculty && (
                    <Link
                      to="/faculty"
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Faculty Review Queue</span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Hub</span>
                    </Link>
                  )}



                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isGuest ? 'Exit Guest Mode' : 'Sign Out'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                to="/auth?mode=signin"
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                to="/auth?mode=signup"
                className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-colors whitespace-nowrap"
              >
                Join
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 xl:hidden"
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white/98 dark:bg-slate-950/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="relative pb-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search doubts, courses, formulas..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setMobileMenuOpen(false);
                  navigate('/explore');
                }
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {allMobileNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300"
                >
                  <Icon className={cn('w-4 h-4 shrink-0', link.highlight && 'text-rose-500')} />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </div>


        </div>
      )}

      {/* Role Selection Modal (Only triggered on initial authentication if needed) */}
      <RoleSelectionModal
        isOpen={needsRoleSelection}
        onClose={() => {
          setNeedsRoleSelection(false);
        }}
      />
    </header>
  );
};
