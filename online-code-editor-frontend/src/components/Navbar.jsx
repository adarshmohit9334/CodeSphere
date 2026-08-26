function Navbar() {
  return (
    <header className="navbar">
      <div className="logo">
        💻 <span>CodeEditor</span>
      </div>

      <div className="navbar-actions">
        <button>My Projects</button>
        <button>💾 Save</button>
        <button className="run-button">▶ Run</button>
        <button>👤</button>
      </div>
    </header>
  );
}

export default Navbar;