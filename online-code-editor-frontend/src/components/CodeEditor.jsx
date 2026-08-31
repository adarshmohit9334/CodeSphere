import Editor from "@monaco-editor/react";

function CodeEditor({
  code,
  setCode,
  selectedFile,
  files,
  openFiles,
  onFileSelect,
  onCloseFile,
}) {
  const selectedFileData = files.find(
    (file) => file.name === selectedFile
  );

  return (
    <main className="code-editor">

      {/* ================================= */}
      {/* FILE TABS */}
      {/* ================================= */}

      <div className="editor-tabs">

        {openFiles.map((fileName) => {

          const file = files.find(
            (item) => item.name === fileName
          );

          if (!file) {
            return null;
          }

          return (
            <div
              key={fileName}
              className={`editor-tab ${
                selectedFile === fileName
                  ? "active-tab"
                  : ""
              }`}
              onClick={() =>
                onFileSelect(fileName)
              }
            >

              <span className="tab-name">
                📄 {fileName}
              </span>

              <button
                type="button"
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


      {/* ================================= */}
      {/* MONACO EDITOR */}
      {/* ================================= */}

      <Editor
        height="100%"
        language={
          selectedFileData?.language ||
          "javascript"
        }
        theme="vs-dark"
        value={code}
        onChange={(value) =>
          setCode(value || "")
        }
        options={{
          fontSize: 15,

          minimap: {
            enabled: false,
          },

          automaticLayout: true,

          padding: {
            top: 15,
          },

          scrollBeyondLastLine: false,

          wordWrap: "on",

          tabSize: 2,
        }}
      />

    </main>
  );
}

export default CodeEditor;