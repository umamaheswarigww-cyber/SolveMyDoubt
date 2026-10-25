import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Tag as TagIcon,
  Code2,
  Calculator,
  Upload,
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  ArrowRight,
  X,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_TAGS, INITIAL_QUESTIONS } from '../lib/mockData';
import { DoubtQualityAssistant } from '../components/common/DoubtQualityAssistant';
import { QuestionDifficulty, Tag } from '../types';
import { renderFormattedContent } from '../lib/utils';
import { createQuestion, getTags } from '../lib/api';

const DRAFT_STORAGE_KEY = 'solvemydoubt_draft';

export const AskQuestionPage: React.FC = () => {
  const { user, profile, isGuest } = useAuth();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(['tag-loss']);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('Intermediate');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const [tags, setTags] = useState<Tag[]>(INITIAL_TAGS);

  // Load tags from database
  useEffect(() => {
    async function loadMetadata() {
      try {
        const tList = await getTags();
        if (tList.length > 0) setTags(tList);
      } catch (err) {
        console.error('Failed to load tags:', err);
      }
    }
    loadMetadata();
  }, []);

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.body) setBody(parsed.body);
        if (Array.isArray(parsed.selectedTagIds) && parsed.selectedTagIds.length > 0) {
          setSelectedTagIds(parsed.selectedTagIds);
        }
        if (parsed.difficulty) setDifficulty(parsed.difficulty);
      }
    } catch {}
  }, []);

  // Save draft on edit
  useEffect(() => {
    if (title || body) {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ title, body, selectedTagIds, difficulty })
      );
    }
  }, [title, body, selectedTagIds, difficulty]);

  // Insert helpers for math and code
  const handleInsertMath = () => {
    setActiveTab('write');
    const snippet = ' $f(x) = x^2$ ';
    setBody((prev) => {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const next = prev.substring(0, start) + snippet + prev.substring(end);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + snippet.length, start + snippet.length);
        }, 50);
        return next;
      }
      return prev ? `${prev}${snippet}` : snippet;
    });
  };

  const handleInsertCode = () => {
    setActiveTab('write');
    const snippet = '\n```python\n# Code or error trace here\n```\n';
    setBody((prev) => {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const next = prev.substring(0, start) + snippet + prev.substring(end);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + snippet.length, start + snippet.length);
        }, 50);
        return next;
      }
      return prev ? `${prev}${snippet}` : snippet;
    });
  };

  // Duplicate / Similar questions detection
  const similarQuestions = useMemo(() => {
    if (!title || title.trim().length < 8) return [];
    const keywords = title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    return INITIAL_QUESTIONS.filter((q) => {
      const qText = `${q.title} ${q.body}`.toLowerCase();
      return keywords.some((w) => qText.includes(w));
    }).slice(0, 2);
  }, [title]);

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle || trimmedTitle.length < 15) {
      setErrorMessage('Please provide a descriptive doubt title (at least 15 characters).');
      return;
    }

    if (!trimmedBody || trimmedBody.length < 30) {
      setErrorMessage('Please describe the context and what you tried (at least 30 characters).');
      return;
    }

    if (selectedTagIds.length === 0) {
      setErrorMessage('Please select at least one topic tag so peers can discover your question.');
      return;
    }

    setIsSubmitting(true);

    try {
      const authorId = user?.id || (isGuest ? 'guest-author' : 'member-author');

      const { data, error } = await createQuestion({
        title: trimmedTitle,
        body: trimmedBody,
        difficulty,
        tagIds: selectedTagIds,
        attachmentUrl: attachmentName ? 'https://example.com/attachment.pdf' : null,
        authorId,
        authorProfile: profile,
      });

      if (error) {
        throw error;
      }

      // Clear draft
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // Navigate to created question
      if (data?.id) {
        navigate(`/doubt/${data.id}`);
      } else {
        navigate('/explore');
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit doubt. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-full min-w-0 py-6 px-1 sm:px-2 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Ask a Doubt
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Get verified explanations from peers and professors. If unresolved after 12h, your question automatically enters the Rescue Queue.
        </p>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start min-w-0">
        {/* Center Primary Form (8 cols on XL, full width on medium/mobile) */}
        <form onSubmit={handleSubmit} noValidate className="xl:col-span-8 space-y-6 min-w-0 w-full">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* 1. Question Title Field */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-2xs space-y-2 min-w-0">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Doubt Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {title.length} characters
              </span>
            </div>

            {/* Short clear placeholder that never clips */}
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. Why does cross-entropy penalize confident wrong predictions?"
              className="w-full px-4 py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 min-w-0 box-border"
            />

            {/* Concise helper text underneath explaining what to enter */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Frame your title as a clear question. Identify the exact algorithm, theorem, or conceptual difficulty.
            </p>
          </div>

          {/* Similar Questions Detection Alert */}
          {similarQuestions.length > 0 && (
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 space-y-2 text-xs min-w-0">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
                <Sparkles className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>Existing Similar Discussions Found</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                These answered questions might already have the explanation you need:
              </p>
              <div className="space-y-1.5 pt-1">
                {similarQuestions.map((q) => (
                  <Link
                    key={q.id}
                    to={`/doubt/${q.id}`}
                    target="_blank"
                    className="block p-2 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-400 transition-colors font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 truncate text-[11px]"
                  >
                    • {q.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 2. Description & Rich Body Field */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-2xs space-y-3 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Detailed Context & Attempted Solution <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500">
                  Explain what you tried, compiler errors, or where your reasoning breaks down.
                </p>
              </div>

              {/* Write vs Preview Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'write'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Quick formatting toolbar */}
            <div className="flex items-center gap-2 pt-1 border-b border-slate-100 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={handleInsertMath}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold transition-colors"
                title="Insert LaTeX Math Formula"
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                <span>Math ($)</span>
              </button>
              <button
                type="button"
                onClick={handleInsertCode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold transition-colors"
                title="Insert Code Snippet"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Code (```)</span>
              </button>
            </div>

            {activeTab === 'write' ? (
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                rows={11}
                placeholder="Include your background context, formula derivations, code examples, or where your understanding breaks down.

For math formulas: $E = mc^2$ or $$\int f(x)dx$$
For code blocks: ```python or ```cpp"
                className="w-full p-4 rounded-xl text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 leading-relaxed placeholder:text-slate-400 placeholder:font-sans min-h-[220px] box-border"
              />
            ) : (
              <div
                className="w-full p-4 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 min-h-[220px] leading-relaxed text-slate-900 dark:text-slate-100 prose dark:prose-invert max-w-none overflow-x-auto"
                dangerouslySetInnerHTML={{
                  __html: renderFormattedContent(body || '*No content provided for preview yet.*'),
                }}
              />
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 flex-wrap gap-2">
              <span className="flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                <span>KaTeX Math supported: <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">$x^2$</code></span>
              </span>
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Code blocks supported: <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">```python</code></span>
              </span>
            </div>
          </div>

          {/* 3. Topic Tags & Difficulty Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
            {/* Topic Tags Selector */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-2xs space-y-2.5 min-w-0">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Topic Tags <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  {selectedTagIds.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400">
                Helps peers and faculty specialists quickly discover your question.
              </p>
            </div>

            {/* Coursework Difficulty */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-2xs space-y-2.5 min-w-0">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Question Difficulty
              </label>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['Introductory', 'Intermediate', 'Advanced'] as QuestionDifficulty[]).map((diff) => (
                  <button
                    type="button"
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center transition-all truncate ${
                      difficulty === diff
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400">
                Guides the depth of formulas and explanations provided in answers.
              </p>
            </div>
          </div>

          {/* 4. File Attachment */}
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4 text-xs text-slate-500 flex items-center justify-between min-w-0 gap-3">
            <div className="flex items-center gap-2 truncate">
              <Upload className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">
                {attachmentName ? (
                  <strong className="text-slate-800 dark:text-slate-200">{attachmentName}</strong>
                ) : (
                  'Optional attachment (PDF, diagram PNG/JPEG up to 5MB)'
                )}
              </span>
            </div>
            <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors shrink-0">
              <span>{attachmentName ? 'Change' : 'Browse'}</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setAttachmentName(file.name);
                }}
              />
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to="/explore"
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Publishing Doubt...' : 'Publish to Academic Network'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Right Assistant Column (4 cols on XL, stacks below form on < XL) */}
        <aside className="xl:col-span-4 space-y-6 min-w-0 w-full">
          <DoubtQualityAssistant
            title={title}
            body={body}
            selectedTagIds={selectedTagIds}
            onInsertMath={handleInsertMath}
            onInsertCode={handleInsertCode}
          />

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-5 space-y-3 text-xs shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>DoubtsHub Escalation Protocol</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              If your question receives no verified peer answers within 12 hours, DoubtsHub automatically escalates it to teaching assistants and faculty reviewers.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
