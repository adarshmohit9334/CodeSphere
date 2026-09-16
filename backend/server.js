import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import os from "os";
import fs from "fs";
import path from "path";
import pty from "node-pty";

import projectsRouter, { getProjectByName } from "./routes/projects.js";
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
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/projects", projectsRouter);
app.use("/api/execute", executeRouter);
app.use("/api/ai", aiRouter);

// Basic Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("Global Error Handler caught:", err);
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

io.on("connection", async (socket) => {
  console.log("Client connected to terminal socket");
  
  const projectName = socket.handshake.query.project || "";
  const project = await getProjectByName(projectName);
  
  let workspaceDir = project?.customPath || path.join(os.homedir(), "CodeSphere_Workspace");
  
  if (!project?.customPath && projectName) {
    workspaceDir = path.join(workspaceDir, projectName);
  }

  if (!fs.existsSync(workspaceDir)) {
    fs.mkdirSync(workspaceDir, { recursive: true });
  }

  const shellProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 30,
    cwd: workspaceDir,
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
  console.log(`🚀 CodeSphere Backend Server running at http://localhost:${PORT}`);
});
