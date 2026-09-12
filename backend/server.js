require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patients");
const caseRoutes = require("./routes/cases");

const app = express();

function requiredEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function validateEnvironment() {
  requiredEnv("MONGO_URI");
  requiredEnv("JWT_SECRET");

  if (process.env.NODE_ENV === "production") {
    if (!process.env.CLIENT_ORIGIN && !process.env.CLIENT_ORIGINS && !process.env.FRONTEND_URL) {
      throw new Error("Missing required environment variable: CLIENT_ORIGIN, CLIENT_ORIGINS, or FRONTEND_URL");
    }
  }
}

function normalizeOrigin(origin) {
  try {
    return new URL(origin).origin;
  } catch {
    return origin.replace(/\/+$/, "");
  }
}

function parseAllowedOrigins() {
  const configuredOrigins = [
    process.env.CLIENT_ORIGIN,
    process.env.CLIENT_ORIGINS,
    process.env.FRONTEND_URL,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(","))
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins.length === 0) {
    configuredOrigins.push("https://medquanta-front.onrender.com/");
  }

  configuredOrigins.push("https://medquanta-front.onrender.com/");

  return new Set(configuredOrigins.map(normalizeOrigin));
}

function isAllowedOrigin(origin) {
  return !origin || allowedOrigins.has(normalizeOrigin(origin));
}

validateEnvironment();
connectDB();

if (process.env.TRUST_PROXY || process.env.NODE_ENV === "production") {
  app.set("trust proxy", Number(process.env.TRUST_PROXY || 1));
}

const allowedOrigins = parseAllowedOrigins();
const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  const { origin } = req.headers;

  if (origin && isAllowedOrigin(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Methods", corsOptions.methods.join(","));
    res.header("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(","));
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});
app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/cases", caseRoutes);

// Fallback error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MedQuanta server running on port ${PORT}`));
