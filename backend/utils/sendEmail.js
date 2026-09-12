const nodemailer = require("nodemailer");

// Uses real SMTP if credentials are set in .env. Otherwise falls back to
// logging the email to the console — so OTP login works out of the box in
// local development without requiring an email provider.
function getTransport() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS are required in production");
  }

  return null;
}

async function sendOtpEmail(to, code) {
  const transport = getTransport();
  const subject = "Your MedQuanta verification code";
  const text = `Your MedQuanta login code is ${code}. It expires in 10 minutes.`;

  if (!transport) {
    // Dev fallback — makes the OTP visible in server logs so login flow is
    // testable without configuring a real mail provider.
    console.log(`\n[DEV EMAIL] To: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || "MedQuanta <no-reply@medquanta.local>",
    to,
    subject,
    text,
  });
}

module.exports = { sendOtpEmail };
