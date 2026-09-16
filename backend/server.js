import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import os from "os";
import pty from "node-pty";

import projectsRouter from "./routes/projects.js";
import executeRouter from "./routes/execute.js";
import aiRouter from "./routes/ai.js";

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

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
app.use("/api/ai", aiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

import { spawn } from "child_process";

// --- Terminal Socket.io Setup ---
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Determine the default shell for the OS
const shell = process.env.SHELL || (os.platform() === 'win32' ? 'powershell.exe' : '/bin/zsh');

io.on("connection", (socket) => {
  console.log("Client connected to terminal socket");
  
  const shellProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME || process.cwd(),
    env: process.env
  });

  shellProcess.onData((data) => {
    socket.emit("terminal:data", data);
  });

  socket.on("terminal:write", (data) => {
    shellProcess.write(data);
  });

  socket.on("terminal:resize", ({ cols, rows }) => {
    try {
      shellProcess.resize(cols, rows);
    } catch (e) {}
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected from terminal socket");
    try {
      shellProcess.kill();
    } catch (e) {}
  });
});

server.listen(PORT, () => {
  console.log(`🚀 VS Code Clone Backend Server running at http://localhost:${PORT}`);
});
