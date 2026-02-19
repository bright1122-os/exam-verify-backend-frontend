import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  examinerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  qrCodeToken: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['approved', 'denied'],
    required: true,
  },
  examHall: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  denialReason: {
    type: String,
  },
  verifiedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

verificationSchema.index({ studentId: 1 });
verificationSchema.index({ examinerId: 1 });
verificationSchema.index({ verifiedAt: -1 });

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification;
