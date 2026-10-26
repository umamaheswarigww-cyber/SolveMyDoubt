import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { Footer } from './components/common/Footer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorePage } from './pages/ExplorePage';
import { AskQuestionPage } from './pages/AskQuestionPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { RescuePage } from './pages/RescuePage';
import { FacultyReviewPage } from './pages/FacultyReviewPage';
import { KnowledgeLibraryPage } from './pages/KnowledgeLibraryPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { BookmarksPage } from './pages/BookmarksPage';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';

const AppLayout: React.FC<{ darkMode: boolean; setDarkMode: (v: boolean) => void }> = ({
  darkMode,
  setDarkMode,
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const isAuthPage = location.pathname.startsWith('/auth');
  const isLandingPage = location.pathname === '/' && !user;

  // Render standalone landing or auth pages
  if (isAuthPage || isLandingPage) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-x-hidden">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex gap-6 lg:gap-8 items-start pb-24 md:pb-6 min-w-0">
        {/* Persistent Left Sidebar on Desktop */}
        <Sidebar />

        {/* Central Dynamic Page View */}
        <div className="flex-1 min-w-0 w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/ask" element={<AskQuestionPage />} />
            <Route path="/doubt/:id" element={<QuestionDetailPage />} />
            <Route path="/rescue" element={<RescuePage />} />
            <Route path="/faculty" element={<FacultyReviewPage />} />
            <Route path="/library" element={<KnowledgeLibraryPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('doubtloop_theme');
      return saved ? saved === 'dark' : true; // Default dark theme
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('doubtloop_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('doubtloop_theme', 'light');
      }
    } catch {}
  }, [darkMode]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout darkMode={darkMode} setDarkMode={setDarkMode} />
      </AuthProvider>
    </BrowserRouter>
  );
}


export default App;
