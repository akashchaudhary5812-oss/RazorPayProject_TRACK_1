const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Resend } = require('resend');

// Resend client initialization (never logs the API key)
const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const registerUser = async (req, res) => {
    const { userName, password, email } = req.body;
    if (!userName || !password || !email) {
        return res.status(400).json({
            success: false,
            message: "All Fields are Required!"
        });
    }

    try {
        const user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User Already Exists!"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await userModel.create({
            userName,
            password: hashedPassword,
            email
        });

        const token = jwt.sign({
            userId: newUser._id
        }, process.env.JWT_SECRET || 'secret', {
            expiresIn: "7d"
        });

        res.status(201).json({
            success: true,
            message: "User Registered Successfully!",
            token,
            user: newUser
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "All Fields are Required!"
        });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found!"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password!"
            });
        }

        const token = jwt.sign({
            userId: user._id
        }, process.env.JWT_SECRET || 'secret', {
            expiresIn: "7d"
        });

        res.status(200).json({
            success: true,
            message: "User Logged In Successfully!",
            token,
            user
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        });
    }
};

// Server-side OTP store for secure authentication
// Key: normalized email, Value: { hashedOtp, expiresAt, attempts, lastSentAt, requestCount, windowStart, fullName, type }
const otpStore = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown
const MAX_ATTEMPTS = 5; // Max 5 verification attempts
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 sends per 15 minutes
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const sendOtp = async (req, res) => {
    try {
        const { email, type = 'signin', fullName } = req.body;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Account existence verification depending on auth mode
        const existingUser = await userModel.findOne({ email: normalizedEmail });
        if (type === 'signin' && !existingUser) {
            return res.status(404).json({
                success: false,
                code: "USER_NOT_FOUND",
                message: "No account found with this email. Please create an account."
            });
        }

        if (type === 'signup' && existingUser) {
            return res.status(400).json({
                success: false,
                code: "USER_EXISTS",
                message: "An account already exists with this email. Please sign in."
            });
        }

        const now = Date.now();
        const existingRecord = otpStore.get(normalizedEmail);

        // Rate limiting check: 30s cooldown between requests
        if (existingRecord && now - existingRecord.lastSentAt < RESEND_COOLDOWN_MS) {
            const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - existingRecord.lastSentAt)) / 1000);
            return res.status(429).json({
                success: false,
                code: "COOLDOWN_ACTIVE",
                message: `Please wait ${waitSeconds}s before requesting a new code.`
            });
        }

        // Rate limiting check: max requests per 15 min window
        let windowStart = existingRecord?.windowStart || now;
        let requestCount = existingRecord?.requestCount || 0;
        if (now - windowStart > RATE_LIMIT_WINDOW_MS) {
            windowStart = now;
            requestCount = 0;
        }
        if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
            return res.status(429).json({
                success: false,
                code: "TOO_MANY_REQUESTS",
                message: "Too many attempts. Please try again later."
            });
        }

        // Generate cryptographically secure 6-digit random OTP
        const otp = crypto.randomInt(100000, 1000000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        otpStore.set(normalizedEmail, {
            hashedOtp,
            fullName: fullName ? String(fullName).trim() : (existingRecord?.fullName || ''),
            type,
            expiresAt: now + OTP_EXPIRY_MS,
            attempts: 0,
            lastSentAt: now,
            requestCount: requestCount + 1,
            windowStart
        });

        // Safe diagnostic logging (Never logs OTP value or API key)
        console.log(`[OTP] Sending verification email to: ${normalizedEmail}`);

        // Send OTP via Resend SDK if configured
        if (resendClient) {
            try {
                const sender = process.env.RESEND_FROM || 'IntentCartAI <onboarding@resend.dev>';
                const { data, error } = await resendClient.emails.send({
                    from: sender,
                    to: [normalizedEmail],
                    subject: 'Your verification code',
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                            <div style="margin-bottom: 20px;">
                                <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 22px;">Your verification code</h2>
                                <p style="color: #475569; font-size: 14px; margin: 0;">Your verification code is:</p>
                            </div>
                            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 18px; text-align: center; border-radius: 8px; margin: 20px 0;">
                                <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: monospace;">${otp}</span>
                            </div>
                            <p style="color: #64748b; font-size: 13px; margin: 16px 0 0 0;">This code will expire in 5 minutes.</p>
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
                            <p style="color: #94a3b8; font-size: 12px; margin: 0;">If you didn't request this code, you can safely ignore this email.</p>
                        </div>
                    `
                });

                if (error) {
                    console.error(`[Resend Error]:`, error.message || error);
                    const statusCode = error.statusCode || (error.name === 'validation_error' ? 403 : 502);

                    if (statusCode === 403 || error.name === 'validation_error' || error.message?.includes('only send testing emails')) {
                        return res.status(403).json({
                            success: false,
                            code: "RESEND_DOMAIN_RESTRICTION",
                            message: error.message || "Resend free tier only permits sending to the account owner's email. Verify a custom domain at resend.com/domains to send to any address.",
                            details: {
                                errorCategory: "account_domain_restriction",
                                provider: "Resend",
                                helpUrl: "https://resend.com/domains"
                            }
                        });
                    }

                    if (statusCode === 401) {
                        return res.status(401).json({
                            success: false,
                            code: "RESEND_AUTH_ERROR",
                            message: "Email service authentication failed. Please verify the Resend API configuration."
                        });
                    }

                    if (statusCode === 422) {
                        return res.status(422).json({
                            success: false,
                            code: "RESEND_VALIDATION_ERROR",
                            message: error.message || "Invalid sender or recipient email format rejected by Resend."
                        });
                    }

                    if (statusCode === 429) {
                        return res.status(429).json({
                            success: false,
                            code: "RESEND_RATE_LIMITED",
                            message: "Email service rate limit reached. Please try again in a few minutes."
                        });
                    }

                    return res.status(502).json({
                        success: false,
                        code: "EMAIL_DELIVERY_FAILED",
                        message: error.message || "Failed to deliver verification email via Resend."
                    });
                }

                console.log(`[Resend Success]: Email accepted for ${normalizedEmail} (ID: ${data?.id})`);

            } catch (emailErr) {
                console.error("[Resend Network Error]:", emailErr.message);
                return res.status(503).json({
                    success: false,
                    code: "EMAIL_NETWORK_ERROR",
                    message: "Unable to reach email service. Please check network connectivity and try again."
                });
            }
        } else {
            console.log(`[Dev Mode] Verification code for ${normalizedEmail}: ${otp}`);
        }

        return res.status(200).json({
            success: true,
            message: "Verification code sent to your email."
        });

    } catch (err) {
        console.error("sendOtp error:", err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp, fullName } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const cleanOtp = String(otp).trim();

        if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
            return res.status(400).json({
                success: false,
                code: "INVALID_LENGTH",
                message: "That code isn't correct. Please try again."
            });
        }

        const record = otpStore.get(normalizedEmail);
        const now = Date.now();

        if (!record || now > record.expiresAt) {
            if (record) otpStore.delete(normalizedEmail);
            return res.status(400).json({
                success: false,
                code: "EXPIRED",
                message: "This code has expired. Please request a new one."
            });
        }

        if (record.attempts >= MAX_ATTEMPTS) {
            otpStore.delete(normalizedEmail);
            return res.status(429).json({
                success: false,
                code: "TOO_MANY_ATTEMPTS",
                message: "Too many attempts. Please try again later."
            });
        }

        // Timing-safe constant-time hash verification
        const candidateHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');
        const candidateBuf = Buffer.from(candidateHash, 'hex');
        const storedBuf = Buffer.from(record.hashedOtp, 'hex');
        const isMatch = candidateBuf.length === storedBuf.length && crypto.timingSafeEqual(candidateBuf, storedBuf);

        if (!isMatch) {
            record.attempts += 1;
            return res.status(400).json({
                success: false,
                code: "INCORRECT",
                message: "That code isn't correct. Please try again."
            });
        }

        // Correct code! Remove OTP record immediately to prevent replay
        const storedFullName = record.fullName;
        otpStore.delete(normalizedEmail);

        // Find or create user
        let user = await userModel.findOne({ email: normalizedEmail });
        if (!user) {
            const randomBytes = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomBytes, salt);

            const chosenName = (fullName && String(fullName).trim()) || storedFullName || normalizedEmail.split('@')[0];

            user = await userModel.create({
                userName: chosenName,
                email: normalizedEmail,
                password: hashedPassword
            });
        }

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
        console.error("verifyOtp error:", err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    sendOtp,
    verifyOtp
};