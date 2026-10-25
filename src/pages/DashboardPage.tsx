import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  LifeBuoy,
  PlusCircle,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Filter,
  Flame,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DoubtCard } from '../components/common/DoubtCard';
import { RightSidebar } from '../components/common/RightSidebar';
import { QuestionCommentsModal } from '../components/common/QuestionCommentsModal';
import { INITIAL_QUESTIONS, INITIAL_RESCUE_METRICS } from '../lib/mockData';
import { getQuestions, getRescueMetrics, subscribeToQuestions, checkDatabaseHealth } from '../lib/api';
import { Question, RescueMetrics } from '../types';
import { MemberCheckmark, GuestBadge } from '../components/common/BadgeSystem';

export const DashboardPage: React.FC = () => {
  const { user, profile, isGuest, isMember } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'unanswered' | 'verified'>('feed');
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
  const [selectedTagSlug, setSelectedTagSlug] = useState<string | undefined>();
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [rescueMetrics, setRescueMetrics] = useState<RescueMetrics>(INITIAL_RESCUE_METRICS);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalQuestion, setActiveModalQuestion] = useState<Question | null>(null);
  const [liveNotice, setLiveNotice] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{ isReady: boolean; statusText?: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [qData, metricsData, health] = await Promise.all([
          getQuestions(),
          getRescueMetrics(),
          checkDatabaseHealth(),
        ]);
        if (mounted) {
          if (qData && qData.length > 0) setQuestions(qData);
          if (metricsData) setRescueMetrics(metricsData);
          setDbStatus(health);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();

    // Setup Supabase Realtime live sync
    const unsubscribe = subscribeToQuestions((newQuestion) => {
      if (mounted) {
        setQuestions((prev) => {
          if (prev.some((q) => q.id === newQuestion.id)) return prev;
          return [newQuestion, ...prev];
        });
        setLiveNotice(`Live Broadcast: New doubt posted by ${newQuestion.author?.display_name || 'learner'}: "${newQuestion.title.slice(0, 45)}..."`);
        setTimeout(() => setLiveNotice(null), 6000);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Filter questions based on selected tab and filters
  const displayedQuestions = questions.filter((q) => {
    if (activeTab === 'unanswered') {
      return (q.answers_count || 0) === 0;
    }
    if (activeTab === 'verified') {
      return q.answers?.some((a) => a.verified_by) || q.id === 'q-faculty-verified';
    }
    if (selectedCourseId) {
      return q.course_id === selectedCourseId;
    }
    if (selectedTagSlug) {
      return q.tags?.some((t) => t.slug === selectedTagSlug);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Realtime Live Broadcast Toast */}
      {liveNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce-subtle border border-indigo-400">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
          <span>{liveNotice}</span>
        </div>
      )}

      {/* Supabase Schema Setup Guide if tables not yet populated */}
      {dbStatus && !dbStatus.isReady && (
        <div className="mb-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[11px]">
              ⚡ Supabase Linked
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              Run <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[11px]">supabase/schema.sql</code> in your Supabase SQL Editor to enable worldwide PostgreSQL sync!
            </span>
          </div>
          <a
            href="https://supabase.com/dashboard/project/sgyflrnosqeeulmlcaba/sql/new"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 shadow-xs transition-colors flex items-center gap-1"
          >
            <span>Open Supabase SQL Editor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Personalized Welcome Banner */}
      <div className="relative rounded-3xl border border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-cyan-900/10 p-6 sm:p-8 mb-8 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50">
                {isGuest ? 'Guest Exploration' : profile?.department || 'Student Workspace'}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-500 font-medium">Academic Year 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back, {profile?.display_name || 'Learner'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              {isGuest
                ? 'You are browsing in guest mode. Search and inspect doubts freely, or create a registered profile to unlock answer upvoting and certified badges.'
                : 'Your peer network has 8 active doubts in your courses today. Help answer a doubt to boost your reputation streak.'}
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center min-w-[90px]">
              <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {isGuest ? 0 : profile?.reputation || 25}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Reputation
              </div>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center min-w-[90px]">
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {isGuest ? 0 : 3}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Solutions
              </div>
            </div>

            <Link
              to="/ask"
              className="hidden sm:flex flex-col items-center justify-center px-4 py-3 rounded-2xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all text-center min-w-[100px]"
            >
              <PlusCircle className="w-5 h-5 mb-0.5" />
              <span>Ask Doubt</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Unanswered Rescue Alert Callout */}
      <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-xs">
            <LifeBuoy className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Unanswered Doubts Escalation Radar
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500 text-white animate-pulse">
                {rescueMetrics.totalUnanswered} Doubts Need Help
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              3 critical questions are approaching the 12-hour faculty escalation limit. Providing an answer awards +15 bonus points!
            </p>
          </div>
        </div>
        <Link
          to="/rescue"
          className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-300 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all flex items-center gap-1.5 shadow-2xs"
        >
          <span>Open Rescue Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Layout Grid */}
      <div className="flex items-start gap-8">
        {/* Central Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Feed Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveTab('feed');
                  setSelectedCourseId(undefined);
                  setSelectedTagSlug(undefined);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'feed'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Recommended Doubts
              </button>
              <button
                onClick={() => setActiveTab('unanswered')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'unanswered'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                }`}
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Unanswered Doubts</span>
              </button>
              <button
                onClick={() => setActiveTab('verified')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'verified'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Faculty Verified</span>
              </button>
            </div>

            {(selectedCourseId || selectedTagSlug) && (
              <button
                onClick={() => {
                  setSelectedCourseId(undefined);
                  setSelectedTagSlug(undefined);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Clear Filters ×
              </button>
            )}
          </div>

          {/* Doubt Cards List */}
          <div className="space-y-4">
            {displayedQuestions.length > 0 ? (
              displayedQuestions.map((question) => (
                <DoubtCard
                  key={question.id}
                  question={question}
                  onOpenComments={(q) => setActiveModalQuestion(q)}
                  onVote={(qId, dir) => {
                    setQuestions((prev) =>
                      prev.map((item) =>
                        item.id === qId ? { ...item, score: item.score + dir } : item
                      )
                    );
                  }}
                />
              ))
            ) : (
              <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  No doubts matching current filter.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('feed');
                    setSelectedCourseId(undefined);
                    setSelectedTagSlug(undefined);
                  }}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <RightSidebar
          selectedCourseId={selectedCourseId}
          onSelectCourse={(id) => setSelectedCourseId(id === selectedCourseId ? undefined : id)}
          selectedTagSlug={selectedTagSlug}
          onSelectTag={(slug) => setSelectedTagSlug(slug === selectedTagSlug ? undefined : slug)}
        />
      </div>

      {/* Instagram-Style Comments & Explanations Popup Window */}
      <QuestionCommentsModal
        isOpen={Boolean(activeModalQuestion)}
        question={activeModalQuestion}
        onClose={() => setActiveModalQuestion(null)}
        onQuestionVoteUpdate={(qId, newScore) => {
          setQuestions((prev) =>
            prev.map((q) => (q.id === qId ? { ...q, score: newScore } : q))
          );
        }}
        onAnswerCountUpdate={(qId, newCount) => {
          setQuestions((prev) =>
            prev.map((q) => (q.id === qId ? { ...q, answers_count: newCount } : q))
          );
          if (activeModalQuestion && activeModalQuestion.id === qId) {
            setActiveModalQuestion((prev) =>
              prev ? { ...prev, answers_count: newCount } : null
            );
          }
        }}
      />
    </div>
  );
};
