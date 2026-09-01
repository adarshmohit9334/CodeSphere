import { useState } from "react";

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
  onExportProject
}) {
  const [showProjects, setShowProjects] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

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
      {/* BRAND / LOGO */}
      <div className="logo">
        <svg viewBox="0 0 100 100" width="26" height="26" fill="none">
          <path d="M72 90L95 78V22L72 10L35 48L72 90Z" fill="#007ACC" />
          <path d="M72 90L35 48L10 65L72 90Z" fill="#1F9CF0" />
          <path d="M72 10L35 48L10 31L72 10Z" fill="#0065A9" />
        </svg>
        <span>VS Code Web</span>
      </div>

      {/* NAVBAR ACTIONS */}
      <div className="navbar-actions">
        {/* MY PROJECTS DROPDOWN */}
        <div className="projects-wrapper">
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

        {/* CURRENT PROJECT BADGE */}
        <div className="current-project">
          📁 {currentProject}
        </div>

        {/* THEME SELECTOR */}
        <div className="projects-wrapper">
          <button
            className="theme-button"
            onClick={() => setShowThemeMenu((prev) => !prev)}
            title="Switch Theme"
          >
            🎨 Theme ▾
          </button>

          {showThemeMenu && (
            <div className="projects-dropdown theme-dropdown">
              {themesList.map((t) => (
                <div
                  key={t.id}
                  className={`theme-option ${theme === t.id ? "active-theme" : ""}`}
                  onClick={() => {
                    setTheme(t.id);
                    setShowThemeMenu(false);
                  }}
                >
                  <span>{t.name}</span>
                  {theme === t.id && <span>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EXPORT PROJECT */}
        <button className="export-button" onClick={onExportProject} title="Export Project Files">
          📥 Export
        </button>

        {/* KEYBOARD SHORTCUTS INFO */}
        <button className="shortcuts-button" onClick={() => setShowShortcutsModal(true)} title="Keyboard Shortcuts">
          ⌨️ Shortcuts
        </button>

        {/* SAVE BUTTON */}
        <button className="save-button" onClick={saveCode} title="Save Project (Ctrl+S / Cmd+S)">
          💾 Save
        </button>

        {/* RUN BUTTON */}
        <button className="run-button" onClick={runCode} title="Run Project (Ctrl+Enter / Cmd+Enter)">
          ▶ Run
        </button>
      </div>

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