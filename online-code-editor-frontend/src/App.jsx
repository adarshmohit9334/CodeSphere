import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CodeEditor from "./components/CodeEditor";
import Preview from "./components/Preview";
import OutputPanel from "./components/OutputPanel";

import "./App.css";


// ========================================
// DEFAULT FILES
// ========================================

const defaultFiles = [
  {
    name: "App.jsx",
    language: "javascript",
    code: `function App() {
  console.log("Hello from Console");

  return (
    <div>
      <h1>Hello React 👋</h1>
    </div>
  );
}

export default App;`,
  },

  {
    name: "main.jsx",
    language: "javascript",
    code: `import React from "react";
import ReactDOM from "react-dom/client";

ReactDOM.createRoot(
  document.getElementById("root")
).render(<App />);`,
  },

  {
    name: "index.css",
    language: "css",
    code: `body {
  margin: 0;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #61dafb;
}`,
  },
];


// ========================================
// DEFAULT PROJECTS
// ========================================

const defaultProjects = [
  "My React Project",
  "Untitled Project",
];


// ========================================
// APP
// ========================================

function App() {

  // ======================================
  // PROJECT LIST
  // ======================================

  const [projects, setProjects] = useState(() => {

    const savedProjects =
      localStorage.getItem(
        "code-editor-projects"
      );

    return savedProjects
      ? JSON.parse(savedProjects)
      : defaultProjects;
  });


  // ======================================
  // CURRENT PROJECT
  // ======================================

  const [currentProject, setCurrentProject] =
    useState(() => {

      return (
        localStorage.getItem(
          "code-editor-current-project"
        ) || "My React Project"
      );
    });


  // ======================================
  // FILES
  // ======================================

  const [files, setFiles] = useState(() => {

    const savedProject =
      localStorage.getItem(
        "code-editor-current-project"
      ) || "My React Project";

    const savedFiles =
      localStorage.getItem(
        `code-editor-files-${savedProject}`
      );

    return savedFiles
      ? JSON.parse(savedFiles)
      : defaultFiles;
  });


  // ======================================
  // OPEN FILES
  // ======================================

  const [openFiles, setOpenFiles] =
    useState(() => {

      const savedProject =
        localStorage.getItem(
          "code-editor-current-project"
        ) || "My React Project";

      const savedOpenFiles =
        localStorage.getItem(
          `code-editor-open-files-${savedProject}`
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

      const savedProject =
        localStorage.getItem(
          "code-editor-current-project"
        ) || "My React Project";

      const savedSelectedFile =
        localStorage.getItem(
          `code-editor-selected-file-${savedProject}`
        );

      return savedSelectedFile || "App.jsx";
    });


  // ======================================
  // CURRENT CODE
  // ======================================

  const [code, setCode] = useState(() => {

    const savedProject =
      localStorage.getItem(
        "code-editor-current-project"
      ) || "My React Project";

    const savedFiles =
      localStorage.getItem(
        `code-editor-files-${savedProject}`
      );

    const savedSelectedFile =
      localStorage.getItem(
        `code-editor-selected-file-${savedProject}`
      ) || "App.jsx";


    if (savedFiles) {

      const parsedFiles =
        JSON.parse(savedFiles);

      const selected =
        parsedFiles.find(
          (file) =>
            file.name ===
            savedSelectedFile
        );

      if (selected) {
        return selected.code;
      }
    }

    return defaultFiles[0].code;
  });


  // ======================================
  // CONSOLE
  // ======================================

  const [output, setOutput] =
    useState("");


  // ======================================
  // RUN
  // ======================================

  const [runCode, setRunCode] =
    useState(0);


  // ======================================
  // SAVE PROJECT LIST
  // ======================================

  useEffect(() => {

    localStorage.setItem(
      "code-editor-projects",
      JSON.stringify(projects)
    );

  }, [projects]);


  // ======================================
  // SAVE CURRENT PROJECT
  // ======================================

  useEffect(() => {

    localStorage.setItem(
      "code-editor-current-project",
      currentProject
    );

  }, [currentProject]);


  // ======================================
  // SAVE FILES
  // ======================================

  useEffect(() => {

    localStorage.setItem(
      `code-editor-files-${currentProject}`,
      JSON.stringify(files)
    );

  }, [files, currentProject]);


  // ======================================
  // SAVE OPEN TABS
  // ======================================

  useEffect(() => {

    localStorage.setItem(
      `code-editor-open-files-${currentProject}`,
      JSON.stringify(openFiles)
    );

  }, [openFiles, currentProject]);


  // ======================================
  // SAVE SELECTED FILE
  // ======================================

  useEffect(() => {

    if (!selectedFile) {
      return;
    }

    localStorage.setItem(
      `code-editor-selected-file-${currentProject}`,
      selectedFile
    );

  }, [selectedFile, currentProject]);


  // ======================================
  // PROJECT SELECT
  // ======================================

  const handleProjectSelect = (
    project
  ) => {

    // Save current project

    localStorage.setItem(
      `code-editor-files-${currentProject}`,
      JSON.stringify(files)
    );

    localStorage.setItem(
      `code-editor-open-files-${currentProject}`,
      JSON.stringify(openFiles)
    );

    localStorage.setItem(
      `code-editor-selected-file-${currentProject}`,
      selectedFile
    );


    // Load selected project

    const savedFiles =
      localStorage.getItem(
        `code-editor-files-${project}`
      );

    const savedOpenFiles =
      localStorage.getItem(
        `code-editor-open-files-${project}`
      );

    const savedSelectedFile =
      localStorage.getItem(
        `code-editor-selected-file-${project}`
      );


    const newFiles =
      savedFiles
        ? JSON.parse(savedFiles)
        : defaultFiles.map(
            (file) => ({
              ...file,
            })
          );


    const newOpenFiles =
      savedOpenFiles
        ? JSON.parse(savedOpenFiles)
        : ["App.jsx"];


    const newSelectedFile =
      savedSelectedFile ||
      "App.jsx";


    const selectedData =
      newFiles.find(
        (file) =>
          file.name ===
          newSelectedFile
      );


    setCurrentProject(project);

    setFiles(newFiles);

    setOpenFiles(newOpenFiles);

    setSelectedFile(
      newSelectedFile
    );

    setCode(
      selectedData
        ? selectedData.code
        : ""
    );

    setOutput(
      `📁 Project loaded: ${project}`
    );
  };


  // ======================================
  // CREATE NEW PROJECT
  // ======================================

  const handleCreateProject = () => {

    const projectName =
      prompt(
        "Enter new project name:"
      );


    if (!projectName) {
      return;
    }


    const trimmedName =
      projectName.trim();


    if (!trimmedName) {
      return;
    }


    // Check duplicate

    const exists =
      projects.some(
        (project) =>
          project.toLowerCase() ===
          trimmedName.toLowerCase()
      );


    if (exists) {

      alert(
        "A project with this name already exists!"
      );

      return;
    }


    // Add project

    setProjects(
      (currentProjects) => [
        ...currentProjects,
        trimmedName,
      ]
    );


    // Create fresh project files

    const newProjectFiles =
      defaultFiles.map(
        (file) => ({
          ...file,
        })
      );


    // Save project

    localStorage.setItem(
      `code-editor-files-${trimmedName}`,
      JSON.stringify(
        newProjectFiles
      )
    );

    localStorage.setItem(
      `code-editor-open-files-${trimmedName}`,
      JSON.stringify([
        "App.jsx",
      ])
    );

    localStorage.setItem(
      `code-editor-selected-file-${trimmedName}`,
      "App.jsx"
    );


    // Switch

    setCurrentProject(
      trimmedName
    );

    setFiles(
      newProjectFiles
    );

    setOpenFiles([
      "App.jsx",
    ]);

    setSelectedFile(
      "App.jsx"
    );

    setCode(
      newProjectFiles[0].code
    );

    setOutput(
      `✅ New project created: ${trimmedName}`
    );
  };


  // ======================================
  // RENAME PROJECT
  // ======================================

  const handleRenameProject = () => {

    const newProjectName =
      prompt(
        "Enter new project name:",
        currentProject
      );


    if (!newProjectName) {
      return;
    }


    const trimmedName =
      newProjectName.trim();


    if (!trimmedName) {
      return;
    }


    if (
      trimmedName ===
      currentProject
    ) {
      return;
    }


    // Check duplicate

    const exists =
      projects.some(
        (project) =>
          project.toLowerCase() ===
          trimmedName.toLowerCase()
      );


    if (exists) {

      alert(
        "A project with this name already exists!"
      );

      return;
    }


    // Save current project data

    localStorage.setItem(
      `code-editor-files-${currentProject}`,
      JSON.stringify(files)
    );

    localStorage.setItem(
      `code-editor-open-files-${currentProject}`,
      JSON.stringify(openFiles)
    );

    localStorage.setItem(
      `code-editor-selected-file-${currentProject}`,
      selectedFile
    );


    // Rename localStorage keys

    localStorage.setItem(
      `code-editor-files-${trimmedName}`,
      JSON.stringify(files)
    );

    localStorage.setItem(
      `code-editor-open-files-${trimmedName}`,
      JSON.stringify(openFiles)
    );

    localStorage.setItem(
      `code-editor-selected-file-${trimmedName}`,
      selectedFile
    );


    // Remove old keys

    localStorage.removeItem(
      `code-editor-files-${currentProject}`
    );

    localStorage.removeItem(
      `code-editor-open-files-${currentProject}`
    );

    localStorage.removeItem(
      `code-editor-selected-file-${currentProject}`
    );


    // Update project list

    setProjects(
      (currentProjects) =>
        currentProjects.map(
          (project) =>
            project === currentProject
              ? trimmedName
              : project
        )
    );


    setCurrentProject(
      trimmedName
    );


    setOutput(
      `✏️ Project renamed to: ${trimmedName}`
    );
  };


  // ======================================
  // DELETE PROJECT
  // ======================================

  const handleDeleteProject = () => {

    // Prevent deleting last project

    if (projects.length === 1) {

      alert(
        "You cannot delete the last project."
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${currentProject}"?`
      );


    if (!confirmed) {
      return;
    }


    // Delete project files

    localStorage.removeItem(
      `code-editor-files-${currentProject}`
    );

    localStorage.removeItem(
      `code-editor-open-files-${currentProject}`
    );

    localStorage.removeItem(
      `code-editor-selected-file-${currentProject}`
    );


    // Find remaining projects

    const remainingProjects =
      projects.filter(
        (project) =>
          project !== currentProject
      );


    const nextProject =
      remainingProjects[0];


    // Update projects

    setProjects(
      remainingProjects
    );


    // Load next project

    const savedFiles =
      localStorage.getItem(
        `code-editor-files-${nextProject}`
      );

    const savedOpenFiles =
      localStorage.getItem(
        `code-editor-open-files-${nextProject}`
      );

    const savedSelectedFile =
      localStorage.getItem(
        `code-editor-selected-file-${nextProject}`
      );


    const nextFiles =
      savedFiles
        ? JSON.parse(savedFiles)
        : defaultFiles.map(
            (file) => ({
              ...file,
            })
          );


    const nextOpenFiles =
      savedOpenFiles
        ? JSON.parse(savedOpenFiles)
        : ["App.jsx"];


    const nextSelectedFile =
      savedSelectedFile ||
      "App.jsx";


    const nextSelectedData =
      nextFiles.find(
        (file) =>
          file.name ===
          nextSelectedFile
      );


    setCurrentProject(
      nextProject
    );

    setFiles(
      nextFiles
    );

    setOpenFiles(
      nextOpenFiles
    );

    setSelectedFile(
      nextSelectedFile
    );

    setCode(
      nextSelectedData
        ? nextSelectedData.code
        : ""
    );

    setOutput(
      `🗑️ Project deleted. Switched to ${nextProject}`
    );
  };


  // ======================================
  // RUN CODE
  // ======================================

  const handleRunCode = () => {

    setOutput("");

    setRunCode(
      (previous) =>
        previous + 1
    );
  };


  // ======================================
  // SAVE PROJECT
  // ======================================

  const handleSaveCode = () => {

    localStorage.setItem(
      `code-editor-files-${currentProject}`,
      JSON.stringify(files)
    );

    localStorage.setItem(
      `code-editor-open-files-${currentProject}`,
      JSON.stringify(openFiles)
    );

    localStorage.setItem(
      `code-editor-selected-file-${currentProject}`,
      selectedFile
    );

    alert(
      `✅ ${currentProject} saved successfully!`
    );
  };


  // ======================================
  // CONSOLE MESSAGE
  // ======================================

  const handleConsoleMessage = (
    message
  ) => {

    setOutput(
      (currentOutput) => {

        if (!currentOutput) {
          return message;
        }

        return `${currentOutput}\n${message}`;
      }
    );
  };


  // ======================================
  // CLEAR CONSOLE
  // ======================================

  const clearOutput = () => {
    setOutput("");
  };


  // ======================================
  // SELECT FILE
  // ======================================

  const handleFileSelect = (
    fileName
  ) => {

    const selected =
      files.find(
        (file) =>
          file.name === fileName
      );


    if (!selected) {
      return;
    }


    if (
      !openFiles.includes(
        fileName
      )
    ) {

      setOpenFiles(
        (currentFiles) => [
          ...currentFiles,
          fileName,
        ]
      );
    }


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

    setFiles(
      (currentFiles) =>
        currentFiles.map(
          (file) =>
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
  // GET LANGUAGE
  // ======================================

  const getLanguageFromFileName = (
    fileName
  ) => {

    const extension =
      fileName
        .split(".")
        .pop()
        .toLowerCase();


    switch (extension) {

      case "js":
      case "jsx":
        return "javascript";

      case "ts":
      case "tsx":
        return "typescript";

      case "css":
        return "css";

      case "html":
      case "htm":
        return "html";

      case "json":
        return "json";

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

    const fileName =
      prompt(
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


    const exists =
      files.some(
        (file) =>
          file.name.toLowerCase() ===
          trimmedName.toLowerCase()
      );


    if (exists) {

      alert(
        "File already exists!"
      );

      return;
    }


    const newFile = {
      name: trimmedName,

      language:
        getLanguageFromFileName(
          trimmedName
        ),

      code: "",
    };


    setFiles(
      (currentFiles) => [
        ...currentFiles,
        newFile,
      ]
    );


    setOpenFiles(
      (currentFiles) => [
        ...currentFiles,
        trimmedName,
      ]
    );


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


    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${fileName}?`
      );


    if (!confirmed) {
      return;
    }


    const updatedFiles =
      files.filter(
        (file) =>
          file.name !== fileName
      );


    setFiles(
      updatedFiles
    );


    const updatedOpenFiles =
      openFiles.filter(
        (file) =>
          file !== fileName
      );


    setOpenFiles(
      updatedOpenFiles
    );


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
      trimmedName ===
      oldFileName
    ) {
      return;
    }


    const exists =
      files.some(
        (file) =>
          file.name.toLowerCase() ===
          trimmedName.toLowerCase()
      );


    if (exists) {

      alert(
        "A file with this name already exists!"
      );

      return;
    }


    setFiles(
      (currentFiles) =>
        currentFiles.map(
          (file) =>
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


    setOpenFiles(
      (currentFiles) =>
        currentFiles.map(
          (file) =>
            file === oldFileName
              ? trimmedName
              : file
        )
    );


    if (
      selectedFile ===
      oldFileName
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


    if (
      selectedFile !== fileName
    ) {

      setOpenFiles(
        remainingOpenFiles
      );

      return;
    }


    if (
      remainingOpenFiles.length === 0
    ) {

      setOpenFiles([]);

      setSelectedFile("");

      setCode("");

      return;
    }


    const currentIndex =
      openFiles.indexOf(
        fileName
      );


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
        runCode={handleRunCode}
        saveCode={handleSaveCode}
        currentProject={
          currentProject
        }
        projects={projects}
        onProjectSelect={
          handleProjectSelect
        }
        onCreateProject={
          handleCreateProject
        }
        onRenameProject={
          handleRenameProject
        }
        onDeleteProject={
          handleDeleteProject
        }
      />


      <div className="workspace">

        {/* SIDEBAR */}

        <Sidebar
          files={files}
          selectedFile={
            selectedFile
          }
          onFileSelect={
            handleFileSelect
          }
          onCreateFile={
            handleCreateFile
          }
          onDeleteFile={
            handleDeleteFile
          }
          onRenameFile={
            handleRenameFile
          }
        />


        {/* CODE EDITOR */}

        <CodeEditor
          code={code}
          setCode={
            handleCodeChange
          }
          selectedFile={
            selectedFile
          }
          files={files}
          openFiles={
            openFiles
          }
          onFileSelect={
            handleFileSelect
          }
          onCloseFile={
            handleCloseFile
          }
        />


        {/* RIGHT PANEL */}

        <div className="right-panel">

          <Preview
            files={files}
            onConsoleMessage={
              handleConsoleMessage
            }
            runCode={runCode}
          />


          <OutputPanel
            output={output}
            clearOutput={
              clearOutput
            }
          />

        </div>

      </div>
    </>
  );
}


export default App;