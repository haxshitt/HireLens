const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")


const app = express()



app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("CORS not allowed"));
    },
    credentials: true
}));

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const resumeRouter = require("./routes/resume.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/resume", resumeRouter)


module.exports = app
