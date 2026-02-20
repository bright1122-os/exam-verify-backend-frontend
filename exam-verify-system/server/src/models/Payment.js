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
        default: 15000,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
    },
    remitaStatus: String,
    transactionDate: Date,
    remitaResponse: mongoose.Schema.Types.Mixed,
}, {
    timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
