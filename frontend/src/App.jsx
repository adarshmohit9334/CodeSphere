import React, { useEffect, useState, useCallback, Component } from "react";

import Navbar from "./components/Navbar";
import ActivityBar from "./components/ActivityBar";
import Sidebar from "./components/Sidebar";
import SearchPanel from "./components/SearchPanel";
import CodeEditor from "./components/CodeEditor";
import Preview from "./components/Preview";
import OutputPanel from "./components/OutputPanel";
import StatusBar from "./components/StatusBar";

import Dashboard from "./components/Dashboard";
import SignIn from "./components/SignIn";
import AiAssistantPanel from "./components/AiAssistantPanel";
import InputDialogModal from "./components/InputDialogModal";

import "./App.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center", color: "#f8fafc", background: "#090d16", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h2>Workspace State Sync Issue</h2>
          <p style={{ color: "#ef4444", margin: "16px 0", maxWidth: 500 }}>{this.state.error?.toString()}</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ padding: "10px 20px", background: "#0284c7", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}
          >
            Reset Workspace Cache &amp; Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const API_BASE = "http://localhost:5000/api";

const defaultFiles = [
  {
    name: "App.jsx",
    language: "javascript",
    code: `function App() {\n  console.log("Hello from Code Sphere!");\n\n  return (\n    <div className="container">\n      <h1>Hello React 👋</h1>\n      <p>Welcome to Code Sphere Editor.</p>\n    </div>\n  );\n}\n\nexport default App;`
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
  // User Authentication State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("codesphere_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // State
  const [viewMode, setViewMode] = useState(() => {
    const savedUser = localStorage.getItem("codesphere_user");
    return savedUser ? "dashboard" : "signin"; // 'signin' | 'editor' | 'dashboard'
  });
  const [activeTab, setActiveTab] = useState("explorer"); // 'explorer' | 'search' | 'debug'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("code-editor-theme") || "vs-dark";
  });

  const handleSignIn = (userObj) => {
    setUser(userObj);
    setViewMode("dashboard");
  };

  const handleSignOut = () => {
    localStorage.removeItem("codesphere_user");
    localStorage.removeItem("codesphere_auth_token");
    setUser(null);
    setViewMode("signin");
  };

  const [editorSettings, setEditorSettings] = useState(() => {
    const saved = localStorage.getItem("codesphere_editor_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return { fontSize: 14, tabSize: 2, autoSave: true, minimap: true };
  });

  const handleUpdateEditorSettings = (newSettings) => {
    setEditorSettings(newSettings);
    localStorage.setItem("codesphere_editor_settings", JSON.stringify(newSettings));
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    const key = String(updatedUser.username || updatedUser.email || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
    localStorage.setItem("codesphere_user", JSON.stringify(updatedUser));
    localStorage.setItem(`codesphere_user_${key}`, JSON.stringify(updatedUser));
  };

  // Save theme preference to LocalStorage
  useEffect(() => {
    localStorage.setItem("code-editor-theme", theme);
  }, [theme]);

  const userKey = user
    ? (user.username || user.email || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_")
    : "guest";

  const [backendStatus, setBackendStatus] = useState(false);

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem(`codesphere_${userKey}_projects`);
    return saved ? JSON.parse(saved) : defaultProjects;
  });

  const [currentProject, setCurrentProject] = useState(() => {
    return localStorage.getItem(`codesphere_${userKey}_current_project`) || "My React Project";
  });

  const [files, setFiles] = useState(() => {
    const savedProject = localStorage.getItem(`codesphere_${userKey}_current_project`) || "My React Project";
    const savedFiles = localStorage.getItem(`codesphere_${userKey}_files_${savedProject}`);
    return savedFiles ? JSON.parse(savedFiles) : defaultFiles;
  });

  const [openFiles, setOpenFiles] = useState(() => {
    const savedProject = localStorage.getItem(`codesphere_${userKey}_current_project`) || "My React Project";
    const savedOpenFiles = localStorage.getItem(`codesphere_${userKey}_open_files_${savedProject}`);
    return savedOpenFiles ? JSON.parse(savedOpenFiles) : ["App.jsx"];
  });

  const [selectedFile, setSelectedFile] = useState(() => {
    const savedProject = localStorage.getItem(`codesphere_${userKey}_current_project`) || "My React Project";
    const savedSelected = localStorage.getItem(`codesphere_${userKey}_selected_file_${savedProject}`);
    return savedSelected || "App.jsx";
  });

  const [code, setCode] = useState(() => {
    const selected = files.find((f) => f.name === selectedFile);
    return selected ? selected.code : defaultFiles[0].code;
  });

  // Re-sync workspace when active user account changes!
  useEffect(() => {
    if (!userKey) return;
    const savedProjStr = localStorage.getItem(`codesphere_${userKey}_projects`);
    const userProjects = savedProjStr ? JSON.parse(savedProjStr) : [`${user?.name || "My"} React Workspace`, "Untitled Project"];
    setProjects(userProjects);

    const savedCurProj = localStorage.getItem(`codesphere_${userKey}_current_project`) || userProjects[0];
    setCurrentProject(savedCurProj);

    const savedFilesStr = localStorage.getItem(`codesphere_${userKey}_files_${savedCurProj}`);
    const userFiles = savedFilesStr ? JSON.parse(savedFilesStr) : defaultFiles;
    setFiles(userFiles);

    const savedOpenStr = localStorage.getItem(`codesphere_${userKey}_open_files_${savedCurProj}`);
    setOpenFiles(savedOpenStr ? JSON.parse(savedOpenStr) : ["App.jsx"]);

    const savedSelected = localStorage.getItem(`codesphere_${userKey}_selected_file_${savedCurProj}`) || "App.jsx";
    setSelectedFile(savedSelected);

    const activeObj = userFiles.find((f) => f.name === savedSelected);
    setCode(activeObj ? activeObj.code : (userFiles[0]?.code || defaultFiles[0].code));
  }, [userKey]);

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
        } else {
          setBackendStatus(false);
        }
      } catch (e) {
        setBackendStatus(false);
      }
    }
    checkBackend();
  }, []);

  // Sync to LocalStorage per-account
  useEffect(() => {
    localStorage.setItem(`codesphere_${userKey}_projects`, JSON.stringify(projects));
  }, [projects, userKey]);

  useEffect(() => {
    localStorage.setItem(`codesphere_${userKey}_current_project`, currentProject);
  }, [currentProject, userKey]);

  useEffect(() => {
    localStorage.setItem(`codesphere_${userKey}_files_${currentProject}`, JSON.stringify(files));
  }, [files, currentProject, userKey]);

  useEffect(() => {
    localStorage.setItem(`codesphere_${userKey}_open_files_${currentProject}`, JSON.stringify(openFiles));
  }, [openFiles, currentProject, userKey]);

  useEffect(() => {
    if (selectedFile) {
      localStorage.setItem(`codesphere_${userKey}_selected_file_${currentProject}`, selectedFile);
    }
  }, [selectedFile, currentProject, userKey]);

  // Project Selection
  const handleProjectSelect = (project) => {
    localStorage.setItem(`codesphere_${userKey}_files_${currentProject}`, JSON.stringify(files));
    localStorage.setItem(`codesphere_${userKey}_open_files_${currentProject}`, JSON.stringify(openFiles));
    localStorage.setItem(`codesphere_${userKey}_selected_file_${currentProject}`, selectedFile);

    const savedFiles = localStorage.getItem(`codesphere_${userKey}_files_${project}`);
    const savedOpenFiles = localStorage.getItem(`codesphere_${userKey}_open_files_${project}`);
    const savedSelectedFile = localStorage.getItem(`codesphere_${userKey}_selected_file_${project}`);

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

  // Custom Input Modal State
  const [inputModal, setInputModal] = useState({
    isOpen: false,
    title: "",
    placeholder: "",
    defaultValue: "",
    onSubmit: () => { }
  });

  const openInputModal = (title, placeholder, defaultValue, onSubmit, isConfirm = false, confirmText = "") => {
    setInputModal({
      isOpen: true,
      title,
      placeholder,
      defaultValue,
      isConfirm,
      confirmText,
      onSubmit
    });
  };

  const closeInputModal = () => {
    setInputModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Create Project
  const handleCreateProject = () => {
    openInputModal(
      "➕ Create New Project",
      "Enter project name (e.g. Portfolio App)",
      "",
      (projectName) => {
        if (projects.some((p) => p.toLowerCase() === projectName.toLowerCase())) {
          alert("A project with this name already exists!");
          return;
        }

        const newProjectFiles = defaultFiles.map((file) => ({ ...file }));
        setProjects((prev) => [...prev, projectName]);
        setCurrentProject(projectName);
        setFiles(newProjectFiles);
        setOpenFiles(["App.jsx"]);
        setSelectedFile("App.jsx");
        setCode(newProjectFiles[0].code);
        setDirtyFiles([]);
        setOutput(`✅ New project created: ${projectName}`);

        // Push to backend if connected
        if (backendStatus) {
          fetch(`${API_BASE}/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: projectName, files: newProjectFiles })
          }).catch((err) => console.warn("Backend sync failed:", err));
        }
      }
    );
  };

  // Rename Project
  const handleRenameProject = () => {
    openInputModal(
      `✏️ Rename Project: ${currentProject}`,
      "Enter new project name",
      currentProject,
      (newName) => {
        if (newName === currentProject) return;
        if (projects.some((p) => p.toLowerCase() === newName.toLowerCase())) {
          alert("A project with this name already exists!");
          return;
        }

        setProjects((prev) => prev.map((p) => (p === currentProject ? newName : p)));
        setCurrentProject(newName);
        setDirtyFiles([]);
        setOutput(`✏️ Project renamed to: ${newName}`);
      }
    );
  };

  // Delete Project
  const handleDeleteProject = () => {
    if (projects.length === 1) {
      alert("You cannot delete the last project.");
      return;
    }

    openInputModal(
      `🗑️ Delete Project`,
      "",
      "",
      () => {
        const remaining = projects.filter((p) => p !== currentProject);
        const nextProject = remaining[0];
        setProjects(remaining);

        handleProjectSelect(nextProject);
        setOutput(`🗑️ Project deleted. Switched to ${nextProject}`);
      },
      true,
      `Are you sure you want to delete project "${currentProject}"? All project files will be permanently removed.`
    );
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
    setOutput("");
    setRunCode((prev) => prev + 1);
  }, []);

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
    openInputModal(
      "📄 Create New File",
      "e.g. Button.jsx, styles.css, utils.js",
      "",
      (fileName) => {
        if (files.some((f) => f.name.toLowerCase() === fileName.toLowerCase())) {
          alert("File already exists!");
          return;
        }

        const newFile = {
          name: fileName,
          language: getLanguageFromFileName(fileName),
          code: ""
        };

        setFiles((prev) => [...prev, newFile]);
        setOpenFiles((prev) => [...prev, fileName]);
        setSelectedFile(fileName);
        setCode("");
        setDirtyFiles((prev) => [...prev, fileName]);
      }
    );
  };

  // Create Folder
  const handleCreateFolder = () => {
    openInputModal(
      "📁 Create New Folder",
      "e.g. components, assets, utils",
      "",
      (folderName) => {
        const trimmedFolder = folderName.replace(/\/+$|^\/+/g, "");
        const defaultFileName = `${trimmedFolder}/index.js`;

        if (files.some((f) => f.name.toLowerCase() === defaultFileName.toLowerCase())) {
          alert("Folder already exists!");
          return;
        }

        const newFile = {
          name: defaultFileName,
          language: "javascript",
          code: `// ${trimmedFolder} folder entry point\nexport {};\n`
        };

        setFiles((prev) => [...prev, newFile]);
        setOpenFiles((prev) => [...prev, defaultFileName]);
        setSelectedFile(defaultFileName);
        setCode(newFile.code);
        setDirtyFiles((prev) => [...prev, defaultFileName]);
      }
    );
  };

  // Delete File
  const handleDeleteFile = (fileName) => {
    if (files.length === 1) {
      alert("You cannot delete the last file.");
      return;
    }

    openInputModal(
      `🗑️ Delete File`,
      "",
      "",
      () => {
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
      },
      true,
      `Are you sure you want to permanently delete "${fileName}"? This action cannot be undone.`
    );
  };

  // Rename File
  const handleRenameFile = (oldName) => {
    openInputModal(
      `✏️ Rename File: ${oldName}`,
      "Enter new file name",
      oldName,
      (newName) => {
        if (newName === oldName) return;
        if (files.some((f) => f.name.toLowerCase() === newName.toLowerCase())) {
          alert("A file with this name already exists!");
          return;
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.name === oldName ? { ...f, name: newName, language: getLanguageFromFileName(newName) } : f
          )
        );
        setOpenFiles((prev) => prev.map((f) => (f === oldName ? newName : f)));
        setDirtyFiles((prev) => prev.map((f) => (f === oldName ? newName : f)));

        if (selectedFile === oldName) setSelectedFile(newName);
      }
    );
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

  if (viewMode === "signin") {
    return (
      <SignIn
        onSignIn={handleSignIn}
        onGuestContinue={() => setViewMode("dashboard")}
      />
    );
  }

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
        viewMode={viewMode}
        setViewMode={setViewMode}
        user={user}
        onSignOut={handleSignOut}
      />

      {viewMode === "dashboard" ? (
        <ErrorBoundary>
          <Dashboard
            projects={projects || []}
            files={files || []}
            currentProject={currentProject || "My React Project"}
            onSelectProject={handleProjectSelect}
            onCreateProject={handleCreateProject}
            onRenameProject={handleRenameProject}
            onDeleteProject={handleDeleteProject}
            onViewEditor={() => setViewMode("editor")}
            backendStatus={backendStatus}
            theme={theme}
            setTheme={setTheme}
            runCount={runCode}
            user={user}
            onSignOut={handleSignOut}
            editorSettings={editorSettings}
            onUpdateEditorSettings={handleUpdateEditorSettings}
            onUpdateUser={handleUpdateUser}
          />
        </ErrorBoundary>
      ) : (
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
              onCreateFolder={handleCreateFolder}
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

          {activeTab === "ai" && (
            <AiAssistantPanel
              selectedFile={selectedFile}
              currentCode={code}
              onInsertCode={(newCode) => {
                if (selectedFile) handleCodeChange(newCode);
              }}
            />
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
            fontSize={editorSettings.fontSize}
            tabSize={editorSettings.tabSize}
          />

          {/* RIGHT PANEL (PREVIEW & CONSOLE) */}
          <div className="right-panel">
            <Preview files={files} onConsoleMessage={handleConsoleMessage} runCode={runCode} />
            <OutputPanel output={output} clearOutput={clearOutput} />
          </div>
        </div>
      )}

      {/* STATUS BAR */}
      <StatusBar
        cursorPosition={cursorPosition}
        selectedFile={selectedFile}
        language={selectedFileData?.language}
        backendStatus={backendStatus}
        theme={theme}
      />

      {/* INPUT DIALOG MODAL (REPLACES BROWSER PROMPT) */}
      <InputDialogModal {...inputModal} onClose={closeInputModal} />
    </div>
  );
}

export default App;