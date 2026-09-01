function StatusBar({ cursorPosition, selectedFile, language, backendStatus, theme }) {
  return (
    <footer className="status-bar">
      <div className="status-left">
        <span className="status-item build-status">
          ⚡ Ready
        </span>
        <span className="status-item">
          {backendStatus ? "🟢 Backend Connected (Port 5000)" : "🟡 Offline (LocalStorage Mode)"}
        </span>
      </div>

      <div className="status-right">
        <span className="status-item">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </span>
        <span className="status-item">Spaces: 2</span>
        <span className="status-item">UTF-8</span>
        <span className="status-item language-tag">
          {language ? language.toUpperCase() : "PLAINTEXT"}
        </span>
        <span className="status-item theme-tag">
          Theme: {theme}
        </span>
      </div>
    </footer>
  );
}

export default StatusBar;
