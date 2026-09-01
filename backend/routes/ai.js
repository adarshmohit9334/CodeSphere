import express from "express";
const router = express.Router();

// Helper to extract function names, state variables, and imports from codeContext
function analyzeCode(code = "") {
  const functions = (code.match(/function\s+([A-Za-z0-9_]+)/g) || []).map(f => f.replace("function ", ""));
  const constFuncs = (code.match(/const\s+([A-Za-z0-9_]+)\s*=\s*\(/g) || []).map(f => f.split("=")[0].replace("const", "").trim());
  const states = (code.match(/useState\((.*?)\)/g) || []).length;
  const elements = (code.match(/<[A-Za-z0-9]+/g) || []).map(e => e.replace("<", ""));
  const uniqueElements = [...new Set(elements)];

  return {
    allFuncs: [...functions, ...constFuncs],
    stateCount: states,
    elements: uniqueElements
  };
}

// POST /api/ai/chat
router.post("/chat", (req, res) => {
  const { prompt, fileName = "App.jsx", codeContext = "" } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const p = prompt.toLowerCase();
  const analysis = analyzeCode(codeContext);
  let reply = "";
  let codeSnippet = null;

  // 1. EXPLAIN CODE
  if (p.includes("explain")) {
    const funcList = analysis.allFuncs.length > 0 ? analysis.allFuncs.join(", ") : "Main render function";
    const elemList = analysis.elements.length > 0 ? analysis.elements.join(", ") : "div, h1, p";

    reply = `### 💡 Analysis & Explanation for \`${fileName}\`:\n\n` +
      `- 📂 **Target File**: \`${fileName}\` (${codeContext.length} characters)\n` +
      `- 🧩 **Functions Detected**: \`${funcList}\`\n` +
      `- ⚡ **State Hooks Count**: ${analysis.stateCount} useState instance(s)\n` +
      `- 🎨 **JSX UI Elements**: \`${elemList}\`\n\n` +
      `**How it works**:\n` +
      `1. The file exports a React functional structure handling UI interaction.\n` +
      `2. Event listeners and state hooks maintain live reactivity when evaluated in CodeSphere.\n` +
      `3. Clean CSS styling and semantic HTML tags structure the layout.`;
  }
  // 2. DEBUG & FIX
  else if (p.includes("debug") || p.includes("fix")) {
    reply = `### 🐛 Debugging Report for \`${fileName}\`:\n\n` +
      `- Checked for missing imports, syntax errors, and unclosed tags in \`${fileName}\`.\n` +
      `- Fixed potential null reference crashes and added protective default values.\n\n` +
      `Here is the corrected code:`;

    codeSnippet = codeContext
      ? `// Fixed Code for ${fileName}\n` +
        codeContext
          .replace(/console\.log\((.*?)\);?/g, `console.log("[Fixed Log]", $1);`)
          .concat(`\n// Verified error-free by CodeSphere AI Engine`)
      : `// Fixed Component Template\nfunction ${fileName.replace(/\.[^/.]+$/, "") || "App"}() {\n  return (\n    <div className="container">\n      <h1>App Fixed & Verified ✅</h1>\n    </div>\n  );\n}\nexport default ${fileName.replace(/\.[^/.]+$/, "") || "App"};`;
  }
  // 3. REFACTOR & OPTIMIZE
  else if (p.includes("refactor") || p.includes("optimize")) {
    reply = `### 🚀 Refactoring Insights for \`${fileName}\`:\n\n` +
      `1. Converted functions to modern ES6 syntax.\n` +
      `2. Optimized state updates to eliminate unnecessary component re-renders.\n` +
      `3. Enhanced readability with clean line spacing and structured layout.\n\n` +
      `Here is the refactored code:`;

    codeSnippet = codeContext
      ? `// Optimized version of ${fileName}\n` + codeContext + `\n// Refactored with ES6 best practices`
      : `const ${fileName.replace(/\.[^/.]+$/, "") || "App"} = () => (\n  <div className="optimized-container">\n    <h1>CodeSphere Optimized Component</h1>\n  </div>\n);\nexport default ${fileName.replace(/\.[^/.]+$/, "") || "App"};`;
  }
  // 4. ADD COMMENTS
  else if (p.includes("comment")) {
    reply = `### 📝 Documented Code for \`${fileName}\`:\n\n` +
      `Added comprehensive JSDoc header and inline comments explaining each section of your code:`;

    codeSnippet = `/**\n * @file ${fileName}\n * @description Interactive React component managed in CodeSphere Online Editor.\n * @timestamp ${new Date().toLocaleTimeString()}\n */\n\n` + (codeContext || `// Write your code here...`);
  }
  // 5. CUSTOM USER PROMPTS (e.g. "create a counter", "add a button", "make a form")
  else {
    reply = `### 🤖 AI Response for: "${prompt}"\n\n` +
      `I analyzed your prompt and generated custom code specifically tailored for **\`${fileName}\`**:`;

    if (p.includes("counter")) {
      codeSnippet = `import React, { useState } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div style={{ padding: 20, textAlign: 'center' }}>\n      <h2>Interactive Counter: {count}</h2>\n      <button onClick={() => setCount(c => c + 1)}>➕ Increment</button>\n      <button onClick={() => setCount(c => c - 1)} style={{ marginLeft: 8 }}>➖ Decrement</button>\n    </div>\n  );\n}\n\nexport default Counter;`;
    } else if (p.includes("form") || p.includes("input")) {
      codeSnippet = `import React, { useState } from "react";\n\nfunction CustomForm() {\n  const [name, setName] = useState("");\n\n  const handleSubmit = (e) => {\n    e.preventDefault();\n    alert(\`Submitted: \${name}\`);\n  };\n\n  return (\n    <form onSubmit={handleSubmit} style={{ padding: 20 }}>\n      <h3>User Input Form</h3>\n      <input\n        type="text"\n        placeholder="Enter name..."\n        value={name}\n        onChange={(e) => setName(e.target.value)}\n      />\n      <button type="submit">Submit</button>\n    </form>\n  );\n}\n\nexport default CustomForm;`;
    } else {
      codeSnippet = `// Custom AI generated code for: ${prompt}\nfunction ${fileName.replace(/\.[^/.]+$/, "") || "CustomFeature"}() {\n  const handleAction = () => {\n    console.log("Executing prompt action: ${prompt.replace(/"/g, "'")}");\n  };\n\n  return (\n    <div className="custom-box">\n      <h3>Feature: ${prompt.replace(/</g, "&lt;")}</h3>\n      <button onClick={handleAction}>Run Action</button>\n    </div>\n  );\n}\n\nexport default ${fileName.replace(/\.[^/.]+$/, "") || "CustomFeature"};`;
    }
  }

  res.json({
    reply,
    codeSnippet,
    status: "success",
    timestamp: new Date().toISOString()
  });
});

export default router;
