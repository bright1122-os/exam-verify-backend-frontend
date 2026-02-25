import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  User, Camera, CreditCard, CheckCircle, ArrowLeft, ArrowRight,
  Upload, X, Loader2, ShieldCheck, FileText, GraduationCap
} from 'lucide-react';
import { PageTransition } from '../../components/layout/PageTransition';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useStore } from '../../store/useStore';

const steps = [
  { id: 1, title: 'Identity',  subtitle: 'Academic details',  icon: GraduationCap },
  { id: 2, title: 'Photo',     subtitle: 'Passport photo',    icon: Camera },
  { id: 3, title: 'Payment',   subtitle: 'Fee verification',  icon: CreditCard },
  { id: 4, title: 'Complete',  subtitle: 'All done',          icon: CheckCircle },
];

const faculties = [
  'Science', 'Engineering', 'Arts', 'Social Sciences', 'Law',
  'Medicine', 'Education', 'Agriculture', 'Management Sciences',
  'Environmental Sciences', 'Pharmacy',
];

const levels = ['100', '200', '300', '400', '500', '600'];

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
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (data) {
        setPaymentData(data);
        if (currentStep < 3) setCurrentStep(3);
      }
    };
    fetchPendingPayment();
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Photo must be less than 10MB'); return; }
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) { toast.error('Only JPG, PNG, or WEBP files are allowed'); return; }
    setPhotoFile(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = (e) => {
    e.stopPropagation();
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadPhoto = async () => {
    // Guard 1: Supabase environment variables not configured
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
        'to your environment variables, then redeploy.'
      );
    }

    // Guard 2: Basic preconditions
    if (!photoFile) throw new Error('No photo file selected');
    if (!user) throw new Error('Not authenticated — please log in again');

    const fileExt = photoFile.name.split('.').pop().toLowerCase();
    // Include user ID in path so each student's photo is isolated in storage
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    // upsert: true — overwrites if the same path exists (safe for retry / re-upload)
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, photoFile, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      // Translate Supabase storage error codes to actionable messages
      const msg = uploadError.message || '';
      if (msg.includes('Bucket not found') || msg.includes('bucket') || uploadError.statusCode === 404) {
        throw new Error(
          'Storage bucket "photos" not found. Run the SQL migration in Supabase SQL Editor to create it.'
        );
      }
      if (msg.includes('row-level security') || msg.includes('policy') || uploadError.statusCode === 403) {
        throw new Error(
          'Upload blocked by storage policy. Ensure the "photos" bucket allows authenticated uploads.'
        );
      }
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        throw new Error(
          'Network error — could not reach Supabase. Check that VITE_SUPABASE_URL is correct in your environment variables.'
        );
      }
      // Fallback: surface the raw error
      throw new Error(`Upload failed: ${msg}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Photo uploaded but URL could not be retrieved. Contact support.');
    }

    return publicUrlData.publicUrl;
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const valid = await trigger(['matricNumber', 'faculty', 'department', 'level']);
      if (!valid) return;
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!photoFile) { toast.error('Please upload your passport photo'); return; }
      setLoading(true);
      try {
        const values = getValues();
        const photoUrl = await uploadPhoto();

        const { error: insertError } = await supabase.from('students').insert({
          user_id: user.id,
          matric_number: values.matricNumber,
          faculty: values.faculty,
          department: values.department,
          level: values.level,
          photo_url: photoUrl,
          registration_complete: true,
        });
        if (insertError) throw insertError;

        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert({ user_id: user.id, amount: 5000, rrr: 'TEST-SUCCESS', status: 'pending' })
          .select()
          .single();
        if (paymentError) throw paymentError;

        setPaymentData(payment);
        updateStudentData({ registrationComplete: true, photoUrl });
        toast.success('Profile saved. Proceeding to payment.');
        setCurrentStep(3);
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (currentStep === 3) {
      setLoading(true);
      try {
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rrr: paymentData.rrr, amount: paymentData.amount, user_id: user.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (paymentData.rrr === 'TEST-SUCCESS' || String(paymentData.rrr).startsWith('RRR-')) {
            toast.success('Demo Payment Verified!');
          } else {
            throw new Error(data.error || 'Verification failed');
          }
        } else if (data && !data.success) {
          throw new Error(data.message || 'Payment invalid');
        }

        updateStudentData({ registrationComplete: true });
        setCurrentStep(4);
      } catch (error) {
        toast.error(error.message || 'Could not verify payment');
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const activeStep = steps[currentStep - 1];

  return (
    <div className="min-h-screen flex bg-parchment selection:bg-primary/10">

      {/* ── Left Panel — Branding + Step Progress ── */}
      <div className="hidden lg:flex lg:w-[38%] bg-ink relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-success/5 rounded-full blur-[110px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/[0.06] border border-white/[0.08] rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white/60" />
          </div>
          <span className="font-heading font-bold text-white/80 text-xl">ExamVerify</span>
        </div>

        {/* Middle copy */}
        <div className="relative z-10 max-w-xs">
          <h2 className="text-display-sm font-heading font-bold text-white mb-4 leading-tight">
            Set up your <span className="text-editorial text-primary-light">exam pass</span>
          </h2>
          <p className="text-body-md text-white/30 leading-relaxed mb-10">
            Complete the registration steps to receive your encrypted digital exam pass. Takes about 3 minutes.
          </p>

          {/* Step sidebar */}
          <div className="space-y-4">
            {steps.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent  = currentStep === step.id;
              const StepIcon   = step.icon;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 transition-all duration-300 ${
                    isCurrent  ? 'opacity-100' :
                    isCompleted ? 'opacity-60'  : 'opacity-25'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isCompleted ? 'bg-success/20 border border-success/30' :
                    isCurrent   ? 'bg-primary/20 border border-primary/30' :
                                  'bg-white/[0.04] border border-white/[0.06]'
                  }`}>
                    {isCompleted
                      ? <CheckCircle className="w-4 h-4 text-success" />
                      : <StepIcon className={`w-4 h-4 ${isCurrent ? 'text-primary-light' : 'text-white/40'}`} />
                    }
                  </div>
                  <div>
                    <p className={`text-sm font-body font-semibold leading-none mb-0.5 ${
                      isCurrent ? 'text-white' : 'text-white/50'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-micro uppercase tracking-widest text-white/25 font-body">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom note */}
        <div className="relative z-10">
          <p className="text-micro uppercase tracking-widest text-white/20 font-body">
            All data is encrypted in transit and at rest
          </p>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Mobile header */}
        <div className="lg:hidden w-full max-w-[480px] flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-heading font-bold text-anthracite">ExamVerify</span>
          </div>
          {/* Mobile step dots */}
          <div className="flex gap-2">
            {steps.map(s => (
              <div
                key={s.id}
                className={`rounded-full transition-all duration-300 ${
                  currentStep === s.id  ? 'w-6 h-2 bg-primary' :
                  currentStep > s.id   ? 'w-2 h-2 bg-success'  :
                                         'w-2 h-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-[480px]"
        >
          {/* Step heading */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-label uppercase font-body font-semibold text-stone tracking-widest">
                Step {currentStep} of {steps.length - 1}
              </span>
            </div>
            <h1 className="text-display-sm font-heading font-bold text-anthracite mb-1">
              {activeStep.title}
            </h1>
            <p className="text-body-md text-stone">{activeStep.subtitle}</p>
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">

            {/* ── Step 1: Identity ── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-5"
              >
                <div className="group">
                  <label className="block text-label uppercase font-body font-semibold text-slate-500 mb-2.5 ml-0.5 group-focus-within:text-primary transition-colors">
                    Matriculation Number
                  </label>
                  <input
                    {...register('matricNumber', { required: 'Matric number is required' })}
                    className="input-premium"
                    placeholder="e.g. 2023/SCI/001"
                  />
                  {errors.matricNumber && (
                    <p className="text-red-500 text-body-sm mt-1.5 font-body font-medium">
                      {errors.matricNumber.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-label uppercase font-body font-semibold text-slate-500 mb-2.5 ml-0.5 group-focus-within:text-primary transition-colors">
                      Faculty
                    </label>
                    <div className="relative">
                      <select
                        {...register('faculty', { required: 'Required' })}
                        className="input-premium appearance-none"
                      >
                        <option value="">Select</option>
                        {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                    {errors.faculty && (
                      <p className="text-red-500 text-body-sm mt-1.5 font-body font-medium">
                        {errors.faculty.message}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-label uppercase font-body font-semibold text-slate-500 mb-2.5 ml-0.5 group-focus-within:text-primary transition-colors">
                      Level
                    </label>
                    <div className="relative">
                      <select
                        {...register('level', { required: 'Required' })}
                        className="input-premium appearance-none"
                      >
                        <option value="">Select</option>
                        {levels.map(l => <option key={l} value={l}>{l} Level</option>)}
                      </select>
                      <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                    {errors.level && (
                      <p className="text-red-500 text-body-sm mt-1.5 font-body font-medium">
                        {errors.level.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-label uppercase font-body font-semibold text-slate-500 mb-2.5 ml-0.5 group-focus-within:text-primary transition-colors">
                    Department
                  </label>
                  <input
                    {...register('department', { required: 'Department is required' })}
                    className="input-premium"
                    placeholder="e.g. Computer Science"
                  />
                  {errors.department && (
                    <p className="text-red-500 text-body-sm mt-1.5 font-body font-medium">
                      {errors.department.message}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Photo ── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <p className="text-body-sm text-stone mb-6">
                  Upload a clear, front-facing passport photograph. This will appear on your exam pass.
                </p>

                {!photoPreview ? (
                  <label className="group relative w-full h-64 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/[0.02] transition-all duration-300 bg-white">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 group-hover:bg-primary/5 transition-all duration-300 border border-slate-100">
                      <Upload className="w-7 h-7 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="font-body font-semibold text-slate-700 group-hover:text-primary transition-colors text-base">
                      Click to upload photo
                    </p>
                    <p className="text-body-sm text-stone mt-1">JPG, PNG or WEBP · Max 10MB</p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </label>
                ) : (
                  <div className="relative flex justify-center">
                    <div className="w-52 h-52 rounded-2xl overflow-hidden border-4 border-white shadow-premium-lg ring-1 ring-slate-200">
                      <img src={photoPreview} alt="Passport preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={removePhoto}
                      className="absolute -top-3 right-[calc(50%-100px)] w-9 h-9 bg-white text-red-500 rounded-full flex items-center justify-center shadow-premium hover:bg-red-50 border border-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                      <label className="cursor-pointer px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-body-sm font-body font-semibold text-slate-600 border border-slate-200 hover:bg-white hover:text-primary transition-all shadow-sm">
                        Change photo
                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                      </label>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Step 3: Payment ── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-5"
              >
                {paymentData ? (
                  <>
                    {/* Payment reference card */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-5 opacity-[0.04]">
                        <FileText className="w-28 h-28" />
                      </div>
                      <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center">
                          <span className="text-label uppercase font-body font-semibold text-stone tracking-wider">
                            Reference (RRR)
                          </span>
                          <span className="font-mono text-sm font-bold text-anthracite bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 select-all">
                            {paymentData.rrr}
                          </span>
                        </div>
                        <div className="h-px bg-slate-100" />
                        <div className="flex justify-between items-center">
                          <span className="text-label uppercase font-body font-semibold text-stone tracking-wider">
                            Amount Due
                          </span>
                          <span className="text-heading-sm font-heading font-bold text-anthracite">
                            ₦{paymentData.amount?.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-px bg-slate-100" />
                        <div className="flex justify-between items-center">
                          <span className="text-label uppercase font-body font-semibold text-stone tracking-wider">
                            Status
                          </span>
                          <span className="badge-warning">Pending</span>
                        </div>
                      </div>
                    </div>

                    {/* Instruction */}
                    <div className="flex gap-3 p-4 bg-primary/[0.04] rounded-xl border border-primary/10">
                      <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-body-sm text-slate-600 font-body leading-relaxed">
                        Complete payment on Remita using the reference above, then click{' '}
                        <strong className="text-primary">Verify Payment</strong> below.
                      </p>
                    </div>

                    <a
                      href={`https://remitademo.net/remita/onepage/biller/${paymentData.rrr}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary w-full justify-center group flex items-center gap-2"
                    >
                      Go to Remita
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="text-stone font-body font-medium">Generating payment reference…</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Step 4: Complete ── */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-success" />
                </div>
                <h2 className="text-heading-lg font-heading font-bold text-anthracite mb-3">
                  You&apos;re all set!
                </h2>
                <p className="text-body-md text-stone max-w-sm mx-auto mb-8 leading-relaxed">
                  Your profile is complete and payment verified. Your digital exam pass is ready.
                </p>
                <button
                  onClick={() => navigate('/student/dashboard')}
                  className="btn-primary px-10 py-4 text-base"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ── Navigation ── */}
          {currentStep < 4 && (
            <div className={`flex mt-8 ${currentStep > 1 ? 'justify-between' : 'justify-end'} items-center`}>
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-2 px-4 py-2.5 text-body-sm font-body font-semibold text-stone hover:text-anthracite hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}

              <button
                onClick={nextStep}
                disabled={loading}
                className="btn-primary px-8"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {currentStep === 3 ? 'Verify Payment' : 'Continue'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
