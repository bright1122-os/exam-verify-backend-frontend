import { useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Zap, Lock, QrCode, Users, ArrowRight, ArrowUpRight, Sparkles, GraduationCap, ScanLine, ExternalLink, ChevronDown } from 'lucide-react';
import { heroMockups } from '../utils/mockImages';

// Scroll-reveal wrapper component
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const features = [
    {
      icon: Shield,
      title: 'Ironclad Security',
      description: 'Military-grade AES-256 encryption for all student passes. Tied to specific sessions, expires automatically.',
      accent: 'bg-primary',
    },
    {
      icon: Zap,
      title: 'Instant Processing',
      description: 'Scan and verify in under 300ms. Reduce hall entry times by up to 80% compared to manual checks.',
      accent: 'bg-success',
    },
    {
      icon: Lock,
      title: 'Verified Payments',
      description: 'Direct Remita integration ensures only fee-cleared students receive an exam pass.',
      accent: 'bg-ink',
    },
  ];

  const processSteps = [
    { number: '01', title: 'Register', description: 'Create account with university credentials and complete identity verification.' },
    { number: '02', title: 'Payment', description: 'Pay examination fees through Remita. Verification is instant.' },
    { number: '03', title: 'QR Pass', description: 'Receive encrypted, one-time-use QR exam pass linked to your biometric data.' },
    { number: '04', title: 'Scan & Enter', description: 'Examiner scans your QR at the hall entrance. Access granted in milliseconds.' },
  ];

  return (
    <div className="bg-parchment selection:bg-primary/10">

      {/* ═══════════════════════════════════════════
          HERO SECTION — Dark, immersive, authoritative
          ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center bg-ink overflow-hidden">
        {/* Subtle gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-success/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Noise texture */}
        <div className="absolute inset-0 noise-overlay" />

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 section-container w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20 pt-32 pb-20 lg:pt-40 lg:pb-32">

            {/* Left — Text */}
            <div className="lg:w-3/5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.06] border border-white/[0.08] text-white/70 rounded-full text-label uppercase font-body font-medium mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Next-Generation Hall Security
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-display-md lg:text-display-lg xl:text-display-xl font-heading font-bold text-white leading-[1.02] mb-8"
              >
                Secure Exam{' '}
                <span className="text-editorial text-primary-light">Verification</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-body-lg text-white/50 mb-12 max-w-xl leading-relaxed"
              >
                Eliminate impersonation and fraud with end-to-end encrypted identification protocols. Real-time verification for every student entering the examination hall.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 items-start"
              >
                <Link to="/auth/signup?role=student" className="btn-light group text-base">
                  Get My Exam Pass
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/auth/login" className="btn-ghost-light text-base">
                  Sign In
                </Link>
              </motion.div>
            </div>

            {/* Right — Hero Image */}
            <motion.div
              className="lg:w-2/5 relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div style={{ y: heroImageY }} className="relative z-10">
                <div className="img-reveal rounded-2xl overflow-hidden shadow-premium-lg border border-white/[0.08]">
                  <img
                    src={heroMockups.queuing}
                    alt="Students entering examination hall"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <p className="text-white/90 font-body font-medium text-sm">Live Verification Active</p>
                    </div>
                  </div>
                </div>

                {/* Floating Card */}
                <motion.div
                  className="absolute -bottom-8 -left-8 z-20 hidden lg:block"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="bg-white rounded-xl shadow-premium-lg p-4 w-56 border border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-slate-900 text-sm leading-none">Exam Pass</p>
                        <p className="text-micro text-slate-500 uppercase mt-1">AES-256 Encrypted</p>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-primary rounded-full" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-micro uppercase text-white/30 font-body tracking-widest">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-4 h-4 text-white/30" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES — Clean, warm background
          ═══════════════════════════════════════════ */}
      <section className="section-padding bg-parchment relative">
        <div className="section-container">
          <Reveal>
            <p className="text-label uppercase text-stone font-body font-semibold tracking-widest mb-4">Why ExamVerify</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-display-sm lg:text-display-md font-heading font-bold text-anthracite mb-20 max-w-2xl">
              Built for institutions that take{' '}
              <span className="text-editorial text-primary">security seriously</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="group">
                    <div className={`w-14 h-14 rounded-xl ${feature.accent} flex items-center justify-center text-white mb-6 transition-transform duration-500 group-hover:scale-110`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-heading-sm font-heading font-bold text-anthracite mb-3">{feature.title}</h3>
                    <p className="text-body-md text-stone leading-relaxed">{feature.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ═══════════════════════════════════════════
          PROCESS — How it works, editorial style
          ═══════════════════════════════════════════ */}
      <section className="section-padding bg-cream relative">
        <div className="section-container">
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Left heading */}
            <div className="lg:w-2/5 lg:sticky lg:top-32 lg:self-start">
              <Reveal>
                <p className="text-label uppercase text-stone font-body font-semibold tracking-widest mb-4">Process</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="text-display-sm lg:text-display-md font-heading font-bold text-anthracite mb-6">
                  From registration to{' '}
                  <span className="text-editorial text-primary">hall entry</span>
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-body-lg text-stone leading-relaxed mb-8">
                  A streamlined four-step process that replaces manual ID checking with cryptographic certainty.
                </p>
              </Reveal>
              <Reveal delay={0.3}>
                <Link to="/auth/signup?role=student" className="btn-primary group inline-flex">
                  Start Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Reveal>
            </div>

            {/* Right steps */}
            <div className="lg:w-3/5 space-y-0">
              {processSteps.map((step, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="group flex gap-6 py-10 border-t border-slate-200 first:border-t-0 lg:first:border-t">
                    <span className="text-display-sm font-heading font-bold text-slate-200 group-hover:text-primary transition-colors duration-500 shrink-0">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="text-heading-md font-heading font-bold text-anthracite mb-2 group-hover:text-primary transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-body-md text-stone leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMPARISON — Before & After, side by side
          ═══════════════════════════════════════════ */}
      <section className="section-padding bg-parchment relative overflow-hidden">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Reveal>
              <p className="text-label uppercase text-stone font-body font-semibold tracking-widest mb-4">Transformation</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-display-sm lg:text-display-md font-heading font-bold text-anthracite mb-6">
                From manual vulnerabilities to{' '}
                <span className="text-editorial text-primary">digital certainty</span>
              </h2>
            </Reveal>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            <Reveal>
              <div className="card-premium bg-slate-50 h-full flex flex-col items-center text-center">
                <span className="badge-premium bg-slate-200 text-slate-500 mb-6">Traditional Protocol</span>
                <div className="img-reveal w-full mb-8">
                  <img src={heroMockups.comparison} alt="Manual process" className="w-full h-48 object-cover grayscale opacity-50 rounded-xl" />
                </div>
                <h4 className="text-heading-sm font-heading font-bold text-slate-700 mb-4">Manual ID Checking</h4>
                <ul className="text-stone space-y-3 text-body-sm">
                  <li>Subject to human error and oversight</li>
                  <li>Easy impersonation using fake IDs</li>
                  <li>Long queues and entry delays</li>
                  <li>No digital audit trail</li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="card-premium border-primary/20 bg-primary/[0.02] h-full flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <span className="badge-primary mb-6">Digital Ecosystem</span>
                <div className="img-reveal w-full mb-8 border-2 border-primary/10 rounded-xl">
                  <img src={heroMockups.success} alt="Digital verification" className="w-full h-48 object-cover rounded-xl" />
                </div>
                <h4 className="text-heading-sm font-heading font-bold text-primary mb-4">Biometric-linked QR Passes</h4>
                <ul className="text-primary/70 space-y-3 text-body-sm">
                  <li className="flex items-center gap-2 justify-center"><CheckCircle className="w-4 h-4 shrink-0" /> Triple-factor authentication</li>
                  <li className="flex items-center gap-2 justify-center"><CheckCircle className="w-4 h-4 shrink-0" /> Tamper-proof digital signatures</li>
                  <li className="flex items-center gap-2 justify-center"><CheckCircle className="w-4 h-4 shrink-0" /> Zero-queue hall entry</li>
                  <li className="flex items-center gap-2 justify-center"><CheckCircle className="w-4 h-4 shrink-0" /> Live attendance audit</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          EXAMINER SECTION — Dark, immersive
          ═══════════════════════════════════════════ */}
      <section className="section-padding-lg bg-ink text-white overflow-hidden relative">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-primary/[0.06] to-transparent pointer-events-none" />

        <div className="section-container relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {/* Image */}
            <Reveal className="lg:w-1/2 order-2 lg:order-1">
              <div className="img-reveal rounded-2xl border border-white/[0.06] shadow-premium-lg overflow-hidden">
                <img
                  src={heroMockups.scanning}
                  alt="Examiner scanning student QR code"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay pointer-events-none" />
              </div>
            </Reveal>

            {/* Text */}
            <div className="lg:w-1/2 order-1 lg:order-2">
              <Reveal>
                <span className="badge-success mb-6 inline-flex">For Institution Staff</span>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="text-display-sm lg:text-display-md font-heading font-bold mb-8 leading-tight">
                  Simplified Hall{' '}
                  <span className="text-editorial text-success-light">Supervision</span>
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="text-body-lg text-white/40 mb-10 leading-relaxed">
                  The Examiner Portal provides a high-performance scanning interface that works on any smartphone. No special hardware required.
                </p>
              </Reveal>

              <div className="space-y-6 mb-12">
                {[
                  { title: 'Live Attendance Count', desc: 'Track exactly how many students are in the hall in real-time.' },
                  { title: 'Fraud Alerts', desc: 'Instant notification if a pass is reused or expired.' },
                  { title: 'Offline Capable', desc: 'Continues to verify passes even with spotty connectivity.' },
                ].map((item, i) => (
                  <Reveal key={i} delay={0.3 + i * 0.1}>
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded bg-success/20 flex items-center justify-center text-success shrink-0 mt-0.5">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-body font-semibold text-white mb-1">{item.title}</p>
                        <p className="text-body-sm text-white/40">{item.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.6}>
                <Link to="/auth/login?role=examiner" className="btn-success group inline-flex">
                  Access Examiner Portal
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TRUST BAR
          ═══════════════════════════════════════════ */}
      <section className="py-16 bg-parchment">
        <div className="section-container text-center">
          <Reveal>
            <p className="text-label font-body font-semibold uppercase tracking-widest text-stone mb-10">
              Trusted by 10,000+ students across
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-x-14 gap-y-4 opacity-30">
              {['UNILAG', 'UNIBEN', 'OAU', 'ABU', 'UI'].map((name) => (
                <span key={name} className="text-2xl font-heading font-bold text-anthracite">{name}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER CTA — Bold, rounded top
          ═══════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-primary text-white text-center rounded-t-[48px] lg:rounded-t-[80px] relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/[0.06] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-6 lg:px-8 relative z-10">
          <Reveal>
            <GraduationCap className="w-12 h-12 mx-auto mb-8 text-white/30" />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-display-sm lg:text-display-md font-heading font-bold mb-8">
              Ready to secure your next session?
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-body-lg text-white/60 mb-12 leading-relaxed max-w-xl mx-auto">
              Automate hall entry, eliminate fraud, and create a better experience for students and staff alike.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup?role=student" className="px-10 py-4 bg-white text-primary font-body font-bold rounded-xl hover:bg-white/90 transition-all text-base shadow-lg">
                Start as Student
              </Link>
              <Link to="/auth/signup?role=examiner" className="px-10 py-4 bg-primary-dark text-white border border-white/20 font-body font-bold rounded-xl hover:bg-white/10 transition-all text-base">
                Partner as Examiner
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
