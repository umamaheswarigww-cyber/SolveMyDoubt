import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  BookOpen,
  LifeBuoy,
  Flame,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { INITIAL_COURSES, INITIAL_TAGS, INITIAL_LEADERBOARD, INITIAL_RESCUE_METRICS } from '../../lib/mockData';
import { MemberCheckmark, FacultyBadge } from './BadgeSystem';
import { cn } from '../../lib/utils';

interface RightSidebarProps {
  selectedCourseId?: string;
  onSelectCourse?: (courseId: string) => void;
  selectedTagSlug?: string;
  onSelectTag?: (slug: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedCourseId,
  onSelectCourse,
  selectedTagSlug,
  onSelectTag,
}) => {
  return (
    <aside className="w-80 shrink-0 hidden xl:block space-y-6 sticky top-20 self-start text-xs select-none">
      {/* Rescue Status Widget */}
      <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-transparent p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500 text-white shadow-xs">
              <LifeBuoy className="w-4 h-4 animate-spin-slow" />
            </span>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Rescue Network</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Zero Doubts Left Behind</p>
            </div>
          </div>
          <Link
            to="/rescue"
            className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5"
          >
            <span>Feed</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-lg font-black text-rose-600 dark:text-rose-400">
              {INITIAL_RESCUE_METRICS.totalUnanswered}
            </div>
            <div className="text-[10px] font-semibold text-slate-500">Unanswered</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60">
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {INITIAL_RESCUE_METRICS.rescueSuccessRatePercent}%
            </div>
            <div className="text-[10px] font-semibold text-slate-500">Resolved Rate</div>
          </div>
        </div>
      </div>

      {/* Courses Filter List */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>Academic Courses</span>
          </div>
          <Link to="/explore" className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            All
          </Link>
        </div>

        <div className="space-y-1">
          {INITIAL_COURSES.slice(0, 5).map((course) => {
            const isSelected = selectedCourseId === course.id;
            return (
              <button
                key={course.id}
                onClick={() => onSelectCourse && onSelectCourse(course.id)}
                className={cn(
                  'w-full flex items-center justify-between p-2 rounded-xl transition-all text-left font-medium',
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: course.color }}
                  />
                  <span className="truncate">{course.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                  {course.course_code}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Topics (Tags) */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 p-4 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Trending Concepts</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {INITIAL_TAGS.map((tag) => {
            const isSelected = selectedTagSlug === tag.slug;
            return (
              <button
                key={tag.id}
                onClick={() => onSelectTag && onSelectTag(tag.slug)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all',
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                )}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Academic Scholars Leaderboard Preview */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
            <Award className="w-4 h-4 text-indigo-500" />
            <span>Top Contributors</span>
          </div>
          <Link to="/leaderboard" className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            View All
          </Link>
        </div>

        <div className="space-y-2.5">
          {INITIAL_LEADERBOARD.slice(0, 4).map((scholar, idx) => (
            <div key={scholar.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-4 text-center font-bold text-slate-400 text-[11px]">
                  #{idx + 1}
                </span>
                {scholar.avatar_url ? (
                  <img
                    src={scholar.avatar_url}
                    alt={scholar.display_name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                    {scholar.display_name[0]}
                  </div>
                )}
                <div className="truncate">
                  <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100 truncate">
                    <span className="truncate">{scholar.display_name}</span>
                    <MemberCheckmark />
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{scholar.badge}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {scholar.reputation}
                </span>
                <span className="text-[10px] text-slate-400 ml-0.5">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
