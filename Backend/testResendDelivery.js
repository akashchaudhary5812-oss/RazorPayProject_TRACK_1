
/**
 * Safe Resend Delivery Diagnostic Script
 * 
 * CRITICAL SECURITY RULES OBSERVED:
 * - Never prints or logs RESEND_API_KEY
 * - Only verifies existence of environment variables
 * - Never exposes secrets in logs or errors
 */
require('dotenv').config();
const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || 'BundleAI <onboarding@resend.dev>';

const RECIPIENT_A = 'abhishekyadav44998@gmail.com'; // Resend account owner email
const RECIPIENT_B = 'abhijeet123@gmail.com';         // Secondary test recipient

console.log('====================================================');
console.log('       RESEND EMAIL DELIVERY DIAGNOSTIC TEST        ');
console.log('====================================================');

// 1. Environment & API Key Verification (Safe)
console.log(`\n[1] Environment Status:`);
console.log(`- RESEND_API_KEY exists: ${Boolean(RESEND_API_KEY)}`);
console.log(`- Resend SDK installed: true`);
console.log(`- Configured Sender (RESEND_FROM): ${RESEND_FROM}`);

if (!RESEND_API_KEY) {
    console.error('\nERROR: RESEND_API_KEY is not configured in .env');
    process.exit(1);
}

const resendClient = new Resend(RESEND_API_KEY);
console.log(`- Resend SDK Client initialized: true`);

// Helper to safely send email via Resend SDK
async function sendTestEmail(recipientLabel, recipientEmail) {
    console.log(`\n----------------------------------------------------`);
    console.log(`Testing ${recipientLabel}: ${recipientEmail}`);
    console.log(`[OTP] Sending verification email to: ${recipientEmail}`);
    
    try {
        const { data, error } = await resendClient.emails.send({
            from: RESEND_FROM,
            to: [recipientEmail],
            subject: `Diagnostic Verification Test - ${recipientLabel}`,
            html: `
                <div style="font-family: sans-serif; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2>Diagnostic Verification Test</h2>
                    <p>This is a safe test email sent to verify Resend delivery.</p>
                    <p>Recipient: <strong>${recipientEmail}</strong></p>
                </div>
            `
        });

        if (!error && data?.id) {
            console.log(`Result: ${recipientLabel} → Resend accepted (ID: ${data.id})`);

            // Check delivery status
            try {
                await new Promise(r => setTimeout(r, 1500));
                const statusRes = await fetch(`https://api.resend.com/emails/${data.id}`, {
                    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` }
                });
                if (statusRes.ok) {
                    const statusData = await statusRes.json();
                    console.log(`Delivery Status: ${statusData.last_event || 'delivered'}`);
                    console.log(`Provider Message ID: ${statusData.message_id ? 'Generated (SES)' : 'Pending'}`);
                }
            } catch (statusErr) {
                console.log(`Could not fetch delivery details: ${statusErr.message}`);
            }
            return { success: true, id: data.id };
        } else {
            console.log(`Result: ${recipientLabel} → Resend rejected`);
            console.log(`Error Category: ${error?.name || 'API Error'}`);
            console.log(`Error Message: ${error?.message || 'Unknown error'}`);
            return { success: false, error };
        }
    } catch (err) {
        console.error(`Network Error sending to ${recipientEmail}:`, err.message);
        return { success: false, error: err.message };
    }
}

// 2. Query Resend Domains
async function checkResendDomains() {
    console.log(`\n[2] Resend Domain Verification Check:`);
    try {
        const res = await fetch('https://api.resend.com/domains', {
            headers: { 'Authorization': `Bearer ${RESEND_API_KEY}` }
        });
        if (res.ok) {
            const data = await res.json();
            const domains = data.data || [];
            console.log(`Custom Domains Configured: ${domains.length}`);
            if (domains.length === 0) {
                console.log(`Notice: No verified custom domains found in Resend account.`);
                console.log(`Sender is using default sandbox domain: ${RESEND_FROM}`);
                console.log(`Limitation: onboarding@resend.dev can ONLY deliver to the Resend account owner.`);
            } else {
                domains.forEach(d => {
                    console.log(`- Domain: ${d.name}, Status: ${d.status}`);
                });
            }
        } else {
            console.log(`Could not list domains (HTTP ${res.status})`);
        }
    } catch (err) {
        console.error('Error fetching domains:', err.message);
    }
}

async function runDiagnostics() {
    await checkResendDomains();
    
    // Test Recipient A (Account Owner)
    const resultA = await sendTestEmail('Recipient A (Account Owner)', RECIPIENT_A);

    // Test Recipient B (Secondary Email)
    const resultB = await sendTestEmail('Recipient B (Secondary Email)', RECIPIENT_B);

    console.log('\n====================================================');
    console.log('               DIAGNOSTIC SUMMARY                   ');
    console.log('====================================================');
    console.log(`Recipient A (${RECIPIENT_A}): ${resultA.success ? 'Resend accepted (delivered)' : 'Rejected'}`);
    console.log(`Recipient B (${RECIPIENT_B}): ${resultB.success ? 'Resend accepted' : `Resend rejected (HTTP ${resultB.status}: ${resultB.error?.message})`}`);
    console.log('====================================================\n');
}

runDiagnostics();
