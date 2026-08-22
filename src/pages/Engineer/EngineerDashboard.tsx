import React from 'react';
import './Engineer.css';
import DashboardSidebar from '../../components/DashboardSidebar';

export default function EngineerDashboard() {
  return (
    <div className="engineer-root">
      <DashboardSidebar role="professional" title="CamTrust" />
      <main className="engineer-main">
        <header className="engineer-header">
          <h1>Engineer Dashboard</h1>
          <p className="muted">Field updates, progress tracking and assigned tasks</p>
        </header>

        <div className="engineer-grid">
          <section className="panel">
            <h3>Assigned Projects</h3>
            <ul>
              <li>Modern Villa Construction — Progress 72%</li>
              <li>Duplex Residence — Progress 45%</li>
            </ul>
          </section>

          <section className="panel">
            <h3>Update Progress</h3>
            <p>Submit progress reports and upload site photos from the field.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
