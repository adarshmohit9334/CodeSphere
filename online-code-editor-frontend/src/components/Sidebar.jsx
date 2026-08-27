function Sidebar({
  files,
  selectedFile,
  onFileSelect,
  onCreateFile,
  onDeleteFile,
}) {
  return (
    <aside className="sidebar">

      <h3>EXPLORER</h3>

      <div className="project-name">
        📁 my-project
      </div>

      {/* File List */}

      {files.map((file) => (
        <div
          key={file.name}
          className={`file ${
            selectedFile === file.name
              ? "active-file"
              : ""
          }`}
        >

          {/* File Name */}

          <span
            className="file-name"
            onClick={() =>
              onFileSelect(file.name)
            }
          >
            📄 {file.name}
          </span>

          {/* Delete Button */}

          <button
            className="delete-file"
            onClick={() =>
              onDeleteFile(file.name)
            }
            title={`Delete ${file.name}`}
          >
            🗑
          </button>

        </div>
      ))}

      {/* New File */}

      <button
        className="new-file"
        onClick={onCreateFile}
      >
        + New File
      </button>

    </aside>
  );
}

export default Sidebar;