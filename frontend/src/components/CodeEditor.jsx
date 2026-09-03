import { useRef } from "react";
import Editor from "@monaco-editor/react";

function CodeEditor({
  code,
  setCode,
  selectedFile,
  files,
  openFiles,
  onFileSelect,
  onCloseFile,
  dirtyFiles,
  onCursorChange,
  theme,
  saveCode,
  runCode,
  fontSize = 14,
  tabSize = 2
}) {
  const editorRef = useRef(null);

  const selectedFileData = files.find((file) => file.name === selectedFile);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange({
          line: e.position.lineNumber,
          column: e.position.column
        });
      }
    });

    // Keyboard Shortcuts: Save (Cmd+S / Ctrl+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (saveCode) saveCode();
    });

    // Keyboard Shortcuts: Run (Cmd+Enter / Ctrl+Enter)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (runCode) runCode();
    });
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

  return (
    <main className="code-editor">
      {/* FILE TABS */}
      <div className="editor-tabs">
        {openFiles.map((fileName) => {
          const file = files.find((item) => item.name === fileName);
          if (!file) return null;

          return (
            <div
              key={fileName}
              className={`editor-tab ${selectedFile === fileName ? "active-tab" : ""}`}
              onClick={() => onFileSelect(fileName)}
            >
              <span className="tab-name">
                <span className="file-badge-wrapper">{getFileBadge(fileName)}</span> {fileName}
                {dirtyFiles.includes(fileName) && (
                  <span className="dirty-dot" title="Unsaved changes">●</span>
                )}
              </span>

              <button
                className="close-tab"
                onClick={(event) => {
                  event.stopPropagation();
                  onCloseFile(fileName);
                }}
                title={`Close ${fileName}`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* MONACO EDITOR */}
      {selectedFile ? (
        <Editor
          height="calc(100% - 42px)"
          language={selectedFileData?.language || "javascript"}
          theme={theme || "vs-dark"}
          value={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          options={{
            fontSize: Number(fontSize || 14),
            fontFamily: "Fira Code, Consolas, Monaco, 'Courier New', monospace",
            minimap: { enabled: true },
            automaticLayout: true,
            padding: { top: 12 },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: Number(tabSize || 2),
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on"
          }}
        />
      ) : (
        <div className="no-file-open">
          <div className="no-file-content">
            <svg viewBox="0 0 100 100" width="64" height="64" fill="none">
              <path d="M72 90L95 78V22L72 10L35 48L72 90Z" fill="#007ACC" opacity="0.5" />
            </svg>
            <h2>No File Open</h2>
            <p>Select a file from the explorer or create a new file to start coding.</p>
          </div>
        </div>
      )}
    </main>
  );
}

export default CodeEditor;