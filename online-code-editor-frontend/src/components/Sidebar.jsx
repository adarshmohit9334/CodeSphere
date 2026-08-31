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

      {/* ================================= */}
      {/* EXPLORER */}
      {/* ================================= */}

      <h3>EXPLORER</h3>


      {/* ================================= */}
      {/* PROJECT NAME */}
      {/* ================================= */}

      <div className="project-name">
        📁 my-project
      </div>


      {/* ================================= */}
      {/* FILE LIST */}
      {/* ================================= */}

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

            {/* FILE NAME */}

            <span>
              📄 {file.name}
            </span>


            {/* ================================= */}
            {/* FILE ACTIONS */}
            {/* ================================= */}

            <div className="file-actions">

              {/* RENAME */}

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


              {/* DELETE */}

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


      {/* ================================= */}
      {/* NEW FILE */}
      {/* ================================= */}

      <button
        type="button"
        className="new-file"
        onClick={onCreateFile}
      >
        + New File
      </button>

    </aside>
  );
}

export default Sidebar;