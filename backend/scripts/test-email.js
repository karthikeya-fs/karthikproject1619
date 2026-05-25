const path = require("path");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("Missing EMAIL_USER or EMAIL_APP_PASSWORD/EMAIL_PASS in backend/.env");
  process.exit(1);
}

(async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    console.log("Verifying SMTP transporter...");
    await transporter.verify();
    console.log("✅ SMTP verified");

    const info = await transporter.sendMail({
      from: `Campus Lost & Found <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: "OTP Email Test",
      text: "This is a test OTP message. If you receive this, the backend email pipeline is working.",
      html: `<p>This is a test OTP message. If you receive this, the backend email pipeline is working.</p>`,
    });

    console.log("✅ Test email sent successfully");
    console.log("MessageId:", info.messageId);
    process.exit(0);
  } catch (error) {
    console.error("❌ Test email failed:", error.message || error);
    process.exit(1);
  }
})();
