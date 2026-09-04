const userModel = require('../models/user.model');
const Otp = require('../models/otp.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendOtpEmail } = require('../services/email.service');

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown
const MAX_ATTEMPTS = 5; // Max 5 verification attempts
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 OTP requests per 15 min window
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

/**
 * Serverless-safe helper: Generates cryptographically secure OTP,
 * stores it persistently in MongoDB, and dispatches via Nodemailer SMTP.
 */
async function dispatchOtp({ email, type }) {
    const now = Date.now();
    const existingRecord = await Otp.findOne({ email });

    // Rate limiting: 30-second cooldown check
    if (existingRecord && (now - existingRecord.lastSentAt.getTime()) < RESEND_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - existingRecord.lastSentAt.getTime())) / 1000);
        return {
            status: 429,
            body: {
                success: false,
                code: "COOLDOWN_ACTIVE",
                message: `Please wait ${waitSeconds}s before requesting a new code.`
            }
        };
    }

    // Rate limiting: window request count check
    let windowStart = existingRecord ? existingRecord.windowStart.getTime() : now;
    let requestCount = existingRecord ? existingRecord.requestCount : 0;
    if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
        windowStart = now;
        requestCount = 0;
    }
    if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
        return {
            status: 429,
            body: {
                success: false,
                code: "TOO_MANY_REQUESTS",
                message: "Too many requests. Please wait a moment and try again."
            }
        };
    }

    // Generate cryptographically secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Persist OTP in MongoDB (Works across all stateless serverless instances)
    await Otp.findOneAndUpdate(
        { email },
        {
            hashedOtp,
            type,
            attempts: 0,
            lastSentAt: new Date(now),
            requestCount: requestCount + 1,
            windowStart: new Date(windowStart),
            expiresAt: new Date(now + OTP_EXPIRY_MS)
        },
        { upsert: true, new: true }
    );

    // Send verification email via Nodemailer SMTP
    const emailResult = await sendOtpEmail(email, otp, type);

    if (!emailResult.success) {
        // Roll back the rate limit cooldown so user can retry immediately
        if (existingRecord) {
            await Otp.findOneAndUpdate(
                { email },
                {
                    hashedOtp: existingRecord.hashedOtp,
                    lastSentAt: existingRecord.lastSentAt,
                    requestCount: existingRecord.requestCount
                }
            );
        } else {
            await Otp.deleteOne({ email });
        }

        return {
            status: 500,
            body: {
                success: false,
                code: "EMAIL_DELIVERY_FAILED",
                message: "We couldn't send the verification code. Please try again."
            }
        };
    }

    return {
        status: 200,
        body: {
            success: true,
            message: "Verification code sent to your email."
        }
    };
}

/**
 * SIGN IN: Step 1 — Validate email and password credentials.
 * If valid, generates and dispatches OTP via Nodemailer SMTP.
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail });

        // Generic error response to prevent user enumeration
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const isPasswordValid = await bcrypt.compare(String(password), user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Credentials valid -> dispatch OTP via Nodemailer SMTP
        const dispatchResult = await dispatchOtp({
            email: normalizedEmail,
            type: 'signin'
        });

        return res.status(dispatchResult.status).json(dispatchResult.body);

    } catch (err) {
        console.error("loginUser error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};

/**
 * CREATE ACCOUNT: Step 1 — Validate details, register unverified user, and dispatch OTP.
 */
