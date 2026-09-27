const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: [true, "username already taken"],
  },

  email: {
    type: String,
    required: true,
    unique: [true, "user with this username already exists"],
  },

  password: {
    type: String,
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  otp: {
    type: String,
  },

  otpExpiry: {
    type: Date,
  },

  lastOtpSentAt: {
    type: Date,
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },

  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },

});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
