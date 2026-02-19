import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  QrCode,
  CreditCard,
  MapPin,
  CalendarDays,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';
import { PageTransition } from '../../components/layout/PageTransition';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function VerificationStatus() {
  const { user, studentData } = useStore();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearanceStatus, setClearanceStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?.id) return;

      try {
        // Fetch student record
        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (student) {
          setClearanceStatus({
            registrationComplete: student.registration_complete || false,
            paymentVerified: student.payment_verified || false,
            qrGenerated: student.qr_generated || false,
            matricNumber: student.matric_number,
            department: student.department,
            level: student.level,
          });

          // Fetch verification history (exam entry scans)
          const { data: verificationData } = await supabase
            .from('verifications')
            .select('*')
            .eq('student_id', student.id)
            .order('scanned_at', { ascending: false });

          if (verificationData) {
            setVerifications(verificationData);
          }
        } else {
          // Use studentData from store as fallback
          setClearanceStatus({
            registrationComplete: !!studentData,
            paymentVerified: studentData?.payment_verified || false,
            qrGenerated: studentData?.qr_generated || false,
            matricNumber: studentData?.matric_number || '',
            department: studentData?.department || '',
            level: studentData?.level || '',
          });
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user, studentData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" text="Loading verification status..." />
      </div>
    );
  }

  const steps = [
    {
      label: 'Profile Registration',
      done: clearanceStatus?.registrationComplete,
      icon: Shield,
      description: clearanceStatus?.registrationComplete
        ? `Registered as ${clearanceStatus.matricNumber}`
        : 'Complete your student profile to proceed',
    },
    {
      label: 'Payment Verified',
      done: clearanceStatus?.paymentVerified,
      icon: CreditCard,
      description: clearanceStatus?.paymentVerified
        ? 'University fees confirmed'
        : 'Awaiting payment confirmation',
    },
    {
      label: 'QR Pass Generated',
      done: clearanceStatus?.qrGenerated,
      icon: QrCode,
      description: clearanceStatus?.qrGenerated
        ? 'Your exam entry pass is ready'
        : 'Generate your QR pass after payment',
    },
    {
      label: 'Exam Entry',
      done: verifications.some(v => v.status === 'approved'),
      icon: CheckCircle,
      description: verifications.some(v => v.status === 'approved')
        ? 'Entry granted to examination hall'
        : 'Present QR code at exam venue',
    },
  ];

  const completedSteps = steps.filter(s => s.done).length;
  const progressPercent = Math.round((completedSteps / steps.length) * 100);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 py-12 px-4 font-body text-slate-900">
        <div className="max-w-[900px] mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
              Verification Status
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Track your exam clearance progress and verification history
            </p>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-premium p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold text-slate-900">Clearance Progress</h2>
              <span className="text-2xl font-heading font-bold text-primary">{progressPercent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-primary rounded-full"
              />
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-4 p-5 rounded-xl transition-colors ${
                      step.done
                        ? 'bg-emerald-50/50 border border-emerald-100'
                        : 'bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      step.done
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {step.done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-bold ${step.done ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {step.label}
                        </p>
                        {step.done ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 uppercase">
                            Complete
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 uppercase">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            {!clearanceStatus?.qrGenerated && clearanceStatus?.paymentVerified && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <Link
                  to="/student/qr-code"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  Generate Your QR Pass
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {!clearanceStatus?.registrationComplete && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <Link
                  to="/student/register"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
                >
                  <Shield className="w-4 h-4" />
                  Complete Registration
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.div>

          {/* Verification History */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-premium p-8"
          >
            <h2 className="text-xl font-heading font-bold text-slate-900 mb-6">Scan History</h2>

            {verifications.length > 0 ? (
              <div className="space-y-4">
                {verifications.map((v, index) => (
                  <motion.div
                    key={v.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-5 rounded-xl border ${
                      v.status === 'approved'
                        ? 'bg-emerald-50/50 border-emerald-100'
                        : 'bg-red-50/50 border-red-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        v.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-red-100 text-red-500'
                      }`}>
                        {v.status === 'approved' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${
                          v.status === 'approved' ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {v.status === 'approved' ? 'Entry Approved' : 'Entry Denied'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {v.exam_hall && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="w-3 h-3" />
                              {v.exam_hall}
                            </span>
                          )}
                          {v.scanned_at && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <CalendarDays className="w-3 h-3" />
                              {new Date(v.scanned_at).toLocaleDateString()} {new Date(v.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        {v.denial_reason && (
                          <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            Reason: {v.denial_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">No scan records yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Your verification history will appear here after examiners scan your QR code
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
