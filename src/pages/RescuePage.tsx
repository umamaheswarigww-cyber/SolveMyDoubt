import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LifeBuoy,
  Clock,
  AlertTriangle,
  Flame,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Filter,
  Sparkles,
  Users,
  Timer,
  TrendingDown,
} from 'lucide-react';
import { DoubtCard } from '../components/common/DoubtCard';
import { QuestionCommentsModal } from '../components/common/QuestionCommentsModal';
import { INITIAL_QUESTIONS, INITIAL_RESCUE_METRICS, INITIAL_COURSES } from '../lib/mockData';
import { getQuestions, getRescueMetrics, getCourses } from '../lib/api';
import { Question, RescueMetrics, Course, RescuePriority } from '../types';

export const RescuePage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [metrics, setMetrics] = useState<RescueMetrics>(INITIAL_RESCUE_METRICS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalQuestion, setActiveModalQuestion] = useState<Question | null>(null);

  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'fast_clarification' | 'critical' | 'urgent' | 'escalated'>('all');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    async function loadRescueData() {
      setIsLoading(true);
      try {
        const [qData, mData, cData] = await Promise.all([
          getQuestions({ rescueOnly: true }),
          getRescueMetrics(),
          getCourses(),
        ]);
        if (mounted) {
          if (qData && qData.length > 0) setQuestions(qData);
          if (mData) setMetrics(mData);
          if (cData && cData.length > 0) setCourses(cData);
        }
      } catch (err) {
        console.error('Failed to load rescue queue data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadRescueData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter for unanswered doubts
  const unansweredDoubts = useMemo(() => {
    return questions.filter((q) => {
      // Must have 0 answers or be marked open/escalated
      const isUnanswered = (q.answers_count || 0) === 0 || q.status === 'open';
      if (!isUnanswered) return false;

      if (urgencyFilter === 'fast_clarification') {
        return q.rescue_priority === 'critical' || q.rescue_priority === 'urgent' || (q.score || 0) >= 15;
      }
      if (urgencyFilter === 'critical') {
        return q.rescue_priority === 'critical';
      }
      if (urgencyFilter === 'urgent') {
        return q.rescue_priority === 'urgent' || q.rescue_priority === 'critical';
      }
      if (urgencyFilter === 'escalated') {
        return q.is_escalated;
      }

      if (selectedCourseId !== 'all' && q.course_id !== selectedCourseId) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by urgency priority: critical first, then urgent
      const priorityWeights = { critical: 3, urgent: 2, normal: 1 };
      const weightA = priorityWeights[a.rescue_priority || 'normal'];
      const weightB = priorityWeights[b.rescue_priority || 'normal'];
      if (weightA !== weightB) return weightB - weightA;
      // Then oldest first (waiting longest)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [questions, urgencyFilter, selectedCourseId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Signature Rescue Hero Banner */}
      <div className="relative rounded-3xl border border-rose-500/40 bg-gradient-to-br from-rose-950/40 via-slate-900/90 to-slate-950 p-6 sm:p-10 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold">
              <LifeBuoy className="w-4 h-4 animate-spin-slow" />
              <span>Zero Doubts Left Behind Initiative</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Unanswered Doubt Rescue System
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every question on DoubtLoop is backed by our escalation guarantee. When doubts approach 12 hours without resolution, they are prioritized for community rescue with <strong className="text-rose-400">+15 bonus contributor reputation</strong> before escalating to faculty desks.
            </p>
          </div>

          {/* Real-time Rescue Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 shadow-xs text-center">
              <div className="text-2xl font-black text-rose-500">
                {metrics.totalUnanswered}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Awaiting Rescue
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xs text-center">
              <div className="text-2xl font-black text-amber-400">
                {metrics.criticalCount}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Critical Priority
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-xs text-center col-span-2 sm:col-span-1">
              <div className="text-2xl font-black text-emerald-400">
                {metrics.rescueSuccessRatePercent}%
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Resolved Rate
              </div>
            </div>
          </div>
        </div>

        {/* Resolution Trail Diagram Bar */}
        <div className="mt-8 pt-6 border-t border-rose-500/20 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[11px]">
              1
            </span>
            <span className="text-slate-300">Doubt Published to Network</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px]">
              2
            </span>
            <span className="text-slate-300">6h: Peer Match Notification</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px]">
              3
            </span>
            <span className="text-slate-300">12h: Escalation to Faculty Queue</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px]">
              4
            </span>
            <span className="text-slate-300">Knowledge Library Archival</span>
          </div>
        </div>
      </div>

      {/* Deep Definition & Rescue System Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fast Clarification Card */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4>⚡ Fast Clarification Doubts</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Urgent doubts flagged by students with impending deadlines, lab submissions, or exam prep. These questions receive top priority notifications across online peers and active TAs for rapid responses.
          </p>
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 pt-1 flex items-center gap-1">
            <span>Target Response Window: &lt; 2 Hours</span>
          </div>
        </div>

        {/* 12-Hour Escalation Guarantee Card */}
        <div className="rounded-2xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <Timer className="w-4 h-4 text-rose-500" />
            <h4>⏳ The 12-Hour Guarantee</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Unlike standard discussion forums where unanswered doubts disappear into page 10, SolveMyDoubt monitors response telemetry. Any question pending without an answer for 12 hours is automatically rescued into this prioritized triage queue.
          </p>
          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 pt-1 flex items-center gap-1">
            <span>Zero Doubts Left Behind Protocol</span>
          </div>
        </div>

        {/* Faculty Review & Bounty Card */}
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Award className="w-4 h-4 text-indigo-500" />
            <h4>🎁 +15 Rescue Bounty Points</h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Rescuing questions from this feed awards <strong>+15 Bonus Reputation</strong> and advances you toward the top of the University Leaderboard. Difficult questions are also directly reviewed and certified by Course Faculty.
          </p>
          <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 pt-1 flex items-center gap-1">
            <span>Double Karma + Verified Faculty Badges</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setUrgencyFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              urgencyFilter === 'all'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Doubts Awaiting Rescue ({unansweredDoubts.length})
          </button>
          <button
            onClick={() => setUrgencyFilter('fast_clarification')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              urgencyFilter === 'fast_clarification'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Fast Clarification Needed</span>
          </button>
          <button
            onClick={() => setUrgencyFilter('critical')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              urgencyFilter === 'critical'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Critical Waiting (&gt; 18h)</span>
          </button>
          <button
            onClick={() => setUrgencyFilter('escalated')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              urgencyFilter === 'escalated'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Escalated to Faculty</span>
          </button>
        </div>

        {/* Course Filter Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value="all">All Course Topics</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rescue Cards List */}
      <div className="space-y-4">
        {unansweredDoubts.length > 0 ? (
          unansweredDoubts.map((doubt) => (
            <div key={doubt.id} className="relative">
              {/* Contributor bounty ribbon */}
              <div className="mb-2 flex items-center justify-between text-xs px-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    <span>
                      Rescue Bounty: <strong>+15 Bonus Reputation</strong>
                    </span>
                  </span>
                  {(doubt.rescue_priority === 'critical' || doubt.rescue_priority === 'urgent') && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Fast Clarification</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {doubt.escalated_at && (
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                      Escalated to Faculty
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveModalQuestion(doubt)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-2xs transition-all active:scale-95"
                  >
                    <span>Rescue Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <DoubtCard
                question={doubt}
                onOpenComments={(q) => setActiveModalQuestion(q)}
                onVote={(qId, dir) => {
                  setQuestions((prev) =>
                    prev.map((item) =>
                      item.id === qId ? { ...item, score: item.score + dir } : item
                    )
                  );
                }}
              />
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-3xl border border-dashed border-emerald-500/40 bg-emerald-500/5 space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              All academic doubts have been rescued!
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no unanswered doubts awaiting rescue. Outstanding peer collaboration!
            </p>
          </div>
        )}
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
