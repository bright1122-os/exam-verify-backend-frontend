import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signInWithGoogle, userType } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await signIn(email, password);
      setAuthSuccess(true);

      setTimeout(() => {
        if (userType === 'examiner') navigate('/examiner/dashboard');
        else if (userType === 'admin') navigate('/admin/dashboard');
        else navigate('/student/dashboard');
      }, 1000);

    } catch (error) {
      toast.error(error.message || 'Verification failed. Please check credentials.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error('Google Sign-In failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-parchment selection:bg-primary/10">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[45%] bg-ink relative overflow-hidden items-end p-12">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-success/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/[0.06] border border-white/[0.08] rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white/60" />
            </div>
            <span className="font-heading font-bold text-white/80 text-xl">ExamVerify</span>
          </div>
          <h2 className="text-display-sm font-heading font-bold text-white mb-4">
            Secure exam <span className="text-editorial text-primary-light">verification</span>
          </h2>
          <p className="text-body-md text-white/30 leading-relaxed">
            End-to-end encrypted identification for students and examiners. Access your portal to manage exam passes and hall entry.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-slate-900">ExamVerify</span>
          </div>

          <div className="mb-10">
            <h1 className="text-display-sm font-heading font-bold text-anthracite mb-2">
              Sign In
            </h1>
            <p className="text-body-md text-stone">
              Access your examination portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-label uppercase font-body font-semibold text-slate-500 mb-2.5 ml-0.5 group-focus-within:text-primary transition-colors">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium"
                placeholder="name@university.edu.ng"
                required
              />
            </div>

            <div className="group">
              <label className="block text-label uppercase font-body font-semibold text-slate-500 mb-2.5 ml-0.5 group-focus-within:text-primary transition-colors">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="button" className="text-body-sm font-body font-semibold text-primary hover:text-primary-dark transition-colors">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || authSuccess}
              className={`btn-primary w-full py-4 text-base mt-2 ${loading ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              <AnimatePresence mode="wait">
                {authSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-white" />
                    Authenticated
                  </motion.div>
                ) : loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing In...
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-parchment px-4 text-label uppercase font-body font-semibold text-slate-400">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-4 px-6 bg-white border border-slate-200 rounded-xl font-body font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>

          <p className="text-center mt-10 text-body-sm text-stone">
            New student?{' '}
            <Link to="/auth/signup" className="text-primary font-body font-semibold hover:underline">
              Create an account
            </Link>
          </p>

          <div className="text-center mt-6">
            <Link to="/" className="text-label font-body font-semibold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
              Back to homepage
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
