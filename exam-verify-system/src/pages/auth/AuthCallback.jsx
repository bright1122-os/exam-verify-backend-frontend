import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { fetchProfile, userType } = useStore();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session) {
          // If no session after a brief wait, redirect to login
          setTimeout(() => {
            navigate('/auth/login');
          }, 2000);
          return;
        }

        // Session exists, fetch profile to get role
        await fetchProfile(session.user.id);
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message);
        setTimeout(() => navigate('/auth/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate, fetchProfile]);

  // Once userType is loaded, redirect
  useEffect(() => {
    if (userType) {
      if (userType === 'student') navigate('/student/dashboard');
      else if (userType === 'examiner') navigate('/examiner/dashboard');
      else if (userType === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } else if (userType === null) {
      // Profile fetch finished but no role found (new social user)
      // For now, redirect to home or a profile setup page
      navigate('/');
    }
  }, [userType, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <LoadingSpinner size="lg" text="Securing your session..." />
        {error && (
          <p className="mt-4 text-red-500 font-medium">
            Authentication error: {error}. Redirecting...
          </p>
        )}
      </div>
    </div>
  );
}

