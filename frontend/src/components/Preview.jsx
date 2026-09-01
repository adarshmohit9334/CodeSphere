import { useEffect, useRef } from "react";

function Preview({ files, onConsoleMessage, runCode }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    // Only run when user explicitly clicks Run button (runCode > 0)
    if (!runCode) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    // ----------------------------------------
    // FIND FILES
    // ----------------------------------------
    const appFile = files.find((file) => file.name === "App.jsx" || file.name === "App.js");
    const cssFile = files.find((file) => file.name === "index.css" || file.name === "App.css");
    const componentFiles = files.filter(
      (file) =>
        (file.name.endsWith(".jsx") || file.name.endsWith(".js")) &&
        file.name !== "App.jsx" &&
        file.name !== "App.js" &&
        file.name !== "main.jsx" &&
        file.name !== "main.js"
    );

    let appCode = appFile ? appFile.code || "" : "";
    const cssCode = cssFile ? cssFile.code || "" : "";

    // Helper function to clean imports and exports
    const cleanCode = (codeStr) => {
      let cleaned = codeStr;
      // Remove import lines
      cleaned = cleaned.replace(/import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?/g, "");
      cleaned = cleaned.replace(/import\s+['"][^'"]+['"];?/g, "");
      cleaned = cleaned.replace(/import\s+.*$/gm, "");

      // Replace exports
      cleaned = cleaned.replace(/export\s+default\s+function\s+/g, "function ");
      cleaned = cleaned.replace(/export\s+default\s+class\s+/g, "class ");
      cleaned = cleaned.replace(/export\s+default\s+/g, "");
      cleaned = cleaned.replace(/export\s+const\s+/g, "const ");
      cleaned = cleaned.replace(/export\s+function\s+/g, "function ");
      cleaned = cleaned.replace(/export\s+class\s+/g, "class ");

      return cleaned;
    };

    const cleanedAppCode = cleanCode(appCode);

    let extraComponentsCode = "";
    componentFiles.forEach((file) => {
      extraComponentsCode += `\n${cleanCode(file.code || "")}\n`;
    });

    // Construct full HTML document with Babel transform
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <style>
    ${cssCode}
    body {
      margin: 0;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- React & ReactDOM CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.development.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.development.js"></script>
  
  <!-- Babel Standalone CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.5/babel.min.js"></script>

  <script>
    // Console interceptor
    (function() {
      const origLog = console.log;
      const origErr = console.error;
      const origWarn = console.warn;

      console.log = function(...args) {
        window.parent.postMessage({
          type: "console",
          message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")
        }, "*");
        origLog.apply(console, args);
      };

      console.error = function(...args) {
        window.parent.postMessage({
          type: "error",
          message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")
        }, "*");
        origErr.apply(console, args);
      };

      console.warn = function(...args) {
        window.parent.postMessage({
          type: "warn",
          message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ")
        }, "*");
        origWarn.apply(console, args);
      };

      window.onerror = function(msg, url, line, col, err) {
        window.parent.postMessage({
          type: "error",
          message: String(msg)
        }, "*");
      };
    })();
  </script>

  <script>
    function renderApp() {
      if (typeof Babel === 'undefined' || typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        setTimeout(renderApp, 40);
        return;
      }

      try {
        const rawCode = \`
          ${extraComponentsCode}

          ${cleanedAppCode}

          if (typeof App !== 'undefined') {
            const rootEl = document.getElementById("root");
            const root = ReactDOM.createRoot(rootEl);
            root.render(React.createElement(App));
          } else {
            console.error("App component is not defined in App.jsx");
          }
        \`;

        // Transform JSX to JS via Babel
        const compiled = Babel.transform(rawCode, {
          presets: ["react"]
        }).code;

        // Execute compiled code
        eval(compiled);
      } catch (err) {
        console.error(err.message || err);
      }
    }

    renderApp();
  </script>
</body>
</html>
`;

    iframe.srcdoc = html;
  }, [runCode]);

  // Listen for console messages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data || !event.data.type) return;

      if (event.data.type === "console") {
        onConsoleMessage(event.data.message);
      } else if (event.data.type === "error") {
        onConsoleMessage(`❌ ${event.data.message}`);
      } else if (event.data.type === "warn") {
        onConsoleMessage(`⚠️ ${event.data.message}`);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onConsoleMessage]);

  return (
    <section className="preview-panel">
      <div className="preview-header">
        <span>▶</span>
        <span>Preview</span>
      </div>
      <iframe
        ref={iframeRef}
        title="Code Preview"
        className="preview-frame"
        sandbox="allow-scripts allow-same-origin"
      />
    </section>
  );
}

export default Preview;