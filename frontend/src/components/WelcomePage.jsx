import React from 'react';
import './WelcomePage.css';

function WelcomePage({ 
  projects = [], 
  onNewFile, 
  onOpenProject, 
  onCloneGit, 
  onGenerateWorkspace,
  onOpenRecent
}) {
  return (
    <div className="welcome-page-container">
      <div className="welcome-header">
        <h1>CodeSphere</h1>
        <p className="subtitle">Editing evolved</p>
      </div>

      <div className="welcome-content">
        {/* LEFT COLUMN: START & RECENT */}
        <div className="welcome-column">
          <section className="welcome-section">
            <h2>Start</h2>
            <ul className="action-list">
              <li onClick={onNewFile}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M2.75 2.5a.25.25 0 00-.25.25v10.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25v-7.586a.25.25 0 00-.073-.177l-2.914-2.914a.25.25 0 00-.177-.073H2.75zM1 2.75C1 1.784 1.784 1 2.75 1h7.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v7.586A1.75 1.75 0 0113.25 15H2.75A1.75 1.75 0 011 13.25V2.75z"></path></svg>
                <span>New File...</span>
              </li>
              <li onClick={onOpenProject}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M1.75 2.5a.25.25 0 00-.25.25v1.5h13V2.75a.25.25 0 00-.25-.25H1.75zM1.5 5.75v7.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25v-7.5h-13zM0 2.75C0 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0113.25 15H2.75A1.75 1.75 0 010 13.25V2.75z"></path></svg>
                <span>Open...</span>
              </li>
              <li onClick={onCloneGit}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M5.5 3.5a2 2 0 100 4 2 2 0 000-4zM4 5.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm5 4.5a2 2 0 100 4 2 2 0 000-4zM7.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm3-8.5a2 2 0 100 4 2 2 0 000-4zM9 5.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM5.5 8h5a.5.5 0 010 1h-5a.5.5 0 010-1z"></path></svg>
                <span>Clone Git Repository...</span>
              </li>
              <li onClick={onGenerateWorkspace}>
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path fillRule="evenodd" d="M2.5 1.75v11.5c0 .138.112.25.25.25h3.17a.75.75 0 010 1.5H2.75A1.75 1.75 0 011 13.25V1.75C1 .784 1.784 0 2.75 0h8.5C12.216 0 13 .784 13 1.75v3.17a.75.75 0 01-1.5 0V1.75a.25.25 0 00-.25-.25h-8.5a.25.25 0 00-.25.25zM12.5 8a.75.75 0 01.75.75v2.5h2.5a.75.75 0 010 1.5h-2.5v2.5a.75.75 0 01-1.5 0v-2.5h-2.5a.75.75 0 010-1.5h2.5v-2.5A.75.75 0 0112.5 8z"></path></svg>
                <span>Generate New Workspace...</span>
              </li>
            </ul>
          </section>

          <section className="welcome-section recent-section">
            <h2>Recent</h2>
            {projects && projects.length > 0 ? (
              <ul className="recent-list">
                {projects.slice(0, 5).map((proj, idx) => {
                  const projName = typeof proj === 'string' ? proj : proj.name;
                  const projId = typeof proj === 'string' ? idx : proj.id;
                  return (
                    <li key={projId} onClick={() => onOpenRecent(projName)}>
                      <span className="recent-name">{projName}</span>
                      <span className="recent-path">~/CodeSphere_Workspace</span>
                    </li>
                  );
                })}
                {projects.length > 5 && (
                  <li className="recent-more" onClick={onOpenProject}>More...</li>
                )}
              </ul>
            ) : (
              <p className="no-recent">No recent projects.</p>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: WALKTHROUGHS */}
        <div className="welcome-column walkthrough-column">
          <section className="welcome-section">
            <h2>Walkthroughs</h2>
            <div className="walkthrough-list">
              
              <div className="walkthrough-item">
                <div className="walkthrough-icon" style={{color: "#58a6ff"}}>★</div>
                <div className="walkthrough-details">
                  <h3>Get started with CodeSphere</h3>
                  <p>Customize your editor, learn the basics, and start coding</p>
                </div>
              </div>

              <div className="walkthrough-item">
                <div className="walkthrough-icon" style={{color: "#3b82f6"}}>💡</div>
                <div className="walkthrough-details">
                  <h3>Learn the Fundamentals</h3>
                </div>
              </div>

              <div className="walkthrough-item">
                <div className="walkthrough-icon" style={{color: "#f59e0b"}}>🐍</div>
                <div className="walkthrough-details">
                  <h3>Get Started with Python Development <span className="badge">Updated</span></h3>
                </div>
              </div>

              <div className="walkthrough-item">
                <div className="walkthrough-icon" style={{color: "#8b5cf6"}}>C++</div>
                <div className="walkthrough-details">
                  <h3>Get started with C++ development <span className="badge">Updated</span></h3>
                </div>
              </div>

              <div className="walkthrough-item">
                <div className="walkthrough-icon" style={{color: "#ef4444"}}>☕</div>
                <div className="walkthrough-details">
                  <h3>Get Started with Java Development <span className="badge">Updated</span></h3>
                </div>
              </div>

            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
