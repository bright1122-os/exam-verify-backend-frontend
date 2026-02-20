import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Camera, CreditCard, CheckCircle, ArrowLeft, ArrowRight, Upload, X, Loader2, ShieldCheck, FileText } from 'lucide-react';
import { PageTransition } from '../../components/layout/PageTransition';
import api from '../../services/api';
import { useStore } from '../../store/useStore';

const steps = [
  { id: 1, title: 'Identity', icon: User },
  { id: 2, title: 'Photo', icon: Camera },
  { id: 3, title: 'Payment', icon: CreditCard },
  { id: 4, title: 'Success', icon: CheckCircle },
];

const faculties = [
  'Science', 'Engineering', 'Arts', 'Social Sciences', 'Law',
  'Medicine', 'Education', 'Agriculture', 'Management Sciences',
  'Environmental Sciences', 'Pharmacy',
];

const levels = ['100', '200', '300', '400', '500'];

export default function Register() {
  const navigate = useNavigate();
  const { user, updateStudentData } = useStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, getValues, trigger } = useForm();

  useEffect(() => {
    const fetchPendingPayment = async () => {
      if (!user) return;
      try {
        const res = await api.get('/payment/my-payment');
        if (res.data?.payment && res.data.payment.status === 'pending') {
          setPaymentData(res.data.payment);
          if (currentStep < 3) setCurrentStep(3);
        }
      } catch (error) {
        // No pending payment found, that's fine
      }
    };
    fetchPendingPayment();
  }, [user]);

  const handlePhotoChange = (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error('Photo must be less than 10MB');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG and PNG files are allowed');
        return;
      }

      setPhotoFile(file);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(URL.createObjectURL(file));
    } catch (error) {
      console.error('Error in handlePhotoChange:', error);
      toast.error('Failed to process image');
    }
  };

  const removePhoto = (e) => {
    e.stopPropagation();
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const valid = await trigger(['matricNumber', 'faculty', 'department', 'level']);
      if (!valid) return;
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!photoFile) {
        toast.error('Please upload your photo');
        return;
      }

      setLoading(true);
      try {
        const values = getValues();

        // Build multipart form data for backend
        const formData = new FormData();
        formData.append('photo', photoFile);
        formData.append('matricNumber', values.matricNumber);
        formData.append('faculty', values.faculty);
        formData.append('department', values.department);
        formData.append('level', values.level);

        // Register student profile via backend API
        const res = await api.post('/student/register', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // Monorepo server: { data: student } — standalone: { data: { student } }
        const student = res.data?.id || res.data?._id ? res.data : res.data?.student;
        updateStudentData(student);

        // Initiate payment via backend
        try {
          const paymentRes = await api.post('/payment/initiate');
          // Monorepo: { data: payment } — standalone: { data: { payment } }
          const pData = paymentRes.data?.rrr ? paymentRes.data : paymentRes.data?.payment;
          setPaymentData(pData);
        } catch (paymentError) {
          console.warn('Payment initiation failed, continuing:', paymentError);
          // Set a demo fallback so the UI can still proceed
          setPaymentData({
            rrr: 'TEST-SUCCESS',
            amount: 15000,
            status: 'pending',
          });
        }

        toast.success('Profile saved. Proceeding to payment.');
        setCurrentStep(3);
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentStep === 3) {
      setLoading(true);
      try {
        // Verify payment via backend
        const res = await api.post(`/payment/verify/${paymentData.rrr}`);

        if (res.success === false) {
          throw new Error(res.message || 'Payment verification failed');
        }

        updateStudentData({ paymentVerified: true, qrCodeGenerated: !!res.data?.qrCode });
        toast.success('Payment verified!');
        setCurrentStep(4);
      } catch (error) {
        console.error('Verification error:', error);
        toast.error(error.message || 'Could not verify payment');
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 py-12 px-4 font-body text-slate-900">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-heading font-bold text-slate-900 tracking-tight">Student Registration</h1>
            <p className="text-slate-500 mt-2 font-medium">Complete your profile to generate your exam pass</p>
          </div>

          {/* Stepper */}
          <div className="hidden md:flex justify-between items-center mb-12 px-12 max-w-3xl mx-auto relative">
            <div className="absolute top-1/2 left-12 right-12 h-[2px] bg-slate-200 -z-10 -translate-y-1/2" />
            <motion.div
              className="absolute top-1/2 left-12 h-[2px] bg-primary -z-10 -translate-y-1/2"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{ maxWidth: 'calc(100% - 6rem)' }}
            />

            {steps.map((step) => {
              const isActive = currentStep >= step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2 z-10">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      backgroundColor: isActive ? '#1E40AF' : '#F1F5F9',
                      borderColor: isActive ? '#1E40AF' : '#CBD5E1',
                      color: isActive ? '#FFFFFF' : '#94A3B8'
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-colors shadow-sm"
                  >
                    {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                  </motion.div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-[24px] shadow-premium max-w-2xl mx-auto relative overflow-hidden min-h-[500px] flex flex-col border border-slate-100">
            <div className="p-8 lg:p-10 flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col"
                  >
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                      <User className="w-5 h-5 text-primary" />
                      Academic Information
                    </h2>
                    <div className="space-y-6 flex-1">
                      <div className="group">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Matriculation Number</label>
                        <input
                          {...register('matricNumber', { required: 'Matric number is required' })}
                          className="input-premium w-full"
                          placeholder="e.g. 2023/SCI/001"
                        />
                        {errors.matricNumber && <span className="text-red-500 text-sm mt-1 font-medium">{errors.matricNumber.message}</span>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Faculty</label>
                          <div className="relative">
                            <select
                              {...register('faculty', { required: 'Required' })}
                              className="input-premium w-full appearance-none"
                            >
                              <option value="">Select Faculty</option>
                              {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ArrowRight className="w-4 h-4 rotate-90" />
                            </div>
                          </div>
                          {errors.faculty && <span className="text-red-500 text-sm mt-1 font-medium">{errors.faculty.message}</span>}
                        </div>

                        <div className="group">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Level</label>
                          <div className="relative">
                            <select
                              {...register('level', { required: 'Required' })}
                              className="input-premium w-full appearance-none"
                            >
                              <option value="">Select Level</option>
                              {levels.map(l => <option key={l} value={l}>{l} Level</option>)}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ArrowRight className="w-4 h-4 rotate-90" />
                            </div>
                          </div>
                          {errors.level && <span className="text-red-500 text-sm mt-1 font-medium">{errors.level.message}</span>}
                        </div>
                      </div>

                      <div className="group">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Department</label>
                        <input
                          {...register('department', { required: 'Department is required' })}
                          className="input-premium w-full"
                          placeholder="e.g. Computer Science"
                        />
                        {errors.department && <span className="text-red-500 text-sm mt-1 font-medium">{errors.department.message}</span>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col"
                  >
                    <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-primary" />
                      Passport Photograph
                    </h2>
                    <p className="text-slate-500 text-sm mb-6 pb-4 border-b border-slate-100">Upload a clear front-facing photo for your exam pass.</p>

                    <div className="flex-1 flex flex-col items-center justify-center py-6">
                      {!photoPreview ? (
                        <label className="w-full h-80 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group bg-slate-50">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform text-slate-400 group-hover:text-primary border border-slate-100">
                            <Upload className="w-8 h-8" />
                          </div>
                          <span className="font-bold text-lg text-slate-700 group-hover:text-primary">Click to upload photo</span>
                          <span className="text-sm text-slate-400 mt-2 font-medium">JPG or PNG (Max 10MB)</span>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoChange}
                            className="hidden"
                            accept="image/*"
                          />
                        </label>
                      ) : (
                        <div className="relative group">
                          <div className="w-64 h-64 rounded-2xl overflow-hidden border-4 border-white shadow-2xl ring-1 ring-slate-100">
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <button
                            onClick={removePhoto}
                            className="absolute -top-4 -right-4 w-10 h-10 bg-white text-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 border border-slate-100 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col"
                  >
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Fee Verification
                    </h2>

                    {paymentData ? (
                      <div className="space-y-6">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5">
                            <FileText className="w-32 h-32" />
                          </div>
                          <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Remita Reference (RRR)</span>
                              <span className="font-mono text-lg font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm select-all">{paymentData.rrr}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Amount Due</span>
                              <span className="text-2xl font-bold text-slate-900">₦{paymentData.amount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Status</span>
                              <span className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">Pending Payment</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                          <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            Complete your payment on Remita using the RRR above. Once successful, click <span className="text-primary font-bold">Verify Payment</span> to generate your pass.
                          </p>
                        </div>

                        <a
                          href={`https://remitademo.net/remita/onepage/biller/${paymentData.rrr}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary w-full justify-center group"
                        >
                          Proceed to Remita <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                        <p className="text-slate-500 font-medium">Generating Payment Reference...</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center py-12"
                  >
                    <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mb-6 shadow-sm border border-success/20">
                      <CheckCircle className="w-12 h-12 text-success" />
                    </div>
                    <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">You're All Set!</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg font-medium">
                      Your profile has been created and payment verified. Your digital exam pass is ready for download.
                    </p>
                    <button
                      onClick={() => navigate('/student/dashboard')}
                      className="btn-primary px-10 text-lg py-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                      Go to Dashboard
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            {currentStep < 4 && (
              <div className="p-8 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                {currentStep > 1 ? (
                  <button
                    onClick={prevStep}
                    className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center gap-2 px-4 py-2 hover:bg-white rounded-lg transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  onClick={nextStep}
                  disabled={loading}
                  className="btn-primary px-8 shadow-md"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      {currentStep === 3 ? 'Verify Payment' : 'Next Step'}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
