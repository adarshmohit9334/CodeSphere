import { useState } from "react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CodeEditor from "./components/CodeEditor";
import OutputPanel from "./components/OutputPanel";

import "./App.css";

function App() {
  // All project files
  const [files, setFiles] = useState([
    {
      name: "App.jsx",
      language: "javascript",
      code: `function App() {
  return (
    <h1>Hello World</h1>
  );
}`,
    },
    {
      name: "main.jsx",
      language: "javascript",
      code: `import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);`,
    },
    {
      name: "index.css",
      language: "css",
      code: `body {
  margin: 0;
  font-family: Arial, sans-serif;
}`,
    },
  ]);

  // Currently selected file
  const [selectedFile, setSelectedFile] = useState("App.jsx");

  // Currently displayed code
  const [code, setCode] = useState(files[0].code);

  // Output
  const [output, setOutput] = useState("");

  // --------------------------------
  // Run Code
  // --------------------------------

  const runCode = () => {
    try {
      let result = "";

      const customConsole = {
        log: (...messages) => {
          result += messages.join(" ") + "\n";
        },
      };

      const executeCode = new Function(
        "console",
        code
      );

      executeCode(customConsole);

      setOutput(
        result || "Code executed successfully."
      );
    } catch (error) {
      setOutput("Error: " + error.message);
    }
  };

  // --------------------------------
  // Clear Output
  // --------------------------------

  const clearOutput = () => {
    setOutput("");
  };

  // --------------------------------
  // Select File
  // --------------------------------

  const handleFileSelect = (fileName) => {
    const selected = files.find(
      (file) => file.name === fileName
    );

    if (selected) {
      setSelectedFile(selected.name);
      setCode(selected.code);
    }
  };

  // --------------------------------
  // Change Code
  // --------------------------------

  const handleCodeChange = (newCode) => {
    setCode(newCode);

    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.name === selectedFile
          ? {
              ...file,
              code: newCode,
            }
          : file
      )
    );
  };

  // --------------------------------
  // Detect File Language
  // --------------------------------

  const getLanguageFromFileName = (fileName) => {
    const extension = fileName
      .split(".")
      .pop()
      .toLowerCase();

    switch (extension) {
      case "js":
      case "jsx":
        return "javascript";

      case "css":
        return "css";

      case "html":
      case "htm":
        return "html";

      case "json":
        return "json";

      case "ts":
      case "tsx":
        return "typescript";

      default:
        return "plaintext";
    }
  };

  // --------------------------------
  // Create New File
  // --------------------------------

  const handleCreateFile = () => {
    const fileName = prompt("Enter file name:");

    if (!fileName) {
      return;
    }

    const trimmedName = fileName.trim();

    if (!trimmedName) {
      return;
    }

    const fileExists = files.some(
      (file) =>
        file.name.toLowerCase() ===
        trimmedName.toLowerCase()
    );

    if (fileExists) {
      alert("File already exists!");
      return;
    }

    const newFile = {
      name: trimmedName,
      language:
        getLanguageFromFileName(trimmedName),
      code: "",
    };

    setFiles((currentFiles) => [
      ...currentFiles,
      newFile,
    ]);

    setSelectedFile(trimmedName);
    setCode("");
  };

  // --------------------------------
  // Delete File
  // --------------------------------

  const handleDeleteFile = (fileName) => {
    // Don't allow deleting the last file
    if (files.length === 1) {
      alert("You cannot delete the last file.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${fileName}?`
    );

    if (!confirmDelete) {
      return;
    }

    const updatedFiles = files.filter(
      (file) => file.name !== fileName
    );

    setFiles(updatedFiles);

    // If selected file was deleted
    if (selectedFile === fileName) {
      const firstFile = updatedFiles[0];

      setSelectedFile(firstFile.name);
      setCode(firstFile.code);
    }
  };

  return (
    <>
      <Navbar runCode={runCode} />

      <div className="workspace">

        <Sidebar
          files={files}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
        />

        <CodeEditor
          code={code}
          setCode={handleCodeChange}
        />

        <OutputPanel
          output={output}
          clearOutput={clearOutput}
        />

      </div>
    </>
  );
}

export default App;