import React, { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { io } from "socket.io-client";
import "@xterm/xterm/css/xterm.css";

export default function TerminalPanel({ currentProject }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const socketRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    // Initialize xterm
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#161b22', // GitHub/VS Code dark background
        foreground: '#e6edf3',
      },
      fontFamily: '"Consolas", "Courier New", monospace',
      fontSize: 14,
      scrollback: 1000
    });
    xtermRef.current = term;

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    
    // Slight delay to ensure DOM is ready before fitting
    setTimeout(() => {
      fitAddon.fit();
    }, 100);

    // Connect to backend via Socket.IO
    const API_BASE = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : `http://${window.location.hostname}:5000`;
    
    const socket = io(API_BASE, { 
      query: { project: currentProject || '' } 
    }); 
    socketRef.current = socket;

    socket.on("connect", () => {
      // Intentionally silent on connect to act like a real terminal
    });

    socket.on("terminal:data", (data) => {
      term.write(data);
    });

    socket.on("disconnect", () => {
      term.write("\r\n*** Disconnected from terminal backend ***\r\n");
    });

    // Handle user input
    term.onData((data) => {
      socket.emit("terminal:write", data);
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
      socket.emit("terminal:resize", { cols: term.cols, rows: term.rows });
    };

    window.addEventListener("resize", handleResize);

    // Initial resize sync after connection
    setTimeout(handleResize, 200);

    // Handle programmatic command execution
    const handleRunCommand = (e) => {
      const command = e.detail;
      socket.emit("terminal:write", command + "\r");
    };
    window.addEventListener("terminal:run-command", handleRunCommand);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("terminal:run-command", handleRunCommand);
      socket.disconnect();
      term.dispose();
    };
  }, [currentProject]);

  return (
    <div 
      ref={terminalRef} 
      className="terminal-container" 
      style={{ height: "100%", width: "100%", overflow: "hidden", padding: "8px" }} 
    />
  );
}
