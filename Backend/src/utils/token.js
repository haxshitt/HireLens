const jwt = require("jsonwebtoken");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
};

function signTokenAndSetCookie(res, user) {
  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.cookie("token", token, COOKIE_OPTIONS);
  return token;
}

function clearTokenCookie(res) {
  res.clearCookie("token", COOKIE_OPTIONS);
}

module.exports = { signTokenAndSetCookie, clearTokenCookie };
