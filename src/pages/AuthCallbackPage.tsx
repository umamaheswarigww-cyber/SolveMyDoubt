import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLiveSupabase } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleAuthCallback() {
      if (!isLiveSupabase || !supabase) {
        // If unconfigured, redirect to auth
        navigate('/auth');
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          if (mounted) {
            setStatus('success');
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 600);
          }
        } else {
          // Listen for next auth event (PKCE hash exchange)
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, currentSession) => {
              if (currentSession?.user && mounted) {
                setStatus('success');
                subscription.unsubscribe();
                setTimeout(() => {
                  navigate('/dashboard', { replace: true });
                }, 600);
              }
            }
          );

          // Timeout after 6 seconds if exchange doesn't complete
          setTimeout(() => {
            if (mounted && status === 'processing') {
              subscription.unsubscribe();
              setStatus('error');
              setErrorMessage('Authentication session could not be established. Please try signing in again.');
            }
          }, 6000);
        }
      } catch (err: any) {
        if (mounted) {
          setStatus('error');
          setErrorMessage(err.message || 'Google OAuth callback exchange failed.');
        }
      }
    }

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [isLiveSupabase, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center space-y-4 shadow-2xl backdrop-blur-md">
        {status === 'processing' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-7 h-7 animate-spin-slow" />
            </div>
            <h2 className="text-lg font-black text-white">Completing Secure Sign-in</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verifying credentials with Google & establishing your university learner session...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-white">Authentication Verified</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Redirecting you to the DoubtLoop workspace...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-white">Authentication Failed</h2>
            <p className="text-xs text-rose-400 leading-relaxed">{errorMessage}</p>
            <button
              onClick={() => navigate('/auth')}
              className="mt-4 px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              Return to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};
