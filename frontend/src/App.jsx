import React, { useEffect, useState, useCallback, Component } from "react";
import { supabase } from "./supabaseClient";

import Navbar from "./components/Navbar";
import ActivityBar from "./components/ActivityBar";
import Sidebar from "./components/Sidebar";
import SearchPanel from "./components/SearchPanel";
import CodeEditor from "./components/CodeEditor";
import Preview from "./components/Preview";
import OutputPanel from "./components/OutputPanel";
import StatusBar from "./components/StatusBar";

import SettingsModal from "./components/SettingsModal";
import SignIn from "./components/SignIn";
import AiAssistantPanel from "./components/AiAssistantPanel";
import InputDialogModal from "./components/InputDialogModal";
import TerminalPanel from "./components/TerminalPanel";
import CreateProjectModal from "./components/CreateProjectModal";

// Reusing InputDialogModal for Git Clone since it just takes a string
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
    if (!savedUser) return "signin";
    return localStorage.getItem("codesphere_view_mode") || "editor";
  });

  useEffect(() => {
    if (viewMode !== "signin") {
      localStorage.setItem("codesphere_view_mode", viewMode);
    }
  }, [viewMode]);
  const [activeTab, setActiveTab] = useState("explorer"); // 'explorer' | 'search' | 'debug'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("code-editor-theme") || "vs-dark";
  });

  const mapSupabaseUser = (sbUser) => {
    const meta = sbUser.user_metadata || {};
    const userObj = {
      id: sbUser.id,
      name: meta.full_name || meta.name || sbUser.email?.split("@")[0] || "Adarsh Kumar",
      email: sbUser.email || "",
      username: meta.user_name || meta.preferred_username || sbUser.email?.split("@")[0] || "",
      avatar: meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(meta.full_name || sbUser.email || "User")}`,
      provider: sbUser.app_metadata?.provider || "Supabase",
      role: meta.role || "Full-Stack Developer",
      plan: "Pro Developer ⚡",
      joinedDate: new Date(sbUser.created_at || Date.now()).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    };

    const key = (userObj.username || userObj.email || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_");
    localStorage.setItem("codesphere_user", JSON.stringify(userObj));
    localStorage.setItem(`codesphere_user_${key}`, JSON.stringify(userObj));

    setUser(userObj);
    // User requested that after login, it should always go to Welcome Page (editor mode) by default
    setViewMode("editor");
    localStorage.setItem("codesphere_view_mode", "editor");
  };

  // Real Supabase Session Listener (Google SSO Redirect & Auth Persistence)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = (userObj) => {
    setUser(userObj);
    setViewMode("editor");
    // Ensure no file is open so Welcome Page shows on fresh login
    setSelectedFile("");
    setOpenFiles([]);
    setCurrentProject(null);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
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

  const userKey = user
    ? (user.username || user.email || "guest").toLowerCase().replace(/[^a-z0-9]/g, "_")
    : "guest";



  // Save theme preference to LocalStorage
  useEffect(() => {
    localStorage.setItem("code-editor-theme", theme);
  }, [theme]);

  const [backendStatus, setBackendStatus] = useState(false);

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem(`codesphere_${userKey}_projects`);
    return saved ? JSON.parse(saved) : defaultProjects;
  });

  const [currentProject, setCurrentProject] = useState(null);

  const [files, setFiles] = useState([]);

  const [openFiles, setOpenFiles] = useState([]);

  const [selectedFile, setSelectedFile] = useState("");

  const [code, setCode] = useState("");

  // Re-sync workspace when active user account changes!
  useEffect(() => {
    if (!userKey) return;
    const savedProjStr = localStorage.getItem(`codesphere_${userKey}_projects`);
    const userProjects = savedProjStr ? JSON.parse(savedProjStr) : [`${user?.name || "My"} React Workspace`, "Untitled Project"];
    setProjects(userProjects);

    // ALWAYS start with no folder opened based on user request
    setCurrentProject(null);
    setFiles([]);
    setOpenFiles([]);
    setSelectedFile("");
    setCode("");
  }, [userKey]);

  const [output, setOutput] = useState("");
  const [runCode, setRunCode] = useState(0);
  const [dirtyFiles, setDirtyFiles] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [bottomTab, setBottomTab] = useState("terminal"); // 'output' | 'terminal'
  const [bottomPanelHeight, setBottomPanelHeight] = useState(300);
  const [rightPanelWidth, setRightPanelWidth] = useState(360);
  const [showPreview, setShowPreview] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiPanelWidth, setAiPanelWidth] = useState(360);

  // Run History tracking
  const [runHistory, setRunHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("codesphere_run_history")) || [];
    } catch {
      return [];
    }
  });

  const addRunHistory = useCallback((file, status, output) => {
    const newItem = {
      id: Date.now(),
      file,
      status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      output: output && output.length > 80 ? output.substring(0, 80) + "..." : (output || "No output")
    };
    setRunHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem("codesphere_run_history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const startHorizontalResizingAi = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startX = mouseDownEvent.clientX;
    const startWidth = aiPanelWidth;

    const onMouseMove = (mouseMoveEvent) => {
      const deltaX = startX - mouseMoveEvent.clientX;
      const newWidth = Math.max(250, Math.min(window.innerWidth * 0.7, startWidth + deltaX));
      setAiPanelWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const startResizing = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startY = mouseDownEvent.clientY;
    const startHeight = bottomPanelHeight;

    const onMouseMove = (mouseMoveEvent) => {
      // Calculate new height: dragging up increases height, dragging down decreases
      const deltaY = startY - mouseMoveEvent.clientY;
      const newHeight = Math.max(100, Math.min(window.innerHeight * 0.8, startHeight + deltaY));
      setBottomPanelHeight(newHeight);

      // Dispatch custom resize event so xterm can recalculate fit
      window.dispatchEvent(new Event('resize'));
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const startHorizontalResizing = (mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startX = mouseDownEvent.clientX;
    const startWidth = rightPanelWidth;

    const onMouseMove = (mouseMoveEvent) => {
      // Calculate new width: dragging left increases width, dragging right decreases
      const deltaX = startX - mouseMoveEvent.clientX;
      const newWidth = Math.max(250, Math.min(window.innerWidth * 0.7, startWidth + deltaX));
      setRightPanelWidth(newWidth);

      // Dispatch custom resize event so xterm can recalculate fit
      window.dispatchEvent(new Event('resize'));
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

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
  const [inputModal, setInputModal] = useState({ isOpen: false, title: "", placeholder: "", defaultValue: "", onSubmit: null, isDestructive: false, description: "" });
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isGitCloneModalOpen, setIsGitCloneModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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

  const handleCreateProjectClick = () => {
    setIsCreateProjectModalOpen(true);
  };

  const handleCreateProject = handleCreateProjectClick;

  const handleCreateProjectSubmit = async ({ name, type }) => {
    if (projects.includes(name)) {
      alert("A project with this name already exists locally.");
      return;
    }
    const newFiles = getTemplateFiles(type);

    // Save to DB if backend connected
    if (backendStatus) {
      try {
        await fetch(`${API_BASE}/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type, files: newFiles })
        });
      } catch (err) {
        console.error("Failed to save project to backend:", err);
      }
    }

    const updatedProjects = [...projects, name];
    setProjects(updatedProjects);
    localStorage.setItem(`codesphere_${userKey}_projects`, JSON.stringify(updatedProjects));

    setCurrentProject(name);
    localStorage.setItem(`codesphere_${userKey}_current_project`, name);

    setFiles(newFiles);
    localStorage.setItem(`codesphere_${userKey}_files_${name}`, JSON.stringify(newFiles));

    const defaultOpen = newFiles.slice(0, 1).map((f) => f.name);
    setOpenFiles(defaultOpen);
    localStorage.setItem(`codesphere_${userKey}_open_files_${name}`, JSON.stringify(defaultOpen));

    const selected = defaultOpen[0] || "";
    setSelectedFile(selected);
    localStorage.setItem(`codesphere_${userKey}_selected_file_${name}`, selected);

    if (selected) {
      const activeObj = newFiles.find((f) => f.name === selected);
      setCode(activeObj ? activeObj.code : "");
    } else {
      setCode("");
    }

    setIsCreateProjectModalOpen(false);
    setViewMode("editor");
  };

  const handleGitCloneSubmit = async (gitUrl) => {
    if (!gitUrl.trim()) return;

    if (!backendStatus) {
      alert("Backend is not connected. Git clone requires a running backend.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/projects/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gitUrl })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to clone repository");
      }

      const data = await response.json();

      const newFiles = typeof data.files === 'string' ? JSON.parse(data.files) : data.files;
      const projName = data.name;

      if (!projects.includes(projName)) {
        const updatedProjects = [...projects, projName];
        setProjects(updatedProjects);
        localStorage.setItem(`codesphere_${userKey}_projects`, JSON.stringify(updatedProjects));
      }

      setCurrentProject(projName);
      localStorage.setItem(`codesphere_${userKey}_current_project`, projName);

      setFiles(newFiles);
      localStorage.setItem(`codesphere_${userKey}_files_${projName}`, JSON.stringify(newFiles));

      const defaultOpen = newFiles.length > 0 ? [newFiles[0].name] : [];
      setOpenFiles(defaultOpen);
      localStorage.setItem(`codesphere_${userKey}_open_files_${projName}`, JSON.stringify(defaultOpen));

      const selected = defaultOpen[0] || "";
      setSelectedFile(selected);
      localStorage.setItem(`codesphere_${userKey}_selected_file_${projName}`, selected);

      if (selected) {
        const activeObj = newFiles.find((f) => f.name === selected);
        setCode(activeObj ? activeObj.code : "");
      } else {
        setCode("");
      }

      setIsGitCloneModalOpen(false);
      setViewMode("editor");
      setActiveTab("explorer");
    } catch (err) {
      console.error(err);
      alert(`Git Clone Failed: ${err.message}`);
    }
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
    handleSaveCode(); // Ensure latest file changes are synced to backend before running
    setOutput("");
    const selectedData = files.find(f => f.name === selectedFile);
    if (!selectedData) return;

    const lang = selectedData.language;

    // Check if project has web UI components (HTML or React App)
    const hasHtml = files.some(f => f.name.endsWith('.html'));
    const hasReactApp = files.some(f => f.name === 'App.jsx' || f.name === 'App.js');
    const isWebProject = hasHtml || hasReactApp;

    // Web projects run in Preview iframe
    if (isWebProject && ["javascript", "html", "css", "typescript"].includes(lang)) {
      setRunCode((prev) => prev + 1);
      addRunHistory(selectedFile, "Success", "Browser preview refreshed");
    } else {
      // Backend Execution for Python, Java, C, C++, raw JS, etc.
      setBottomTab("terminal");

      let command = "";
      if (lang === "python") command = `python3 ${selectedFile}`;
      else if (lang === "java") command = `javac ${selectedFile} && java ${selectedFile.replace('.java', '')}`;
      else if (lang === "c") command = `gcc ${selectedFile} -o a.out && ./a.out`;
      else if (lang === "cpp") command = `g++ ${selectedFile} -o a.out && ./a.out`;
      else if (lang === "javascript" || lang === "typescript") command = `node ${selectedFile}`;
      else command = `cat ${selectedFile}`;

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('terminal:run-command', { detail: command }));
      }, 300);

      addRunHistory(selectedFile, "Success", "Sent command to interactive terminal");
    }
  }, [files, selectedFile, addRunHistory, handleSaveCode]);

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
      case "py":
        return "python";
      case "java":
        return "java";
      case "c":
        return "c";
      case "cpp":
        return "cpp";
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

  const handleExecuteAIActions = useCallback((actions) => {
    actions.forEach(action => {
      if (action.action === "CREATE_PROJECT") {
        const projName = action.name || "AI Generated Project";
        setProjects(prev => {
          const updated = !prev.includes(projName) ? [...prev, projName] : prev;
          localStorage.setItem(`codesphere_projects_${userKey}`, JSON.stringify(updated));
          return updated;
        });
        setCurrentProject(projName);
        localStorage.setItem(`codesphere_${userKey}_current_project`, projName);

        const newFiles = action.files || [];
        if (newFiles.length > 0) {
          const names = newFiles.map(f => f.path || f.name);
          setOpenFiles(names);
          setSelectedFile(names[0]);
          setCode(newFiles[0].content || newFiles[0].code || "");

          const formattedFiles = newFiles.map(f => {
            const fileName = f.path || f.name;
            const ext = fileName.split('.').pop();
            return {
              name: fileName,
              language: (ext === 'js' || ext === 'jsx') ? 'javascript' : ext,
              code: f.content || f.code || ""
            };
          });
          setFiles(formattedFiles);

          // Save to LocalStorage immediately so it persists
          localStorage.setItem(`code-editor-files-${projName}`, JSON.stringify(formattedFiles));
          localStorage.setItem(`code-editor-open-files-${projName}`, JSON.stringify(names));
          localStorage.setItem(`code-editor-selected-file-${projName}`, names[0]);
        }

        // Show the editor and switch to Explorer tab so user sees the files!
        setViewMode("editor");
        setActiveTab("explorer");

      } else if (action.action === "UPDATE_FILE") {
        const filePath = action.path || action.name;
        const newCode = action.content || action.code;

        setFiles(prev => {
          const exists = prev.find(f => f.name === filePath);
          const updated = exists
            ? prev.map(f => f.name === filePath ? { ...f, code: newCode } : f)
            : [...prev, { name: filePath, language: (filePath.split('.').pop() === 'js' || filePath.split('.').pop() === 'jsx') ? 'javascript' : filePath.split('.').pop(), code: newCode }];

          if (currentProject) {
            localStorage.setItem(`code-editor-files-${currentProject}`, JSON.stringify(updated));
          }
          return updated;
        });

        setOpenFiles(prev => {
          const updated = !prev.includes(filePath) ? [...prev, filePath] : prev;
          if (currentProject) {
            localStorage.setItem(`code-editor-open-files-${currentProject}`, JSON.stringify(updated));
          }
          return updated;
        });

        setSelectedFile(filePath);
        if (currentProject) {
          localStorage.setItem(`code-editor-selected-file-${currentProject}`, filePath);
        }
        setCode(newCode);

        // Switch to Explorer to show the updated file structure
        setActiveTab("explorer");
      }
    });
  }, [userKey, currentProject]);

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
        showPreview={showPreview}
        setShowPreview={setShowPreview}
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

      <div className="workspace">
        {/* ACTIVITY BAR */}
        <ActivityBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          backendStatus={backendStatus}
          showAiPanel={showAiPanel}
          toggleAiPanel={() => setShowAiPanel(prev => !prev)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
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
            onOpenProject={() => setViewMode("dashboard")}
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

          <div className="workspace-main" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="workspace-top" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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
                projects={projects}
                onNewFile={() => setActiveTab("explorer")} // Just open explorer to let them click the + icon
                onOpenProject={() => setViewMode("dashboard")}
                onCloneGit={() => setIsGitCloneModalOpen(true)}
                onGenerateWorkspace={() => setIsCreateProjectModalOpen(true)}
                onOpenRecent={(projName) => handleProjectSelect(projName)}
              />

              {/* HORIZONTAL DRAG HANDLE */}
              <div
                onMouseDown={startHorizontalResizing}
                style={{
                  width: '4px',
                  cursor: 'col-resize',
                  backgroundColor: '#30363d',
                  height: '100%',
                  zIndex: 10,
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#58a6ff'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#30363d'}
              />

              {/* RIGHT PANEL (PREVIEW) */}
              {showPreview && (
                <div className="right-panel" style={{ width: `${rightPanelWidth}px`, minWidth: '250px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <Preview files={files} onConsoleMessage={handleConsoleMessage} runCode={runCode} />
                  </div>
                </div>
              )}
            </div>

            {/* DRAG HANDLE FOR RESIZING BOTTOM PANEL */}
            {openFiles.length > 0 && (
              <>
                <div
                  onMouseDown={startResizing}
                  style={{ height: '4px', cursor: 'row-resize', backgroundColor: '#30363d', width: '100%', zIndex: 10 }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#58a6ff'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#30363d'}
                />

                {/* BOTTOM PANEL (TERMINAL & OUTPUT) */}
                <div className="bottom-panel-container" style={{ display: 'flex', flexDirection: 'column', height: `${bottomPanelHeight}px`, minHeight: '100px', backgroundColor: '#0d1117' }}>
                  <div className="bottom-panel-tabs" style={{ display: 'flex', gap: '16px', padding: '8px 16px', borderBottom: '1px solid #30363d', backgroundColor: '#161b22', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <div
                      style={{ cursor: 'pointer', color: bottomTab === 'output' ? '#e6edf3' : '#8b949e', borderBottom: bottomTab === 'output' ? '1px solid #58a6ff' : 'none', paddingBottom: '4px' }}
                      onClick={() => setBottomTab('output')}
                    >
                      Output
                    </div>
                    <div
                      style={{ cursor: 'pointer', color: bottomTab === 'terminal' ? '#e6edf3' : '#8b949e', borderBottom: bottomTab === 'terminal' ? '1px solid #58a6ff' : 'none', paddingBottom: '4px' }}
                      onClick={() => setBottomTab('terminal')}
                    >
                      Terminal
                    </div>
                  </div>
                  <div className="bottom-panel-content" style={{ flex: 1, overflow: 'hidden' }}>
                    {bottomTab === 'output' && (
                      <OutputPanel output={output} clearOutput={clearOutput} />
                    )}
                    {bottomTab === 'terminal' && (
                      <TerminalPanel currentProject={currentProject} theme={theme} />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* HORIZONTAL DRAG HANDLE (AI PANEL) */}
          {showAiPanel && (
            <div
              onMouseDown={startHorizontalResizingAi}
              style={{ width: '4px', cursor: 'col-resize', backgroundColor: '#30363d', zIndex: 10, flexShrink: 0 }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#58a6ff'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#30363d'}
            />
          )}

          {/* AI ASSISTANT PANEL */}
          {showAiPanel && (
            <div className="ai-panel-container" style={{ width: `${aiPanelWidth}px`, minWidth: '300px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #30363d', backgroundColor: '#0d1117' }}>
              <AiAssistantPanel
                selectedFile={selectedFile}
                currentCode={code}
                files={files}
                onInsertCode={(newCode) => {
                  if (selectedFile) handleCodeChange(newCode);
                }}
                onExecuteActions={handleExecuteAIActions}
                onClose={() => setShowAiPanel(false)}
              />
            </div>
          )}
        </div>

        {/* SETTINGS MODAL */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          user={user}
          onLogout={handleSignOut}
          theme={theme}
          onToggleTheme={() =>
            setTheme((prev) => (prev === "vs-dark" ? "vs-light" : prev === "vs-light" ? "hc-black" : "vs-dark"))
          }
        />
      {/* STATUS BAR */}
      <StatusBar
        cursorPosition={cursorPosition}
        selectedFile={selectedFile}
        language={selectedFileData?.language}
        backendStatus={backendStatus}
        theme={theme}
      />

      {/* MODALS */}
      <InputDialogModal {...inputModal} onClose={closeInputModal} />

      <InputDialogModal
        isOpen={isGitCloneModalOpen}
        title="📥 Clone Git Repository"
        description="Enter the URL of a public Git repository to clone and open as a new workspace."
        placeholder="https://github.com/user/repo.git"
        defaultValue=""
        onClose={() => setIsGitCloneModalOpen(false)}
        onSubmit={handleGitCloneSubmit}
      />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onSubmit={handleCreateProjectSubmit}
      />
    </div>
  );
}

export default App;