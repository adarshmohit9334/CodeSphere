import { useState } from "react";

function Navbar({
  runCode,
  saveCode,
  currentProject,
  projects,
  onProjectSelect,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}) {
  const [showProjects, setShowProjects] =
    useState(false);

  const handleProjectSelect = (project) => {
    onProjectSelect(project);
    setShowProjects(false);
  };

  const handleCreateProject = () => {
    setShowProjects(false);
    onCreateProject();
  };

  const handleRenameProject = () => {
    setShowProjects(false);
    onRenameProject();
  };

  const handleDeleteProject = () => {
    setShowProjects(false);
    onDeleteProject();
  };

  return (
    <header className="navbar">

      {/* LOGO */}

      <div className="logo">
        💻 <span>CodeEditor</span>
      </div>


      {/* NAVBAR ACTIONS */}

      <div className="navbar-actions">

        {/* MY PROJECTS */}

        <div className="projects-wrapper">

          <button
            className="projects-button"
            onClick={() =>
              setShowProjects(
                (previous) => !previous
              )
            }
          >
            My Projects ▾
          </button>


          {/* PROJECT DROPDOWN */}

          {showProjects && (
            <div className="projects-dropdown">

              {/* HEADER */}

              <div className="projects-dropdown-header">
                <span>My Projects</span>

                <span className="project-count">
                  {projects.length}
                </span>
              </div>


              {/* PROJECT LIST */}

              <div className="projects-list">

                {projects.map((project) => (
                  <div
                    key={project}
                    className={`project-item ${
                      currentProject === project
                        ? "active-project"
                        : ""
                    }`}
                  >

                    <div
                      className="project-select"
                      onClick={() =>
                        handleProjectSelect(
                          project
                        )
                      }
                    >

                      <div className="project-info">

                        <span className="project-icon">
                          📁
                        </span>

                        <div className="project-text">

                          <span className="project-title">
                            {project}
                          </span>

                          <span className="project-subtitle">
                            React Project
                          </span>

                        </div>

                      </div>


                      {currentProject ===
                        project && (
                        <span className="project-check">
                          ✓
                        </span>
                      )}

                    </div>

                  </div>
                ))}

              </div>


              {/* DIVIDER */}

              <div className="project-divider"></div>


              {/* PROJECT ACTIONS */}

              <div className="project-actions">

                <div
                  className="project-action-item"
                  onClick={
                    handleRenameProject
                  }
                >
                  <span>✏️</span>
                  <span>Rename Project</span>
                </div>


                <div
                  className="project-action-item delete-project"
                  onClick={
                    handleDeleteProject
                  }
                >
                  <span>🗑️</span>
                  <span>Delete Project</span>
                </div>


                <div
                  className="new-project-item"
                  onClick={
                    handleCreateProject
                  }
                >
                  <span>➕</span>
                  <span>New Project</span>
                </div>

              </div>

            </div>
          )}

        </div>


        {/* CURRENT PROJECT */}

        <div className="current-project">
          📁 {currentProject}
        </div>


        {/* SAVE */}

        <button
          className="save-button"
          onClick={saveCode}
        >
          💾 Save
        </button>


        {/* RUN */}

        <button
          className="run-button"
          onClick={runCode}
        >
          ▶ Run
        </button>


        {/* USER */}

        <button className="user-button">
          👤
        </button>

      </div>

    </header>
  );
}

export default Navbar;