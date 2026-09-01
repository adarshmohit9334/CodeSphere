import { Router } from "express";

const router = Router();

// In-memory initial store (seeded with defaults)
let projectsStore = [
  {
    id: "proj-1",
    name: "My React Project",
    type: "React Project",
    updatedAt: new Date().toISOString(),
    files: [
      {
        name: "App.jsx",
        language: "javascript",
        code: `function App() {\n  console.log("Hello from Console");\n\n  return (\n    <div>\n      <h1>Hello React 👋</h1>\n    </div>\n  );\n}\n\nexport default App;`
      },
      {
        name: "main.jsx",
        language: "javascript",
        code: `import React from "react";\nimport ReactDOM from "react-dom/client";\n\nReactDOM.createRoot(\n  document.getElementById("root")\n).render(<App />);`
      },
      {
        name: "index.css",
        language: "css",
        code: `body {\n  margin: 0;\n  padding: 20px;\n  font-family: Arial, sans-serif;\n}\n\nh1 {\n  color: #61dafb;\n}`
      }
    ]
  },
  {
    id: "proj-2",
    name: "Untitled Project",
    type: "React Project",
    updatedAt: new Date().toISOString(),
    files: [
      {
        name: "App.jsx",
        language: "javascript",
        code: `function App() {\n  return (\n    <div>\n      <h1>Welcome to New Project 🚀</h1>\n    </div>\n  );\n}\n\nexport default App;`
      }
    ]
  }
];

// GET /api/projects - List all projects
router.get("/", (req, res) => {
  const summary = projectsStore.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    updatedAt: p.updatedAt,
    fileCount: p.files.length
  }));
  res.json(summary);
});

// GET /api/projects/:id - Get specific project details
router.get("/:id", (req, res) => {
  const project = projectsStore.find(p => p.id === req.params.id || p.name.toLowerCase() === req.params.id.toLowerCase());
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }
  res.json(project);
});

// POST /api/projects - Create new project
router.post("/", (req, res) => {
  const { name, files } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Project name is required" });
  }

  const existing = projectsStore.find(p => p.name.toLowerCase() === name.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "A project with this name already exists" });
  }

  const defaultFiles = [
    {
      name: "App.jsx",
      language: "javascript",
      code: `function App() {\n  return (\n    <div>\n      <h1>Hello from ${name.trim()} 👋</h1>\n    </div>\n  );\n}\n\nexport default App;`
    },
    {
      name: "index.css",
      language: "css",
      code: `body { font-family: sans-serif; padding: 20px; }`
    }
  ];

  const newProject = {
    id: `proj-${Date.now()}`,
    name: name.trim(),
    type: "React Project",
    updatedAt: new Date().toISOString(),
    files: Array.isArray(files) && files.length > 0 ? files : defaultFiles
  };

  projectsStore.push(newProject);
  res.status(201).json(newProject);
});

// PUT /api/projects/:id - Update existing project (files/name)
router.put("/:id", (req, res) => {
  const projectIndex = projectsStore.findIndex(p => p.id === req.params.id || p.name.toLowerCase() === req.params.id.toLowerCase());
  if (projectIndex === -1) {
    return res.status(404).json({ error: "Project not found" });
  }

  const { name, files } = req.body;
  if (name && typeof name === "string") {
    projectsStore[projectIndex].name = name.trim();
  }
  if (Array.isArray(files)) {
    projectsStore[projectIndex].files = files;
  }
  projectsStore[projectIndex].updatedAt = new Date().toISOString();

  res.json(projectsStore[projectIndex]);
});

// DELETE /api/projects/:id - Delete project
router.delete("/:id", (req, res) => {
  const projectIndex = projectsStore.findIndex(p => p.id === req.params.id || p.name.toLowerCase() === req.params.id.toLowerCase());
  if (projectIndex === -1) {
    return res.status(404).json({ error: "Project not found" });
  }

  if (projectsStore.length <= 1) {
    return res.status(400).json({ error: "Cannot delete the last remaining project" });
  }

  const deleted = projectsStore.splice(projectIndex, 1)[0];
  res.json({ message: "Project deleted successfully", project: deleted });
});

export default router;
