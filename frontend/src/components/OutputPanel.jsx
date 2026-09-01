function OutputPanel({ output, clearOutput }) {
  return (
    <section className="output-panel">

      {/* ================================= */}
      {/* OUTPUT HEADER */}
      {/* ================================= */}

      <div className="output-header">

        <div className="output-title">
          <span className="console-icon">⌘</span>

          <span>Console</span>
        </div>


        {/* CLEAR BUTTON */}

        <button
          type="button"
          className="clear-output"
          onClick={clearOutput}
        >
          Clear
        </button>

      </div>


      {/* ================================= */}
      {/* OUTPUT CONTENT */}
      {/* ================================= */}

      <div className="output-content">

        {output ? (

          <pre className="console-output">
            {output}
          </pre>

        ) : (

          <div className="empty-output">

            <span className="empty-output-icon">
              ›
            </span>

            <span>
              Console output will appear here...
            </span>

          </div>

        )}

      </div>

    </section>
  );
}

export default OutputPanel;