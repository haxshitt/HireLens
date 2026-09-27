const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map(url => url.trim().replace(/\/$/, "")) : [])
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/$/, "");
        if (allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.endsWith(".vercel.app")) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true
}));

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const resumeRouter = require("./routes/resume.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/resume", resumeRouter)

// Global Error Handler to prevent 500 errors from stripping CORS headers
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});

module.exports = app

