const Otp = require("../models/otp");
const Item = require("../models/Item");
const generateOTP = require("../utils/generateOtp");
const { sendCustomEmail } = require("../config/email");

/**
 * Build a Gmail-safe claim-verification OTP email body.
 */
function buildClaimEmailHtml(otp, itemTitle) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Claim Verification</title></head>
<body style="margin:0;padding:0;background-color:#0b1120;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0b1120;border-collapse:collapse;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560"><tr><td><![endif]-->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;background-color:#111827;border-collapse:collapse;border-radius:16px;">
        <!-- Logo / App Name -->
        <tr>
          <td align="center" style="padding:40px 32px 16px 32px;font-size:20px;font-weight:bold;color:#22d3ee;">
            CAMPUS LOST &amp; FOUND
          </td>
        </tr>
        <!-- Heading -->
        <tr>
          <td align="center" style="padding:0 32px 8px 32px;font-size:22px;font-weight:bold;color:#f8fafc;">
            Claim Verification
          </td>
        </tr>
        <!-- Description -->
        <tr>
          <td align="center" style="padding:0 32px 24px 32px;font-size:14px;line-height:22px;color:#94a3b8;">
            Use the OTP below to verify your ownership claim for <strong style="color:#e2e8f0;">${itemTitle}</strong>.
          </td>
        </tr>
        <!-- OTP Box -->
        <tr>
          <td align="center" style="padding:0 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td align="center" style="background-color:#1e293b;border:1px solid #334155;padding:24px 16px;font-size:36px;font-weight:bold;color:#22d3ee;letter-spacing:8px;font-family:Arial,Helvetica,sans-serif;">
                  ${otp}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Expiry -->
        <tr>
          <td align="center" style="padding:24px 32px 4px 32px;font-size:13px;color:#94a3b8;">
            This OTP expires in <strong style="color:#cbd5e1;">5 minutes</strong>.
          </td>
        </tr>
        <!-- Security -->
        <tr>
          <td align="center" style="padding:4px 32px 40px 32px;font-size:12px;color:#64748b;line-height:18px;">
            If you did not request this verification, please ignore this email.<br>
            Do not share this code with anyone.
          </td>
        </tr>
      </table>
      <!--[if mso]></td></tr></table><![endif]-->
      <!-- Footer -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:16px 32px;font-size:11px;color:#475569;">
            Campus Lost &amp; Found Network &bull; BIT Campus
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/**
 * POST /api/claims/send-otp
 * Generates a 6-digit OTP, hashes it, stores it, and emails the plaintext OTP.
 */
const sendClaimOtp = async (req, res) => {
  try {
    const { email, itemId } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailKey = email.trim().toLowerCase();

    // Rate-limit: max 1 OTP per email per 60 seconds
    const recent = await Otp.findOne({ email: emailKey, purpose: "claim", used: false });
    if (recent) {
      const ageMs = Date.now() - new Date(recent._id.getTimestamp()).getTime();
      if (ageMs < 60_000) {
        const remaining = Math.ceil((60_000 - ageMs) / 1000);
        return res.status(429).json({
          message: `Please wait ${remaining}s before requesting another OTP.`,
        });
      }
    }

    // Fetch item title for the email template
    let itemTitle = "an item";
    if (itemId) {
      try {
        const item = await Item.findById(itemId).select("title");
        if (item) itemTitle = item.title;
      } catch { /* non-fatal */ }
    }

    const otp = String(generateOTP());

    // Invalidate any previous unverified OTPs for this email+claim
    await Otp.deleteMany({ email: emailKey, purpose: "claim", used: false });

    const otpRecord = await Otp.create({
      email: emailKey,
      code: otp,          // plaintext — Otp.hashOtp() removed from model
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      purpose: "claim",
      itemId: itemId || null,
    });

    console.log(`[ClaimOTP] Generated OTP for ${emailKey} (item: "${itemTitle}")`);

    try {
      const html = buildClaimEmailHtml(otp, itemTitle);
      const text = `Campus Lost & Found - Claim Verification\n\nUse this OTP to verify your ownership claim for "${itemTitle}".\n\nOTP: ${otp}\n\nThis OTP expires in 5 minutes.\nDo not share this code with anyone.`;
      await sendCustomEmail(
        emailKey,
        "Campus Lost & Found — Claim Verification OTP",
        html,
        text
      );
      console.log(`[ClaimOTP] Email sent successfully to ${emailKey}`);
      return res.json({ message: "OTP sent to your email" });
    } catch (mailErr) {
      console.error("[ClaimOTP] Failed to send OTP email to", emailKey, ":", mailErr);
      console.error("[ClaimOTP] Error message:", mailErr.message);
      console.error("[ClaimOTP] Error code:", mailErr.code);
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(500).json({
        message: "Failed to send OTP, please try again",
        error: mailErr.message,
        code: mailErr.code,
      });
    }
  } catch (err) {
    console.error("[ClaimOTP] sendClaimOtp error:", err);
    res.status(500).json({ message: err.message || "Failed to send OTP" });
  }
};

/**
 * POST /api/claims/verify-otp
 * Verifies the OTP by direct plaintext comparison.
 */
const verifyClaimOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const emailKey = email.trim().toLowerCase();
    const otpStr = String(otp).trim();

    const record = await Otp.findOne({
      email: emailKey,
      purpose: "claim",
      used: false,
    });

    if (!record) {
      console.log(`[ClaimOTP] Verify FAIL — no active OTP for ${emailKey}`);
      return res.status(400).json({ message: "OTP not found. Please request a new one." });
    }

    console.log(`[ClaimOTP] Found record for ${emailKey}, expires: ${record.expiresAt}`);

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ email: emailKey, purpose: "claim" });
      console.log(`[ClaimOTP] Verify FAIL — expired OTP for ${emailKey}`);
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Direct plaintext comparison — no hashing
    if (record.code !== otpStr) {
      console.log(`[ClaimOTP] Verify FAIL — wrong OTP for ${emailKey}`);
      return res.status(400).json({ message: "Invalid OTP. Please check and try again." });
    }

    await Otp.updateOne(
      { _id: record._id },
      { $set: { used: true, verifiedAt: new Date() } }
    );

    console.log(`[ClaimOTP] Verify SUCCESS for ${emailKey}`);
    res.json({ verified: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("[ClaimOTP] verifyClaimOtp error:", err);
    res.status(500).json({ message: err.message || "OTP verification failed" });
  }
};

module.exports = { sendClaimOtp, verifyClaimOtp };
