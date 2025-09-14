require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const ProfileRoute=require("./routes/ProfileRoutes")
const ProjectRoute=require("./routes/ProjectRoutes")
const app = express();
app.use(express.json());
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s=>s.trim()) : ['*'];
app.use(cors({
  origin: function(origin, cb){
    if(!origin) return cb(null, true);
    if(allowedOrigins.includes('*')) return cb(null, true);
    if(allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']
}));
app.options(/.*/, cors());




// ===== Routes =====
app.use("/api/Profile",ProfileRoute);
app.use("/api/Project",ProjectRoute);

// Health-check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// ===== Error Handling Middleware =====
app.use((err, req, res, next) => {
  console.error(" Unhandled Error:", err);

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () =>
      console.log(` Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    );

    process.on("SIGTERM", () => {
      console.log(" SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log(" Server closed");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error(" Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
