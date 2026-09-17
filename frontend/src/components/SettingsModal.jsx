import React from "react";
import "./SettingsModal.css";

function SettingsModal({ isOpen, onClose, user, onLogout, onToggleTheme, theme }) {
  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className={`settings-modal-container ${theme}`} onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>Settings</h2>
          <button className="settings-close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="settings-modal-content">
          <div className="settings-section">
            <h3>Profile</h3>
            <div className="profile-info">
              <div className="profile-avatar">
                {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="profile-details">
                <span className="profile-name">{user?.user_metadata?.full_name || "User"}</span>
                <span className="profile-email">{user?.email || "user@example.com"}</span>
              </div>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Preferences</h3>
            <div className="setting-item">
              <span>Theme</span>
              <button className="theme-toggle-btn" onClick={onToggleTheme}>
                {theme === "vs-dark" ? "Switch to Light Mode" : theme === "vs-light" ? "Switch to High Contrast" : "Switch to Dark Mode"}
              </button>
            </div>
          </div>
        </div>

        <div className="settings-modal-footer">
          <button className="settings-logout-btn" onClick={onLogout}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm10.44 4.5-1.97-1.97a.749.749 0 0 1 1.06-1.06l3.25 3.25a.749.749 0 0 1 0 1.06l-3.25 3.25a.749.749 0 1 1-1.06-1.06l1.97-1.97H5.75a.75.75 0 0 1 0-1.5Z"></path>
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
