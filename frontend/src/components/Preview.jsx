import { useEffect, useRef } from "react";

function Preview({
  files,
  onConsoleMessage,
  runCode,
}) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return;
    }

    // ----------------------------------------
    // GET FILES
    // ----------------------------------------

    const appFile = files.find(
      (file) => file.name === "App.jsx"
    );

    const cssFile = files.find(
      (file) => file.name === "index.css"
    );

    const componentFiles = files.filter(
      (file) =>
        file.name.endsWith(".jsx") &&
        file.name !== "App.jsx" &&
        file.name !== "main.jsx"
    );


    // ----------------------------------------
    // APP CODE
    // ----------------------------------------

    let appCode = appFile
      ? appFile.code
      : "";


    // ----------------------------------------
    // REMOVE IMPORTS
    // ----------------------------------------

    appCode = appCode.replace(
      /import\s+[\s\S]*?from\s+["'][^"']+["'];?/g,
      ""
    );

    appCode = appCode.replace(
      /import\s+["'][^"']+["'];?/g,
      ""
    );


    // ----------------------------------------
    // REMOVE EXPORT DEFAULT
    // ----------------------------------------

    appCode = appCode.replace(
      /export\s+default\s+/g,
      ""
    );


    // ----------------------------------------
    // COMPONENT CODE
    // ----------------------------------------

    let extraComponents = "";

    componentFiles.forEach(
      (file) => {

        let componentCode = file.code || "";


        // Remove imports

        componentCode = componentCode.replace(
          /import\s+[\s\S]*?from\s+["'][^"']+["'];?/g,
          ""
        );

        componentCode = componentCode.replace(
          /import\s+["'][^"']+["'];?/g,
          ""
        );


        // Remove exports

        componentCode = componentCode.replace(
          /export\s+default\s+/g,
          ""
        );

        componentCode = componentCode.replace(
          /export\s+/g,
          ""
        );


        extraComponents += `
          ${componentCode}
        `;
      }
    );


    // ----------------------------------------
    // CSS
    // ----------------------------------------

    const cssCode = cssFile
      ? cssFile.code
      : "";


    // ----------------------------------------
    // CREATE PREVIEW HTML
    // ----------------------------------------

    const html = `
<!DOCTYPE html>

<html>

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Preview</title>

  <style>

    ${cssCode}

    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

  </style>

</head>


<body>

  <div id="root"></div>


  <!-- React -->

  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>

  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>


  <!-- Babel -->

  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>


  <script>

    // --------------------------------------
    // CONSOLE CAPTURE
    // --------------------------------------

    const originalLog = console.log;

    const originalError = console.error;

    const originalWarn = console.warn;


    console.log = function(...args) {

      window.parent.postMessage(
        {
          type: "console",
          message: args
            .map((item) => String(item))
            .join(" ")
        },
        "*"
      );

      originalLog.apply(
        console,
        args
      );
    };


    console.error = function(...args) {

      window.parent.postMessage(
        {
          type: "error",
          message: args
            .map((item) => String(item))
            .join(" ")
        },
        "*"
      );

      originalError.apply(
        console,
        args
      );
    };


    console.warn = function(...args) {

      window.parent.postMessage(
        {
          type: "warn",
          message: args
            .map((item) => String(item))
            .join(" ")
        },
        "*"
      );

      originalWarn.apply(
        console,
        args
      );
    };


    // --------------------------------------
    // ERROR HANDLER
    // --------------------------------------

    window.onerror = function(
      message,
      source,
      line,
      column,
      error
    ) {

      window.parent.postMessage(
        {
          type: "error",
          message: String(message)
        },
        "*"
      );

    };


    // --------------------------------------
    // USER COMPONENTS
    // --------------------------------------

    try {

      ${extraComponents}


      // ------------------------------------
      // APP COMPONENT
      // ------------------------------------

      ${appCode}


      // ------------------------------------
      // RENDER APP
      // ------------------------------------

      const root =
        ReactDOM.createRoot(
          document.getElementById("root")
        );


      root.render(
        React.createElement(App)
      );


    } catch (error) {

      window.parent.postMessage(
        {
          type: "error",
          message: error.message
        },
        "*"
      );

    }

  </script>


  <!-- JSX TRANSFORM -->

  <script type="text/babel">

    // This script intentionally exists
    // so Babel Standalone is loaded
    // for JSX support.

  </script>

</body>

</html>
`;


    // ----------------------------------------
    // WRITE HTML TO IFRAME
    // ----------------------------------------

    iframe.srcdoc = html;


  }, [runCode]);


  // ----------------------------------------
  // LISTEN FOR CONSOLE
  // ----------------------------------------

  useEffect(() => {

    const handleMessage = (event) => {

      if (
        !event.data ||
        !event.data.type
      ) {
        return;
      }


      if (
        event.data.type === "console"
      ) {

        onConsoleMessage(
          event.data.message
        );

      }


      if (
        event.data.type === "error"
      ) {

        onConsoleMessage(
          `❌ ${event.data.message}`
        );

      }


      if (
        event.data.type === "warn"
      ) {

        onConsoleMessage(
          `⚠️ ${event.data.message}`
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


  // ----------------------------------------
  // UI
  // ----------------------------------------

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
        sandbox="allow-scripts"
      />

    </section>
  );
}


export default Preview;