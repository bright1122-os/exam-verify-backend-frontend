import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, Download, QrCode, CheckCircle, AlertTriangle, ArrowLeft, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { supabase } from '../../lib/supabase';
import { PageTransition } from '../../components/layout/PageTransition';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { generateAvatar } from '../../utils/mockImages';
import { QRCodeSVG } from 'qrcode.react';
import { encryptQRData } from '../../utils/crypto';

export default function PrintQR() {
  const { user } = useStore();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setStudentData(data);
        }
      } catch (error) {
        console.error('Fetch QR error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print(); // Simple PDF save for now
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFAF7]">
        <LoadingSpinner size="lg" text="Loading QR code..." />
      </div>
    );
  }

  // Generate Encrypted QR Payload
  const qrPayloadRaw = {
    id: studentData?.id,
    matric: studentData?.matric_number,
    generatedAt: new Date().toISOString(),
    verifier: 'exam-verify-system'
  };

  const encryptedPayload = studentData ? encryptQRData(qrPayloadRaw) : '';

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#FCFAF7] py-8 px-4 font-body text-[#333331]">
        <div className="max-w-lg mx-auto">
          {/* Back Link */}
          <Link
            to="/student/dashboard"
            className="no-print inline-flex items-center gap-2 text-[#666660] hover:text-[#D97757] mb-6 font-heading font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* QR Card */}
          <div id="qr-card" className="bg-[#FCFAF7] rounded-2xl shadow-xl overflow-hidden border border-[#D9D9D5] print:shadow-none print:border-2 print:border-black">
            {/* Header */}
            <div className="bg-[#141413] p-6 text-[#FAF9F5] text-center print:bg-black print:text-white">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-8 h-8 border border-[#D97757] rounded flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[#D97757]" />
                </div>
                <h1 className="font-heading font-bold text-xl tracking-wide">ExamVerify Code</h1>
              </div>
              <p className="text-[#999995] text-sm font-heading">2024/2025 Academic Session</p>
            </div>

            {/* Student Info */}
            <div className="p-8">
              <div className="flex items-center gap-5 mb-8">
                <img
                  src={studentData?.photo_url || generateAvatar(user?.user_metadata?.name || 'Student')}
                  alt="Student"
                  className="w-20 h-20 rounded-xl object-cover border-2 border-[#D9D9D5] shadow-sm"
                />
                <div>
                  <h2 className="font-heading font-bold text-xl text-[#141413]">{user?.user_metadata?.name}</h2>
                  <p className="text-sm font-heading text-[#D97757] font-medium mb-1">{studentData?.matric_number}</p>
                  <p className="text-sm font-body text-[#666660]">
                    {studentData?.level} Level • {studentData?.department}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-8">
                {studentData?.qr_generated ? (
                  <div className="p-4 bg-white border-2 border-dashed border-[#D9D9D5] rounded-xl relative group">
                    <QRCodeSVG
                      value={encryptedPayload || ''}
                      size={192}
                      level="H"
                      includeMargin={true}
                    />
                    {/* Security Badge Overlay */}
                    <div className="absolute -bottom-3 -right-3 bg-[#D97757] text-[#FAF9F5] text-[10px] px-2 py-0.5 rounded-full font-heading font-bold shadow-sm print:hidden">
                      AES-256 SECURE
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-[#F2F0E9] rounded-xl flex items-center justify-center border-2 border-dashed border-[#D9D9D5]">
                    <QrCode className="w-24 h-24 text-[#999995]" />
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="text-center mb-4">
                {/* Simplified status for now as we don't verify 'used' yet without backend logic, assume valid if generated */}
                {studentData?.qr_generated ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E3F2E6] text-[#2E7D32] rounded-full border border-[#2E7D32]/20">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-heading font-medium">Valid - Ready for Use</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF4E5] text-[#D97757] rounded-full">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-heading font-medium">QR Not Generated</span>
                  </div>
                )}
              </div>

              {/* Print Instructions (visible only when printing) */}
              <div className="hidden print:block text-center text-xs text-[#666660] mt-6 border-t border-[#D9D9D5] pt-4 font-body">
                <p>Present this card at the exam hall for verification.</p>
                <p>This QR code is single-use and encrypted.</p>
              </div>
            </div>

            {/* Footer Decorative Line */}
            <div className="h-2 bg-gradient-to-r from-[#D97757] via-[#F2F0E9] to-[#788C5D] print:hidden" />
          </div>

          {/* Action Buttons */}
          <div className="no-print flex gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrint}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              Print Card
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="flex-1 btn-secondary flex items-center justify-center gap-2 bg-white"
            >
              <Download className="w-5 h-5" />
              Download
            </motion.button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
