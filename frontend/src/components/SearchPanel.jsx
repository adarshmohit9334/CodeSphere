import { useState } from "react";

function SearchPanel({ files, onFileSelect }) {
  const [searchTerm, setSearchTerm] = useState("");

  const results = [];

  if (searchTerm.trim() !== "") {
    const termLower = searchTerm.toLowerCase();
    files.forEach((file) => {
      const lines = file.code.split("\n");
      lines.forEach((lineText, idx) => {
        if (lineText.toLowerCase().includes(termLower)) {
          results.push({
            fileName: file.name,
            lineNumber: idx + 1,
            lineText: lineText.trim()
          });
        }
      });
    });
  }

  return (
    <aside className="search-panel">
      <h3>SEARCH</h3>

      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Search across files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm("")}>
            ×
          </button>
        )}
      </div>

      <div className="search-results-info">
        {searchTerm ? (
          <span>{results.length} result{results.length !== 1 ? "s" : ""} found</span>
        ) : (
          <span className="search-hint">Type to search code across all project files</span>
        )}
      </div>

      <div className="search-results-list">
        {results.map((res, i) => (
          <div
            key={`${res.fileName}-${res.lineNumber}-${i}`}
            className="search-result-item"
            onClick={() => onFileSelect(res.fileName)}
          >
            <div className="result-file-header">
              📄 <span className="file-title">{res.fileName}</span>
              <span className="line-badge">Line {res.lineNumber}</span>
            </div>
            <div className="result-snippet">{res.lineText}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default SearchPanel;
