import React, { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { io } from "socket.io-client";
import "@xterm/xterm/css/xterm.css";

export default function TerminalPanel({ currentProject, theme }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const socketRef = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    // Initialize xterm
    // Determine initial colors
    const isLight = theme === 'vs-light';
    const isHC = theme === 'hc-black';
    
    const termTheme = {
      background: isLight ? '#ffffff' : (isHC ? '#000000' : '#161b22'),
      foreground: isLight ? '#24292e' : (isHC ? '#ffffff' : '#e6edf3'),
      cursor: isLight ? '#24292e' : '#ffffff'
    };

    const term = new Terminal({
      cursorBlink: true,
      theme: termTheme,
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
  }, [currentProject]); // Note: We do NOT want to re-run this on theme changes, we handle theme changes separately.

  // Handle dynamic theme changes without reconnecting
  useEffect(() => {
    if (xtermRef.current) {
      const isLight = theme === 'vs-light';
      const isHC = theme === 'hc-black';
      xtermRef.current.options.theme = {
        background: isLight ? '#ffffff' : (isHC ? '#000000' : '#161b22'),
        foreground: isLight ? '#24292e' : (isHC ? '#ffffff' : '#e6edf3'),
        cursor: isLight ? '#24292e' : '#ffffff'
      };
    }
  }, [theme]);

  return (
    <div 
      ref={terminalRef} 
      className="terminal-container" 
      style={{ height: "100%", width: "100%", overflow: "hidden", padding: "8px" }} 
    />
  );
}
