const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true,
        lowercase: true,
        trim: true
    },
    hashedOtp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['signin', 'signup', 'password_reset'],
        default: 'signin'
    },
    attempts: {
        type: Number,
        default: 0
    },
    lastSentAt: {
        type: Date,
        default: Date.now
    },
    requestCount: {
        type: Number,
        default: 1
    },
    windowStart: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // MongoDB TTL index to auto-remove expired documents
    }
}, {
    timestamps: true
});

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
