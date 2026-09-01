import { useEffect, useState, useCallback } from "react";

import Navbar from "./components/Navbar";
import ActivityBar from "./components/ActivityBar";
import Sidebar from "./components/Sidebar";
import SearchPanel from "./components/SearchPanel";
import CodeEditor from "./components/CodeEditor";
import Preview from "./components/Preview";
import OutputPanel from "./components/OutputPanel";
import StatusBar from "./components/StatusBar";

import "./App.css";

const API_BASE = "http://localhost:5000/api";

const defaultFiles = [
  {
    name: "App.jsx",
    language: "javascript",
    code: `function App() {\n  console.log("Hello from VS Code Online Editor!");\n\n  return (\n    <div className="container">\n      <h1>Hello React 👋</h1>\n      <p>Welcome to your VS Code Web Code Editor.</p>\n    </div>\n  );\n}\n\nexport default App;`
  },
  {
    name: "main.jsx",
    language: "javascript",
    code: `import React from "react";\nimport ReactDOM from "react-dom/client";\n\nReactDOM.createRoot(document.getElementById("root")).render(<App />);`
  },
  {
    name: "index.css",
    language: "css",
    code: `body {\n  margin: 0;\n  padding: 24px;\n  font-family: system-ui, -apple-system, sans-serif;\n  background: #0d1117;\n  color: #e6edf3;\n}\n\n.container {\n  border: 1px solid #30363d;\n  padding: 20px;\n  border-radius: 8px;\n  background: #161b22;\n}\n\nh1 {\n  color: #58a6ff;\n  margin-top: 0;\n}`
  }
];

const defaultProjects = ["My React Project", "Untitled Project"];

