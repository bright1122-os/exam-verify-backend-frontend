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
    notes: String,
    denialReason: {
        type: String,
        required: function () { return this.status === 'denied'; }
    },
    verifiedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

const Verification = mongoose.model('Verification', verificationSchema);
export default Verification;
