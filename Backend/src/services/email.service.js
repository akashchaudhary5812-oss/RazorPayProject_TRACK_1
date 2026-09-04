if (!process.env.SMTP_HOST) {
    require('dotenv').config();
}

const nodemailer = require('nodemailer');

function checkSmtpConfigured() {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
    );
}

console.log('SMTP configuration detected:', checkSmtpConfigured());

let cachedTransporter = null;

function createTransporter() {
    if (!checkSmtpConfigured()) {
        return null;
    }

    const host = process.env.SMTP_HOST.trim();
    const port = Number(process.env.SMTP_PORT) || 587;
    const isSecure = port === 465;

    return nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: {
            user: process.env.SMTP_USER.trim(),
            pass: process.env.SMTP_PASS.trim()
        },
        tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
    });
}

/**
 * Gets or creates the active Nodemailer SMTP transporter.
 * Fails cleanly if SMTP credentials are not configured (never silently falls back to mock inboxes).
 */
async function getTransporter() {
    if (cachedTransporter) {
        return cachedTransporter;
    }

    if (!checkSmtpConfigured()) {
        return null;
    }

    cachedTransporter = createTransporter();
    return cachedTransporter;
}

/**
 * Tests the SMTP handshake and connection.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function verifySmtpConnection() {
    const transporter = await getTransporter();
    if (!transporter) {
        return {
            success: false,
            error: 'SMTP credentials are not configured.'
        };
    }

    try {
        await transporter.verify();
        console.log('SMTP connection: successful');
        return { success: true };
    } catch (err) {
        console.error('SMTP connection error:', err.message);
        return { success: false, error: err.message };
    }
}

// Perform safe startup verification
if (checkSmtpConfigured()) {
    getTransporter().then((t) => {
        if (t) {
            t.verify((err) => {
                if (err) {
                    console.error('SMTP connection error:', err.message);
                } else {
                    console.log('SMTP connection: successful');
                }
            });
        }
    });
}

/**
 * Sends a 6-digit OTP verification email via Nodemailer SMTP.
 * Sends both plaintext and HTML to guarantee delivery and avoid anti-spam penalties.
 * 
 * @param {string} toEmail Recipient email address
 * @param {string} otp 6-digit verification code
 * @param {string} [purpose='signin'] Purpose of the OTP ('signin', 'signup', 'password_reset')
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendOtpEmail(toEmail, otp, purpose = 'signin') {
    console.log('OTP email request received');

    const activeTransporter = await getTransporter();

    if (!activeTransporter) {
        console.error('[SMTP Error]: SMTP credentials are not configured on the server.');
        return {
            success: false,
            error: 'SMTP credentials are not configured on the server.'
        };
    }

    // Determine clean From address with display name matching the authenticated user
    const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
    const configuredFrom = process.env.SMTP_FROM ? process.env.SMTP_FROM.trim() : '';

    let fromAddress;
    if (configuredFrom && configuredFrom.includes('<') && configuredFrom.includes('>')) {
        fromAddress = configuredFrom;
    } else if (configuredFrom && configuredFrom.includes('@')) {
        fromAddress = `"BundleAI" <${configuredFrom}>`;
    } else if (smtpUser) {
        fromAddress = `"BundleAI" <${smtpUser}>`;
    } else {
        fromAddress = 'BundleAI <no-reply@bundleai.com>';
    }

    const isPasswordReset = purpose === 'password_reset';
    const emailSubject = isPasswordReset ? 'Reset your password' : 'Your verification code';
    const emailHeading = isPasswordReset ? 'Reset your password' : 'Verify your email';
    const emailSubtitle = isPasswordReset
        ? 'Your password reset verification code is:'
        : 'Your verification code is:';
    const disclaimerText = isPasswordReset
        ? "If you didn't request a password reset, you can safely ignore this email."
        : "If you didn't request this code, you can safely ignore this email.";

    const textContent = `${emailHeading}\n\n${emailSubtitle} ${otp}\n\nThis code will expire in 10 minutes.\n${disclaimerText}`;

    const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="margin-bottom: 20px;">
                <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 22px; font-weight: 700;">${emailHeading}</h2>
                <p style="color: #475569; font-size: 14px; margin: 0;">${emailSubtitle}</p>
            </div>
            <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 18px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #0f172a; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px; margin: 16px 0 0 0;">This code will expire in 10 minutes.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">${disclaimerText}</p>
        </div>
    `;

    try {
        console.log(`[OTP] Sending verification email via Nodemailer SMTP to: ${toEmail} (Purpose: ${purpose})`);

        const info = await activeTransporter.sendMail({
            from: fromAddress,
            to: toEmail,
            subject: emailSubject,
            text: textContent,
            html: htmlContent
        });

        console.log(`[SMTP Success] OTP email sent to: ${toEmail} (Message ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };

    } catch (err) {
        console.error('[SMTP Send Error]:', err.message);
        return { success: false, error: err.message };
    }
}

module.exports = {
    sendOtpEmail,
    getTransporter,
    verifySmtpConnection,
    checkSmtpConfigured,
    get isSmtpConfigured() {
        return checkSmtpConfigured();
    }
};
