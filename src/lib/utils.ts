import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import katex from 'katex';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateString: string | null | undefined): string {
  if (!dateString) return 'recently';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'recently';
  }
}

export function formatExactDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString || '';
  }
}

/**
 * Parses markdown-like text with inline math $...$ and block math $$...$$
 * and renders KaTeX safely.
 */
export function renderFormattedContent(text: string): string {
  if (!text) return '';

  // First handle block math $$...$$
  let processed = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return `<div class="my-3 overflow-x-auto py-2 text-center">${katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
      })}</div>`;
    } catch {
      return `<pre class="katex-error bg-red-50 p-2 rounded text-red-700">${math}</pre>`;
    }
  });

  // Next handle inline math $...$
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return `<code>${math}</code>`;
    }
  });

  // Convert basic markdown formatting: code blocks ```lang ... ```
  processed = processed.replace(/```([a-zA-Z0-9]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<div class="my-4 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900 shadow-md">
      <div class="flex items-center justify-between px-4 py-1.5 bg-slate-800/80 border-b border-slate-700/50 text-xs font-mono text-slate-400">
        <span>${lang || 'code'}</span>
        <span class="text-[10px] uppercase tracking-wider text-slate-400">Syntax</span>
      </div>
      <pre class="p-4 text-xs md:text-sm font-mono text-slate-100 overflow-x-auto leading-relaxed"><code>${escapedCode}</code></pre>
    </div>`;
  });

  // Markdown images ![alt](url) with interactive Annotation and Download controls
  processed = processed.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    `<div class="doubts-image-container relative group my-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/40 inline-block max-w-full shadow-sm">
      <img src="$2" alt="$1" class="doubts-interactive-image max-h-96 w-auto max-w-full rounded-2xl object-contain mx-auto cursor-pointer transition-transform hover:scale-[1.01]" loading="lazy" data-image-url="$2" data-image-alt="$1" />
      <div class="image-actions-overlay absolute top-2 right-2 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-slate-900/85 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/20 shadow-lg z-10 pointer-events-auto">
        <button type="button" class="btn-annotate-img px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer" data-action="annotate" data-src="$2" data-alt="$1" title="Annotate, draw, or inspect this image">
          ✏️ Annotate
        </button>
        <button type="button" class="btn-download-img px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-[11px] font-bold flex items-center gap-1 border border-slate-600 shadow-xs transition-transform active:scale-95 cursor-pointer" data-action="download" data-src="$2" data-alt="$1" title="Download this photo">
          ⬇️ Download
        </button>
      </div>
    </div>`
  );

  // Inline code `...`
  processed = processed.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-semibold">$1</code>');

  return processed;
}

export function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}


/**
 * Universal Image Downloader for DoubtsHub
 * Supports Base64 data URLs, object URLs, and cross-origin images
 */
export async function downloadImage(url: string, filename: string = 'doubts-photo.png'): Promise<void> {
  if (!url) return;
  try {
    if (url.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
  } catch {
    // Fallback for CORS restricted images
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
