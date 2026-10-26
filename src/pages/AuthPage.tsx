import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  Lock,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GuestBadge } from '../components/common/BadgeSystem';
import { RoleSelectionModal } from '../components/common/RoleSelectionModal';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [yearOfStudy, setYearOfStudy] = useState('1st Year');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    signInWithGoogle,
    signInWithGoogleCredential,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    isLiveSupabase,
    configStatus,
  } = useAuth();
  const navigate = useNavigate();

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '';

  useEffect(() => {
    // Initialize Google Identity Services if script is loaded
    function initGIS() {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              if (response?.credential) {
                setIsSubmitting(true);
                setErrorMessage(null);
                const { error } = await signInWithGoogleCredential(response.credential);
                setIsSubmitting(false);
                if (error) {
                  setErrorMessage(error.message);
                } else {
                  setShowRoleSelection(true);
                }
              }
            },
          });
          // Native button rendered via unified Continue with Google button below
        } catch (err) {
          console.warn('Google Identity initialization notice:', err);
        }
      }
    }

    initGIS();
    const timer = setTimeout(initGIS, 800);
    return () => clearTimeout(timer);
  }, [googleClientId, navigate, signInWithGoogleCredential]);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id && googleClientId) {
        let promptHandled = false;
        try {
          (window as any).google.accounts.id.prompt((notification: any) => {
            promptHandled = true;
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              signInWithGoogle().then(({ error }) => {
                if (error) setErrorMessage(error.message);
              });
            }
          });
        } catch {
          // fallback to Supabase
        }
        if (promptHandled) {
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google OAuth failed to initiate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const { error } = await signInAsGuest();
      if (error) {
        setErrorMessage(error.message);
      } else {
        setShowRoleSelection(true);
      }
    } catch (err: any) {
      setErrorMessage('Guest sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setErrorMessage('Please provide your name.');
          setIsSubmitting(false);
          return;
        }
        const { error } = await signUpWithEmail(email, password, displayName, department, yearOfStudy);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setShowRoleSelection(true);
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setShowRoleSelection(true);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-indigo-400 font-extrabold text-sm">?↻</span>
              </div>
            </div>
            <span className="font-extrabold text-xl text-white">DoubtsHub</span>
          </Link>
          <h1 className="text-xl font-black text-white pt-2">
            {mode === 'signup' ? 'Create University Account' : 'Sign in to DoubtsHub'}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'signup'
              ? 'Join peers and certified faculty to clear academic doubts.'
              : 'Sign in with your university account or Google OAuth.'}
          </p>
        </div>

        {/* Clear Setup State if Supabase credentials are missing */}
        {!isLiveSupabase && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Supabase Configuration Notice</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-snug">
              Live Google OAuth requires <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> in <code>.env</code>. See README for the 5-step Google Cloud + Supabase setup guide.
            </p>
          </div>
        )}

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
            {errorMessage.toLowerCase().includes('not enabled') && (
              <div className="mt-1 p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/80 text-[11px] text-indigo-200 space-y-1">
                <p className="font-bold text-white">To enable Google OAuth in Supabase:</p>
                <p>1. Go to <a href="https://supabase.com/dashboard/project/sgyflrnosqeeulmlcaba/auth/providers" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline font-semibold">Supabase &gt; Authentication &gt; Providers &gt; Google</a></p>
                <p>2. Toggle <strong>Enable Google provider</strong> to <strong>ON</strong></p>
                <p>3. Paste your Google OAuth <strong>Client ID</strong> from Google Cloud Console</p>
                <p>4. Paste your Google OAuth <strong>Client Secret</strong> from Google Cloud Console</p>
                <p>5. Click <strong>Save</strong>!</p>
              </div>
            )}
          </div>
        )}



        {/* Primary Action: Continue with Google OAuth */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center gap-2.5 shadow-sm active:scale-95 disabled:opacity-50"
        >
          {/* Google Official SVG Mark */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px bg-slate-800 flex-1" />
          <span>or email & password</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Sophia Patel"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Artificial Intelligence">AI & Data Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Year of Study
                  </label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              University Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@stanford.edu"
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pr-10 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Processing...' : mode === 'signup' ? 'Complete Registration' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Guest Mode: Separate, clearly labelled option */}
        <div className="pt-2 border-t border-slate-800/80 text-center space-y-2">
          <button
            type="button"
            onClick={handleGuestSignIn}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>Continue as Guest (No Registration Required)</span>
          </button>
          <p className="text-[10px] text-slate-500">
            Guest mode provides read and search access. Voting & verification require a signed-in account.
          </p>
        </div>

        {/* Toggle Sign in / Sign up Mode */}
        <div className="text-center text-xs text-slate-400">
          {mode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button
                onClick={() => setMode('signin')}
                className="text-indigo-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-indigo-400 font-bold hover:underline"
              >
                Sign Up Free
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Role Selection Modal Shown Immediately on Successful Sign-In */}
      <RoleSelectionModal
        isOpen={showRoleSelection}
        onSuccess={(role) => {
          setShowRoleSelection(false);
          navigate(role === 'faculty' ? '/explore' : '/dashboard');
        }}
        onClose={() => {
          setShowRoleSelection(false);
          navigate('/dashboard');
        }}
      />
    </div>
  );
};
