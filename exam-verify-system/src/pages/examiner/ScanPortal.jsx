import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';
import { Camera, QrCode, CheckCircle, XCircle, RefreshCw, User, Shield, ArrowLeft, Search, Keyboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';
import { PageTransition } from '../../components/layout/PageTransition';
import { decryptQRData } from '../../utils/crypto';

export default function ScanPortal() {
  const { user } = useStore();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('scan'); // 'scan' or 'manual'
  const [manualInput, setManualInput] = useState('');

  // Verification States
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showDenyForm, setShowDenyForm] = useState(false);
  const [examHall, setExamHall] = useState('');
  const [notes, setNotes] = useState('');
  const [denialReason, setDenialReason] = useState('');

  const startCamera = useCallback(async () => {
    try {
      if (mode !== 'scan') return;
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        requestAnimationFrame(tick);
      }
    } catch (err) {
      toast.error('Camera access denied. Please enable camera permissions.');
      console.error('Camera error:', err);
    }
  }, [mode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setScanning(false);
  }, []);

  const tick = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleQRDetected(code.data);
        return;
      }
    }

    animationRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (mode === 'scan' && !result) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode, result, startCamera, stopCamera]);

  const handleQRDetected = async (qrDataString) => {
    stopCamera();
    if (navigator.vibrate) navigator.vibrate(200);

    setLoading(true);
    try {
      console.log('Scanned Raw:', qrDataString);
      const qrData = decryptQRData(qrDataString);

      if (!qrData) throw new Error('Invalid or Tampered QR Code.');
      if (qrData.verifier !== 'exam-verify-system') throw new Error('QR Code issuing authority mismatch.');

      await verifyStudent(qrData.id);

    } catch (error) {
      console.error('Scan Error:', error);
      setResult({
        success: false,
        message: error?.message || 'Verification failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    setLoading(true);
    try {
      // Find student by Matric Number
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .ilike('matric_number', manualInput.trim())
        .single();

      if (error || !student) throw new Error('Student not found with this Matric Number.');

      await verifyStudent(student.id);

    } catch (error) {
      console.error('Manual Verify Error:', error);
      setResult({
        success: false,
        message: error?.message || 'Verification failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyStudent = async (studentId) => {
    // Fetch Student with Profile
    const { data: student, error } = await supabase
      .from('students')
      .select(`
            *,
            profiles:profiles!user_id (full_name)
        `)
      .eq('id', studentId)
      .single();

    if (error || !student) throw new Error('Student record not found.');

    // Verification Logic
    if (!student.registration_complete) throw new Error('Student registration incomplete.');
    if (!student.payment_verified) throw new Error('Student fees NOT verified.');
    if (!student.qr_generated) throw new Error('Exam pass not generated.');

    setResult({
      success: true,
      student: {
        ...student,
        name: student.profiles?.full_name || 'Student'
      },
      message: 'Student Verified',
    });
    setShowApproveForm(true);
  };

  const handleApprove = async () => {
    if (!examHall) {
      toast.error('Please enter the exam hall');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('verifications')
        .insert({
          student_id: result.student.id,
          examiner_id: user.id,
          status: 'approved',
          exam_hall: examHall,
          notes: notes,
          scanned_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Student approved!');
      resetScan();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!denialReason) {
      toast.error('Please select a denial reason');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('verifications')
        .insert({
          student_id: result.student.id,
          examiner_id: user.id,
          status: 'denied',
          exam_hall: examHall || 'N/A',
          notes: notes,
          denial_reason: denialReason,
          scanned_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Entry denied');
      resetScan();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Denial failed');
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setResult(null);
    setShowApproveForm(false);
    setShowDenyForm(false);
    setExamHall('');
    setNotes('');
    setDenialReason('');
    setManualInput('');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 py-8 px-4 font-body text-slate-900">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/examiner/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors p-2 hover:bg-white rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Scan Portal
            </h1>
            <div className="w-9" />
          </div>

          {/* Mode Switcher */}
          {!result && (
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-6">
              <button
                onClick={() => setMode('scan')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'scan' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                <Camera className="w-4 h-4" /> Scan QR
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'manual' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                <Keyboard className="w-4 h-4" /> Manual Entry
              </button>
            </div>
          )}

          {/* Scanner / Input Area */}
          {!result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[24px] overflow-hidden border border-slate-200 shadow-premium min-h-[400px] flex flex-col"
            >
              {mode === 'scan' ? (
                <div className="relative flex-1 bg-black flex flex-col">
                  <div className="flex-1 relative overflow-hidden">
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Scanning Overlay */}
                    {scanning && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-2 border-primary/50 rounded-3xl relative">
                          <motion.div
                            className="absolute left-4 right-4 h-0.5 bg-primary shadow-[0_0_15px_rgba(37,99,235,0.8)]"
                            animate={{ top: ['10%', '90%', '10%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                          />
                          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                        </div>
                      </div>
                    )}

                    {!scanning && !loading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white">
                        <Camera className="w-12 h-12 text-slate-500 mb-4" />
                        <p className="text-slate-400 font-medium">Camera is inactive</p>
                      </div>
                    )}
                  </div>

                  {scanning && (
                    <div className="p-4 bg-white text-center">
                      <p className="text-sm text-slate-500">Align QR code within the frame</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Manual Input Form */
                <div className="flex-1 flex flex-col p-8">
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-400">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Search Student</h3>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">Enter the student's Matriculation Number to verify their clearance status manually.</p>

                    <form onSubmit={handleManualSubmit} className="w-full max-w-xs space-y-4">
                      <input
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder="e.g. 2023/SCI/001"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!manualInput.trim() || loading}
                        className="btn-primary w-full justify-center py-3.5"
                      >
                        {loading ? 'Verifying...' : 'Verify Student'}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {loading && mode === 'scan' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                  <div className="text-center text-white">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-medium">Verifying...</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Result Display */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-[24px] overflow-hidden shadow-premium border border-slate-100"
              >
                {result.success ? (
                  <>
                    <div className="bg-success p-6 text-white text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h2 className="font-heading font-bold text-2xl">Verified</h2>
                      <p className="text-success-100 text-sm font-medium">Clearance Confirmed</p>
                    </div>

                    <div className="p-6 md:p-8">
                      <div className="flex items-start gap-4 mb-8 pb-8 border-b border-slate-100">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                          {result.student.photo_url ? (
                            <img src={result.student.photo_url} alt="Student" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-xl leading-tight mb-1">{result.student.name}</h3>
                          <p className="text-primary font-bold font-mono text-sm mb-2">{result.student.matric_number}</p>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded">{result.student.department}</span>
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded">{result.student.level} Lvl</span>
                          </div>
                        </div>
                      </div>

                      {/* Approve Form */}
                      {showApproveForm && !showDenyForm && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Exam Hall</label>
                            <input
                              value={examHall}
                              onChange={(e) => setExamHall(e.target.value)}
                              className="input-premium w-full text-lg"
                              placeholder="e.g. Hall A"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes (Optional)</label>
                            <textarea
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="input-premium w-full min-h-[80px]"
                              placeholder="Internal notes..."
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-4">
                            <button
                              onClick={handleApprove}
                              disabled={loading}
                              className="btn-primary w-full justify-center py-3 bg-success hover:bg-success-600 border-success-600"
                            >
                              {loading ? 'Processing...' : 'Approve Entry'}
                            </button>
                            <button
                              onClick={() => setShowDenyForm(true)}
                              className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                            >
                              Deny Entry
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Deny Form */}
                      {showDenyForm && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3 text-red-700">
                            <Shield className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">You are about to deny entry to this student. This action will be logged.</p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason for Denial</label>
                            <select
                              value={denialReason}
                              onChange={(e) => setDenialReason(e.target.value)}
                              className="input-premium w-full"
                            >
                              <option value="">Select a reason...</option>
                              <option value="photo_mismatch">Identity Mismatch (Photo)</option>
                              <option value="expired_qr">Invalid/Expired Pass</option>
                              <option value="wrong_exam">Wrong Exam Hall/Time</option>
                              <option value="suspicious">Suspicious Behavior</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-4">
                            <button
                              onClick={() => setShowDenyForm(false)}
                              className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleDeny}
                              disabled={loading}
                              className="px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                            >
                              {loading ? 'Processing...' : 'Confirm Denial'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Error State */
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
                    <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">{result.message}</p>

                    <button
                      onClick={() => { resetScan(); setMode('scan'); }}
                      className="btn-primary w-full justify-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer security badge */}
          {!result && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Shield className="w-3 h-3" />
                Secured Examiner Portal
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
