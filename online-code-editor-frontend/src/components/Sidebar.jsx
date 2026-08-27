function Sidebar({
  files,
  selectedFile,
  onFileSelect,
  onCreateFile,
}) {
  return (
    <aside className="sidebar">
      <h3>EXPLORER</h3>

      <div className="project-name">
        📁 my-project
      </div>

      {files.map((file) => (
        <div
          key={file.name}
          className={`file ${
            selectedFile === file.name ? "active-file" : ""
          }`}
          onClick={() => onFileSelect(file.name)}
        >
          📄 {file.name}
        </div>
      ))}

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