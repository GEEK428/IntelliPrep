const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const { rateLimit } = require("express-rate-limit")
const { RedisStore } = require("rate-limit-redis")
const { redisClient } = require("./utils/redis")
const requestLogger = require("./middlewares/logger.middleware")

const app = express()

// Trust proxy is required for accurate rate limiting when deployed (Render, Vercel, etc.)
app.set('trust proxy', 1);

// Global Store for Rate Limiting (Redis preference, Fallback to Memory)
const store = redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: "rl:", // Rate Limit prefix
}) : undefined;

// Security & Performance Middlewares
app.use(helmet())
app.use(compression())
app.use(requestLogger)

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, 
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store,
    skip: (req) => req.method === 'OPTIONS' || req.path === '/api/health',
    message: { message: "Too many requests from this IP, please try again later." }
})
app.use(limiter)

// Stricter limit specifically for AI routes — unique store to prevent ERR_ERL_STORE_REUSE
const aiStore = redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
    prefix: "rl-ai:", 
}) : undefined;

const aiLimiter = rateLimit({
    windowMs: 60 * 1000, 
    limit: 15,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: aiStore,
    skip: (req) => req.method === 'OPTIONS',
    message: { message: "AI request limit reached. Please wait a moment." }
})

// Apply strict limit to AI routes specifically
app.use("/api/interview/resume/pdf", aiLimiter)
app.use("/api/notes/ai-answer", aiLimiter)
app.use("/api/interview/generate", aiLimiter)

// Safety: Global Request Timeout Middleware (90s)
app.use((req, res, next) => {
    const timeout = 90000;
    res.setTimeout(timeout, () => {
        console.error(`[TIMEOUT] Request to ${req.originalUrl} timed out after ${timeout/1000}s`);
        if (!res.headersSent) {
            res.status(503).json({ message: "Service temporarily delayed. Please try again." });
        }
    });
    next();
});

app.use(express.json({ limit: "2mb" }))
app.use(cookieParser())
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://40.81.231.38.nip.io:5173",
    process.env.FRONTEND_URL
].filter(Boolean)
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true
}))

app.get("/api/health", (req, res) => {
    return res.status(200).json({ ok: true, service: "backend", timestamp: new Date().toISOString() })
})

app.get("/", (req, res) => {
    return res.status(200).json({ message: "IntelliPrep API is running.", version: "1.0.0" })
})

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const noteRouter = require("./routes/note.routes")
const progressRouter = require("./routes/progress.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/notes", noteRouter)
app.use("/api/progress", progressRouter)

app.use((err, req, res, next) => {
    if (!err) {
        return next()
    }

    const rawMessage = String(err?.message || "")
    const normalizedMessage = rawMessage.toLowerCase()
    const statusCode = Number(err?.status || err?.statusCode || 0)
    const isAiLimitError = statusCode === 429
        || normalizedMessage.includes("resource_exhausted")
        || normalizedMessage.includes("quota")
        || normalizedMessage.includes("rate limit")
        || normalizedMessage.includes("too many requests")
        || normalizedMessage.includes("429")

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            message: "File size exceeds 10MB limit."
        })
    }

    if (isAiLimitError) {
        return res.status(429).json({
            message: "You have reached limit. Please answer yourself."
        })
    }

    if (err.message) {
        return res.status(400).json({
            message: err.message
        })
    }

    return res.status(500).json({
        message: "Internal server error."
    })
})



module.exports = app
