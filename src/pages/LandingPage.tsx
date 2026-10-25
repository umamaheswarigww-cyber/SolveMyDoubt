import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  LifeBuoy,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  Users,
  Search,
  Zap,
  Award,
  Layers,
  ArrowBigUp,
  MessageSquare,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MemberCheckmark, FacultyVerifiedBadge, GuestBadge } from '../components/common/BadgeSystem';

export const LandingPage: React.FC = () => {
  const { signInAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleGuestEntry = async () => {
    await signInAsGuest();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Gradients & Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Landing Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="text-indigo-400 font-extrabold text-sm">?↻</span>
            </div>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              DoubtsHub
            </span>
            <span className="text-[10px] ml-1.5 uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              DoubtsHub
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link to="/explore" className="hover:text-white transition-colors">
            Explore
          </Link>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#rescue-system" className="hover:text-white transition-colors flex items-center gap-1.5">
            <span>Rescue System</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          </a>
          <Link to="/library" className="hover:text-white transition-colors">
            Knowledge Library
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGuestEntry}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
          >
            <span>Guest Mode</span>
          </button>
          <Link
            to="/auth?mode=signin"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-600/25"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center max-w-5xl mx-auto px-4 sm:px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Next-Generation Peer-to-Peer Academic Clearing Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
          Every doubt deserves{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200 bg-clip-text text-transparent">
            an answer.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Help students get reliable, high-fidelity academic explanations from peers and verified faculty outside classroom hours. Built with an intelligent <strong className="text-slate-200 font-semibold">Unanswered Doubt Rescue System</strong> so questions never disappear into a void.
        </p>

        {/* Action CTAs */}
        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Start Learning</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/explore"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900/90 text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>Explore Doubts</span>
          </Link>
          <button
            onClick={handleGuestEntry}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 transition-all border border-transparent hover:border-slate-800"
          >
            <span>Continue as Guest</span>
          </button>
        </div>

        {/* Highlights Row */}
        <div className="mt-12 flex items-center justify-center gap-8 flex-wrap text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Multi-Tier Badge Verification</span>
          </div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-rose-400" />
            <span>12h Unanswered Rescue Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Supabase RLS & Role Isolation</span>
          </div>
        </div>
      </section>

      {/* Realistic Interactive Product Preview */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-4 sm:p-6 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 font-mono text-[11px] text-slate-500">
                https://doubtshub.vercel.app/doubts/cs-201
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                LIVE DEMO ENVIRONMENT
              </span>
            </div>
          </div>

          {/* Realistic Doubt Card inside preview */}
          <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/80 p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Data Structures & Algorithms (CS-201)
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950 text-purple-300 uppercase">
                  Advanced
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Faculty Verified</span>
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                How does Dijkstra algorithm fail with negative edge weights, and why does Johnson algorithm use reweighting?
              </h3>
              <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                I understand that Dijkstra uses a greedy approach where once node u is extracted from the priority queue, its distance is finalized. Can someone show a minimal concrete counterexample?
              </p>
            </div>

            {/* Answer with Faculty Verified Badge Preview */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-indigo-900 text-indigo-200 flex items-center justify-center font-bold text-xs">
                    M
                  </div>
                  <div>
                    <div className="flex items-center gap-1 font-bold text-slate-200">
                      <span>Maya Al-Mansoor</span>
                      <MemberCheckmark />
                    </div>
                    <span className="text-[10px] text-slate-500">Computer Engineering • 4th Year</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-400">
                  <ArrowBigUp className="w-4 h-4 fill-current" />
                  <span>41 upvotes</span>
                </div>
              </div>

              {/* Prominent Restrained Faculty Verification Badge */}
              <FacultyVerifiedBadge
                verifierName="Dr. Marcus Vance (Faculty Reviewer)"
                verifiedAt={new Date().toISOString()}
                feedback="Outstanding explanation. The telescoping sum demonstration is mathematically rigorous and provides clear intuition."
              />

              <div className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <span className="text-indigo-400"># Reweighted edge invariant:</span><br />
                ŵ(u, v) = w(u, v) + h(u) - h(v) ≥ 0
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            A High-Fidelity Learning Loop
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
            From unanswered doubt to permanent knowledge asset
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400">
            Traditional forum threads get buried. DoubtsHub employs structured peer explanations, faculty endorsements, and persistent topic indexing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-white">Ask with Math & Code</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use KaTeX LaTeX formulas and syntax-highlighted code fences. Our Doubt Quality Assistant provides a real-time clarity score before publishing.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-white">Collaborative Peer Rescue</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Doubts route to students with matching course enrollments. If unanswered after 12 hours, doubts escalate to the prioritized rescue queue.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-white">Faculty Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authorized professors certify correct explanations, attach official corrections, and convert answers into the permanent Knowledge Library.
            </p>
          </div>
        </div>
      </section>

      {/* Unanswered Doubt Rescue System Section */}
      <section id="rescue-system" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-900">
        <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/30 via-slate-900/70 to-slate-950 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold">
                <LifeBuoy className="w-4 h-4 animate-spin-slow" />
                <span>The Defining Signature Feature</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Unanswered Doubt Rescue System
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Most academic forums suffer from the "abandoned question" syndrome where difficult conceptual questions rot with 0 answers. DoubtsHub solves this with deterministic time thresholds:
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span><strong>6 Hours:</strong> Surfaced to high-reputation peer contributors in followed courses.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span><strong>12 Hours:</strong> Automated escalation to authorized faculty review queue.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span><strong>Resolution:</strong> +15 bonus reputation awarded to the savior contributor.</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  to="/rescue"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all"
                >
                  <span>Explore the Rescue Queue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>RESCUE TELEMETRY (LIVE DATA)</span>
                <span className="text-emerald-400">91.2% Success Rate</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-2xl font-black text-rose-500">8</div>
                  <div className="text-[11px] text-slate-400 font-medium">Currently Rescuing</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-2xl font-black text-indigo-400">3.4h</div>
                  <div className="text-[11px] text-slate-400 font-medium">Avg Time to Rescue</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-snug">
                "Zero doubts abandoned. Every student gets an academically sound answer before their next class."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tri-Party Roles Participation */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-white">Three Clear Participation Roles</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Rigorous security prevents self-promotion. Guests, Students, and Faculty have distinct roles and badges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Guest */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <GuestBadge />
              <span className="text-[10px] text-slate-500 font-mono">Anonymous</span>
            </div>
            <h3 className="font-bold text-base text-white">Guest Learner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse questions, search the knowledge library, and ask questions with guest attribution. Voting and bookmarking require registered verification.
            </p>
          </div>

          {/* Student */}
          <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/20 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 font-bold text-slate-200 text-xs">
                <span>Member</span>
                <MemberCheckmark />
              </div>
              <span className="text-[10px] text-indigo-400 font-mono">Registered</span>
            </div>
            <h3 className="font-bold text-base text-white">University Student</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Earn reputation, vote on answers, accept solutions to your doubts, bookmark resources, and build an academic contribution record.
            </p>
          </div>

          {/* Faculty */}
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 font-bold text-emerald-400 text-xs">
                <span>Faculty</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Approved</span>
            </div>
            <h3 className="font-bold text-base text-white">Verified Faculty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect the review queue, certify peer answers with official endorsements, provide corrections, and resolve escalated doubts.
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-900/30 to-slate-900/80 p-10 sm:p-14 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Ready to experience collaborative academic clarity?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Join the community of peers and instructors dedicated to making sure no academic question goes unanswered.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
            <Link
              to="/auth?mode=signup"
              className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-lg"
            >
              Create Account
            </Link>
            <button
              onClick={handleGuestEntry}
              className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 text-slate-200 hover:text-white transition-all"
            >
              Explore as Guest
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} DoubtsHub. All academic rights reserved.</p>
      </footer>
    </div>
  );
};
