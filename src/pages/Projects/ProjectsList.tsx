import React from 'react';
import { Link } from 'react-router-dom';
import './Projects.css';

const projectOptions = [
  { name: 'Modern Villa Construction', code: 'MV-2025-014', progress: 72 },
  { name: 'Duplex Residence', code: 'DR-2025-009', progress: 45 },
  { name: 'Office Building Project', code: 'OB-2025-006', progress: 26 },
];

export default function ProjectsList() {
  return (
    <div className="projects-page">
      <header className="projects-header">
        <h1>Projects</h1>
        <p className="muted">Browse all projects in your workspace</p>
      </header>

      <main className="projects-grid">
        {projectOptions.map((p) => (
          <article key={p.code} className="project-card">
            <div className="project-card-main">
              <div>
                <strong>{p.name}</strong>
                <small className="muted">{p.code}</small>
              </div>
              <div className="project-progress">{p.progress}%</div>
            </div>
            <div className="project-actions">
              <Link to={`/projects/${p.code}`} className="btn-link">View</Link>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
