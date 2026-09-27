const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { signTokenAndSetCookie, clearTokenCookie } = require("../utils/token");
const { generateAndSendOtp } = require("../utils/mailer");

async function registerUserController(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Please provide username, email and password",
    });
  }

  const existingUser = await userModel.findOne({ email });

  if (existingUser && existingUser.isVerified) {
    return res.status(400).json({
      message: "Email already registered",
    });
  }

  const existingUsername = await userModel.findOne({ username });
  if (existingUsername) {
    return res.status(400).json({
      message: "Username already taken try differnt username",
    });
  }

  const hash = await bcrypt.hash(password, 10);

  if (existingUser && !existingUser.isVerified) {
    existingUser.username = username;
    existingUser.password = hash;
    await generateAndSendOtp(existingUser);
  } else {
    const user = await userModel.create({
      username,
      email,
      password: hash,
    });
    await generateAndSendOtp(user);
  }

  res.status(201).json({
    message: "OTP sent to your email",
    email,
  });
}

async function loginUserController(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  if (!user.isVerified) {
    const now = new Date();
    if (user.lastOtpSentAt && (now.getTime() - user.lastOtpSentAt.getTime() < 60000)) {
      return res.status(403).json({
        status: "unverified",
        message: "OTP recently sent. Please check your email.",
        email: user.email
      });
    }

    await generateAndSendOtp(user);

    return res.status(403).json({
      status: "unverified",
      message: "Please verify your email. A new OTP has been sent.",
      email: user.email
    });
  }

  if (user.authProvider === "google" && !user.password) {
    return res.status(400).json({
      message: "This account uses Google Sign-In. Please login with Google.",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  signTokenAndSetCookie(res, user);
  res.status(200).json({
    message: "User loggedIn successfully.",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function logoutUserController(req, res) {
  clearTokenCookie(res);
  res.status(200).json({
    message: "User logged out successfully",
  });
}

async function getMeController(req, res) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await userModel.findById(req.user.id);

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  res.status(200).json({
    message: "User details fetched successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function verifyOtpController(req, res) {
  const { email, otp } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "Already verified" });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Incorrect OTP. Please enter the correct OTP." });
  }

  if (user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "OTP expired. Please resend OTP." });
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const token = signTokenAndSetCookie(res, user);

  res.status(200).json({
    message: "Email verified",
    token,
  });
}

async function resendOtpController(req, res) {
  const { email } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "Already verified" });
  }

  const now = new Date();
  if (user.lastOtpSentAt && (now.getTime() - user.lastOtpSentAt.getTime() < 60000)) {
    return res.status(429).json({
      message: "Please wait before requesting another OTP.",
    });
  }

  await generateAndSendOtp(user);

  res.status(200).json({ message: "OTP resent" });
}

async function forgotPasswordOtpController(req, res) {
  const { email } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "If an account exists with this email, an OTP will be sent.",
    });
  }

  const now = new Date();
  if (user.lastOtpSentAt && (now.getTime() - user.lastOtpSentAt.getTime() < 60000)) {
    return res.status(429).json({
      message: "Please wait before requesting another OTP.",
    });
  }

  await generateAndSendOtp(user);

  res.status(200).json({ message: "OTP sent to your email" });
}

async function resetPasswordController(req, res) {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Incorrect OTP." });
  }

  if (user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "OTP expired." });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  user.password = hash;
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  signTokenAndSetCookie(res, user);

  res.status(200).json({
    message: "Password reset successful.",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function verifyResetOtpController(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Incorrect OTP." });
  }

  if (user.otpExpiry < new Date()) {
    return res.status(400).json({ message: "OTP expired." });
  }

  res.status(200).json({ message: "OTP verified." });
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController,
  verifyOtpController,
  resendOtpController,
  forgotPasswordOtpController,
  verifyResetOtpController,
  resetPasswordController,
};
