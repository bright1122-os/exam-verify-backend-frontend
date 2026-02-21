import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-ink border-t border-white/[0.06] no-print">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/[0.06] border border-white/[0.08] rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white/60" />
            </div>
            <span className="font-heading font-bold text-white/80 text-lg">ExamVerify</span>
          </div>

          <div className="flex items-center gap-8 text-body-sm text-white/30 font-body">
            <Link to="/" className="hover:text-white/60 transition-colors duration-200">Home</Link>
            <Link to="/auth/signup" className="hover:text-white/60 transition-colors duration-200">Get Started</Link>
            <Link to="/examiner/scan" className="hover:text-white/60 transition-colors duration-200">Verify</Link>
          </div>

          <p className="text-body-sm text-white/20 font-body">
            &copy; {new Date().getFullYear()} ExamVerify
          </p>
        </div>
      </div>
    </footer>
  );
};
