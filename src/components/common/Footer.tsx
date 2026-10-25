import React from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, ShieldCheck, Heart, Github, BookOpenCheck, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md mt-20 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-sm">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <span className="text-indigo-400 font-extrabold text-xs">?↻</span>
                </div>
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                SolveMyDoubt
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
              Every doubt deserves an answer and Every Problem has a Solution. Peer collaboration paired with certified faculty verification.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Academic Integrity Protected</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Platform
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/explore" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Explore Doubts
                </Link>
              </li>
              <li>
                <Link to="/rescue" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center gap-1">
                  <span>Rescue Queue</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                </Link>
              </li>
              <li>
                <Link to="/library" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Knowledge Library
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Leaderboard & Streaks
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & Rescue */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Ecosystem
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/faculty" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Faculty Review Queue
                </Link>
              </li>
              <li>
                <Link to="/ask" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Ask a Doubt
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=guest" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Guest Mode Sandbox
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Admin Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Stack & Badge Notice */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Architecture
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Powered by React 18, TypeScript, Tailwind CSS, KaTeX math typesetting, and Supabase PostgreSQL with strict Row Level Security.
            </p>
            <div className="text-[10px] text-slate-400 pt-1">
              Engineered for hackathon excellence and campus-wide scale.
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between flex-wrap gap-4 text-[11px]">
          <div>
            © {new Date().getFullYear()} SolveMyDoubt (DoubtLoop). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for Academic Clarity</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
