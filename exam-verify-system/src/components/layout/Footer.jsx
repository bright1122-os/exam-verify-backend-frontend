import { GraduationCap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-anthracite border-t border-white/10 no-print">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-anthracite border-2 border-terracotta rounded-lg flex items-center justify-center">
              <span className="font-heading font-bold text-terracotta text-sm">EV</span>
            </div>
            <span className="font-heading font-bold text-parchment">ExamVerify</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-stone font-heading">
            <Link to="/" className="hover:text-terracotta transition-colors">Home</Link>
            <Link to="/examiner/scan" className="hover:text-terracotta transition-colors">Verify Student</Link>
          </div>

          <p className="text-sm text-stone flex items-center gap-1 font-body">
            Made with <Heart className="w-4 h-4 text-terracotta" /> for secure exams
          </p>
        </div>
      </div>
    </footer>
  );
};
