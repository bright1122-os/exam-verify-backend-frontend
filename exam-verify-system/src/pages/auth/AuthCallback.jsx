import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthFromToken } = useStore();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const role = searchParams.get('role');

        if (!token) {
          setError('No authentication token received');
          setTimeout(() => navigate('/auth/login'), 2000);
          return;
        }

        // Save token and fetch user profile from backend
        const user = await setAuthFromToken(token);

        // Navigate based on role
        const userRole = user?.role || role;
        if (userRole === 'examiner') navigate('/examiner/dashboard', { replace: true });
        else if (userRole === 'admin') navigate('/admin/dashboard', { replace: true });
        else navigate('/student/dashboard', { replace: true });

      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        setTimeout(() => navigate('/auth/login'), 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams, setAuthFromToken]);

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
