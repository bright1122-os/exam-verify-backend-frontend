import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  rrr: {
    type: String,
    unique: true,
    sparse: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  remitaStatus: {
    type: String,
  },
  transactionDate: {
    type: Date,
  },
  remitaResponse: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

paymentSchema.index({ studentId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ rrr: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
