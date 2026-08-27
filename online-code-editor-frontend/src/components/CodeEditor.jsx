import Editor from "@monaco-editor/react";

function CodeEditor({ code, setCode }) {
  return (
    <main className="code-editor">
      <div className="editor-header">
        <span>📄 App.jsx</span>
      </div>

      <Editor
        height="calc(100vh - 102px)"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          fontSize: 15,
          minimap: {
            enabled: false,
          },
          automaticLayout: true,
          padding: {
            top: 15,
          },
        }}
      />
    </main>
  );
}

export default CodeEditor;