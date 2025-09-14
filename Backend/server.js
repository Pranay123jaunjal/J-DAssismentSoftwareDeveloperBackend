// Backend/server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // keep your DB connector
const ProfileRoute = require("./routes/ProfileRoutes");
const ProjectRoute = require("./routes/ProjectRoutes");

const app = express();

// --- middleware ---
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// --- CORS () ---
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : ["*"];

app.use(
  cors({
    origin: function (origin, cb) {
      
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes("*")) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.options(/.*/, cors());

// ===== API Routes =====
app.use("/api/Profile", ProfileRoute);
app.use("/api/Project", ProjectRoute);

// ===== Health-check endpoint =====
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// ===== Serve static frontend (UI/staticUi) =====

const frontendPath = path.join(__dirname, "..", "staticUi");


app.use(express.static(frontendPath));

app.get("/*", (req, res, next) => {
  // If the request targets our API, skip this handler
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(frontendPath, "index.html"), (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send("Server error");
    }
  });
});

// ===== Error Handling Middleware =====
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err && err.stack ? err.stack : err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB(); // your DB connection
    const server = app.listen(PORT, () =>
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} on port ${PORT}`
      )
    );

    process.on("SIGTERM", () => {
      console.log("SIGTERM received - shutting down");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
