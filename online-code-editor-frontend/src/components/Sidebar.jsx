function Sidebar({
  files,
  selectedFile,
  onFileSelect,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
}) {
  return (
    <aside className="sidebar">

      <h3>EXPLORER</h3>

      <div className="project-name">
        📁 my-project
      </div>

      {/* FILE LIST */}

      <div className="file-list">

        {files.map((file) => (
          <div
            key={file.name}
            className={`file ${
              selectedFile === file.name
                ? "selected-file"
                : ""
            }`}
            onClick={() =>
              onFileSelect(file.name)
            }
          >

            <span>
              📄 {file.name}
            </span>

            {/* FILE ACTIONS */}

            <div className="file-actions">

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onRenameFile(file.name);
                }}
                title="Rename"
              >
                ✏️
              </button>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onDeleteFile(file.name);
                }}
                title="Delete"
              >
                🗑️
              </button>

            </div>

          </div>
        ))}

      </div>


      {/* NEW FILE */}

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