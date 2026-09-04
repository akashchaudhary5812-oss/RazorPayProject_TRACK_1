/**
 * Safe Nodemailer SMTP Delivery Diagnostic Script
 * 
 * CRITICAL SECURITY RULES:
 * - Never prints or logs SMTP_PASS
 * - Only checks presence/status of environment variables
 * - Never exposes secrets in logs
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'BundleAI <no-reply@bundleai.com>';

console.log('====================================================');
console.log('     NODEMAILER SMTP EMAIL DELIVERY DIAGNOSTIC      ');
console.log('====================================================');

console.log('\n[1] SMTP Environment Status:');
console.log(`- SMTP_HOST: ${SMTP_HOST || 'Not configured'}`);
console.log(`- SMTP_PORT: ${SMTP_PORT}`);
console.log(`- SMTP_USER exists: ${Boolean(SMTP_USER)}`);
console.log(`- SMTP_PASS exists: ${Boolean(SMTP_PASS)} (length: ${SMTP_PASS ? SMTP_PASS.length : 0})`);
console.log(`- SMTP_FROM: ${SMTP_FROM}`);
console.log(`- SMTP configuration detected: ${Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS)}`);

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('\n[Notice] SMTP environment variables are not fully configured.');
    console.log('To send live emails via Nodemailer, configure in Backend/.env (and Vercel Environment Variables):');
    console.log('  SMTP_HOST=smtp.gmail.com (or your provider)');
    console.log('  SMTP_PORT=587');
    console.log('  SMTP_USER=your-email@example.com');
    console.log('  SMTP_PASS=your-app-password');
    console.log('  SMTP_FROM=BundleAI <your-email@example.com>');
    process.exit(0);
}

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }
});

async function runDiagnostic() {
    console.log('\n[2] Testing SMTP Handshake Connection:');
    try {
        await transporter.verify();
        console.log('SMTP connection: successful ✅');

        const testRecipient = process.argv[2] || SMTP_USER;
        console.log(`\n[3] Testing email dispatch to: ${testRecipient}`);

        const info = await transporter.sendMail({
            from: SMTP_FROM,
            to: testRecipient,
            subject: 'BundleAI SMTP Diagnostic Test',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2>SMTP Diagnostic Test</h2>
                    <p>This is a safe test email sent to verify Nodemailer SMTP delivery.</p>
                    <p>Recipient: <strong>${testRecipient}</strong></p>
                </div>
            `
        });

        console.log(`OTP email: sent ✅ (Message ID: ${info.messageId})`);
        console.log('\n====================================================');
        console.log('         DIAGNOSTIC COMPLETED SUCCESSFULLY          ');
        console.log('====================================================');

    } catch (err) {
        console.error('SMTP connection / send error ❌:', err.message);
        console.log('\nCommon fixes:');
        console.log('- If using Gmail, use a 16-character App Password (not your account password)');
        console.log('- Ensure 2-Step Verification is enabled in your Google account');
        console.log('- Check that port 587 (STARTTLS) or 465 (SSL) is allowed by your network/provider');
    }
}

runDiagnostic();
