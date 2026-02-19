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

      // Delay for success state animation
      setTimeout(() => {
        // Redirection handled by Store/App, but manual check here for UX
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 selection:bg-primary/10 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-success/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px] relative"
      >
        <div className="bg-white rounded-[32px] shadow-premium p-10 lg:p-12 border border-slate-100">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight mb-2">
              Sign In
            </h1>
            <p className="text-slate-500 font-medium">
              Access your examination portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 group-focus-within:text-primary transition-colors">
                University Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium px-5 py-4"
                placeholder="name@university.edu.ng"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 group-focus-within:text-primary transition-colors">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium px-5 py-4"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end py-1">
              <button type="button" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || authSuccess}
              className={`btn-primary w-full py-4 text-lg mt-2 ${loading ? 'cursor-not-allowed opacity-80' : ''}`}
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
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
              <span className="bg-white px-4 text-slate-400">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-4 px-6 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <p className="text-center mt-10 text-slate-500 font-medium">
            New student?{' '}
            <Link to="/auth/signup" className="text-primary font-bold hover:underline transition-all">
              Create an account
            </Link>
          </p>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
            Back to homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

