import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  LogOut,
  QrCode,
  ScanLine,
  LayoutDashboard,
  ShieldCheck,
  ChevronRight,
  Settings,
  ClipboardCheck,
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, signOut, userType } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = {
    student: [
      { to: '/student/dashboard', label: 'Portal', icon: LayoutDashboard },
      { to: '/student/qr-code', label: 'Exam Pass', icon: QrCode },
      { to: '/student/verification', label: 'Status', icon: ClipboardCheck },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
    examiner: [
      { to: '/examiner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/examiner/scan', label: 'Scanner', icon: ScanLine },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Admin', icon: LayoutDashboard },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  };

  const links = isAuthenticated ? navLinks[userType] || [] : [];
  const isActive = (path) => location.pathname === path;

  // Dynamic styles based on scroll and page
  const isDarkHeader = isHomePage && !scrolled;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] h-20 transition-all duration-500 no-print ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm'
          : isHomePage
            ? 'bg-transparent border-b border-transparent'
            : 'bg-white/90 backdrop-blur-xl border-b border-slate-200/60'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-500 ${
              isDarkHeader ? 'bg-white/10 border border-white/10' : 'bg-primary shadow-lg shadow-primary/20'
            }`}>
              <ShieldCheck className={`w-6 h-6 ${isDarkHeader ? 'text-white' : 'text-white'}`} />
            </div>
            <span className={`text-xl font-heading font-bold tracking-tight hidden sm:block transition-colors duration-500 ${
              isDarkHeader ? 'text-white' : 'text-slate-900'
            }`}>
              ExamVerify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-body font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? isDarkHeader
                        ? 'bg-white/10 text-white'
                        : 'bg-primary/5 text-primary'
                      : isDarkHeader
                        ? 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                        : 'text-slate-500 hover:text-primary hover:bg-primary/5'
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
                <div className={`hidden md:flex items-center gap-3 pl-4 border-l transition-colors duration-500 ${
                  isDarkHeader ? 'border-white/10' : 'border-slate-200'
                }`}>
                  <div className="text-right">
                    <p className={`text-sm font-body font-semibold leading-none transition-colors duration-500 ${
                      isDarkHeader ? 'text-white' : 'text-slate-900'
                    }`}>
                      {user?.name || user?.user_metadata?.name || 'User'}
                    </p>
                    <p className={`text-micro uppercase mt-1.5 font-body font-bold transition-colors duration-500 ${
                      isDarkHeader ? 'text-white/40' : 'text-slate-400'
                    }`}>
                      {userType}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border overflow-hidden transition-colors duration-500 ${
                    isDarkHeader
                      ? 'bg-white/10 border-white/10 text-white'
                      : 'bg-slate-100 border-slate-200 text-primary'
                  }`}>
                    {user?.avatar || user?.user_metadata?.avatar_url ? (
                      <img src={user.avatar || user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-body font-bold text-sm">
                        {(user?.name || user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border border-transparent ${
                    isDarkHeader
                      ? 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
                      : 'text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100'
                  }`}
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/auth/login"
                  className={`px-5 py-2 text-sm font-body font-semibold transition-colors duration-200 ${
                    isDarkHeader ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/signup"
                  className={`px-5 py-2.5 text-sm font-body font-bold rounded-lg transition-all active:scale-[0.98] ${
                    isDarkHeader
                      ? 'bg-white text-ink hover:bg-white/90 shadow-lg'
                      : 'bg-primary text-white hover:shadow-lg hover:shadow-primary/20'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isDarkHeader
                  ? 'text-white bg-white/[0.06]'
                  : 'text-slate-600 bg-slate-100'
              }`}
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
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[110] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[120] md:hidden shadow-premium-lg flex flex-col"
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
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-50 text-slate-900 font-body font-bold"
                      >
                        Sign In
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>
                      <Link
                        to="/auth/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-4 rounded-xl bg-primary text-white font-body font-bold"
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
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                            active
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-body font-bold">{link.label}</span>
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
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500 bg-red-50 font-body font-bold mt-auto"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
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
