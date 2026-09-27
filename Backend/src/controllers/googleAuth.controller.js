const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { signTokenAndSetCookie } = require("../utils/token");

async function googleAuthController(req, res) {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      message: "Authorization code is required",
    });
  }

  // Exchange authorization code for tokens
  let tokens;
  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "postmessage",
        grant_type: "authorization_code",
      },
    );
    tokens = tokenResponse.data;
  } catch (err) {
    return res.status(400).json({
      message: "Failed to exchange authorization code with Google",
    });
  }

  // Fetch user info from Google
  let googleUser;
  try {
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      },
    );
    googleUser = userInfoResponse.data;
  } catch (err) {
    return res.status(400).json({
      message: "Failed to fetch user info from Google",
    });
  }

  const { sub: googleId, email, name } = googleUser;

  if (!email) {
    return res.status(400).json({
      message: "Google account does not have an email address",
    });
  }

  // Find or create user by email (join key)
  let user = await userModel.findOne({ email });

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId;
    }
    if (!user.isVerified) {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
    }
    await user.save();
  } else {
    let username = name || email.split("@")[0];
    const existingUsername = await userModel.findOne({ username });
    if (existingUsername) {
      const suffix = Math.random().toString(36).substring(2, 6);
      username = `${username}_${suffix}`;
    }

    user = await userModel.create({
      username,
      email,
      googleId,
      authProvider: "google",
      isVerified: true,
    });
  }

  signTokenAndSetCookie(res, user);

  res.status(200).json({
    message: "Google authentication successful",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

module.exports = {
  googleAuthController,
};
