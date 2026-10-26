import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  X,
  PenTool,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { INITIAL_TAGS } from '../lib/mockData';
import { QuestionDifficulty, Tag } from '../types';
import { downloadImage } from '../lib/utils';
import { createQuestion, getTags } from '../lib/api';
import { ImageAnnotatorModal } from '../components/common/ImageAnnotatorModal';

const DRAFT_STORAGE_KEY = 'solvemydoubt_draft';

export const AskQuestionPage: React.FC = () => {
  const { user, profile, isGuest } = useAuth();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  // Handled under the hood for clean database integrity without burdening users
  const [difficulty] = useState<QuestionDifficulty>('Intermediate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Attachment state (photos/diagrams with instant preview, annotation, and download)
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isAnnotatorOpen, setIsAnnotatorOpen] = useState(false);

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
      }
    } catch {}
  }, []);

  // Save draft on edit
  useEffect(() => {
    if (title || body) {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({ title, body })
      );
    }
  }, [title, body]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachmentName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachedImage(null);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentName(null);
    setAttachedImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    // Frictionless submission: require title and body
    if (!trimmedTitle) {
      setErrorMessage('Please enter your doubt title.');
      return;
    }

    if (!trimmedBody) {
      setErrorMessage('Please explain your doubt.');
      return;
    }

    setIsSubmitting(true);

    try {
      const authorId = user?.id || (isGuest ? 'guest-author' : 'member-author');

      let finalBody = trimmedBody;
      if (attachedImage) {
        finalBody = `${finalBody}\n\n![${attachmentName || 'Doubt Attachment'}](${attachedImage})`;
      }

      // Automatically assign primary academic tag under the hood so database relation is intact
      const defaultTagId = tags.length > 0 ? tags[0].id : 'tag-loss';

      const { data, error } = await createQuestion({
        title: trimmedTitle,
        body: finalBody,
        difficulty,
        tagIds: [defaultTagId],
        attachmentUrl: attachedImage || (attachmentName ? 'https://example.com/attachment.pdf' : null),
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
    <div className="w-full max-w-4xl mx-auto space-y-6 min-w-0 pb-16">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Ask a Doubt
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Get verified explanations from peers and certified faculty professors.
        </p>
      </div>

      {/* Clean, Free-Form Doubt Submission Box */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6 min-w-0 w-full">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* 1. Doubt Title Field */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm space-y-2.5 min-w-0">
          <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Doubt Title <span className="text-rose-500">*</span>
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="e.g. Why does cross-entropy penalize confident wrong predictions?"
            className="w-full px-4 py-3.5 rounded-xl text-sm sm:text-base bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 min-w-0 box-border"
          />

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
            Write a clear question or topic summarizing what you are trying to solve.
          </p>
        </div>

        {/* 2. Explain your doubt (Clean Free Box - No Math/Code clutter, No preview toggle) */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm space-y-3 min-w-0">
          <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Explain your doubt <span className="text-rose-500">*</span>
          </label>

          <textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            rows={10}
            placeholder="Explain your doubt here freely. Write any details, questions, formulas, or code you want to ask..."
            className="w-full p-4 rounded-xl text-sm sm:text-base font-sans bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 leading-relaxed placeholder:text-slate-400 min-h-[220px] box-border"
          />
        </div>

        {/* 3. Photo / Diagram / File Attachment with Annotate & Download */}
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-5 text-sm text-slate-500 space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 truncate">
              <Upload className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="truncate text-sm font-medium">
                {attachmentName ? (
                  <strong className="text-slate-900 dark:text-slate-100 font-bold">{attachmentName}</strong>
                ) : (
                  'Optional: Attach photo, handwritten notes, or diagram (PNG, JPEG, PDF)'
                )}
              </span>
            </div>

            <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 transition-colors shrink-0 shadow-xs">
              <span>{attachmentName ? 'Change Photo' : 'Browse File'}</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {/* Image Preview with Annotate and Download controls */}
          {attachedImage && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <img
                  src={attachedImage}
                  alt="Doubt attachment preview"
                  className="h-20 w-24 object-cover rounded-xl border border-slate-700"
                />
                <div className="space-y-1.5">
                  <span className="font-bold text-xs sm:text-sm text-slate-200 block truncate max-w-[220px]">
                    {attachmentName}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAnnotatorOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Annotate Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadImage(attachedImage, attachmentName || 'doubt-photo.png')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 shadow-sm transition-transform active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons (Medium/Large Sizing) */}
        <div className="flex items-center justify-between pt-3 gap-4">
          <Link
            to="/explore"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Publishing Doubt...' : 'Publish Doubt'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* DoubtsHub Escalation Guarantee */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-4 sm:p-5 space-y-1.5 text-xs sm:text-sm shadow-xs">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>DoubtsHub Escalation Guarantee</span>
          </h4>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
            If your question receives no verified peer answers within 12 hours, DoubtsHub automatically escalates it to teaching assistants and faculty reviewers.
          </p>
        </div>
      </form>

      {/* Image Annotator Modal */}
      {isAnnotatorOpen && attachedImage && (
        <ImageAnnotatorModal
          isOpen={isAnnotatorOpen}
          imageUrl={attachedImage}
          imageAlt={attachmentName || 'Attachment'}
          onClose={() => setIsAnnotatorOpen(false)}
          onSaveAnnotated={(annotatedDataUrl) => {
            setAttachedImage(annotatedDataUrl);
          }}
        />
      )}
    </div>
  );
};
