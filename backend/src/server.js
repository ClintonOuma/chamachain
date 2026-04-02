const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const { validateEnv } = require("./config/validateEnv");
const { startCronJobs } = require('./services/cronService');
const { generalLimiter } = require('./middleware/rateLimiter');

dotenv.config({ path: path.join(__dirname, "..", ".env") });
validateEnv();

const app = express();
app.set("trust proxy", 1);

// Allow SPA on another origin (e.g. Vite :5173) to read API responses
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const corsStrict =
  process.env.CORS_STRICT === "1" || process.env.CORS_STRICT === "true";

function buildCorsOrigins() {
  const origins = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]);
  const raw =
    process.env.CORS_ORIGINS?.trim() ||
    process.env.FRONTEND_URL?.trim() ||
    "";
  for (const part of raw.split(",")) {
    const o = part.trim().replace(/\/$/, "");
    if (o) origins.add(o);
  }
  return [...origins];
}

app.use(
  cors({
    origin: corsStrict ? buildCorsOrigins() : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use('/api/', generalLimiter);

const authRoutes = require('./routes/authRoutes');
app.use('/api/v1/auth', authRoutes);

const chamaRoutes = require('./routes/chamaRoutes');
app.use('/api/v1/chamas', chamaRoutes);

const contributionRoutes = require('./routes/contributionRoutes');
app.use('/api/v1/contributions', contributionRoutes);

const loanRoutes = require('./routes/loanRoutes');
app.use('/api/v1/loans', loanRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/v1/notifications', notificationRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/v1/users', userRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/v1/ai', aiRoutes);

const reportRoutes = require('./routes/reportRoutes') 
app.use('/api/v1/reports', reportRoutes) 

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const mongoUri = process.env.MONGODB_URI.trim();

app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, message: "ChamaChain API running" });
});

const { errorHandler, notFound } = require('./middleware/errorHandler')
app.use(notFound)
app.use(errorHandler)

const startPort = Number.parseInt(process.env.PORT, 10) || 4000;
const MAX_PORT_TRIES = 30;

function listenWithFallback(port, triesLeft) {
  if (triesLeft <= 0) {
    console.error("Could not bind to any port after multiple attempts.");
    process.exit(1);
  }

  function onListening() {
    server.removeListener("error", onError);
    process.env.ACTUAL_PORT = String(port);
    console.log(`Server running on port ${port}`);
  }

  function onError(err) {
    server.removeListener("listening", onListening);
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${port} in use, trying ${port + 1}...`);
      listenWithFallback(port + 1, triesLeft - 1);
    } else {
      console.error(err);
      process.exit(1);
    }
  }

  server.once("listening", onListening);
  server.once("error", onError);
  server.listen(port);
}

async function start() {
  try {
    mongoose.set("bufferCommands", false);
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
    startCronJobs();
    listenWithFallback(startPort, MAX_PORT_TRIES);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };

