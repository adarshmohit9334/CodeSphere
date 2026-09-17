import { Router } from "express";
import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import pool from "../db.js";

const router = Router();
const WORKSPACE_DIR = path.join(os.homedir(), "CodeSphere_Workspace");

const getSqlDate = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

export async function getProjectByName(name) {
  if (!name) return null;
  const [rows] = await pool.query('SELECT * FROM projects WHERE LOWER(name) = ?', [name.toLowerCase()]);
  if (rows.length > 0) {
    const p = rows[0];
    p.files = typeof p.files === 'string' ? JSON.parse(p.files) : p.files;
    return p;
  }
  return null;
}

function syncProjectToDisk(project) {
  try {
    const projectDir = path.join(WORKSPACE_DIR, project.name);
    const isNew = !fs.existsSync(projectDir);
    if (isNew) {
      fs.mkdirSync(projectDir, { recursive: true });
    }
    
    const files = typeof project.files === 'string' ? JSON.parse(project.files) : project.files;
    
    files.forEach(file => {
      fs.writeFileSync(path.join(projectDir, file.name), file.code || "");
    });
    
    if (isNew) {
      try {
        execSync("git init", { cwd: projectDir, stdio: 'ignore' });
        execSync("git add .", { cwd: projectDir, stdio: 'ignore' });
        execSync('git commit -m "Initial project commit from CodeSphere"', { cwd: projectDir, stdio: 'ignore' });
      } catch (gitErr) {
        console.error("Git initialization failed:", gitErr.message);
      }
    }
  } catch (err) {
    console.error("Failed to sync project to disk:", err);
  }
}

// Ensure default projects exist
async function seedDefaultProjects() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM projects');
    if (rows[0].count === 0) {
      const defaultProject = {
        id: `proj-${Date.now()}`,
        name: "My React Project",
        type: "React Project",
        updatedAt: getSqlDate(),
        files: JSON.stringify([
          {
            name: "App.jsx",
            language: "javascript",
            code: `function App() {\n  return (\n    <div>\n      <h1>Hello React 👋</h1>\n    </div>\n  );\n}\n\nexport default App;`
          }
        ])
      };
      
      await pool.query(
        'INSERT INTO projects (id, name, type, files, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [defaultProject.id, defaultProject.name, defaultProject.type, defaultProject.files, defaultProject.updatedAt]
      );
      
      syncProjectToDisk({ ...defaultProject, files: JSON.parse(defaultProject.files) });
    }
  } catch (err) {
    console.error("Failed to seed default project:", err);
  }
}
seedDefaultProjects();

// GET /api/projects - List all projects
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, type, updatedAt, files FROM projects');
    const summary = rows.map(p => {
      const filesArr = typeof p.files === 'string' ? JSON.parse(p.files) : p.files;
      return {
        id: p.id,
        name: p.name,
        type: p.type,
        updatedAt: p.updatedAt,
        fileCount: filesArr ? filesArr.length : 0
      };
    });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id - Get specific project details
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ? OR LOWER(name) = ?', [req.params.id, req.params.id.toLowerCase()]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    const project = rows[0];
    project.files = typeof project.files === 'string' ? JSON.parse(project.files) : project.files;
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/clone - Clone a Git repo
router.post("/clone", async (req, res) => {
  try {
    const { gitUrl } = req.body;
    if (!gitUrl || typeof gitUrl !== "string") {
      return res.status(400).json({ error: "Git URL is required" });
    }

    // Extract repo name from URL (e.g., https://github.com/user/repo.git -> repo)
    let repoName = gitUrl.split('/').pop().replace(/\.git$/, '');
    if (!repoName) repoName = `repo-${Date.now()}`;

    // Ensure it doesn't already exist in DB
    const [existing] = await pool.query('SELECT id FROM projects WHERE LOWER(name) = ?', [repoName.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "A project with this name already exists" });
    }

    const projectDir = path.join(WORKSPACE_DIR, repoName);
    
    // Remove if exists locally just in case
    if (fs.existsSync(projectDir)) {
      fs.rmSync(projectDir, { recursive: true, force: true });
    }

    // Clone
    execSync(`git clone ${gitUrl} ${repoName}`, { cwd: WORKSPACE_DIR, stdio: 'ignore' });

    // Read cloned files
    function readDirRecursive(dir, baseDir = dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        if (file === '.git' || file === 'node_modules' || file === 'dist' || file === 'build') continue;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(readDirRecursive(filePath, baseDir));
        } else {
          const relPath = path.relative(baseDir, filePath).replace(/\\/g, '/');
          const ext = path.extname(file).toLowerCase();
          const textExts = ['.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css', '.md', '.txt', '.py', '.java', '.cpp', '.c'];
          
          if (textExts.includes(ext) || !ext) {
            try {
               const content = fs.readFileSync(filePath, 'utf-8');
               let lang = 'text';
               if (['.js', '.jsx'].includes(ext)) lang = 'javascript';
               if (['.ts', '.tsx'].includes(ext)) lang = 'typescript';
               if (ext === '.css') lang = 'css';
               if (ext === '.html') lang = 'html';
               if (ext === '.json') lang = 'json';
               if (ext === '.py') lang = 'python';
               if (ext === '.md') lang = 'markdown';
               results.push({ name: relPath, language: lang, code: content });
            } catch (e) {
               console.warn(`Failed to read file ${filePath}`);
            }
          }
        }
      }
      return results;
    }

    const clonedFiles = readDirRecursive(projectDir);

    const newProject = {
      id: `proj-${Date.now()}`,
      name: repoName,
      customPath: null,
      type: "Git Clone",
      updatedAt: getSqlDate(),
      files: JSON.stringify(clonedFiles.length > 0 ? clonedFiles : [{ name: "README.md", language: "markdown", code: "# " + repoName }])
    };

    await pool.query(
      'INSERT INTO projects (id, name, type, files, customPath, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [newProject.id, newProject.name, newProject.type, newProject.files, newProject.customPath, newProject.updatedAt]
    );

    res.status(201).json(newProject);
  } catch (err) {
    console.error("Git Clone error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects - Create new project
router.post("/", async (req, res) => {
  try {
    const { name, files, customPath } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Project name is required" });
    }

    const [existing] = await pool.query('SELECT id FROM projects WHERE LOWER(name) = ?', [name.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "A project with this name already exists" });
    }

    const defaultFiles = [
      { name: "App.jsx", language: "javascript", code: `function App() { return <h1>Hello from ${name.trim()}</h1>; } export default App;` },
      { name: "index.css", language: "css", code: `body { font-family: sans-serif; padding: 20px; }` }
    ];

    const projectFiles = Array.isArray(files) && files.length > 0 ? files : defaultFiles;
    
    const newProject = {
      id: `proj-${Date.now()}`,
      name: name.trim(),
      customPath: customPath || null,
      type: "React Project",
      updatedAt: getSqlDate(),
      files: JSON.stringify(projectFiles)
    };

    await pool.query(
      'INSERT INTO projects (id, name, type, files, customPath, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [newProject.id, newProject.name, newProject.type, newProject.files, newProject.customPath, newProject.updatedAt]
    );

    newProject.files = projectFiles;
    syncProjectToDisk(newProject);
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id - Update existing project (files/name)
router.put("/:id", async (req, res) => {
  try {
    const { name, files, customPath } = req.body;
    const [existing] = await pool.query('SELECT * FROM projects WHERE id = ? OR LOWER(name) = ?', [req.params.id, req.params.id.toLowerCase()]);
    
    if (existing.length === 0) {
      // Restoring project
      const restoredProject = {
        id: `proj-${Date.now()}`,
        name: (name || req.params.id).trim(),
        customPath: customPath || null,
        type: "Restored Project",
        updatedAt: getSqlDate(),
        files: JSON.stringify(Array.isArray(files) ? files : [])
      };
      await pool.query(
        'INSERT INTO projects (id, name, type, files, customPath, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        [restoredProject.id, restoredProject.name, restoredProject.type, restoredProject.files, restoredProject.customPath, restoredProject.updatedAt]
      );
      restoredProject.files = JSON.parse(restoredProject.files);
      syncProjectToDisk(restoredProject);
      return res.json(restoredProject);
    }
    
    const project = existing[0];
    const newName = name ? name.trim() : project.name;
    const newFiles = Array.isArray(files) ? JSON.stringify(files) : project.files;
    const newUpdatedAt = getSqlDate();

    await pool.query(
      'UPDATE projects SET name = ?, files = ?, updatedAt = ? WHERE id = ?',
      [newName, newFiles, newUpdatedAt, project.id]
    );

    const updatedProject = {
      ...project,
      name: newName,
      files: typeof newFiles === 'string' ? JSON.parse(newFiles) : newFiles,
      updatedAt: newUpdatedAt
    };

    syncProjectToDisk(updatedProject);
    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete("/:id", async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM projects WHERE id = ? OR LOWER(name) = ?', [req.params.id, req.params.id.toLowerCase()]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const [all] = await pool.query('SELECT COUNT(*) as count FROM projects');
    if (all[0].count <= 1) {
      return res.status(400).json({ error: "Cannot delete the last remaining project" });
    }

    await pool.query('DELETE FROM projects WHERE id = ?', [existing[0].id]);
    res.json({ message: "Project deleted successfully", project: existing[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