function App() {
  // State
  const [activeTab, setActiveTab] = useState("explorer"); // 'explorer' | 'search' | 'debug'
  const [theme, setTheme] = useState("vs-dark");
  const [backendStatus, setBackendStatus] = useState(false);

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem("code-editor-projects");
    return saved ? JSON.parse(saved) : defaultProjects;
  });

  const [currentProject, setCurrentProject] = useState(() => {
    return localStorage.getItem("code-editor-current-project") || "My React Project";
  });

  const [files, setFiles] = useState(() => {
    const savedProject = localStorage.getItem("code-editor-current-project") || "My React Project";
    const savedFiles = localStorage.getItem(`code-editor-files-${savedProject}`);
    return savedFiles ? JSON.parse(savedFiles) : defaultFiles;
  });

  const [openFiles, setOpenFiles] = useState(() => {
    const savedProject = localStorage.getItem("code-editor-current-project") || "My React Project";
    const savedOpenFiles = localStorage.getItem(`code-editor-open-files-${savedProject}`);
    return savedOpenFiles ? JSON.parse(savedOpenFiles) : ["App.jsx"];
  });

  const [selectedFile, setSelectedFile] = useState(() => {
    const savedProject = localStorage.getItem("code-editor-current-project") || "My React Project";
    const savedSelected = localStorage.getItem(`code-editor-selected-file-${savedProject}`);
    return savedSelected || "App.jsx";
  });

  const [code, setCode] = useState(() => {
    const selected = files.find((f) => f.name === selectedFile);
    return selected ? selected.code : defaultFiles[0].code;
  });

  const [output, setOutput] = useState("");
  const [runCode, setRunCode] = useState(0);
  const [dirtyFiles, setDirtyFiles] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // ----------------------------------------------------
  // Backend Connection Health Check & Initial Sync
  // ----------------------------------------------------
  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) {
          setBackendStatus(true);
          // Sync projects list from backend
          const projectsRes = await fetch(`${API_BASE}/projects`);
          if (projectsRes.ok) {
            const remoteProjects = await projectsRes.json();
            if (remoteProjects && remoteProjects.length > 0) {
              const names = remoteProjects.map((p) => p.name);
              setProjects((prev) => Array.from(new Set([...prev, ...names])));
            }
          }
        } else {
          setBackendStatus(false);
        }
      } catch (e) {
        setBackendStatus(false);
      }
    }
    checkBackend();
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("code-editor-projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("code-editor-current-project", currentProject);
  }, [currentProject]);

  useEffect(() => {
    localStorage.setItem(`code-editor-files-${currentProject}`, JSON.stringify(files));
  }, [files, currentProject]);

  useEffect(() => {
    localStorage.setItem(`code-editor-open-files-${currentProject}`, JSON.stringify(openFiles));
  }, [openFiles, currentProject]);

  useEffect(() => {
    if (selectedFile) {
      localStorage.setItem(`code-editor-selected-file-${currentProject}`, selectedFile);
    }
  }, [selectedFile, currentProject]);

  // Project Selection
  const handleProjectSelect = (project) => {
    localStorage.setItem(`code-editor-files-${currentProject}`, JSON.stringify(files));
    localStorage.setItem(`code-editor-open-files-${currentProject}`, JSON.stringify(openFiles));
    localStorage.setItem(`code-editor-selected-file-${currentProject}`, selectedFile);

    const savedFiles = localStorage.getItem(`code-editor-files-${project}`);
    const savedOpenFiles = localStorage.getItem(`code-editor-open-files-${project}`);
    const savedSelectedFile = localStorage.getItem(`code-editor-selected-file-${project}`);

    const newFiles = savedFiles ? JSON.parse(savedFiles) : defaultFiles;
    const newOpenFiles = savedOpenFiles ? JSON.parse(savedOpenFiles) : ["App.jsx"];
    const newSelectedFile = savedSelectedFile || "App.jsx";
    const selectedData = newFiles.find((f) => f.name === newSelectedFile);

    setCurrentProject(project);
    setFiles(newFiles);
    setOpenFiles(newOpenFiles);
    setSelectedFile(newSelectedFile);
    setCode(selectedData ? selectedData.code : "");
    setDirtyFiles([]);
    setOutput(`📁 Project loaded: ${project}`);
  };

  // Create Project
  const handleCreateProject = () => {
    const projectName = prompt("Enter new project name:");
    if (!projectName || !projectName.trim()) return;
    const trimmed = projectName.trim();

    if (projects.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      alert("A project with this name already exists!");
      return;
    }

    const newProjectFiles = defaultFiles.map((file) => ({ ...file }));
    setProjects((prev) => [...prev, trimmed]);
    setCurrentProject(trimmed);
    setFiles(newProjectFiles);
    setOpenFiles(["App.jsx"]);
    setSelectedFile("App.jsx");
    setCode(newProjectFiles[0].code);
    setDirtyFiles([]);
    setOutput(`✅ New project created: ${trimmed}`);

    // Push to backend if connected
    if (backendStatus) {
      fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, files: newProjectFiles })
      }).catch((err) => console.warn("Backend sync failed:", err));
    }
  };

  // Rename Project
  const handleRenameProject = () => {
    const newName = prompt("Enter new project name:", currentProject);
    if (!newName || !newName.trim() || newName.trim() === currentProject) return;
    const trimmed = newName.trim();

    if (projects.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      alert("A project with this name already exists!");
      return;
    }

    setProjects((prev) => prev.map((p) => (p === currentProject ? trimmed : p)));
    setCurrentProject(trimmed);
    setDirtyFiles([]);
    setOutput(`✏️ Project renamed to: ${trimmed}`);
  };

  // Delete Project
  const handleDeleteProject = () => {
    if (projects.length === 1) {
      alert("You cannot delete the last project.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${currentProject}"?`)) return;

    const remaining = projects.filter((p) => p !== currentProject);
    const nextProject = remaining[0];
    setProjects(remaining);

    handleProjectSelect(nextProject);
    setOutput(`🗑️ Project deleted. Switched to ${nextProject}`);
  };

  // Save Code
  const handleSaveCode = useCallback(() => {
    localStorage.setItem(`code-editor-files-${currentProject}`, JSON.stringify(files));
    localStorage.setItem(`code-editor-open-files-${currentProject}`, JSON.stringify(openFiles));
    localStorage.setItem(`code-editor-selected-file-${currentProject}`, selectedFile);
    setDirtyFiles([]);

    if (backendStatus) {
      fetch(`${API_BASE}/projects/${encodeURIComponent(currentProject)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: currentProject, files })
      }).catch((err) => console.warn("Backend save failed:", err));
    }

    setOutput((prev) => (prev ? `${prev}\n✅ Saved changes to ${currentProject}` : `✅ Saved changes to ${currentProject}`));
  }, [currentProject, files, openFiles, selectedFile, backendStatus]);

  // Run Code
  const handleRunCode = useCallback(() => {
    setRunCode((prev) => prev + 1);

    // Also attempt backend server-side execution check if connected
    if (backendStatus && selectedFile && selectedFile.endsWith(".js")) {
      fetch(`${API_BASE}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "javascript" })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.logs && data.logs.length > 0) {
            setOutput((prev) => (prev ? `${prev}\n[Server Log] ${data.logs.join("\n")}` : `[Server Log] ${data.logs.join("\n")}`));
          }
        })
        .catch(() => {});
    }
  }, [backendStatus, selectedFile, code]);

  // Export Project
  const handleExportProject = () => {
    const projectData = {
      project: currentProject,
      exportedAt: new Date().toISOString(),
      files: files
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentProject.toLowerCase().replace(/\s+/g, "-")}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOutput((prev) => `${prev}\n📥 Exported project ${currentProject}`);
  };

  const handleConsoleMessage = useCallback((msg) => {
    setOutput((prev) => (prev ? `${prev}\n${msg}` : msg));
  }, []);

  const clearOutput = () => setOutput("");

  // Select File
  const handleFileSelect = (fileName) => {
    const selected = files.find((f) => f.name === fileName);
    if (!selected) return;

    if (!openFiles.includes(fileName)) {
      setOpenFiles((prev) => [...prev, fileName]);
    }
    setSelectedFile(fileName);
    setCode(selected.code);
  };

  // Code Change
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setFiles((prev) => prev.map((f) => (f.name === selectedFile ? { ...f, code: newCode } : f)));

    if (!dirtyFiles.includes(selectedFile)) {
      setDirtyFiles((prev) => [...prev, selectedFile]);
    }
  };

  const getLanguageFromFileName = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
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
      default:
        return "plaintext";
    }
  };

  // Create File
  const handleCreateFile = () => {
    const fileName = prompt("Enter file name (e.g. Button.jsx, styles.css):");
    if (!fileName || !fileName.trim()) return;
    const trimmed = fileName.trim();

    if (files.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())) {
      alert("File already exists!");
      return;
    }

    const newFile = {
      name: trimmed,
      language: getLanguageFromFileName(trimmed),
      code: ""
    };

    setFiles((prev) => [...prev, newFile]);
    setOpenFiles((prev) => [...prev, trimmed]);
    setSelectedFile(trimmed);
    setCode("");
    setDirtyFiles((prev) => [...prev, trimmed]);
  };

  // Delete File
  const handleDeleteFile = (fileName) => {
    if (files.length === 1) {
      alert("You cannot delete the last file.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;

    const updatedFiles = files.filter((f) => f.name !== fileName);
    const updatedOpenFiles = openFiles.filter((f) => f !== fileName);

    setFiles(updatedFiles);
    setOpenFiles(updatedOpenFiles);
    setDirtyFiles((prev) => prev.filter((f) => f !== fileName));

    if (selectedFile === fileName) {
      if (updatedOpenFiles.length > 0) {
        const next = updatedOpenFiles[updatedOpenFiles.length - 1];
        const nextData = updatedFiles.find((f) => f.name === next);
        setSelectedFile(next);
        if (nextData) setCode(nextData.code);
      } else {
        setSelectedFile(updatedFiles[0].name);
        setCode(updatedFiles[0].code);
      }
    }
  };

  // Rename File
  const handleRenameFile = (oldName) => {
    const newName = prompt("Enter new file name:", oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;
    const trimmed = newName.trim();

    if (files.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())) {
      alert("A file with this name already exists!");
      return;
    }

    setFiles((prev) =>
      prev.map((f) =>
        f.name === oldName ? { ...f, name: trimmed, language: getLanguageFromFileName(trimmed) } : f
      )
    );
    setOpenFiles((prev) => prev.map((f) => (f === oldName ? trimmed : f)));
    setDirtyFiles((prev) => prev.map((f) => (f === oldName ? trimmed : f)));

    if (selectedFile === oldName) setSelectedFile(trimmed);
  };

  // Close Tab
  const handleCloseFile = (fileName) => {
    const remaining = openFiles.filter((f) => f !== fileName);
    if (selectedFile !== fileName) {
      setOpenFiles(remaining);
      return;
    }

    if (remaining.length === 0) {
      setOpenFiles([]);
      setSelectedFile("");
      setCode("");
      return;
    }

    const idx = openFiles.indexOf(fileName);
    const next = remaining[idx] || remaining[idx - 1] || remaining[0];
    const nextData = files.find((f) => f.name === next);

    setOpenFiles(remaining);
    setSelectedFile(next);
    if (nextData) setCode(nextData.code);
  };

  const selectedFileData = files.find((f) => f.name === selectedFile);

  return (
    <div className={`app-container ${theme}`}>
      <Navbar
        runCode={handleRunCode}
        saveCode={handleSaveCode}
        currentProject={currentProject}
        projects={projects}
        onProjectSelect={handleProjectSelect}
        onCreateProject={handleCreateProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
        theme={theme}
        setTheme={setTheme}
        onExportProject={handleExportProject}
      />

      <div className="workspace">
        {/* ACTIVITY BAR */}
        <ActivityBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          backendStatus={backendStatus}
          onToggleTheme={() =>
            setTheme((prev) => (prev === "vs-dark" ? "vs-light" : prev === "vs-light" ? "hc-black" : "vs-dark"))
          }
        />

        {/* EXPLORER OR SEARCH PANEL */}
        {activeTab === "explorer" && (
          <Sidebar
            files={files}
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
            currentProject={currentProject}
          />
        )}

        {activeTab === "search" && (
          <SearchPanel files={files} onFileSelect={handleFileSelect} />
        )}

        {activeTab === "debug" && (
          <aside className="sidebar debug-panel">
            <h3>RUN & DEBUG</h3>
            <div className="debug-content">
              <button className="run-button debug-run" onClick={handleRunCode}>
                ▶ Start Debugging
              </button>
              <p className="debug-info">
                Preview console and error log capture are actively monitoring execution.
              </p>
            </div>
          </aside>
        )}

        {/* CODE EDITOR */}
        <CodeEditor
          code={code}
          setCode={handleCodeChange}
          selectedFile={selectedFile}
          files={files}
          openFiles={openFiles}
          onFileSelect={handleFileSelect}
          onCloseFile={handleCloseFile}
          dirtyFiles={dirtyFiles}
          onCursorChange={setCursorPosition}
          theme={theme}
          saveCode={handleSaveCode}
          runCode={handleRunCode}
        />

        {/* RIGHT PANEL (PREVIEW & CONSOLE) */}
        <div className="right-panel">
          <Preview files={files} onConsoleMessage={handleConsoleMessage} runCode={runCode} />
          <OutputPanel output={output} clearOutput={clearOutput} />
        </div>
      </div>

      {/* STATUS BAR */}
      <StatusBar
        cursorPosition={cursorPosition}
        selectedFile={selectedFile}
        language={selectedFileData?.language}
        backendStatus={backendStatus}
        theme={theme}
      />
    </div>
  );
}

export default App;