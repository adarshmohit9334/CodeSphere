function OutputPanel({ output, clearOutput }) {
  return (
    <section className="output-panel">

      <div className="output-header">
        <span>Output</span>

        <button onClick={clearOutput}>
          Clear
        </button>
      </div>

      <div className="output-content">
        {output ? (
          <pre>{output}</pre>
        ) : (
          <div className="empty-output">
            Run your code to see the output here.
          </div>
        )}
      </div>

    </section>
  );
}

export default OutputPanel;