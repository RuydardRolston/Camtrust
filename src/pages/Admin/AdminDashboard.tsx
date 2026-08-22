import React from 'react';
import { Link } from 'react-router-dom';
import './Admin.css';
import DashboardSidebar from '../../components/DashboardSidebar';

export default function AdminDashboard() {
  return (
    <div className="admin-root">
      <DashboardSidebar role="administrator" title="CamTrust Admin" />
      <main className="admin-main">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <p className="muted">Manage users, verify professionals and review projects</p>
        </header>

        <div className="admin-grid">
          <section className="panel admin-card">
            <h3>Admin Overview</h3>
            <div className="admin-stats">
              <div><strong>120</strong><small>Projects</small></div>
              <div><strong>45</strong><small>Professionals</small></div>
              <div><strong>75</strong><small>Verified</small></div>
              <div><strong>36</strong><small>Pending</small></div>
            </div>
          </section>

          <section className="panel">
            <h3>Users Management</h3>
            <Link to="/admin/users" className="btn-link">Open users</Link>
          </section>

          <section className="panel">
            <h3>Professionals Verification</h3>
            <p>Review verification requests and approve qualified professionals.</p>
          </section>

          <section className="panel">
            <h3>Projects Management</h3>
            <Link to="/projects" className="btn-link">View projects</Link>
          </section>
        </div>
      </main>
    </div>
  );
}