const registerUser = async (req, res) => {
    try {
        const { userName, email, password } = req.body;

        if (!userName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required."
            });
        }

        const trimmedName = String(userName).trim();
        if (trimmedName.length < 2 || trimmedName.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid name (2-60 characters)."
            });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        if (String(password).length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        // Check if verified account already exists
        const existingUser = await userModel.findOne({ email: normalizedEmail });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({
                success: false,
                code: "USER_EXISTS",
                message: "An account already exists with this email. Please sign in."
            });
        }

        // Secure password hashing with bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(String(password), salt);

        if (existingUser) {
            existingUser.userName = trimmedName;
            existingUser.password = hashedPassword;
            existingUser.isVerified = false;
            await existingUser.save();
        } else {
            await userModel.create({
                userName: trimmedName,
                email: normalizedEmail,
                password: hashedPassword,
                isVerified: false
            });
        }

        // Dispatch OTP via Nodemailer SMTP
        const dispatchResult = await dispatchOtp({
            email: normalizedEmail,
            type: 'signup'
        });

        return res.status(dispatchResult.status).json(dispatchResult.body);

    } catch (err) {
        console.error("registerUser error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};

/**
 * RESEND OTP: Triggered by user cooldown timer.
 */
const resendOtp = async (req, res) => {
    try {
        const { email, type } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const existingRecord = await Otp.findOne({ email: normalizedEmail });
        const otpType = type || existingRecord?.type || 'signin';

        if (otpType === 'password_reset') {
            const user = await userModel.findOne({ email: normalizedEmail });
            if (!user) {
                return res.status(200).json({
                    success: true,
                    message: "If an account exists for this email, we've sent a verification code."
                });
            }
        }

        const dispatchResult = await dispatchOtp({
            email: normalizedEmail,
            type: otpType
        });

        return res.status(dispatchResult.status).json(dispatchResult.body);

    } catch (err) {
        console.error("resendOtp error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};

/**
 * VERIFY OTP: Step 2 — Verifies OTP from MongoDB.
 * Upon success: marks user verified, deletes OTP record, and issues JWT session token.
 */
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required."
            });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const cleanOtp = String(otp).trim();

        if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
            return res.status(400).json({
                success: false,
                code: "INCORRECT",
                message: "That verification code isn't correct. Please try again."
            });
        }

        const record = await Otp.findOne({ email: normalizedEmail });
        const now = Date.now();

        // Check expiration
        if (!record || now > record.expiresAt.getTime()) {
            if (record) await Otp.deleteOne({ email: normalizedEmail });
            return res.status(400).json({
                success: false,
                code: "EXPIRED",
                message: "This verification code has expired. Please request a new one."
            });
        }

        // Check attempt limit
        if (record.attempts >= MAX_ATTEMPTS) {
            await Otp.deleteOne({ email: normalizedEmail });
            return res.status(429).json({
                success: false,
                code: "TOO_MANY_ATTEMPTS",
                message: "Too many attempts. Please request a new verification code."
            });
        }

        // Timing-safe comparison of SHA-256 OTP hashes
        const candidateHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');
        const candidateBuf = Buffer.from(candidateHash, 'hex');
        const storedBuf = Buffer.from(record.hashedOtp, 'hex');
        const isMatch = candidateBuf.length === storedBuf.length && crypto.timingSafeEqual(candidateBuf, storedBuf);

        if (!isMatch) {
            record.attempts += 1;
            if (record.attempts >= MAX_ATTEMPTS) {
                await Otp.deleteOne({ email: normalizedEmail });
                return res.status(429).json({
                    success: false,
                    code: "TOO_MANY_ATTEMPTS",
                    message: "Too many attempts. Please request a new verification code."
                });
            }
            await record.save();
            return res.status(400).json({
                success: false,
                code: "INCORRECT",
                message: "That verification code isn't correct. Please try again."
            });
        }

        // Match! Invalidate OTP immediately to prevent replay
        await Otp.deleteOne({ email: normalizedEmail });

        // Retrieve user
        let user = await userModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        // Mark user verified
        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }

        // Issue JWT session token
        const token = jwt.sign({
            userId: user._id,
            email: user.email
        }, process.env.JWT_SECRET || 'secret', {
            expiresIn: "7d"
        });

        return res.status(200).json({
            success: true,
            message: "Signed in successfully!",
            token,
            user: {
                _id: user._id,
                userName: user.userName,
                email: user.email
            }
        });

    } catch (err) {
        console.error("verifyOtp error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};

/**
 * FORGOT PASSWORD: Step 1 — Request OTP for password reset.
 * Uses enumeration protection: always returns 200 with generic success message.
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const user = await userModel.findOne({ email: normalizedEmail });

        // Security: User enumeration protection.
        // If user does not exist, return generic success message without sending email.
        if (!user) {
            console.log('[Password Reset] Request received for non-existent email (enumeration protection applied)');
            return res.status(200).json({
                success: true,
                message: "If an account exists for this email, we've sent a verification code."
            });
        }

        // Dispatch password-reset OTP via Nodemailer SMTP
        const dispatchResult = await dispatchOtp({
            email: normalizedEmail,
            type: 'password_reset'
        });

        if (dispatchResult.status === 429) {
            return res.status(dispatchResult.status).json(dispatchResult.body);
        }

        if (dispatchResult.status !== 200) {
            return res.status(dispatchResult.status).json({
                success: false,
                message: "We couldn't send the verification code. Please try again."
            });
        }

        return res.status(200).json({
            success: true,
            message: "If an account exists for this email, we've sent a verification code."
        });

    } catch (err) {
        console.error("forgotPassword error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};

/**
 * VERIFY RESET OTP: Step 2 — Verify OTP specifically generated for password_reset.
 * Upon success, invalidates the OTP and issues a cryptographically secure, 10-minute resetToken.
 */
const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required."
            });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const cleanOtp = String(otp).trim();

        if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
            return res.status(400).json({
                success: false,
                code: "INCORRECT",
                message: "That verification code isn't correct. Please try again."
            });
        }

        // Strict purpose separation: only accept OTPs with type 'password_reset'
        const record = await Otp.findOne({ email: normalizedEmail, type: 'password_reset' });
        const now = Date.now();

        if (!record || now > record.expiresAt.getTime()) {
            if (record) await Otp.deleteOne({ email: normalizedEmail, type: 'password_reset' });
            return res.status(400).json({
                success: false,
                code: "EXPIRED",
                message: "This verification code has expired. Please request a new code."
            });
        }

        if (record.attempts >= MAX_ATTEMPTS) {
            await Otp.deleteOne({ email: normalizedEmail, type: 'password_reset' });
            return res.status(429).json({
                success: false,
                code: "TOO_MANY_ATTEMPTS",
                message: "Too many attempts. Please request a new verification code."
            });
        }

        // Timing-safe comparison of SHA-256 OTP hashes
        const candidateHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');
        const candidateBuf = Buffer.from(candidateHash, 'hex');
        const storedBuf = Buffer.from(record.hashedOtp, 'hex');
        const isMatch = candidateBuf.length === storedBuf.length && crypto.timingSafeEqual(candidateBuf, storedBuf);

        if (!isMatch) {
            record.attempts += 1;
            if (record.attempts >= MAX_ATTEMPTS) {
                await Otp.deleteOne({ email: normalizedEmail, type: 'password_reset' });
                return res.status(429).json({
                    success: false,
                    code: "TOO_MANY_ATTEMPTS",
                    message: "Too many attempts. Please request a new verification code."
                });
            }
            await record.save();
            return res.status(400).json({
                success: false,
                code: "INCORRECT",
                message: "That verification code isn't correct. Please try again."
            });
        }

        // Correct OTP -> Invalidate OTP immediately to prevent replay
        await Otp.deleteOne({ email: normalizedEmail, type: 'password_reset' });

        const user = await userModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User account not found."
            });
        }

        // Generate cryptographically secure random reset token
        const rawResetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpires = new Date(now + OTP_EXPIRY_MS); // 10 minutes
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Code verified successfully.",
            resetToken: rawResetToken
        });

    } catch (err) {
        console.error("verifyResetOtp error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};

/**
 * RESET PASSWORD: Step 3 — Set new password using verified server reset token.
 * Requires matching resetToken in database, hashes new password with bcrypt, and invalidates token.
 */
const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword, confirmPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email, reset token, and new password are required."
            });
        }

        const normalizedEmail = String(email).toLowerCase().trim();

        if (String(newPassword).length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        if (confirmPassword && String(newPassword) !== String(confirmPassword)) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match."
            });
        }

        const hashedResetToken = crypto.createHash('sha256').update(String(resetToken).trim()).digest('hex');

        // Enforce verification: User must have valid, unexpired reset token
        const user = await userModel.findOne({
            email: normalizedEmail,
            resetPasswordToken: hashedResetToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                code: "INVALID_RESET_SESSION",
                message: "Your password reset session has expired or is invalid. Please request a new code."
            });
        }

        // Hash new password using bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(String(newPassword), salt);

        // Update user password and clear reset token to prevent reuse
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Your password has been updated. You can now sign in with your new password."
        });

    } catch (err) {
        console.error("resetPassword error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};

module.exports = {
    loginUser,
    registerUser,
    resendOtp,
    sendOtp: resendOtp,
    verifyOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword
};