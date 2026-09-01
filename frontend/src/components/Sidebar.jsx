import { useState } from "react";

function Sidebar({
  files,
  selectedFile,
  onFileSelect,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onRenameFile,
  currentProject
}) {
  const [isRootExpanded, setIsRootExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState({ src: true, public: true, components: true });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toggle specific subfolder
  const toggleFolder = (folderName) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Button 3: Refresh Explorer handler
  const handleRefreshExplorer = () => {
    setIsRefreshing(true);
    setIsRootExpanded(true);
    // Expand all folders found in tree
    const allFolders = {};
    files.forEach((f) => {
      const parts = f.name.split("/");
      if (parts.length > 1) {
        allFolders[parts[0]] = true;
      }
    });
    setExpandedFolders(allFolders);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Button 4: Collapse All / Hide Tree handler
  const handleCollapseAll = () => {
    if (!isRootExpanded) {
      // If already closed, reopen root
      setIsRootExpanded(true);
    } else {
      // Collapse all subfolders and root tree
      setExpandedFolders({});
      setIsRootExpanded(false);
    }
  };

  const getFileBadge = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
      case "html":
        return <span className="icon-badge html-badge">&lt;&gt;</span>;
      case "js":
      case "jsx":
        return <span className="icon-badge js-badge">JS</span>;
      case "css":
        return <span className="icon-badge css-badge">#</span>;
      case "json":
        return <span className="icon-badge json-badge">{}</span>;
      case "md":
        return <span className="icon-badge md-badge">M↓</span>;
      default:
        return <span className="icon-badge default-badge">📄</span>;
    }
  };

  // Organize files into root and virtual folders if names contain slashes
  const treeNodes = files.reduce((acc, file) => {
    const parts = file.name.split("/");
    if (parts.length > 1) {
      const folder = parts[0];
      if (!acc[folder]) acc[folder] = [];
      acc[folder].push({ ...file, displayName: parts.slice(1).join("/") });
    } else {
      if (!acc["root"]) acc["root"] = [];
      acc["root"].push({ ...file, displayName: file.name });
    }
    return acc;
  }, {});

  return (
    <aside className="sidebar vscode-explorer">
      {/* VS CODE HEADER BAR */}
      <div className="explorer-header-bar">
        <div
          className="explorer-title-toggle"
          onClick={() => setIsRootExpanded(!isRootExpanded)}
          title="Toggle Project Explorer"
        >
          <span className="chevron">{isRootExpanded ? "∨" : "›"}</span>
          <span className="explorer-title-text">
            {(currentProject || "FULL STACK").toUpperCase()}
          </span>
        </div>

        {/* HEADER TOOLBAR BUTTONS */}
        <div className="explorer-toolbar-actions">
          {/* BUTTON 1: CREATE FILE */}
          <button
            className="toolbar-btn"
            onClick={onCreateFile}
            title="New File... (Create file)"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M9 1H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V6L9 1zm0 1.5L12.5 6H9V2.5zM13 14H3V2h5v5h5v7z" />
              <path d="M8 8h1v2h2v1H9v2H8v-2H6v-1h2V8z" />
            </svg>
          </button>

          {/* BUTTON 2: CREATE FOLDER */}
          <button
            className="toolbar-btn"
            onClick={onCreateFolder || onCreateFile}
            title="New Folder... (Create folder)"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M7.25 4l-1-1H2.5A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H8.25l-1-1.5zM8 9h2v1H8v2H7v-2H5V9h2V7h1v2z" />
            </svg>
          </button>

          {/* BUTTON 3: REFRESH EXPLORER */}
          <button
            className={`toolbar-btn ${isRefreshing ? "refreshing-spin" : ""}`}
            onClick={handleRefreshExplorer}
            title="Refresh Explorer View"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M13.6 2.4A7 7 0 1 0 15 8h-1.5a5.5 5.5 0 1 1-1.1-3.4H10V6h5V1h-1.4v1.4z" />
            </svg>
          </button>

          {/* BUTTON 4: COLLAPSE ALL / HIDE TREE */}
          <button
            className="toolbar-btn"
            onClick={handleCollapseAll}
            title={isRootExpanded ? "Collapse All / Hide Folders" : "Expand All Folders"}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M9 4H1v1h8V4zM9 8H1v1h8V8zM9 12H1v1h8v-1zM11 6h4v1h-4V6z" />
            </svg>
          </button>
        </div>
      </div>

      {/* EXPLORER TREE CONTENT */}
      {isRootExpanded && (
        <div className="explorer-tree">
          {/* RENDER FOLDERS FIRST */}
          {Object.keys(treeNodes).map((folderKey) => {
            if (folderKey === "root") return null;
            const isExpanded = expandedFolders[folderKey];

            return (
              <div key={folderKey} className="tree-folder-group">
                <div
                  className="tree-folder-header"
                  onClick={() => toggleFolder(folderKey)}
                >
                  <span className="chevron">{isExpanded ? "∨" : "›"}</span>
                  <span className="folder-icon">📁</span>
                  <span className="folder-name">{folderKey}</span>
                </div>

                {isExpanded && (
                  <div className="tree-folder-children">
                    {treeNodes[folderKey].map((file) => (
                      <div
                        key={file.name}
                        className={`tree-file-row ${selectedFile === file.name ? "active-row" : ""}`}
                        onClick={() => onFileSelect(file.name)}
                      >
                        <span className="file-badge-wrapper">
                          {getFileBadge(file.name)}
                        </span>
                        <span className="file-title-text">{file.displayName}</span>

                        <div className="row-actions">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              onRenameFile(file.name);
                            }}
                            title="Rename File"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              onDeleteFile(file.name);
                            }}
                            title="Delete File"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* RENDER ROOT FILES */}
          {treeNodes["root"]?.map((file) => (
            <div
              key={file.name}
              className={`tree-file-row ${selectedFile === file.name ? "active-row" : ""}`}
              onClick={() => onFileSelect(file.name)}
            >
              <span className="file-badge-wrapper">
                {getFileBadge(file.name)}
              </span>
              <span className="file-title-text">{file.name}</span>

              <div className="row-actions">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameFile(file.name);
                  }}
                  title="Rename File"
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.name);
                  }}
                  title="Delete File"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QUICK NEW FILE BUTTON */}
      <div className="explorer-footer">
        <button type="button" className="add-file-btn" onClick={onCreateFile}>
          + New File
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;