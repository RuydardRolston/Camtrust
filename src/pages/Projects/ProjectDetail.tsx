import { useParams, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Projects.css';

export default function ProjectDetail() {
  const { code } = useParams<{ code: string }>();
  const { user } = useAuth();

  const project = {
    name: code === 'MV-2025-014' ? 'Modern Villa Construction' : code === 'DR-2025-009' ? 'Duplex Residence' : 'Office Building Project',
    code: code || 'Unknown',
    progress: code === 'MV-2025-014' ? 72 : code === 'DR-2025-009' ? 45 : 26,
    location: 'East Legon, Accra',
  };

  return (
    <div className="project-detail-page">
      <header className="projects-header">
        <div>
          <h1>{project.name}</h1>
          <p className="muted">Project ID {project.code} • {project.location}</p>
        </div>
        <div>
          <Link to="/projects" className="btn-link">Back to projects</Link>
        </div>
      </header>

      <main className="project-detail-main">
        <section className="panel">
          <h2>Overview</h2>
          <p>Progress: <strong>{project.progress}%</strong></p>
          <p>Owner: <strong>{user?.fullName || 'John Doe'}</strong></p>
        </section>

        <section className="panel">
          <h2>Milestones</h2>
          <ul>
            <li>Land Preparation — Completed</li>
            <li>Foundation — Completed</li>
            <li>Roofing — In progress</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
