import React from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import './Owner.css';
import { useNavigate } from 'react-router-dom';

export default function OwnerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="owner-root">
      <DashboardSidebar role="property_owner" title="CamTrust" />
      <main className="owner-main">
        <header className="owner-header">
          <h1>Welcome back, John</h1>
          <div className="owner-actions"><button onClick={() => navigate('/projects')}>Projects</button></div>
        </header>

        <section className="owner-panels">
          <div className="panel overview">
            <h2>Overview</h2>
            <div className="overview-grid">
              <div className="stat small"><strong>3</strong><small>Active Projects</small></div>
              <div className="stat small"><strong>7</strong><small>Open Items</small></div>
              <div className="stat small"><strong>$162,500</strong><small>Budget used</small></div>
              <div className="stat small"><strong>184</strong><small>Days remaining</small></div>
            </div>
          </div>

          <div className="panel projects-list">
            <h3>My Projects</h3>
            <ul>
              <li>Modern Villa Construction — 72%</li>
              <li>Duplex Residence — 45%</li>
            </ul>
          </div>

          <div className="panel reports">
            <h3>Progress Reports</h3>
            <p>Latest weekly summary and photos attached.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
