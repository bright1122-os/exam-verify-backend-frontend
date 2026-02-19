import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  LogOut,
  LogIn,
  UserPlus,
  QrCode,
  ScanLine,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, signOut, userType } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = {
    student: [
      { to: '/student/dashboard', label: 'Student Portal', icon: LayoutDashboard },
      { to: '/student/qr-code', label: 'My Exam Pass', icon: QrCode },
    ],
    examiner: [
      { to: '/examiner/dashboard', label: 'Examiner Dashboard', icon: LayoutDashboard },
      { to: '/examiner/scan', label: 'Scan Terminal', icon: ScanLine },
    ],
    admin: [
      { to: '/admin/dashboard', label: 'System Admin', icon: LayoutDashboard },
    ],
  };

  const links = isAuthenticated ? navLinks[userType] || [] : [];
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-lg border-b border-slate-200/60 h-20 no-print">
      <div className="max-w-[1200px] mx-auto px-6 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-slate-900 tracking-tight hidden sm:block">
              ExamVerify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${active
                    ? 'bg-primary/5 text-primary'
                    : 'text-slate-600 hover:text-primary hover:bg-primary/5'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 leading-none">
                      {user?.user_metadata?.name || 'Authorized User'}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">
                      {userType}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-primary border border-slate-200 shadow-sm overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold">{user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/auth/login" className="px-6 py-2.5 text-sm font-bold text-slate-700 hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link to="/auth/signup" className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[120] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                   <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-heading font-bold text-slate-900 tracking-tight">
                      ExamVerify
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 bg-slate-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  {!isAuthenticated && (
                    <div className="grid grid-cols-1 gap-3 mb-8">
                       <Link
                        to="/auth/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 text-slate-900 font-bold"
                      >
                        Sign In
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>
                      <Link
                        to="/auth/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-4 rounded-xl bg-primary text-white font-bold"
                      >
                        Get Started
                        <ChevronRight className="w-4 h-4 text-white/60" />
                      </Link>
                    </div>
                  )}

                  <div className="space-y-1">
                    {links.map((link) => {
                      const Icon = link.icon;
                      const active = isActive(link.to);
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all ${active
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-bold">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500 bg-red-50 font-bold mt-auto"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout Account
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

