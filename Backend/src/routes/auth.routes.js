const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const googleAuthController = require("../controllers/googleAuth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = Router();

authRouter.post("/register", authController.registerUserController);
authRouter.post("/login", authController.loginUserController);
authRouter.get("/logout", authController.logoutUserController);
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController);
authRouter.post("/verify-otp", authController.verifyOtpController);
authRouter.post("/resend-otp", authController.resendOtpController);
authRouter.post("/google", googleAuthController.googleAuthController);
authRouter.post("/forgot-password-otp", authController.forgotPasswordOtpController);
authRouter.post("/verify-reset-otp", authController.verifyResetOtpController);
authRouter.post("/reset-password", authController.resetPasswordController);

module.exports = authRouter;
