import { useState, useEffect } from "react";
import "./Dashboard.css";
import {
  Folder,
  FileText,
  Play,
  Zap,
  Settings,
  LogOut,
  Code2,
  Plus,
  Search,
  X,
  Clock,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Pause,
  BarChart3,
  User,
  Sparkles,
  ShieldCheck,
  Cpu,
  Globe,
  History,
  Trash
} from "lucide-react";

function Dashboard({
  projects = [],
  files = [],
  currentProject = "My React Project",
  onSelectProject = () => {},
  onCreateProject = () => {},
  onRenameProject = () => {},
  onDeleteProject = () => {},
  onViewEditor = () => {},
  backendStatus = false,
  theme = "vs-dark",
  setTheme = () => {},
  runCount = 12,
  user = null,
  onSignOut = null
}) {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeFiles = Array.isArray(files) ? files : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Session History State (stored in localStorage)
  const [sessionHistory, setSessionHistory] = useState(() => {
    const saved = localStorage.getItem("codesphere_session_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse session history:", e);
      }
    }
    return [
      { id: 1, durationFormatted: "01:14:20", durationSecs: 4460, date: "Sep 2, 2026, 04:30 PM", project: "My React Project" },
      { id: 2, durationFormatted: "00:45:10", durationSecs: 2710, date: "Sep 3, 2026, 10:15 AM", project: "My React Project" }
    ];
  });

  // Persistent Active Session Timer State
  const [sessionTimer, setSessionTimer] = useState(() => {
    const savedStartTime = localStorage.getItem("codesphere_session_start_time");
    const savedAccumulated = parseInt(localStorage.getItem("codesphere_session_accumulated") || "0", 10);
    const isPaused = localStorage.getItem("codesphere_session_paused") === "true";

    if (isPaused) {
      return savedAccumulated;
    }

    if (!savedStartTime) {
      const now = Date.now();
      localStorage.setItem("codesphere_session_start_time", now.toString());
      localStorage.setItem("codesphere_session_accumulated", "0");
      localStorage.setItem("codesphere_session_paused", "false");
      return 0;
    }

    const elapsedSinceStart = Math.floor((Date.now() - parseInt(savedStartTime, 10)) / 1000);
    return savedAccumulated + elapsedSinceStart;
  });

  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    return localStorage.getItem("codesphere_session_paused") !== "true";
  });

  // Real-time persistent session interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        const savedStartTime = localStorage.getItem("codesphere_session_start_time");
        const savedAccumulated = parseInt(localStorage.getItem("codesphere_session_accumulated") || "0", 10);

        if (savedStartTime) {
          const elapsed = Math.floor((Date.now() - parseInt(savedStartTime, 10)) / 1000);
          setSessionTimer(savedAccumulated + elapsed);
        } else {
          setSessionTimer((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Auto-start session timer automatically on login or dashboard mount
  useEffect(() => {
    const savedStartTime = localStorage.getItem("codesphere_session_start_time");
    const isPaused = localStorage.getItem("codesphere_session_paused") === "true";

    if (!savedStartTime || isPaused) {
      const now = Date.now();
      localStorage.setItem("codesphere_session_start_time", now.toString());
      localStorage.setItem("codesphere_session_paused", "false");
      setIsTimerRunning(true);
    }
  }, []);

  const handleToggleTimer = () => {
    if (isTimerRunning) {
      // Pause: Save current total seconds to accumulated and mark paused
      localStorage.setItem("codesphere_session_accumulated", sessionTimer.toString());
      localStorage.removeItem("codesphere_session_start_time");
      localStorage.setItem("codesphere_session_paused", "true");
      setIsTimerRunning(false);
    } else {
      // Resume: Set new start timestamp and unpause
      localStorage.setItem("codesphere_session_start_time", Date.now().toString());
      localStorage.setItem("codesphere_session_paused", "false");
      setIsTimerRunning(true);
    }
  };

  const saveCurrentSessionToHistory = () => {
    if (sessionTimer > 0) {
      const newHistoryItem = {
        id: Date.now(),
        durationFormatted: formatTimer(sessionTimer),
        durationSecs: sessionTimer,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        project: currentProject || "My React Project"
      };

      const updatedHistory = [newHistoryItem, ...sessionHistory];
      setSessionHistory(updatedHistory);
      localStorage.setItem("codesphere_session_history", JSON.stringify(updatedHistory));
    }

    // Reset active session state in localStorage & timer
    localStorage.removeItem("codesphere_session_start_time");
    localStorage.setItem("codesphere_session_accumulated", "0");
    localStorage.setItem("codesphere_session_paused", "true");
    setSessionTimer(0);
    setIsTimerRunning(false);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all session history logs?")) {
      setSessionHistory([]);
      localStorage.removeItem("codesphere_session_history");
    }
  };

  const userProfile = user || {
    name: "Adarsh Kumar",
    email: "adarsh.developer@codesphere.io",
    role: "Full-Stack Developer",
    plan: "Pro Developer ⚡",
    provider: "Email",
    joinedDate: "August 2026"
  };

  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    autoSave: true,
    minimap: true
  });

  const runHistory = [
    { id: 1, file: "App.jsx", status: "Success", timestamp: "2 mins ago", output: "Hello from CodeSphere!" },
    { id: 2, file: "main.jsx", status: "Success", timestamp: "15 mins ago", output: "React root mounted successfully" },
    { id: 3, file: "index.css", status: "Success", timestamp: "1 hour ago", output: "Styles reloaded" },
    { id: 4, file: "App.jsx", status: "Warning", timestamp: "3 hours ago", output: "Console warning interceptor active" }
  ];

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Filter projects by search
  const filteredProjects = safeProjects.filter((p) =>
    p && typeof p === "string" ? p.toLowerCase().includes(searchTerm.toLowerCase().trim()) : false
  );

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of CodeSphere? Your active coding session will be saved to history and reset.")) {
      saveCurrentSessionToHistory();
      if (onSignOut) {
        onSignOut();
      } else {
        alert("Logged out successfully! Session saved and reset.");
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* TOP PROFILE HEADER BAR */}
      <div className="dashboard-header-bar">
        <div className="user-profile-header">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <User size={28} />
              )}
            </div>
            <span className="online-indicator" title="User Online"></span>
          </div>
          <div className="profile-info">
            <div className="profile-name-row">
              <h2 className="profile-name">{userProfile.name}</h2>
              <span className="plan-badge">
                <Sparkles size={13} />
                {userProfile.plan}
              </span>
            </div>
            <p className="profile-email">
              {userProfile.provider === "GitHub" && userProfile.username ? (
                <span>@{userProfile.username}</span>
              ) : (
                <span>{userProfile.email}</span>
              )}
              {" • "}
              <span className="role-tag">{userProfile.role}</span>
            </p>
          </div>
        </div>

        {/* HEADER TOP ACTIONS */}
        <div className="header-top-actions">
          <button
            className="header-action-btn settings-btn"
            onClick={() => setShowSettingsModal(true)}
            title="Settings & Preferences"
          >
            <Settings size={15} />
            <span>Settings</span>
          </button>

          <button
            className="header-action-btn logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>

          <button className="btn-primary open-editor-btn" onClick={onViewEditor}>
            <Code2 size={16} />
            <span>Open Code Editor</span>
          </button>
        </div>
      </div>

      {/* STATISTICS TILES OVERVIEW */}
      <div className="stats-cards-grid">
        <div className="stat-card cyan-card">
          <div className="stat-card-icon-wrapper cyan">
            <Folder size={22} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-value">{safeProjects.length}</span>
            <span className="stat-card-label">Total Workspaces</span>
          </div>
          <span className="stat-trend positive">+1 Active</span>
        </div>

        <div className="stat-card purple-card">
          <div className="stat-card-icon-wrapper purple">
            <FileText size={22} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-value">{safeFiles.length}</span>
            <span className="stat-card-label">Active Source Files</span>
          </div>
          <span className="stat-trend">Current Project</span>
        </div>

        <div className="stat-card green-card">
          <div className="stat-card-icon-wrapper green">
            <Play size={22} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-value">{runCount}</span>
            <span className="stat-card-label">Executions Run</span>
          </div>
          <span className="stat-trend positive">100% Success</span>
        </div>

        <div className="stat-card orange-card">
          <div className="stat-card-icon-wrapper orange">
            <Zap size={22} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-value">
              {backendStatus ? "Online" : "Offline"}
            </span>
            <span className="stat-card-label">Backend Service (Port 5000)</span>
          </div>
          <span className={`status-pill-indicator ${backendStatus ? "online" : "offline"}`}>
            {backendStatus ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* DASHBOARD MAIN LAYOUT GRID */}
      <div className="dashboard-grid-layout">
        {/* LEFT COLUMN: WORKSPACES & HISTORY */}
        <div className="dashboard-section left-section">
          {/* RECENTLY OPENED PROJECT */}
          <div className="dashboard-card recent-projects-card">
            <div className="card-header">
              <div className="card-header-title">
                <Clock size={18} className="header-icon" />
                <h3>Active Workspace Summary</h3>
              </div>
              <button
                className="btn-link"
                onClick={() => {
                  onSelectProject(currentProject);
                  onViewEditor();
                }}
              >
                <span>Open Editor</span>
                <ArrowRight size={14} />
              </button>
            </div>
            <div className="recent-project-banner">
              <div className="banner-icon-bg">
                <Folder size={28} />
              </div>
              <div className="banner-details">
                <h4>{currentProject || "My React Project"}</h4>
                <p>Last active workspace • {safeFiles.length} open files loaded in editor</p>
                <div className="banner-tags">
                  <span className="tag-chip">React 19</span>
                  <span className="tag-chip">Vite JS</span>
                  <span className="tag-chip">JavaScript</span>
                </div>
              </div>
              <button className="btn-primary-sm" onClick={onViewEditor}>
                <Code2 size={14} />
                <span>Continue Coding</span>
              </button>
            </div>
          </div>

          {/* ALL PROJECTS MANAGER */}
          <div className="dashboard-card projects-manager-card">
            <div className="card-header">
              <div>
                <span className="card-subtitle">WORKSPACES MANAGEMENT</span>
                <h3 className="card-title">All Projects ({filteredProjects.length})</h3>
              </div>

              <button className="btn-primary-sm create-proj-btn" onClick={onCreateProject}>
                <Plus size={15} />
                <span>New Project</span>
              </button>
            </div>

            {/* SEARCH PROJECTS BAR */}
            <div className="project-search-bar">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search projects by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-btn" onClick={() => setSearchTerm("")}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* PROJECTS GRID */}
            <div className="all-projects-grid">
              {filteredProjects.map((proj) => {
                const isActive = proj === currentProject;
                return (
                  <div
                    key={proj}
                    className={`project-tile ${isActive ? "active-tile" : ""}`}
                  >
                    <div
                      className="tile-main"
                      onClick={() => {
                        onSelectProject(proj);
                        onViewEditor();
                      }}
                    >
                      <div className="tile-icon-wrapper">
                        <Folder size={20} />
                      </div>
                      <div className="tile-info">
                        <div className="tile-title-row">
                          <h4 className="tile-title">{proj}</h4>
                          {isActive && <span className="active-badge">Active</span>}
                        </div>
                        <span className="tile-meta">React Workspace</span>
                      </div>
                    </div>

                    {/* PROJECT ACTION BUTTONS */}
                    <div className="tile-actions">
                      <button
                        className="tile-action-btn rename"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(proj);
                          onRenameProject();
                        }}
                        title="Rename Workspace"
                      >
                        <Edit2 size={13} />
                        <span>Rename</span>
                      </button>

                      <button
                        className="tile-action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(proj);
                          onDeleteProject();
                        }}
                        title="Delete Workspace"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProjects.length === 0 && (
                <div className="empty-projects-state">
                  <Folder size={32} />
                  <p>No projects match "{searchTerm}"</p>
                  <button className="btn-small" onClick={() => setSearchTerm("")}>
                    Clear Search Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RUN HISTORY & ACTIVITY LOG */}
          <div className="dashboard-card run-history-card">
            <div className="card-header">
              <div className="card-header-title">
                <BarChart3 size={18} className="header-icon" />
                <h3 className="card-title">Run History &amp; Execution Logs</h3>
              </div>
              <span className="history-count">{runHistory.length} Recent Runs</span>
            </div>

            <div className="run-history-table">
              {runHistory.map((item) => (
                <div key={item.id} className="history-row">
                  <div className="history-status-col">
                    <span className={`status-pill ${item.status.toLowerCase()}`}>
                      {item.status === "Success" ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <AlertTriangle size={13} />
                      )}
                      <span>{item.status}</span>
                    </span>
                  </div>
                  <div className="history-file-col">
                    <FileText size={14} className="file-icon" />
                    <span className="file-name">{item.file}</span>
                  </div>
                  <div className="history-output-col">
                    <code className="log-output">{item.output}</code>
                  </div>
                  <div className="history-time-col">
                    <span className="time-stamp">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMER, ACTIVITY & SYSTEM DETAILS */}
        <div className="dashboard-section right-section">
          {/* TIMER CARD */}
          <div className="dashboard-card session-timer-card">
            <div className="card-header">
              <div className="card-header-title">
                <Clock size={18} className="header-icon" />
                <h3>Active Coding Session</h3>
              </div>
              <span className="live-dot-badge">
                <span className="pulse-dot"></span>
                <span>LIVE</span>
              </span>
            </div>

            <div className="session-timer-display">
              <span className="timer-time">{formatTimer(sessionTimer)}</span>
              <span className="timer-desc">Continuous Workspace Session</span>
            </div>

            <button
              className={`timer-toggle-btn ${isTimerRunning ? "pause" : "start"}`}
              onClick={handleToggleTimer}
            >
              {isTimerRunning ? (
                <>
                  <Pause size={15} />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>Resume Session</span>
                </>
              )}
            </button>

            <button
              className="btn-history-toggle"
              onClick={() => setShowHistoryModal(true)}
              title="View Past Recorded Session History Logs"
            >
              <History size={14} />
              <span>Session History ({sessionHistory.length})</span>
            </button>
          </div>

          {/* CODING ACTIVITY CHART */}
          <div className="dashboard-card activity-digest-card">
            <div className="card-header">
              <div className="card-header-title">
                <BarChart3 size={18} className="header-icon" />
                <h3>Weekly Activity (Hours)</h3>
              </div>
            </div>
            <div className="activity-mini-bars">
              {[
                { day: "Mon", hrs: 6 },
                { day: "Tue", hrs: 8 },
                { day: "Wed", hrs: 5 },
                { day: "Thu", hrs: 9 },
                { day: "Fri", hrs: 7 },
                { day: "Sat", hrs: 4 },
                { day: "Sun", hrs: 6 }
              ].map((d) => (
                <div key={d.day} className="mini-col">
                  <div className="bar-wrapper">
                    <div
                      className="mini-bar"
                      style={{ height: `${d.hrs * 11}px` }}
                    >
                      <span className="bar-tooltip">{d.hrs}h</span>
                    </div>
                  </div>
                  <span className="mini-day">{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ENVIRONMENT & SYSTEM STATS */}
          <div className="dashboard-card system-info-card">
            <div className="card-header">
              <div className="card-header-title">
                <ShieldCheck size={18} className="header-icon" />
                <h3>Environment & Tech Stack</h3>
              </div>
            </div>
            <div className="system-info-list">
              <div className="info-row">
                <span className="info-label">
                  <Cpu size={14} /> Frontend Engine
                </span>
                <span className="info-value">React 19 + Vite</span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <Code2 size={14} /> Code Editor
                </span>
                <span className="info-value">Monaco Editor</span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <Globe size={14} /> API Server
                </span>
                <span className="info-value">Node.js Express (5000)</span>
              </div>
              <div className="info-row">
                <span className="info-label">
                  <Sparkles size={14} /> AI Assistant
                </span>
                <span className="info-value">CodeSphere AI v2.4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="modal-backdrop" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Settings size={18} />
                <h3>Editor Settings &amp; Preferences</h3>
              </div>
              <button className="close-modal" onClick={() => setShowSettingsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="setting-item">
                <label>Theme Selection</label>
                <div className="theme-options-grid">
                  <button
                    className={`theme-option-btn ${theme === "vs-dark" ? "selected" : ""}`}
                    onClick={() => setTheme("vs-dark")}
                  >
                    VS Dark
                  </button>
                  <button
                    className={`theme-option-btn ${theme === "vs-light" ? "selected" : ""}`}
                    onClick={() => setTheme("vs-light")}
                  >
                    VS Light
                  </button>
                  <button
                    className={`theme-option-btn ${theme === "hc-black" ? "selected" : ""}`}
                    onClick={() => setTheme("hc-black")}
                  >
                    High Contrast
                  </button>
                </div>
              </div>

              <div className="setting-item">
                <label>Font Size ({editorSettings.fontSize}px)</label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={editorSettings.fontSize}
                  onChange={(e) =>
                    setEditorSettings({ ...editorSettings, fontSize: Number(e.target.value) })
                  }
                />
              </div>

              <div className="setting-item">
                <label>Tab Size</label>
                <select
                  className="setting-select"
                  value={editorSettings.tabSize}
                  onChange={(e) =>
                    setEditorSettings({ ...editorSettings, tabSize: Number(e.target.value) })
                  }
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>

              <div className="setting-item checkbox-setting">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editorSettings.autoSave}
                    onChange={(e) =>
                      setEditorSettings({ ...editorSettings, autoSave: e.target.checked })
                    }
                  />
                  <span>Enable Auto-Save to LocalStorage</span>
                </label>
              </div>

              <div className="modal-footer">
                <button className="btn-primary" onClick={() => setShowSettingsModal(false)}>
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SESSION HISTORY MODAL */}
      {showHistoryModal && (
        <div className="modal-backdrop" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-content history-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <History size={18} />
                <h3>Past Coding Sessions History</h3>
              </div>
              <button className="close-modal" onClick={() => setShowHistoryModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="history-summary-bar">
                <span>Total Recorded Sessions: <strong>{sessionHistory.length}</strong></span>
                {sessionHistory.length > 0 && (
                  <button className="btn-clear-history" onClick={handleClearHistory}>
                    <Trash size={13} />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              <div className="session-history-list">
                {sessionHistory.map((item) => (
                  <div key={item.id} className="session-history-item">
                    <div className="session-item-main">
                      <div className="session-item-header">
                        <span className="session-project-name">📁 {item.project}</span>
                        <span className="session-duration-badge">{item.durationFormatted}</span>
                      </div>
                      <span className="session-date-stamp">⏱ {item.date}</span>
                    </div>
                  </div>
                ))}

                {sessionHistory.length === 0 && (
                  <div className="empty-history-state">
                    <History size={32} />
                    <p>No past session history recorded yet.</p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn-primary" onClick={() => setShowHistoryModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
