import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Zap, Lock, QrCode, Users, ArrowRight, Sparkles, GraduationCap, ScanLine, LogIn, ExternalLink } from 'lucide-react';
import { heroMockups, mockStudentPhotos, generateAvatar } from '../utils/mockImages';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } }
  };

  return (
    <div className="bg-white selection:bg-primary/10">
      {/* ── Landing Hero ── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div
              className="lg:w-3/5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Next-Generation Hall Security
              </motion.div>

              <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-heading font-bold text-slate-900 leading-[1.05] mb-8 tracking-tight">
                Secure Examination <br />
                <span className="text-primary italic">Verification</span> System
              </motion.h1>

              <motion.p variants={itemVariants} className="text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
                Eliminate impersonation and fraud with end-to-end encrypted identification protocols. Secure, real-time verification for every student.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center">
                <Link to="/auth/signup?role=student" className="btn-primary w-full sm:w-auto text-lg group">
                  Get My Exam Pass
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/auth/login" className="btn-secondary w-full sm:w-auto text-lg">
                  Sign In
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              className="lg:w-2/5 relative"
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
                <img src={heroMockups.queuing} alt="Queuing Students" className="w-full h-auto object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <p className="text-white font-medium">Live Verification Active</p>
                  </div>
                </div>
              </div>

              {/* Floating ID Card Component */}
              <motion.div
                className="absolute -bottom-10 -left-10 z-20 hidden md:block"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="bg-white rounded-xl shadow-premium p-4 w-64 border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none">Exam ID</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Status: Active</p>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div className="w-3/4 h-full bg-primary" />
                  </div>
                  <p className="text-[11px] text-slate-400">Unique identifier encrypted via AES-256</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features List ── */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-2 shadow-lg shadow-primary/20">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold text-slate-900">Ironclad Security</h3>
              <p className="text-slate-600 leading-relaxed">
                Military-grade encryption for all student passes. Passes are tied to specific sessions and expire automatically.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-success flex items-center justify-center text-white mb-2 shadow-lg shadow-success/20">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold text-slate-900">Instant Processing</h3>
              <p className="text-slate-600 leading-relaxed">
                Scan and verify in under 300 milliseconds. Reduce hall entry times by up to 80% compared to manual checks.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white mb-2 shadow-lg shadow-slate-900/20">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold text-slate-900">Verified Payments</h3>
              <p className="text-slate-600 leading-relaxed">
                Direct integration with Remita ensures only students who have completed fee payments receive an exam pass.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Before & After Comparison ── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-slate-900 mb-6 tracking-tight">
              Transforming Exam Management
            </h2>
            <p className="text-lg text-slate-600">
              Moving from manual vulnerabilities to digital certainty. Our system replaces guesswork with data-backed verification.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            <div className="card-premium bg-slate-50 flex flex-col items-center text-center">
              <span className="badge-premium bg-slate-200 text-slate-600 mb-6">Traditional Protocol</span>
              <div className="rounded-xl overflow-hidden mb-8 shadow-sm">
                <img src={heroMockups.comparison} alt="Manual Process" className="w-full grayscale h-48 object-cover opacity-50" />
              </div>
              <h4 className="text-xl font-bold mb-4 text-slate-700">Manual ID Checking</h4>
              <ul className="text-slate-500 space-y-3 text-sm">
                <li>• Subject to human error and oversight</li>
                <li>• Easy impersonation using fake IDs</li>
                <li>• Long queues and entry delays</li>
                <li>• No digital audit trail</li>
              </ul>
            </div>

            <div className="card-premium border-primary/20 bg-primary/[0.02] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
              </div>
              <span className="badge-primary mb-6">Digital Ecosystem</span>
              <div className="rounded-xl overflow-hidden mb-8 shadow-md border-2 border-primary/10">
                <img src={heroMockups.success} alt="Digital Verification" className="w-full h-48 object-cover" />
              </div>
              <h4 className="text-xl font-bold mb-4 text-primary">Biometric-linked QR Passes</h4>
              <ul className="text-primary/70 space-y-3 text-sm">
                <li className="flex items-center gap-2 justify-center"><CheckCircle className="w-4 h-4" /> Triple-factor authentication</li>
                <li className="flex items-center gap-2 justify-center"><CheckCircle className="w-4 h-4" /> Tamper-proof digital signatures</li>
                <li className="flex items-center gap-2 justify-center"><CheckCircle className="w-4 h-4" /> Zero-queue hall entry</li>
                <li className="flex items-center gap-2 justify-center"><CheckCircle className="w-4 h-4" /> Live attendance audit</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Examiner Portal Feature ── */}
      <section className="py-24 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />

        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                <img src={heroMockups.scanning} alt="Examiner Scanning" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
              </div>
            </div>

            <div className="lg:w-1/2 order-1 lg:order-2">
              <span className="badge-success mb-6">For Institution Staff</span>
              <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-8 leading-tight">
                Simplified Hall <br />
                <span className="text-success">Supervision</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                The Examiner Portal provides a high-performance scanning interface that works on any smartphone. No special hardware required.
              </p>

              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded bg-success/20 flex items-center justify-center text-success shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Live Attendance Count</p>
                    <p className="text-sm text-slate-500">Track exactly how many students are in the hall in real-time.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded bg-success/20 flex items-center justify-center text-success shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Fraud Alerts</p>
                    <p className="text-sm text-slate-500">Instant notification if a pass is reused or expired.</p>
                  </div>
                </div>
              </div>

              <Link to="/auth/login?role=examiner" className="btn-success group">
                Access Examiner Portal
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Section ── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-12 italic">Join 10,000+ Students Already Verified</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale contrast-125">
            {/* These would be university logos, using placeholder names for now */}
            <span className="text-2xl font-heading font-black">UNILAG</span>
            <span className="text-2xl font-heading font-black">UNIBEN</span>
            <span className="text-2xl font-heading font-black">OAU</span>
            <span className="text-2xl font-heading font-black">ABU</span>
            <span className="text-2xl font-heading font-black">UI</span>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="py-24 bg-primary text-white text-center rounded-t-[40px] lg:rounded-t-[80px]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <GraduationCap className="w-16 h-16 mx-auto mb-8 opacity-50" />
          <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-8">Ready to secure <br /> your next session?</h2>
          <p className="text-primary-light text-xl mb-12 leading-relaxed opacity-80">
            Automate hall entry, eliminate fraud, and create a better experience for students and staff alike.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth/signup?role=student" className="px-10 py-5 bg-white text-primary font-bold rounded-xl hover:bg-slate-50 transition-colors text-lg">
              Start as Student
            </Link>
            <Link to="/auth/signup?role=examiner" className="px-10 py-5 bg-primary-dark text-white border border-white/20 font-bold rounded-xl hover:bg-primary-dark/50 transition-colors text-lg">
              Partner as Examiner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

