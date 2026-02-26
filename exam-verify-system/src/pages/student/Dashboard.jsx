import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Clock, QrCode, CreditCard, User,
  ArrowRight, Shield, GraduationCap, FileText,
  ChevronRight, Printer, BookOpen,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import { PageTransition } from '../../components/layout/PageTransition';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { generateAvatar } from '../../utils/mockImages';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay },
});

export default function Dashboard() {
  const { user } = useStore();
  const [student, setStudent] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [{ data: s }, { data: p }] = await Promise.all([
          supabase.from('students').select('*').eq('user_id', user.id).maybeSingle(),
          supabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);
        setStudent(s);
        setPayment(p);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Student';

  const steps = [
    { id: 1, label: 'Profile Setup', done: !!student?.registration_complete, icon: User },
    { id: 2, label: 'Fee Payment',   done: !!student?.payment_verified,      icon: CreditCard },
    { id: 3, label: 'Exam Pass',     done: !!student?.qr_generated,          icon: QrCode },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const paymentVerified =
    payment?.status === 'verified' || payment?.status === 'completed';

  // Determine the one primary action the student should take next
  let primaryAction;
  if (!student?.registration_complete) {
    primaryAction = {
      to: '/student/register',
      label: 'Complete Profile',
      description: 'Upload academic details and your passport photo to begin.',
      Icon: User,
    };
  } else if (!student?.payment_verified) {
    primaryAction = {
      to: '/student/register',
      label: 'Verify Payment',
      description: 'Your profile is saved. Confirm your exam fee on step 3.',
      Icon: CreditCard,
    };
  } else if (!student?.qr_generated) {
    primaryAction = {
      to: '/student/qr-code',
      label: 'Get Exam Pass',
      description: 'Payment confirmed. Generate your encrypted QR exam pass now.',
      Icon: QrCode,
    };
  } else {
    primaryAction = {
      to: '/student/qr-code',
      label: 'Print Exam Pass',
      description: 'Your pass is ready. Print or download it before your exam.',
      Icon: Printer,
    };
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-parchment pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">

          {/* ── Page Header ── */}
          <motion.div
            {...fadeUp(0)}
            className="flex flex-wrap items-start justify-between gap-4 mb-8"
          >
            <div>
              <p className="text-label uppercase tracking-widest font-body font-semibold text-stone mb-1">
                Student Portal
              </p>
              <h1 className="text-heading-lg font-heading font-bold text-anthracite leading-tight">
                {name}
              </h1>
            </div>

            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-body-sm font-body font-semibold ${
                completedCount === 3
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-amber-50 border-amber-200 text-amber-600'
              }`}
            >
              {completedCount === 3 ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
              {completedCount === 3 ? 'All Clear' : `${completedCount} / 3 Complete`}
            </div>
          </motion.div>

          {/* ── Horizontal Progress Stepper ── */}
          <motion.div
            {...fadeUp(0.07)}
            className="bg-white border border-slate-100 rounded-2xl px-6 py-5 mb-8 shadow-premium"
          >
            <div className="relative flex items-start justify-between">
              {/* Connector line (behind circles) */}
              <div
                className="absolute top-5 left-[calc(16.67%+4px)] right-[calc(16.67%+4px)] h-0.5 bg-slate-100"
                aria-hidden="true"
              />

              {steps.map((step, i) => {
                const StepIcon = step.icon;
                const isActive = !step.done && (i === 0 || steps[i - 1].done);
                return (
                  <div
                    key={step.id}
                    className="relative z-10 flex flex-col items-center gap-2.5 flex-1"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-all ${
                        step.done
                          ? 'border-success bg-success text-white shadow-sm'
                          : isActive
                          ? 'border-primary text-primary shadow-md shadow-primary/20'
                          : 'border-slate-200 text-slate-300'
                      }`}
                    >
                      {step.done ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-body-sm font-body font-semibold text-center leading-tight hidden sm:block ${
                        step.done
                          ? 'text-success'
                          : isActive
                          ? 'text-primary'
                          : 'text-slate-300'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Main Grid ── */}
          <div className="grid lg:grid-cols-5 gap-6">

            {/* LEFT: Profile + Checklist + Payment */}
            <div className="lg:col-span-3 space-y-6">

              {/* Profile Card */}
              <motion.div
                {...fadeUp(0.12)}
                className="bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden"
              >
                <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="shrink-0">
                    <img
                      src={student?.photo_url || generateAvatar(name)}
                      alt="Student"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-premium ring-1 ring-slate-100"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <h2 className="text-heading-sm font-heading font-bold text-anthracite mb-1 truncate">
                      {name}
                    </h2>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-4">
                      <GraduationCap className="w-4 h-4 text-stone shrink-0" />
                      <span className="text-body-sm font-body font-medium text-stone truncate">
                        {student?.matric_number || 'Registration pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Faculty',    value: student?.faculty },
                        { label: 'Department', value: student?.department },
                        { label: 'Level',      value: student?.level ? `${student.level}L` : null },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center"
                        >
                          <p className="text-micro uppercase tracking-widest font-body font-semibold text-stone mb-1">
                            {label}
                          </p>
                          <p className="text-body-sm font-body font-bold text-anthracite leading-snug truncate">
                            {value !== null && value !== undefined
                              ? value
                              : <span className="text-slate-300 font-normal">—</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Clearance Checklist */}
              <motion.div
                {...fadeUp(0.18)}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-heading-sm font-heading font-bold text-anthracite">
                    Clearance Checklist
                  </h3>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: 'Academic Profile',
                      desc: student?.matric_number
                        ? `Matric: ${student.matric_number}`
                        : 'Upload details and your passport photo',
                      done: !!student?.registration_complete,
                    },
                    {
                      label: 'Fee Payment',
                      desc: payment
                        ? `₦${payment.amount?.toLocaleString()} · ${paymentVerified ? 'Verified' : 'Pending'}`
                        : 'Pay exam clearance fee via Remita',
                      done: !!student?.payment_verified,
                    },
                    {
                      label: 'Exam Pass',
                      desc: student?.qr_generated
                        ? 'Encrypted QR code ready for printing'
                        : 'Generated automatically after payment is confirmed',
                      done: !!student?.qr_generated,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                        item.done
                          ? 'bg-success/[0.04] border-success/15'
                          : 'bg-slate-50/60 border-slate-100'
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          item.done ? 'bg-success text-white' : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {item.done ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-body-sm font-body font-bold leading-tight ${
                            item.done ? 'text-anthracite' : 'text-stone'
                          }`}
                        >
                          {item.label}
                        </p>
                        <p className="text-micro text-stone mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      {item.done && (
                        <span className="ml-auto shrink-0 text-[10px] font-body font-bold text-success bg-success/10 px-2 py-0.5 rounded-md border border-success/20 uppercase tracking-wide">
                          Done
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Payment Record */}
              <motion.div
                {...fadeUp(0.24)}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="text-heading-sm font-heading font-bold text-anthracite">
                    Payment
                  </h3>
                  {payment && (
                    <span
                      className={`ml-auto text-[11px] font-body font-bold px-2.5 py-1 rounded-full border ${
                        paymentVerified
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-amber-50 text-amber-600 border-amber-200'
                      }`}
                    >
                      {paymentVerified ? 'Verified' : 'Pending'}
                    </span>
                  )}
                </div>

                {payment ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5">
                    {[
                      { label: 'RRR Reference', value: payment.rrr,         mono: true },
                      { label: 'Amount',         value: `₦${payment.amount?.toLocaleString()}` },
                      {
                        label: 'Date',
                        value: new Date(payment.created_at).toLocaleDateString('en-NG', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        }),
                      },
                      { label: 'Status', value: paymentVerified ? 'Verified' : 'Pending' },
                    ].map(({ label, value, mono }) => (
                      <div key={label}>
                        <p className="text-micro uppercase tracking-widest font-body font-semibold text-stone mb-1">
                          {label}
                        </p>
                        <p
                          className={`text-body-sm font-bold text-anthracite truncate ${
                            mono ? 'font-mono' : 'font-body'
                          }`}
                        >
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100">
                      <CreditCard className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-body-sm font-body font-semibold text-stone">
                      No payment record
                    </p>
                    <p className="text-micro text-slate-300 mt-1">
                      Complete registration to generate a payment reference.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* RIGHT: Primary Action + Quick Links + Guidelines */}
            <div className="lg:col-span-2 space-y-6">

              {/* Primary Action Card */}
              <motion.div {...fadeUp(0.15)}>
                {(() => {
                  const ActionIcon = primaryAction.Icon;
                  return (
                    <Link
                      to={primaryAction.to}
                      className="group block bg-anthracite rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.07] border border-white/[0.06] flex items-center justify-center mb-5 transition-colors group-hover:bg-primary/20">
                        <ActionIcon className="w-6 h-6 text-white/60 group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="text-heading-sm font-heading font-bold text-white mb-2">
                        {primaryAction.label}
                      </h3>
                      <p className="text-body-sm text-white/40 leading-relaxed mb-5">
                        {primaryAction.description}
                      </p>
                      <div className="flex items-center gap-2 text-primary text-body-sm font-body font-semibold">
                        Go now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })()}
              </motion.div>

              {/* Quick Links */}
              <motion.div
                {...fadeUp(0.21)}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium"
              >
                <h3 className="text-micro uppercase tracking-widest font-body font-bold text-stone mb-4">
                  Quick Links
                </h3>
                <div className="space-y-1">
                  {[
                    {
                      to: '/student/qr-code',
                      Icon: QrCode,
                      label: 'Exam Pass',
                      sub: student?.qr_generated ? 'Ready to print' : 'Not ready yet',
                      ready: !!student?.qr_generated,
                    },
                    {
                      to: '/student/verification',
                      Icon: FileText,
                      label: 'Clearance Status',
                      sub: `${completedCount} / 3 steps complete`,
                      ready: completedCount === 3,
                    },
                    {
                      to: '/student/register',
                      Icon: User,
                      label: 'Registration',
                      sub: student?.registration_complete ? 'Completed' : 'Pending',
                      ready: !!student?.registration_complete,
                    },
                    {
                      to: '/settings',
                      Icon: Shield,
                      label: 'Account Settings',
                      sub: 'Profile & preferences',
                      ready: true,
                    },
                  ].map(({ to, Icon, label, sub, ready }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          ready ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-body font-semibold text-anthracite leading-tight">
                          {label}
                        </p>
                        <p className="text-micro text-stone">{sub}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0 transition-colors" />
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Exam Guidelines */}
              <motion.div
                {...fadeUp(0.27)}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-stone" />
                  <h3 className="text-micro uppercase tracking-widest font-body font-bold text-stone">
                    Exam Guidelines
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Print your exam pass in colour before your exam date.',
                    'Arrive at least 30 minutes before the scheduled time.',
                    'Present your QR pass at the hall entrance for scanning.',
                    'Each code is single-use — it cannot be reused.',
                  ].map((tip, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-stone text-micro font-body font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-body-sm text-stone leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
