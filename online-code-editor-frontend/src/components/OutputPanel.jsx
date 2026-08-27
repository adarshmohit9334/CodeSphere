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
          <p>▶ Run your code to see the output here...</p>
        )}
      </div>
    </section>
  );
}

export default OutputPanel;