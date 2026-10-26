import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenCheck,
  Search,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Filter,
  Eye,
  ArrowBigUp,
  GraduationCap,
} from 'lucide-react';
import { INITIAL_QUESTIONS, INITIAL_COURSES, INITIAL_TAGS } from '../lib/mockData';
import { getQuestions, getCourses } from '../lib/api';
import { FacultyVerifiedBadge, AcceptedAnswerBadge } from '../components/common/BadgeSystem';
import { formatTimeAgo, renderFormattedContent } from '../lib/utils';
import { Question, Course } from '../types';

export const KnowledgeLibraryPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'faculty_verified' | 'peer_accepted'>('all');

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [qData, cData] = await Promise.all([getQuestions(), getCourses()]);
        if (mounted) {
          if (qData && qData.length > 0) setQuestions(qData);
          if (cData && cData.length > 0) setCourses(cData);
        }
      } catch (err) {
        console.error('Failed to load knowledge library data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter resolved library items
  const libraryDoubts = useMemo(() => {
    return questions.filter((q) => {
      // Must be resolved or have an accepted answer / faculty verification
      const isResolved =
        q.status === 'resolved' ||
        Boolean(q.accepted_answer_id) ||
        q.id === 'q-faculty-verified' ||
        q.id === 'q-accepted-peer';

      if (!isResolved) return false;

      const hasFacultyVerified =
        q.answers?.some((a) => a.verified_by) || q.id === 'q-faculty-verified';

      if (filterType === 'faculty_verified' && !hasFacultyVerified) return false;
      if (filterType === 'peer_accepted' && hasFacultyVerified) return false;

      if (selectedCourse !== 'all' && q.course_id !== selectedCourse) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesBody = q.body.toLowerCase().includes(query);
        const matchesCourse = q.course?.name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesBody && !matchesCourse) return false;
      }

      return true;
    });
  }, [questions, searchQuery, selectedCourse, filterType]);

  return (
    <div className="w-full space-y-6 sm:space-y-8 min-w-0">
      {/* Hero Header */}
      <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-950/20 via-slate-900/60 to-slate-950 p-6 sm:p-10 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <BookOpenCheck className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Curated Academic Repository
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Campus Knowledge Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Search the index of peer-accepted and faculty-verified explanations. Every cleared doubt is permanently organized by coursework topic for future students.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified solutions, derivations, proofs, and course concepts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 text-xs">
          {/* Verification Filter Pill */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Resolved
            </button>
            <button
              onClick={() => setFilterType('faculty_verified')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'faculty_verified'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-emerald-600'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Faculty Verified Only</span>
            </button>
            <button
              onClick={() => setFilterType('peer_accepted')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'peer_accepted'
                  ? 'bg-green-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-green-600'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Peer Accepted</span>
            </button>
          </div>

          {/* Course filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value="all">All Academic Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.course_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Library Assets Cards */}
      <div className="space-y-6">
        {libraryDoubts.map((doubt) => {
          const isVerified = doubt.id === 'q-faculty-verified';
          return (
            <div
              key={doubt.id}
              className={`rounded-3xl border transition-all p-6 sm:p-7 space-y-4 bg-white/95 dark:bg-slate-900/95 ${
                isVerified
                  ? 'border-emerald-500/40 shadow-emerald-500/5 shadow-md'
                  : 'border-slate-200/80 dark:border-slate-800/80 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {doubt.course?.name} ({doubt.course?.course_code})
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {doubt.difficulty}
                  </span>
                </div>

                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Faculty Verified Solution</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    <span>Author Accepted Solution</span>
                  </span>
                )}
              </div>

              <div>
                <Link to={`/doubt/${doubt.id}`} className="group">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                    {doubt.title}
                  </h3>
                </Link>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  {doubt.body.replace(/[#$*`]/g, '')}
                </p>
              </div>

              {/* Verified Badge preview for verified solutions */}
              {isVerified && (
                <FacultyVerifiedBadge
                  verifierName="Dr. Marcus Vance (Associate Professor)"
                  verifiedAt={doubt.resolved_at}
                  feedback="Recommended reading for exam preparation: The telescoping sum demonstrates Johnson's reweighting invariant with full mathematical correctness."
                />
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    <ArrowBigUp className="w-4 h-4 text-indigo-500" />
                    <span>{doubt.score} upvotes</span>
                  </span>
                  <span>{doubt.view_count} reads</span>
                </div>

                <Link
                  to={`/doubt/${doubt.id}`}
                  className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <span>Read Complete Proof & Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
