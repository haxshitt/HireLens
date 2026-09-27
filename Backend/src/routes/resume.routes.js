const express = require("express");
const rateLimit = require("express-rate-limit");
const { authUser } = require("../middlewares/auth.middleware");
const { generateResumeController, getUserResumesController, downloadResumeController } = require("../controllers/resume.controller");

const resumeRouter = express.Router();

// Rate limit: Max 1 request per minute per user IP to prevent AI spam
const generateResumeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1,
    message: { message: "Too many resume generation requests from this IP. Please wait a minute and try again." },
    standardHeaders: true,
    legacyHeaders: false,
});
resumeRouter.post("/generate", authUser, generateResumeLimiter, generateResumeController);

resumeRouter.get("/", authUser, getUserResumesController);
resumeRouter.get("/download/:resumeId", authUser, downloadResumeController);

module.exports = resumeRouter;
