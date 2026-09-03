import { useState, useRef, useEffect } from "react";

function Navbar({
  runCode,
  saveCode,
  currentProject,
  projects,
  onProjectSelect,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  theme,
  setTheme,
  onExportProject,
  viewMode,
  setViewMode,
  user,
  onSignOut
}) {
  const [showProjects, setShowProjects] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  const projectsRef = useRef(null);

  // Close projects dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (projectsRef.current && !projectsRef.current.contains(event.target)) {
        setShowProjects(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProjectSelect = (project) => {
    onProjectSelect(project);
    setShowProjects(false);
  };

  const themesList = [
    { id: "vs-dark", name: "VS Code Dark+" },
    { id: "vs-light", name: "VS Code Light+" },
    { id: "hc-black", name: "High Contrast Dark" }
  ];

  return (
    <header className="navbar">
      {/* BRAND / LOGO & VIEW SWITCHER */}
      <div className="logo-section">
        <div className="logo" onClick={() => setViewMode("dashboard")} style={{ cursor: "pointer" }}>
          <svg viewBox="0 0 120 120" width="34" height="34" fill="none" className="codesphere-logo-icon">
            <defs>
              <linearGradient id="sphereGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d2ff" />
                <stop offset="45%" stopColor="#0066ff" />
                <stop offset="80%" stopColor="#9d4edd" />
                <stop offset="100%" stopColor="#e0aaff" />
              </linearGradient>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f2fe" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0066ff" />
              </linearGradient>
              <linearGradient id="codeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0088ff" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00d2ff" floodOpacity="0.4" />
              </filter>
            </defs>

            {/* Ring Back */}
            <path
              d="M 16 72 C 2 52, 32 22, 82 18 C 104 16, 116 26, 108 38"
              stroke="url(#ringGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.65"
            />

            {/* Main Sphere Body */}
            <circle cx="60" cy="60" r="42" fill="url(#sphereGrad)" filter="url(#glow)" />

            {/* Dark Eye Aperture Center */}
            <ellipse cx="60" cy="60" rx="30" ry="19" fill="#080c16" />

            {/* Code Brackets </ > */}
            <path
              d="M 47 53 L 37 60 L 47 67"
              stroke="url(#codeGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 64 49 L 56 71"
              stroke="url(#codeGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d="M 73 53 L 83 60 L 73 67"
              stroke="url(#codeGrad)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Ring Front */}
            <path
              d="M 104 42 C 120 62, 84 94, 34 98 C 12 100, 2 90, 14 74"
              stroke="url(#ringGrad)"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </svg>
          <span className="logo-text">
            <span className="logo-white">Code</span>
            <span className="logo-gradient">Sphere</span>
          </span>
        </div>

        {/* TOP NAVIGATION TABS */}
        <div className="view-switch-tabs">
          <button
            className={`view-tab-btn ${viewMode === "dashboard" ? "active" : ""}`}
            onClick={() => setViewMode("dashboard")}
          >
            📊 Dashboard
          </button>
          <button
            className={`view-tab-btn ${viewMode === "editor" ? "active" : ""}`}
            onClick={() => setViewMode("editor")}
          >
            💻 Editor
          </button>
        </div>
      </div>

      {/* NAVBAR ACTIONS - ONLY SHOWN IN EDITOR VIEW */}
      {viewMode === "editor" && (
        <div className="navbar-actions">
          {/* MY PROJECTS DROPDOWN */}
          <div className="projects-wrapper" ref={projectsRef}>
            <button
              className="projects-button"
              onClick={() => setShowProjects((prev) => !prev)}
            >
              Projects ▾
            </button>

            {showProjects && (
              <div className="projects-dropdown">
                <div className="projects-dropdown-header">
                  <span>My Projects</span>
                  <span className="project-count">{projects.length}</span>
                </div>

                <div className="projects-list">
                  {projects.map((project) => (
                    <div
                      key={project}
                      className={`project-item ${currentProject === project ? "active-project" : ""}`}
                    >
                      <div
                        className="project-select"
                        onClick={() => handleProjectSelect(project)}
                      >
                        <div className="project-info">
                          <span className="project-icon">📁</span>
                          <div className="project-text">
                            <span className="project-title">{project}</span>
                            <span className="project-subtitle">React Workspace</span>
                          </div>
                        </div>
                        {currentProject === project && <span className="project-check">✓</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="project-divider"></div>

                <div className="project-actions">
                  <div className="project-action-item" onClick={() => { setShowProjects(false); onRenameProject(); }}>
                    <span>✏️</span>
                    <span>Rename Project</span>
                  </div>

                  <div className="project-action-item delete-project" onClick={() => { setShowProjects(false); onDeleteProject(); }}>
                    <span>🗑️</span>
                    <span>Delete Project</span>
                  </div>

                  <div className="new-project-item" onClick={() => { setShowProjects(false); onCreateProject(); }}>
                    <span>➕</span>
                    <span>New Project</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DIRECT CLICKABLE THEME TOGGLE BUTTON */}
          <button
            className="theme-button"
            onClick={() => {
              if (theme === "vs-light") setTheme("vs-dark");
              else if (theme === "vs-dark") setTheme("hc-black");
              else setTheme("vs-light");
            }}
            title="Click to toggle theme: Light Mode -> Dark Mode -> High Contrast"
          >
            {theme === "vs-light" ? "☀️ Light Mode" : theme === "vs-dark" ? "🌙 Dark Mode" : "🔲 High Contrast"}
          </button>

          {/* EXPORT PROJECT */}
          <button className="export-button" onClick={onExportProject} title="Export Project Files">
            📥 Export
          </button>

          {/* SAVE BUTTON */}
          <button className="save-button" onClick={saveCode} title="Save Project (Ctrl+S / Cmd+S)">
            💾 Save
          </button>

          {/* RUN BUTTON */}
          <button className="run-button" onClick={runCode} title="Run Project (Ctrl+Enter / Cmd+Enter)">
            ▶ Run
          </button>

          {/* USER AUTH STATUS */}
          {user ? (
            <button
              className="user-badge-button"
              onClick={onSignOut}
              title={`Logged in as ${user.name} (${user.email}). Click to Sign Out`}
            >
              <span>👤 {user.name.split(" ")[0]}</span>
            </button>
          ) : (
            <button
              className="signin-nav-button"
              onClick={() => setViewMode("signin")}
              title="Sign In / Register"
            >
              🔑 Sign In
            </button>
          )}
        </div>
      )}

      {/* SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="modal-backdrop" onClick={() => setShowShortcutsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⌨️ Keyboard Shortcuts</h3>
              <button className="close-modal" onClick={() => setShowShortcutsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="shortcut-row">
                <kbd>Cmd</kbd> + <kbd>S</kbd> / <kbd>Ctrl</kbd> + <kbd>S</kbd>
                <span>Save Code & Files</span>
              </div>
              <div className="shortcut-row">
                <kbd>Cmd</kbd> + <kbd>Enter</kbd> / <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
                <span>Run Code & Refresh Preview</span>
              </div>
              <div className="shortcut-row">
                <kbd>Option</kbd> + <kbd>F</kbd> / <kbd>Alt</kbd> + <kbd>F</kbd>
                <span>Search in Files</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;