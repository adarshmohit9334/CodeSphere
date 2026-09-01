import { useState, useEffect } from "react";

function Dashboard({
  projects,
  files,
  currentProject,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onViewEditor,
  backendStatus,
  theme,
  setTheme,
  runCount = 12
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(1420);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // User Profile State
  const [userProfile] = useState({
    name: "Adarsh Kumar",
    email: "adarsh.developer@codesphere.io",
    role: "Full-Stack Developer",
    plan: "Pro Developer ⚡",
    avatar: "👤",
    joinedDate: "August 2026"
  });

  // Editor Settings State
  const [editorSettings, setEditorSettings] = useState({
    fontSize: 14,
    tabSize: 2,
    autoSave: true,
    minimap: true
  });

  // Run History Mock Data
  const runHistory = [
    { id: 1, file: "App.jsx", status: "Success", timestamp: "2 mins ago", output: "Hello from CodeSphere!" },
    { id: 2, file: "main.jsx", status: "Success", timestamp: "15 mins ago", output: "React root mounted successfully" },
    { id: 3, file: "index.css", status: "Success", timestamp: "1 hour ago", output: "Styles reloaded" },
    { id: 4, file: "App.jsx", status: "Warning", timestamp: "3 hours ago", output: "Console warning interceptor active" }
  ];

  // Session timer
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => setSessionTimer((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Filter projects by search
  const filteredProjects = projects.filter((p) =>
    p.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of CodeSphere?")) {
      alert("Logged out successfully! Session ended.");
    }
  };

  return (
    <div className="dashboard-container">
      {/* TOP USER WELCOME & PROFILE HEADER */}
      <div className="dashboard-header-bar">
        <div className="user-profile-header">
          <div className="profile-avatar">{userProfile.avatar}</div>
          <div className="profile-info">
            <div className="profile-name-row">
              <h2 className="profile-name">{userProfile.name}</h2>
              <span className="plan-badge">{userProfile.plan}</span>
            </div>
            <p className="profile-email">{userProfile.email} • {userProfile.role}</p>
          </div>
        </div>

        {/* HEADER TOP ACTIONS */}
        <div className="header-top-actions">
          {/* SETTINGS BUTTON */}
          <button
            className="header-action-btn"
            onClick={() => setShowSettingsModal(true)}
            title="Settings"
          >
            ⚙️ Settings
          </button>

          {/* LOGOUT BUTTON */}
          <button
            className="header-action-btn logout-btn"
            onClick={handleLogout}
            title="Logout"
          >
            🚪 Logout
          </button>

          {/* OPEN EDITOR BUTTON */}
          <button className="btn-primary" onClick={onViewEditor}>
            💻 Open Code Editor
          </button>
        </div>
      </div>

      {/* STATISTICS TILES OVERVIEW */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="stat-card-icon cyan">📁</div>
          <div className="stat-card-data">
            <span className="stat-card-value">{projects.length}</span>
            <span className="stat-card-label">Total Projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon purple">📄</div>
          <div className="stat-card-data">
            <span className="stat-card-value">{files.length}</span>
            <span className="stat-card-label">Active Files</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon green">▶</div>
          <div className="stat-card-data">
            <span className="stat-card-value">{runCount}</span>
            <span className="stat-card-label">Code Runs Executed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon orange">⚡</div>
          <div className="stat-card-data">
            <span className="stat-card-value">{backendStatus ? "Online" : "Offline"}</span>
            <span className="stat-card-label">Backend Status (Port 5000)</span>
          </div>
        </div>
      </div>

      {/* DASHBOARD MAIN LAYOUT GRID */}
      <div className="dashboard-grid-layout">
        {/* LEFT COLUMN: PROJECTS MANAGEMENT */}
        <div className="dashboard-section left-section">
          {/* RECENTLY OPENED PROJECTS */}
          <div className="dashboard-card recent-projects-card">
            <div className="card-header">
              <h3>🕐 Recently Opened Workspace</h3>
              <button className="btn-small" onClick={() => { onSelectProject(currentProject); onViewEditor(); }}>
                Open Editor ➔
              </button>
            </div>
            <div className="recent-project-banner">
              <div className="banner-icon">📁</div>
              <div className="banner-details">
                <h4>{currentProject || "My React Project"}</h4>
                <p>Last active workspace • {files.length} files open</p>
              </div>
              <button className="btn-primary-sm" onClick={onViewEditor}>
                Continue Coding
              </button>
            </div>
          </div>

          {/* ALL PROJECTS GRID WITH SEARCH & MANAGEMENT */}
          <div className="dashboard-card projects-manager-card">
            <div className="card-header">
              <div>
                <span className="card-subtitle">WORKSPACES MANAGEMENT</span>
                <h3 className="card-title">📁 All Projects ({filteredProjects.length})</h3>
              </div>

              <button className="btn-primary-sm" onClick={onCreateProject}>
                ➕ Create New Project
              </button>
            </div>

            {/* SEARCH PROJECTS BAR */}
            <div className="project-search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search projects by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-btn" onClick={() => setSearchTerm("")}>×</button>
              )}
            </div>

            {/* PROJECTS GRID */}
            <div className="all-projects-grid">
              {filteredProjects.map((proj) => (
                <div
                  key={proj}
                  className={`project-tile ${proj === currentProject ? "active-tile" : ""}`}
                >
                  <div
                    className="tile-main"
                    onClick={() => {
                      onSelectProject(proj);
                      onViewEditor();
                    }}
                  >
                    <span className="tile-icon">📂</span>
                    <div className="tile-info">
                      <h4 className="tile-title">{proj}</h4>
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
                      title="Rename Project"
                    >
                      ✏️ Rename
                    </button>

                    <button
                      className="tile-action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(proj);
                        onDeleteProject();
                      }}
                      title="Delete Project"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RUN HISTORY & ACTIVITY LOG */}
          <div className="dashboard-card run-history-card">
            <div className="card-header">
              <h3 className="card-title">📈 Run History &amp; Execution Log</h3>
              <span className="history-count">{runHistory.length} recent executions</span>
            </div>

            <div className="run-history-table">
              {runHistory.map((item) => (
                <div key={item.id} className="history-row">
                  <span className={`status-pill ${item.status.toLowerCase()}`}>
                    {item.status === "Success" ? "✓" : "⚠️"} {item.status}
                  </span>
                  <span className="file-name">📄 {item.file}</span>
                  <span className="log-output">{item.output}</span>
                  <span className="time-stamp">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TIMER & CODING STATS */}
        <div className="dashboard-section right-section">
          {/* TIMER CARD */}
          <div className="dashboard-card session-timer-card">
            <div className="card-header">
              <h3>⏱ Active Session</h3>
              <span className="live-dot">● Live</span>
            </div>

            <div className="session-timer-display">
              <span className="timer-time">{formatTimer(sessionTimer)}</span>
              <span className="timer-desc">Continuous Coding Session</span>
            </div>

            <button
              className={`timer-toggle-btn ${isTimerRunning ? "pause" : "start"}`}
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? "⏸ Pause Session" : "▶ Resume Session"}
            </button>
          </div>

          {/* CODING ACTIVITY CHART */}
          <div className="dashboard-card activity-digest-card">
            <div className="card-header">
              <h3>📊 Weekly Coding Activity</h3>
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
                  <div
                    className="mini-bar"
                    style={{ height: `${d.hrs * 12}px` }}
                    title={`${d.day}: ${d.hrs} hours`}
                  ></div>
                  <span className="mini-day">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="modal-backdrop" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚙️ Editor Settings &amp; Preferences</h3>
              <button className="close-modal" onClick={() => setShowSettingsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="setting-item">
                <label>Font Size ({editorSettings.fontSize}px)</label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={editorSettings.fontSize}
                  onChange={(e) => setEditorSettings({ ...editorSettings, fontSize: Number(e.target.value) })}
                />
              </div>

              <div className="setting-item">
                <label>Tab Size</label>
                <select
                  value={editorSettings.tabSize}
                  onChange={(e) => setEditorSettings({ ...editorSettings, tabSize: Number(e.target.value) })}
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                </select>
              </div>

              <div className="setting-item checkbox-setting">
                <label>
                  <input
                    type="checkbox"
                    checked={editorSettings.autoSave}
                    onChange={(e) => setEditorSettings({ ...editorSettings, autoSave: e.target.checked })}
                  />
                  Enable Auto-Save to LocalStorage
                </label>
              </div>

              <button className="btn-primary" onClick={() => setShowSettingsModal(false)}>
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
