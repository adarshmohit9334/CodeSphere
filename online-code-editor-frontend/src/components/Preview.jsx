import { useEffect, useRef } from "react";

function Preview({ files }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const appFile = files.find(
      (file) => file.name === "App.jsx"
    );

    const cssFile = files.find(
      (file) => file.name === "index.css"
    );

    if (!appFile || !iframeRef.current) {
      return;
    }

    const iframe = iframeRef.current;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    ${cssFile ? cssFile.code : ""}
  </style>
</head>

<body>

  <div id="root"></div>

  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>

  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <script type="text/babel">

    ${appFile.code}

    const root =
      ReactDOM.createRoot(
        document.getElementById("root")
      );

    root.render(<App />);

  </script>

</body>
</html>
`;

    iframe.srcdoc = html;

  }, [files]);

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