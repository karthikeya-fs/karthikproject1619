const path = require("path");
const dotenv = require("dotenv");
const { Resend } = require("resend");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

if (!process.env.RESEND_API_KEY) {
  console.error("Missing RESEND_API_KEY in backend/.env. Add your Resend API key before running this test.");
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

(async () => {
  try {
    const recipient = process.env.TEST_EMAIL_RECIPIENT || process.env.EMAIL_USER;
    if (!recipient) {
      console.error("Set TEST_EMAIL_RECIPIENT or EMAIL_USER in backend/.env to receive the test email.");
      process.exit(1);
    }

    console.log("Sending test email via Resend to", recipient);

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [recipient],
      subject: "OTP Test Email",
      text: "Your test OTP is: 123456",
    });

    if (error) {
      console.error("❌ Resend test failed:", error);
      process.exit(1);
    }

    console.log("✅ Resend test email sent! ID:", data?.id);
    process.exit(0);
  } catch (err) {
    console.error("❌ Resend test threw an error:", err);
    process.exit(1);
  }
})();
