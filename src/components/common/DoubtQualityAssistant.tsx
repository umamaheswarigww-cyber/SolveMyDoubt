import React, { useMemo } from 'react';
import { CheckCircle2, Circle, Sparkles, Code2, Calculator, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DoubtQualityAssistantProps {
  title: string;
  body: string;
  selectedTagIds?: string[];
  onInsertMath?: () => void;
  onInsertCode?: () => void;
}

export const DoubtQualityAssistant: React.FC<DoubtQualityAssistantProps> = ({
  title,
  body,
  selectedTagIds = [],
  onInsertMath,
  onInsertCode,
}) => {
  const analysis = useMemo(() => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    const checks = [
      {
        id: 'title_length',
        label: 'Descriptive title (15+ chars)',
        passed: trimmedTitle.length >= 15,
      },
      {
        id: 'title_question',
        label: 'Formulated as a question (?)',
        passed:
          trimmedTitle.includes('?') ||
          /^(how|why|what|when|where|which|can|does|is|explain|derive)/i.test(trimmedTitle),
      },
      {
        id: 'body_depth',
        label: 'Context & details provided (30+ chars)',
        passed: trimmedBody.length >= 30,
      },
      {
        id: 'tags_selected',
        label: 'Topic tag selected',
        passed: selectedTagIds.length >= 1,
      },
      {
        id: 'code_or_math',
        label: 'Math formula ($) or code block (```)',
        passed:
          trimmedBody.includes('$') ||
          trimmedBody.includes('```') ||
          trimmedBody.includes('`'),
      },
    ];

    const passedCount = checks.filter((c) => c.passed).length;
    const score = Math.round((passedCount / checks.length) * 100);

    let statusText = 'Needs Details';
    let statusColor = 'text-rose-500';
    let barColor = 'bg-rose-500';

    if (score >= 80) {
      statusText = 'Ready to Publish';
      statusColor = 'text-emerald-400';
      barColor = 'bg-emerald-500';
    } else if (score >= 40) {
      statusText = 'Good Progress';
      statusColor = 'text-amber-400';
      barColor = 'bg-amber-500';
    }

    return { checks, score, passedCount, statusText, statusColor, barColor };
  }, [title, body, selectedTagIds]);

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 space-y-4 shadow-sm text-xs min-w-0 w-full transition-all">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
              Doubt Quality Meter
            </h4>
            <span className={cn('text-[11px] font-bold', analysis.statusColor)}>
              {analysis.statusText}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className={cn('text-xl font-black font-mono', analysis.statusColor)}>
            {analysis.score}%
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {analysis.passedCount}/{analysis.checks.length} checks
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', analysis.barColor)}
          style={{ width: `${Math.max(analysis.score, 6)}%` }}
        />
      </div>

      {/* Neat Clean Checklist */}
      <div className="space-y-2 pt-1">
        {analysis.checks.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-2.5 py-1.5 px-2 rounded-xl transition-colors text-xs font-medium',
              item.passed
                ? 'bg-emerald-500/5 text-slate-800 dark:text-slate-200'
                : 'text-slate-400 dark:text-slate-500'
            )}
          >
            {item.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
            )}
            <span className={item.passed ? 'font-semibold text-slate-900 dark:text-slate-100' : ''}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Insert Shortcuts */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onInsertMath}
          className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
        >
          <Calculator className="w-3.5 h-3.5 text-indigo-500" />
          <span>Insert Math ($)</span>
        </button>
        <button
          type="button"
          onClick={onInsertCode}
          className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
        >
          <Code2 className="w-3.5 h-3.5 text-indigo-500" />
          <span>Insert Code (```)</span>
        </button>
      </div>
    </div>
  );
};
