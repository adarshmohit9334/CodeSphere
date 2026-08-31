import { useEffect, useRef } from "react";

function Preview({
  files,
  onConsoleMessage,
  runCode,
}) {
  const iframeRef = useRef(null);

  // =========================================
  // RECEIVE CONSOLE MESSAGES FROM IFRAME
  // =========================================

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "console") {
        onConsoleMessage(event.data.message);
      }

      if (event.data?.type === "error") {
        onConsoleMessage(
          `❌ ${event.data.message}`
        );
      }
    };

    window.addEventListener(
      "message",
      handleMessage
    );

    return () => {
      window.removeEventListener(
        "message",
        handleMessage
      );
    };
  }, [onConsoleMessage]);

  // =========================================
  // RUN PREVIEW
  // =========================================

  useEffect(() => {
    if (!iframeRef.current) {
      return;
    }

    const appFile = files.find(
      (file) => file.name === "App.jsx"
    );

    const cssFile = files.find(
      (file) => file.name === "index.css"
    );

    if (!appFile) {
      return;
    }

    // =========================================
    // CSS
    // =========================================

    const cssCode = cssFile
      ? cssFile.code
      : "";

    // =========================================
    // FIND IMPORTED COMPONENTS
    // =========================================

    const importedFiles = [];

    const importRegex =
      /import\s+(\w+)\s+from\s+["']\.\/(.+?)["'];?/g;

    let match;

    while (
      (match =
        importRegex.exec(appFile.code)) !== null
    ) {
      const importedName = match[1];
      const importedPath = match[2];

      const importedFile = files.find(
        (file) =>
          file.name === importedPath ||
          file.name === `${importedPath}.jsx` ||
          file.name === `${importedPath}.js`
      );

      if (importedFile) {
        importedFiles.push({
          name: importedName,
          file: importedFile,
        });
      }
    }

    // =========================================
    // COMPONENT CODE
    // =========================================

    let componentCode = "";

    importedFiles.forEach(
      ({ file }) => {
        let code = file.code;

        // Remove imports
        code = code.replace(
          /import\s+.*?from\s+["'].*?["'];?/g,
          ""
        );

        // Remove export default
        code = code.replace(
          /export\s+default\s+\w+\s*;?/g,
          ""
        );

        // Remove export
        code = code.replace(
          /export\s+/g,
          ""
        );

        componentCode += `

/* =====================================
   ${file.name}
===================================== */

${code}

`;
      }
    );

    // =========================================
    // APP CODE
    // =========================================

    let appCode = appFile.code;

    // Remove imports
    appCode = appCode.replace(
      /import\s+.*?from\s+["'].*?["'];?/g,
      ""
    );

    // Remove export default
    appCode = appCode.replace(
      /export\s+default\s+\w+\s*;?/g,
      ""
    );

    // =========================================
    // HTML
    // =========================================

    const html = `
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <style>

    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    ${cssCode}

  </style>

</head>

<body>

  <div id="root"></div>

  <!-- React -->

  <script
    src="https://unpkg.com/react@18/umd/react.development.js"
  ></script>

  <!-- React DOM -->

  <script
    src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"
  ></script>

  <!-- Babel -->

  <script
    src="https://unpkg.com/@babel/standalone/babel.min.js"
  ></script>

  <!-- React Application -->

  <script type="text/babel">

    // =====================================
    // CONSOLE LOG
    // =====================================

    const originalConsoleLog = console.log;

    console.log = (...args) => {

      const message = args
        .map((item) => {

          if (
            typeof item === "object" &&
            item !== null
          ) {
            try {
              return JSON.stringify(item);
            } catch {
              return String(item);
            }
          }

          return String(item);

        })
        .join(" ");

      window.parent.postMessage(
        {
          type: "console",
          message: message,
        },
        "*"
      );

      originalConsoleLog(...args);
    };


    // =====================================
    // ERROR HANDLING
    // =====================================

    window.addEventListener(
      "error",
      (event) => {

        window.parent.postMessage(
          {
            type: "error",
            message:
              event.message ||
              "Unknown error",
          },
          "*"
        );

      }
    );


    window.addEventListener(
      "unhandledrejection",
      (event) => {

        window.parent.postMessage(
          {
            type: "error",
            message:
              event.reason?.message ||
              String(event.reason),
          },
          "*"
        );

      }
    );


    // =====================================
    // COMPONENT FILES
    // =====================================

    ${componentCode}


    // =====================================
    // APP
    // =====================================

    ${appCode}


    // =====================================
    // RENDER
    // =====================================

    try {

      const root =
        ReactDOM.createRoot(
          document.getElementById("root")
        );

      root.render(<App />);

    } catch (error) {

      window.parent.postMessage(
        {
          type: "error",
          message: error.message,
        },
        "*"
      );

    }

  </script>

</body>

</html>
`;

    // =========================================
    // LOAD IFRAME
    // =========================================

    iframeRef.current.srcdoc = html;

  }, [runCode]);

  // =========================================
  // UI
  // =========================================

  return (
    <div className="preview">

      <div className="preview-header">
        <span>▶ Preview</span>
      </div>

      <iframe
        ref={iframeRef}
        title="React Preview"
        className="preview-frame"
        sandbox="allow-scripts"
      />

    </div>
  );
}

export default Preview;