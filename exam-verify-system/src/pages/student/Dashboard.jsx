import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, QrCode, CreditCard, User, ArrowRight, Shield, AlertTriangle, GraduationCap, FileText, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import api from '../../services/api';
import { PageTransition } from '../../components/layout/PageTransition';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { generateAvatar } from '../../utils/mockImages';

export default function Dashboard() {
  const { user } = useStore();
  const [student, setStudent] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (!user) return;

        const res = await api.get('/student/dashboard');
        const data = res.data;

        if (data?.student) {
          setStudent(data.student);
        }
        if (data?.payment) {
          setPayment(data.payment);
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const progressSteps = [
    {
      title: 'Profile Setup',
      completed: student?.registrationComplete,
      icon: User,
      desc: 'Personal & Academic Info'
    },
    {
      title: 'Fee Payment',
      completed: student?.paymentVerified,
      icon: CreditCard,
      desc: 'Verification via Remita'
    },
    {
      title: 'Exam Pass',
      completed: student?.qrCodeGenerated,
      icon: QrCode,
      desc: 'Ready for download'
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 py-12 px-4 font-body text-slate-900">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Student Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage your examination clearance status</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-sm font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Operational
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[24px] p-8 shadow-premium border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden"
              >
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <img
                  src={student?.photoUrl || generateAvatar(user?.name || 'Student')}
                  alt="Student"
                  className="w-24 h-24 rounded-2xl object-cover shadow-md border-4 border-white ring-1 ring-slate-100"
                />
                <div className="flex-1 text-center md:text-left z-10">
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">{user?.name || 'Student'}</h2>
                  <p className="text-slate-500 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
                    <GraduationCap className="w-4 h-4" />
                    {student?.matricNumber || 'Matriculation Number Pending'}
                  </p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-200">
                      {student?.department || 'Department'}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-200">
                      {student?.faculty || 'Faculty'}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-200">
                      {student?.level || 'Level'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Progress Tracker */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[24px] p-8 shadow-premium border border-slate-100"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">Clearance Status</h2>
                    <p className="text-slate-500 text-xs font-medium">Complete all steps to proceed</p>
                  </div>
                </div>

                <div className="relative">
                  {/* Connector Line */}
                  <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-slate-100 -z-0" />

                  <div className="space-y-8">
                    {progressSteps.map((step, index) => (
                      <div key={step.title} className="relative z-10 flex items-start gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-4 border-white shadow-sm transition-colors ${step.completed
                          ? 'bg-success text-white ring-2 ring-success/20'
                          : 'bg-slate-100 text-slate-400 ring-2 ring-slate-100'
                          }`}>
                          {step.completed ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                        </div>
                        <div className="pt-2">
                          <h3 className={`text-base font-bold ${step.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                            {step.title}
                          </h3>
                          <p className="text-sm text-slate-400 font-medium">{step.desc}</p>
                        </div>
                        {step.completed && (
                          <div className="ml-auto pt-2">
                            <span className="px-2 py-1 bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider rounded">
                              Completed
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Payment Details */}
              {payment && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-[24px] p-8 shadow-premium border border-slate-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Payment History</h2>
                  </div>

                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">RRR Reference</p>
                      <p className="font-mono font-medium text-slate-900 select-all">{payment.rrr}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                      <p className="font-bold text-slate-900">₦{payment.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                      <p className="font-medium text-slate-900">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider ${payment.status === 'verified' || payment.status === 'completed' ? 'text-success' : 'text-amber-600'
                        }`}>
                        {payment.status === 'verified' || payment.status === 'completed' ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar / Actions */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800 rounded-[24px] p-8 text-white shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />

                <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
                <p className="text-slate-400 text-sm mb-6">Common tasks for your exam preparation</p>

                <div className="space-y-3">
                  {!student?.qrCodeGenerated ? (
                    <Link to="/student/register" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group-hover:border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-sm">Complete Registration</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  ) : (
                    <Link to="/student/qr-code" className="flex items-center justify-between p-4 rounded-xl bg-success/20 hover:bg-success/30 border border-success/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-success flex items-center justify-center">
                          <QrCode className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-sm block">Download Exam Pass</span>
                          <span className="text-[10px] text-success-300 uppercase tracking-wider font-bold">Ready</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </Link>
                  )}

                  <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-slate-300" />
                      </div>
                      <span className="font-medium text-sm text-slate-300">View Guidelines</span>
                    </div>
                  </button>
                </div>
              </motion.div>

              {/* Exam Tips / Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-[24px] p-8 shadow-premium border border-slate-100"
              >
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Exam Guidelines
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                    <span>Ensure your exam pass is printed clearly in color.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                    <span>Arrive 30 minutes before your scheduled time.</span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                    <span>Biometric verification is mandatory at the entrance.</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
