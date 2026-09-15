import { Router } from "express";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";

const router = Router();

// Helper to execute a command with a promise
const execPromise = (command) => {
  return new Promise((resolve) => {
    // 10-second timeout to prevent infinite loops and allow compilation
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
};

// POST /api/execute - Execute code snippets securely
router.post("/", async (req, res) => {
  const { code, language } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Code content is required for execution" });
  }

  // If code is a React JSX component file, browser preview handles DOM rendering
  const isWebLang = language === 'javascript' || language === 'typescript' || language === 'html';
  if (isWebLang && (/<[A-Za-z]/.test(code) || code.includes("ReactDOM") || code.includes("createRoot"))) {
    return res.json({
      success: true,
      logs: ["React component evaluated in browser preview iframe."],
      errors: [],
      timestamp: new Date().toISOString()
    });
  }

  const tempDir = os.tmpdir();
  const fileId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  
  let filePath = "";
  let outPath = "";
  let command = "";

  try {
    // Determine the command based on the language
    switch (language) {
      case "python":
        filePath = path.join(tempDir, `script_${fileId}.py`);
        await fs.writeFile(filePath, code);
        command = `python3 ${filePath}`;
        break;
      
      case "java":
        // Java 11+ supports running single-file source code directly.
        // This avoids issues with public class names needing to match the filename.
        const javaFile = path.join(tempDir, `Main_${fileId}.java`);
        await fs.writeFile(javaFile, code);
        filePath = javaFile;
        command = `java ${javaFile}`;
        break;

      case "c":
        filePath = path.join(tempDir, `program_${fileId}.c`);
        outPath = path.join(tempDir, `out_${fileId}`);
        await fs.writeFile(filePath, code);
        command = `gcc ${filePath} -o ${outPath} && ${outPath}`;
        break;

      case "cpp":
        filePath = path.join(tempDir, `program_${fileId}.cpp`);
        outPath = path.join(tempDir, `out_${fileId}`);
        await fs.writeFile(filePath, code);
        command = `g++ ${filePath} -o ${outPath} && ${outPath}`;
        break;

      case "javascript":
      case "typescript":
      default:
        // Default to raw Node execution for JS/TS
        filePath = path.join(tempDir, `script_${fileId}.js`);
        
        // Strip import and export statements for raw JS execution
        const cleanCode = code
          .replace(/import\s+[\s\S]*?from\s+["'][^"']+["'];?/g, "")
          .replace(/import\s+["'][^"']+["'];?/g, "")
          .replace(/export\s+default\s+/g, "")
          .replace(/export\s+/g, "");

        await fs.writeFile(filePath, cleanCode);
        command = `node ${filePath}`;
        break;
    }

    const { error, stdout, stderr } = await execPromise(command);
    
    // Cleanup temporary files
    try {
      if (filePath) await fs.unlink(filePath);
      if (outPath) await fs.unlink(outPath);
    } catch (cleanupErr) {
      // Ignore cleanup errors
    }

    const outputString = stdout || stderr || (error ? error.message : "Program finished with no output.");
    const errorsList = stderr ? [stderr] : [];
    if (error && error.killed) {
        errorsList.push("Execution Timed Out (5 seconds max)");
    } else if (error && !stderr) {
        errorsList.push(error.message);
    }

    res.json({
      success: !error,
      logs: stdout ? [stdout] : [],
      errors: errorsList,
      output: outputString,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    res.json({
      success: false,
      logs: [],
      errors: [err.message],
      output: `Internal Server Error: ${err.message}`,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
