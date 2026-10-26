import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  BookOpen,
  Tag as TagIcon,
  X,
  PlusCircle,
  HelpCircle,
  LifeBuoy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DoubtCard } from '../components/common/DoubtCard';
import { QuestionCommentsModal } from '../components/common/QuestionCommentsModal';
import { INITIAL_QUESTIONS, INITIAL_COURSES, INITIAL_TAGS } from '../lib/mockData';
import { getQuestions, getCourses, getTags, subscribeToQuestions } from '../lib/api';
import { Question, Course, Tag, QuestionDifficulty, QuestionStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const { isFaculty, profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [tags, setTags] = useState<Tag[]>(INITIAL_TAGS);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalQuestion, setActiveModalQuestion] = useState<Question | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<QuestionStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'most_voted' | 'most_answered' | 'unanswered'>('newest');

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [qData, cData, tData] = await Promise.all([
          getQuestions(),
          getCourses(),
          getTags(),
        ]);
        if (mounted) {
          if (qData && qData.length > 0) setQuestions(qData);
          if (cData && cData.length > 0) setCourses(cData);
          if (tData && tData.length > 0) setTags(tData);
        }
      } catch (err) {
        console.error('Failed to load explore data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadData();

    const unsubscribe = subscribeToQuestions((newQuestion) => {
      if (mounted) {
        setQuestions((prev) => {
          if (prev.some((q) => q.id === newQuestion.id)) return prev;
          return [newQuestion, ...prev];
        });
      }
    });

    const handleDeletedEvent = (e: any) => {
      const qId = e.detail?.questionId;
      if (qId && mounted) {
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
        if (activeModalQuestion?.id === qId) {
          setActiveModalQuestion(null);
        }
      }
    };
    window.addEventListener('doubt_deleted', handleDeletedEvent);

    return () => {
      mounted = false;
      unsubscribe();
      window.removeEventListener('doubt_deleted', handleDeletedEvent);
    };
  }, []);

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Search query filter (matches title, body, course code)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesBody = q.body.toLowerCase().includes(query);
        const matchesCourse = q.course?.name.toLowerCase().includes(query) || q.course?.course_code.toLowerCase().includes(query);
        const matchesTags = q.tags?.some((t) => t.name.toLowerCase().includes(query));
        if (!matchesTitle && !matchesBody && !matchesCourse && !matchesTags) {
          return false;
        }
      }

      // Course filter
      if (selectedCourse !== 'all' && q.course_id !== selectedCourse) {
        return false;
      }

      // Tag filter
      if (selectedTag !== 'all' && !q.tags?.some((t) => t.slug === selectedTag)) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && q.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'most_voted') {
        return b.score - a.score;
      }
      if (sortBy === 'most_answered') {
        return (b.answers_count || 0) - (a.answers_count || 0);
      }
      if (sortBy === 'unanswered') {
        return (a.answers_count || 0) - (b.answers_count || 0);
      }
      // default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [questions, searchQuery, selectedCourse, selectedTag, selectedDifficulty, selectedStatus, sortBy]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCourse !== 'all' ||
    selectedTag !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedStatus !== 'all';


  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (activeModalQuestion?.id === id) {
      setActiveModalQuestion(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCourse('all');
    setSelectedTag('all');
    setSelectedDifficulty('all');
    setSelectedStatus('all');
    setSortBy('newest');
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 min-w-0">
      {/* Faculty Educator Workspace Banner */}
      {isFaculty && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/25">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Faculty Review & Verified Answering Mode
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Welcome, {profile?.display_name || 'Professor'}. You can answer student questions and officially verify accurate peer solutions with the verified badge.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/faculty"
              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
            >
              Open Faculty Triage Queue
            </Link>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Explore Academic Doubts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {filteredQuestions.length} Available
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Search peer discussions, faculty verified solutions, and active coursework challenges.
          </p>
        </div>

        <Link
          to="/ask"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ask New Doubt</span>
        </Link>
      </div>

      {/* Search & Filter Controls Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, formulas, algorithms (e.g. Dijkstra, Cross-Entropy, MVCC)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Course filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">All Academic Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.course_code})
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">All Difficulties</option>
              <option value="Introductory">Introductory</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">All Doubts</option>
              <option value="open">Open (Unanswered)</option>
              <option value="answered">Answered</option>
              <option value="resolved">Resolved (Accepted)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="most_voted">Highest Voted</option>
              <option value="most_answered">Most Answers</option>
              <option value="unanswered">Unanswered First (Rescue)</option>
            </select>
          </div>
        </div>

        {/* Tags Selector Pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400">Popular Tags:</span>
          {tags.map((tag) => {
            const isSelected = selectedTag === tag.slug;
            return (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(isSelected ? 'all' : tag.slug)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                #{tag.name}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Questions Results List */}
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
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
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-12 text-center space-y-3">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              No matching academic doubts found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or course filters, or be the first to post this question.
            </p>
            <div className="pt-2">
              <Link
                to="/ask"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Ask This Doubt</span>
              </Link>
            </div>
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
