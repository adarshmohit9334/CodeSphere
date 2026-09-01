function Sidebar({
  files,
  selectedFile,
  onFileSelect,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  currentProject
}) {
  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
      case "jsx":
      case "js":
        return "⚛️";
      case "css":
        return "🎨";
      case "html":
        return "🌐";
      case "json":
        return "📋";
      default:
        return "📄";
    }
  };

  return (
    <aside className="sidebar">
      {/* EXPLORER HEADER */}
      <div className="sidebar-header">
        <h3>EXPLORER</h3>
        <button className="icon-btn" onClick={onCreateFile} title="New File">
          ➕
        </button>
      </div>

      {/* PROJECT NAME */}
      <div className="project-name">
        <span className="folder-icon">📂</span>
        <span className="project-title-text">{currentProject || "my-project"}</span>
      </div>

      {/* FILE LIST */}
      <div className="file-list">
        {files.map((file) => (
          <div
            key={file.name}
            className={`file ${selectedFile === file.name ? "selected-file" : ""}`}
            onClick={() => onFileSelect(file.name)}
          >
            {/* FILE NAME & ICON */}
            <span className="file-label">
              <span className="file-type-icon">{getFileIcon(file.name)}</span>
              <span className="file-name-text">{file.name}</span>
            </span>

            {/* FILE ACTIONS */}
            <div className="file-actions">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRenameFile(file.name);
                }}
                title={`Rename ${file.name}`}
              >
                ✏️
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteFile(file.name);
                }}
                title={`Delete ${file.name}`}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* NEW FILE BUTTON */}
      <button type="button" className="new-file" onClick={onCreateFile}>
        + New File
      </button>
    </aside>
  );
}

export default Sidebar;