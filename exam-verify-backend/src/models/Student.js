import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  matricNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
  },
  faculty: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
    enum: ['100', '200', '300', '400', '500'],
  },
  photoUrl: {
    type: String,
    required: true,
  },
  photoPublicId: {
    type: String,
  },
  registrationComplete: {
    type: Boolean,
    default: false,
  },
  paymentVerified: {
    type: Boolean,
    default: false,
  },
  qrCodeGenerated: {
    type: Boolean,
    default: false,
  },
  qrCodeToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  qrCodeUsed: {
    type: Boolean,
    default: false,
  },
  qrCodeUsedAt: {
    type: Date,
  },
  examDetails: {
    examDate: Date,
    examVenue: String,
    examTime: String,
  },
}, {
  timestamps: true,
});

studentSchema.index({ userId: 1 });
studentSchema.index({ matricNumber: 1 });
studentSchema.index({ qrCodeToken: 1 });

const Student = mongoose.model('Student', studentSchema);

export default Student;
