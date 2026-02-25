import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { fetchProfile, userType } = useStore();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true); // guard: don't redirect until fetch is done

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Give Supabase a moment to exchange the OAuth code for a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
          // No session yet — may need to wait for PKCE exchange
          setTimeout(() => navigate('/auth/login'), 2000);
          return;
        }

        await fetchProfile(session.user.id);
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message);
        setTimeout(() => navigate('/auth/login'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, []); // run once on mount only

  // Redirect once processing is complete and userType is resolved
  useEffect(() => {
    if (isProcessing) return; // wait for handleCallback to finish

    if (userType === 'student')  { navigate('/student/dashboard');  return; }
    if (userType === 'examiner') { navigate('/examiner/dashboard'); return; }
    if (userType === 'admin')    { navigate('/admin/dashboard');    return; }

    // userType is null/undefined — new Google user without a profile role yet
    // The handle_new_user DB trigger creates the profile; default role is 'student'
    // Redirect to student dashboard where they'll be prompted to complete registration
    navigate('/student/dashboard');
  }, [userType, isProcessing, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment">
      <div className="text-center">
        <LoadingSpinner size="lg" text="Securing your session…" />
        {error && (
          <p className="mt-4 text-red-500 font-body font-medium text-body-sm">
            Authentication error: {error}. Redirecting…
          </p>
        )}
      </div>
    </div>
  );
}
