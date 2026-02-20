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
        required: [true, 'Please add a matric number'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    department: {
        type: String,
        required: [true, 'Please add a department'],
        trim: true,
    },
    faculty: {
        type: String,
        required: [true, 'Please add a faculty'],
        trim: true,
    },
    level: {
        type: String,
        enum: ['100', '200', '300', '400', '500'],
        required: [true, 'Please add a level'],
    },
    photoUrl: {
        type: String,
        required: [true, 'Please add a photo'],
    },
    photoPublicId: String,
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
    qrCodeUsedAt: Date,
    examDetails: {
        examDate: Date,
        examVenue: String,
        examTime: String,
    }
}, {
    timestamps: true,
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
