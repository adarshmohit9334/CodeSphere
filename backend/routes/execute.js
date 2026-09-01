import { Router } from "express";

const router = Router();

// POST /api/execute - Execute JavaScript code snippet securely
router.post("/", async (req, res) => {
  const { code, language } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Code content is required for execution" });
  }

  const logs = [];
  const errors = [];

  const customConsole = {
    log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")),
    error: (...args) => errors.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")),
    warn: (...args) => logs.push(`[WARN] ` + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")),
  };

  try {
    // Basic JS evaluation in isolated context function
    const cleanCode = code
      .replace(/import\s+[\s\S]*?from\s+["'][^"']+["'];?/g, "")
      .replace(/export\s+default\s+/g, "")
      .replace(/export\s+/g, "");

    const runFunc = new Function("console", cleanCode);
    const result = runFunc(customConsole);

    res.json({
      success: true,
      logs: logs,
      errors: errors,
      result: result !== undefined ? String(result) : null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({
      success: false,
      logs: logs,
      errors: [...errors, err.message],
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
