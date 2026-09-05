if (!process.env.SMTP_HOST && !process.env.GMAIL_CLIENT_ID) {
    require('dotenv').config();
}

const nodemailer = require('nodemailer');

// ─── Google Gmail REST API (OAuth2) Configuration ──────────────────────────────
// Uses HTTPS (Port 443) - Never blocked by Render, Vercel, or cloud firewalls.

let cachedGoogleAccessToken = null;
let googleTokenExpiresAt = 0;

function checkGmailApiConfigured() {
    return Boolean(
        process.env.GMAIL_CLIENT_ID &&
        process.env.GMAIL_CLIENT_SECRET &&
        process.env.GMAIL_REFRESH_TOKEN
    );
}

/**
 * Automatically refreshes and caches Google OAuth2 access token.
 */
async function getGoogleAccessToken() {
    if (cachedGoogleAccessToken && Date.now() < googleTokenExpiresAt - 60000) {
        return cachedGoogleAccessToken;
    }

    const clientId = process.env.GMAIL_CLIENT_ID?.trim();
    const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Google Gmail OAuth credentials not fully configured.');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        })
    });

    const data = await response.json();
    if (!response.ok || !data.access_token) {
        throw new Error(`Google token refresh failed: ${data.error_description || data.error || 'Unknown error'}`);
    }

    cachedGoogleAccessToken = data.access_token;
    googleTokenExpiresAt = Date.now() + (data.expires_in * 1000);
    return cachedGoogleAccessToken;
}

/**
 * Builds an RFC 2822 multipart email message and encodes it for the Gmail REST API.
 */
function createRawEmail({ to, from, subject, textContent, htmlContent }) {
    const boundary = `__boundary_${Date.now()}__`;
    const encodedSubject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

    const lines = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${encodedSubject}`,
        'MIME-Version: 1.0',
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        textContent,
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        htmlContent,
        '',
        `--${boundary}--`
    ];

    return Buffer.from(lines.join('\r\n'))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Sends an email using the official Google Gmail REST API over HTTPS (port 443).
 */
async function sendViaGmailApi(toEmail, subject, textContent, htmlContent) {
    const accessToken = await getGoogleAccessToken();
    const gmailUser = process.env.GMAIL_USER ? process.env.GMAIL_USER.trim() : 'abhishekyadav44998@gmail.com';
    const fromAddress = `"IntentCartAI" <${gmailUser}>`;

    const raw = createRawEmail({
        to: toEmail,
        from: fromAddress,
        subject,
        textContent,
        htmlContent
    });

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Gmail API error: ${data.error?.message || 'Failed to dispatch email'}`);
    }

    return { success: true, messageId: data.id };
}

// ─── Nodemailer SMTP Fallback Configuration ─────────────────────────────────────

function checkSmtpConfigured() {
    return Boolean(
        process.env.SMTP_HOST &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS
    );
}

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

// ─── Universal sendOtpEmail Dispatcher ──────────────────────────────────────────

/**
 * Sends a 6-digit OTP verification email.
 * Prioritizes Google Gmail REST API (HTTPS port 443, never blocked).
 * Falls back cleanly to Nodemailer SMTP.
 * 
 * @param {string} toEmail Recipient email address
 * @param {string} otp 6-digit verification code
 * @param {string} [purpose='signin'] Purpose of the OTP ('signin', 'signup', 'password_reset')
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
async function sendOtpEmail(toEmail, otp, purpose = 'signin') {
    console.log(`[OTP] Request received to dispatch code for: ${toEmail} (Purpose: ${purpose})`);

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

    // 1. Primary: Google Gmail REST API (Over HTTPS port 443)
    if (checkGmailApiConfigured()) {
        try {
            console.log(`[OTP] Dispatching email via Google Gmail REST API to: ${toEmail}`);
            const result = await sendViaGmailApi(toEmail, emailSubject, textContent, htmlContent);
            console.log(`[Gmail API Success] OTP email delivered to: ${toEmail} (Message ID: ${result.messageId})`);
            return result;
        } catch (err) {
            console.error('[Gmail API Error]:', err.message);
            // Don't return yet, try falling back to SMTP if configured
        }
    }

    // 2. Secondary / Fallback: Nodemailer SMTP
    const activeTransporter = await getTransporter();
    if (activeTransporter) {
        try {
            console.log(`[OTP] Dispatching email via Nodemailer SMTP fallback to: ${toEmail}`);
            const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
            const configuredFrom = process.env.SMTP_FROM ? process.env.SMTP_FROM.trim() : '';

            let fromAddress;
            if (configuredFrom && configuredFrom.includes('<') && configuredFrom.includes('>')) {
                fromAddress = configuredFrom;
            } else if (configuredFrom && configuredFrom.includes('@')) {
                fromAddress = `"IntentCartAI" <${configuredFrom}>`;
            } else if (smtpUser) {
                fromAddress = `"IntentCartAI" <${smtpUser}>`;
            } else {
                fromAddress = 'IntentCartAI <no-reply@intentcart.ai>';
            }

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

    console.error('[Email Dispatch Error]: Neither Google Gmail API nor Nodemailer SMTP is configured.');
    return {
        success: false,
        error: 'Email delivery credentials are not configured on the server.'
    };
}

console.log('Email delivery engine initialized:');
console.log(`- Google Gmail REST API configured: ${checkGmailApiConfigured()}`);
console.log(`- Nodemailer SMTP fallback configured: ${checkSmtpConfigured()}`);

module.exports = {
    sendOtpEmail,
    getTransporter,
    verifySmtpConnection,
    checkSmtpConfigured,
    checkGmailApiConfigured,
    get isSmtpConfigured() {
        return checkSmtpConfigured() || checkGmailApiConfigured();
    }
};
