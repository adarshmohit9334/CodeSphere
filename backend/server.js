import express from "express";
import cors from "cors";
import projectsRouter from "./routes/projects.js";
import executeRouter from "./routes/execute.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "10mb" }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "VS Code Editor Backend Server is running smoothly",
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/projects", projectsRouter);
app.use("/api/execute", executeRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 VS Code Clone Backend Server running at http://localhost:${PORT}`);
});
