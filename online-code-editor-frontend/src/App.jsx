import { useEffect, useState } from "react";
import * as Babel from "@babel/standalone";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CodeEditor from "./components/CodeEditor";
import OutputPanel from "./components/OutputPanel";
import Preview from "./components/Preview";
import "./App.css";

// ========================================
// DEFAULT PROJECT FILES
// ========================================

const defaultFiles = [
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
];


// ========================================
// APP
// ========================================

function App() {

  // ======================================
  // PROJECT FILES
  // ======================================

  const [files, setFiles] = useState(() => {
    const savedFiles = localStorage.getItem(
      "code-editor-files"
    );

    return savedFiles
      ? JSON.parse(savedFiles)
      : defaultFiles;
  });


  // ======================================
  // OPEN TABS
  // ======================================

  const [openFiles, setOpenFiles] = useState(() => {
    const savedOpenFiles = localStorage.getItem(
      "code-editor-open-files"
    );

    return savedOpenFiles
      ? JSON.parse(savedOpenFiles)
      : ["App.jsx"];
  });


  // ======================================
  // SELECTED FILE
  // ======================================

  const [selectedFile, setSelectedFile] =
    useState(() => {
      const savedSelectedFile =
        localStorage.getItem(
          "code-editor-selected-file"
        );

      return (
        savedSelectedFile || "App.jsx"
      );
    });


  // ======================================
  // CURRENT CODE
  // ======================================

  const [code, setCode] = useState(() => {
    const savedFiles = localStorage.getItem(
      "code-editor-files"
    );

    const savedSelectedFile =
      localStorage.getItem(
        "code-editor-selected-file"
      );

    if (savedFiles) {
      const parsedFiles =
        JSON.parse(savedFiles);

      const file = parsedFiles.find(
        (item) =>
          item.name ===
          (savedSelectedFile || "App.jsx")
      );

      if (file) {
        return file.code;
      }
    }

    return defaultFiles[0].code;
  });


  // ======================================
  // OUTPUT
  // ======================================

  const [output, setOutput] = useState("");


  // ======================================
  // SAVE PROJECT FILES
  // ======================================

  useEffect(() => {
    localStorage.setItem(
      "code-editor-files",
      JSON.stringify(files)
    );
  }, [files]);


  // ======================================
  // SAVE SELECTED FILE
  // ======================================

  useEffect(() => {
    localStorage.setItem(
      "code-editor-selected-file",
      selectedFile
    );
  }, [selectedFile]);


  // ======================================
  // SAVE OPEN TABS
  // ======================================

  useEffect(() => {
    localStorage.setItem(
      "code-editor-open-files",
      JSON.stringify(openFiles)
    );
  }, [openFiles]);


  // ======================================
  // RUN CODE
  // ======================================

  const runCode = () => {
    try {
      let result = "";

      const customConsole = {
        log: (...messages) => {
          result +=
            messages.join(" ") + "\n";
        },
      };

      const executeCode = new Function(
        "console",
        code
      );

      executeCode(customConsole);

      setOutput(
        result ||
          "Code executed successfully."
      );

    } catch (error) {
      setOutput(
        "Error: " + error.message
      );
    }
  };


  // ======================================
  // CLEAR OUTPUT
  // ======================================

  const clearOutput = () => {
    setOutput("");
  };


  // ======================================
  // SELECT FILE
  // ======================================

  const handleFileSelect = (fileName) => {

    const selected = files.find(
      (file) =>
        file.name === fileName
    );

    if (!selected) {
      return;
    }


    // Open tab if not already open

    if (!openFiles.includes(fileName)) {

      setOpenFiles((currentFiles) => [
        ...currentFiles,
        fileName,
      ]);
    }


    // Select file

    setSelectedFile(
      fileName
    );

    setCode(
      selected.code
    );
  };


  // ======================================
  // CHANGE CODE
  // ======================================

  const handleCodeChange = (
    newCode
  ) => {

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


  // ======================================
  // DETECT LANGUAGE
  // ======================================

  const getLanguageFromFileName = (
    fileName
  ) => {

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

      case "xml":
        return "xml";

      case "md":
        return "markdown";

      default:
        return "plaintext";
    }
  };


  // ======================================
  // CREATE NEW FILE
  // ======================================

  const handleCreateFile = () => {

    const fileName = prompt(
      "Enter file name:"
    );

    if (!fileName) {
      return;
    }

    const trimmedName =
      fileName.trim();

    if (!trimmedName) {
      return;
    }


    // Check duplicate

    const fileExists = files.some(
      (file) =>
        file.name.toLowerCase() ===
        trimmedName.toLowerCase()
    );

    if (fileExists) {

      alert(
        "File already exists!"
      );

      return;
    }


    // Create file

    const newFile = {
      name: trimmedName,

      language:
        getLanguageFromFileName(
          trimmedName
        ),

      code: "",
    };


    setFiles((currentFiles) => [
      ...currentFiles,
      newFile,
    ]);


    // Open new file as tab

    setOpenFiles((currentFiles) => [
      ...currentFiles,
      trimmedName,
    ]);


    setSelectedFile(
      trimmedName
    );

    setCode("");
  };


  // ======================================
  // DELETE FILE
  // ======================================

  const handleDeleteFile = (
    fileName
  ) => {

    if (files.length === 1) {

      alert(
        "You cannot delete the last file."
      );

      return;
    }


    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete ${fileName}?`
      );

    if (!confirmDelete) {
      return;
    }


    // Delete from project files

    const updatedFiles =
      files.filter(
        (file) =>
          file.name !== fileName
      );

    setFiles(updatedFiles);


    // Remove from open tabs

    const updatedOpenFiles =
      openFiles.filter(
        (file) =>
          file !== fileName
      );

    setOpenFiles(
      updatedOpenFiles
    );


    // If deleted file was selected

    if (
      selectedFile === fileName
    ) {

      if (
        updatedOpenFiles.length > 0
      ) {

        const nextFile =
          updatedOpenFiles[
            updatedOpenFiles.length - 1
          ];

        const nextFileData =
          updatedFiles.find(
            (file) =>
              file.name === nextFile
          );

        setSelectedFile(
          nextFile
        );

        if (nextFileData) {
          setCode(
            nextFileData.code
          );
        }

      } else {

        const firstFile =
          updatedFiles[0];

        setSelectedFile(
          firstFile.name
        );

        setCode(
          firstFile.code
        );
      }
    }
  };


  // ======================================
  // RENAME FILE
  // ======================================

  const handleRenameFile = (
    oldFileName
  ) => {

    const newFileName =
      prompt(
        "Enter new file name:",
        oldFileName
      );

    if (!newFileName) {
      return;
    }

    const trimmedName =
      newFileName.trim();

    if (!trimmedName) {
      return;
    }


    if (
      trimmedName === oldFileName
    ) {
      return;
    }


    // Check duplicate

    const fileExists = files.some(
      (file) =>
        file.name.toLowerCase() ===
        trimmedName.toLowerCase()
    );

    if (fileExists) {

      alert(
        "A file with this name already exists!"
      );

      return;
    }


    // Rename project file

    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.name === oldFileName
          ? {
              ...file,

              name: trimmedName,

              language:
                getLanguageFromFileName(
                  trimmedName
                ),
            }
          : file
      )
    );


    // Rename open tab

    setOpenFiles((currentFiles) =>
      currentFiles.map((file) =>
        file === oldFileName
          ? trimmedName
          : file
      )
    );


    // Update selected file

    if (
      selectedFile === oldFileName
    ) {

      setSelectedFile(
        trimmedName
      );
    }
  };


  // ======================================
  // CLOSE TAB
  // ======================================

  const handleCloseFile = (
    fileName
  ) => {

    const remainingOpenFiles =
      openFiles.filter(
        (file) =>
          file !== fileName
      );


    // If closing inactive tab

    if (
      selectedFile !== fileName
    ) {

      setOpenFiles(
        remainingOpenFiles
      );

      return;
    }


    // If closing active tab
    // and no tabs remain

    if (
      remainingOpenFiles.length === 0
    ) {

      setOpenFiles([]);

      setSelectedFile("");

      setCode("");

      return;
    }


    // Find current tab index

    const currentIndex =
      openFiles.indexOf(
        fileName
      );


    // Select next tab

    const nextFile =
      remainingOpenFiles[
        currentIndex
      ] ||
      remainingOpenFiles[
        currentIndex - 1
      ] ||
      remainingOpenFiles[0];


    const nextFileData =
      files.find(
        (file) =>
          file.name === nextFile
      );


    setOpenFiles(
      remainingOpenFiles
    );

    setSelectedFile(
      nextFile
    );


    if (nextFileData) {
      setCode(
        nextFileData.code
      );
    }
  };


  // ======================================
  // UI
  // ======================================

  return (
    <>
      <Navbar
        runCode={runCode}
      />

      <div className="workspace">

  <Sidebar
    files={files}
    selectedFile={selectedFile}
    onFileSelect={handleFileSelect}
    onCreateFile={handleCreateFile}
    onDeleteFile={handleDeleteFile}
    onRenameFile={handleRenameFile}
  />

  <CodeEditor
    code={code}
    setCode={handleCodeChange}
    selectedFile={selectedFile}
    files={files}
    openFiles={openFiles}
    onFileSelect={handleFileSelect}
    onCloseFile={handleCloseFile}
  />

  <Preview
    files={files}
  />

</div>
    </>
  );
}

export default App;