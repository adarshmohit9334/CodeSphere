function ActivityBar({ activeTab, setActiveTab, backendStatus, onToggleTheme }) {
  return (
    <aside className="activity-bar">
      <div className="activity-top">
        {/* EXPLORER ICON */}
        <button
          className={`activity-icon ${activeTab === "explorer" ? "active" : ""}`}
          onClick={() => setActiveTab("explorer")}
          title="Explorer (Files)"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </button>

        {/* SEARCH ICON */}
        <button
          className={`activity-icon ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
          title="Search in Files"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        </button>

        {/* RUN & DEBUG ICON */}
        <button
          className={`activity-icon ${activeTab === "debug" ? "active" : ""}`}
          onClick={() => setActiveTab("debug")}
          title="Run & Debug"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>
      </div>

      <div className="activity-bottom">
        {/* BACKEND STATUS BADGE */}
        <div
          className={`backend-indicator ${backendStatus ? "online" : "offline"}`}
          title={backendStatus ? "Backend Server: Connected (Port 5000)" : "Backend Server: Offline (Using LocalStorage)"}
        >
          <span className="dot"></span>
        </div>

        {/* SETTINGS / THEME ICON */}
        <button
          className="activity-icon"
          onClick={onToggleTheme}
          title="Change Editor Theme"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

export default ActivityBar;
