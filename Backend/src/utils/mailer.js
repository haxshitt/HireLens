const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification OTP",
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #333;">Email Verification</h2>
                <p>Your OTP for email verification is:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; margin: 16px 0;">
                    ${otp}
                </div>
                <p style="color: #666; font-size: 14px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
            </div>
        `,
  };

  await transporter.sendMail(mailOptions);
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function generateAndSendOtp(user) {
  const otp = generateOtp();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  user.lastOtpSentAt = new Date();
  await user.save();
  await sendOtpEmail(user.email, otp);
  return otp;
}

module.exports = { sendOtpEmail, generateOtp, generateAndSendOtp };

