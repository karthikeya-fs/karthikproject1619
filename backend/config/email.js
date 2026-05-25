"use strict";

const nodemailer = require("nodemailer");

// ── Build transporter once at module load ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || "smtp.gmail.com",
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // false = STARTTLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection on startup — logs clearly so you know immediately
transporter.verify((err) => {
  if (err) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌  SMTP connection FAILED — OTP emails will not send");
    console.error("    Error  :", err.message);
    console.error("    Code   :", err.code ?? "none");
    console.error("    Fix    : Check SMTP_USER and SMTP_PASS in backend/.env");
    console.error("    Guide  : myaccount.google.com → Security → App passwords");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } else {
    console.log("✅  SMTP transporter ready — OTP emails will send via", process.env.SMTP_USER);
  }
});

// ── Logo URL for email embedding ──────────────────────────────────────────────
// The backend serves /public statically (see server.js).
// This URL is embedded as <img src="..."> in the email — must be publicly reachable.
// For local dev it works only if the recipient's email client can reach localhost,
// which most cannot. The logo will show as a broken image in local dev — that is
// expected. On a deployed server, set APP_URL to your real domain.
function getLogoUrl() {
  const base = process.env.APP_URL || "http://localhost:5000";
  return `${base}/logo.png`;
}

/**
 * Low-level send helper — used by all email functions in this file.
 *
 * @param {string} to       Recipient address
 * @param {string} subject  Subject line
 * @param {string} html     HTML body (inline CSS, Gmail-safe table layout)
 * @param {string} [text]   Plain-text fallback
 */
async function sendCustomEmail(to, subject, html, text) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error(
      "SMTP_USER or SMTP_PASS is not set in backend/.env — " +
      "add your Gmail address and App Password."
    );
  }

  const appName = process.env.APP_NAME || "Lost & Found Campus Network";

  console.log(`📧 Sending email → to: ${to}  subject: "${subject}"`);

  const result = await transporter.sendMail({
    from:    `"${appName}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });

  console.log(`✅ Email sent — MessageId: ${result.messageId}  to: ${to}`);
  return result;
}

/**
 * Send the branded OTP verification email.
 *
 * @param {string} toEmail  Recipient address
 * @param {string} otp      Plaintext 6-digit code
 */
async function sendOTPEmail(toEmail, otp) {
  const appName  = process.env.APP_NAME || "Lost & Found Campus Network";
  const logoUrl  = getLogoUrl();
  const subject  = `${otp} is your ${appName} verification code`;

  // ── Gmail-safe table-based HTML ─────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#0b1120;font-family:Arial,Helvetica,sans-serif;">

  <table role="presentation" cellpadding="0" cellspacing="0" border="0"
         width="100%" style="background-color:#0b1120;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- ── Card ── -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"
               width="100%" style="max-width:540px;background-color:#111827;
               border-radius:20px;border-collapse:collapse;
               box-shadow:0 25px 50px rgba(0,0,0,0.5);">

          <!-- Logo row -->
          <tr>
            <td align="center" style="padding:40px 32px 8px;">
              <img src="${logoUrl}" alt="${appName} logo"
                   width="72" height="72"
                   style="border-radius:16px;background:#ffffff;
                          padding:6px;display:block;border:0;" />
            </td>
          </tr>

          <!-- App name -->
          <tr>
            <td align="center"
                style="padding:12px 32px 4px;font-size:22px;font-weight:700;
                       color:#22d3ee;letter-spacing:-0.5px;">
              Lost &amp; Found
            </td>
          </tr>

          <!-- Tagline -->
          <tr>
            <td align="center"
                style="padding:0 32px 32px;font-size:12px;color:#475569;
                       letter-spacing:3px;text-transform:uppercase;">
              Campus Network
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0"
                     border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="border-top:1px solid #1e293b;font-size:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td align="center"
                style="padding:32px 32px 8px;font-size:18px;font-weight:600;
                       color:#f1f5f9;">
              Verify your email address
            </td>
          </tr>

          <!-- Body text -->
          <tr>
            <td align="center"
                style="padding:0 40px 28px;font-size:15px;color:#94a3b8;
                       line-height:1.7;">
              Use the verification code below to complete your registration.
              This code is valid for <strong style="color:#e2e8f0;">5&nbsp;minutes</strong>.
            </td>
          </tr>

          <!-- OTP box -->
          <tr>
            <td align="center" style="padding:0 32px 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0"
                     border="0" style="border-collapse:collapse;">
                <tr>
                  <td align="center"
                      style="background-color:#0f172a;
                             border:2px solid #22d3ee;
                             border-radius:14px;
                             padding:22px 48px;
                             font-size:44px;
                             font-weight:700;
                             letter-spacing:14px;
                             color:#38bdf8;
                             font-family:'Courier New',Courier,monospace;">
                    ${otp}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiry warning -->
          <tr>
            <td align="center" style="padding:0 32px 12px;">
              <table role="presentation" cellpadding="0" cellspacing="0"
                     border="0" width="100%"
                     style="max-width:380px;border-collapse:collapse;
                            background-color:#1c1f0f;border-radius:10px;
                            border:1px solid #3d3a00;">
                <tr>
                  <td align="center"
                      style="padding:12px 20px;font-size:13px;color:#fbbf24;">
                    ⏱&nbsp; This code expires in <strong>5 minutes</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security warning -->
          <tr>
            <td align="center" style="padding:8px 32px 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0"
                     border="0" width="100%"
                     style="max-width:380px;border-collapse:collapse;
                            background-color:#1a0a0a;border-radius:10px;
                            border:1px solid #3d0000;">
                <tr>
                  <td align="center"
                      style="padding:12px 20px;font-size:13px;color:#f87171;
                             line-height:1.5;">
                    🔒&nbsp; <strong>Never share this code</strong> with anyone.<br>
                    Our team will never ask for your OTP.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0"
                     border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="border-top:1px solid #1e293b;font-size:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td align="center"
                style="padding:20px 32px 32px;font-size:12px;color:#334155;
                       line-height:1.6;">
              If you did not request this code, you can safely ignore this email.<br>
              Someone may have entered your address by mistake.
            </td>
          </tr>

        </table>
        <!-- /Card -->

        <!-- Bottom footer -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"
               width="100%" style="max-width:540px;border-collapse:collapse;">
          <tr>
            <td align="center"
                style="padding:20px 32px;font-size:11px;color:#1e293b;">
              &copy; ${new Date().getFullYear()} ${appName} &bull;
              This is an automated message &mdash; please do not reply
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

  const text =
    `Your ${appName} verification code is: ${otp}\n\n` +
    `This code expires in 5 minutes.\n` +
    `Never share this code with anyone.\n\n` +
    `If you did not request this, please ignore this email.`;

  try {
    return await sendCustomEmail(toEmail, subject, html, text);
  } catch (err) {
    console.error("=== OTP EMAIL SEND FAILED ===");
    console.error("Message  :", err.message);
    console.error("Code     :", err.code     ?? "none");
    console.error("Response :", err.response ?? "none");
    console.error("Stack    :", err.stack);
    throw err;
  }
}

module.exports = sendOTPEmail;
module.exports.sendCustomEmail = sendCustomEmail;
