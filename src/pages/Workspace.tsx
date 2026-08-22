/**
 * CamTrust - Workspace
 * Role-based dashboard: Admin, Engineer, Property Owner
 */

import React from 'react';
import './Workspace.css';
import './WorkspaceOwner.css';
import './WorkspaceSidebar.css';

import DashboardSidebar from '../components/DashboardSidebar';
import useAuth from '../hooks/useAuth';

import {
  FaChartLine,
  FaHardHat,
  FaSeedling,
  FaMapMarkerAlt,
  FaPlus,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaArrowRight,
  FaBuilding,
  FaLeaf,
} from 'react-icons/fa';

const Workspace: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="workspace-loading">
        <div className="loading-spinner" />
        <p>Loading your workspace...</p>
      </div>
    );
  }

  const role = user?.role || 'professional';

  // Safely determine the user's display name
  const displayName =
    (user as any)?.name ||
    (user as any)?.firstName ||
    (user as any)?.username ||
    (user as any)?.email?.split('@')[0] ||
    'User';

  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="workspace-shell">

      {role === 'property_owner' ? (
        <DashboardSidebar
          role="property_owner"
          title="CamTrust"
        />
      ) : (
        <aside className="workspace-sidebar">
          <div className="sidebar-brand">
            <FaChartLine />
            <span>CamTrust</span>
          </div>

          <nav className="sidebar-nav">
            <a href="#overview" className="sidebar-link active">
              <FaChartLine />
              <span>Overview</span>
            </a>

            <a href="#projects" className="sidebar-link">
              <FaClipboardList />
              <span>Projects</span>
            </a>

            <a href="#tasks" className="sidebar-link">
              <FaCheckCircle />
              <span>Tasks</span>
            </a>

            <a href="#reports" className="sidebar-link">
              <FaClock />
              <span>Reports</span>
            </a>
          </nav>
        </aside>
      )}

      <main
        className={`workspace-main ${
          role === 'property_owner' ? 'with-sidebar' : ''
        }`}
      >

        {/* Header */}
        <header className="workspace-header">
          <div>
            <h1>Welcome to your Workspace</h1>
            <p>
              Manage your projects and monitor your activities from one place.
            </p>
          </div>

          <div className="workspace-user">
            <div className="workspace-user-avatar">
              {displayInitial}
            </div>

            <div className="workspace-user-info">
              <strong>{displayName}</strong>
              <span>{role.replace('_', ' ')}</span>
            </div>
          </div>
        </header>

        {/* Statistics */}
        <section className="workspace-stats" id="overview">

          <div className="stat-card">
            <div className="stat-icon">
              <FaClipboardList />
            </div>

            <div className="stat-content">
              <span className="stat-label">Total Projects</span>
              <strong className="stat-value">12</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>

            <div className="stat-content">
              <span className="stat-label">Completed</span>
              <strong className="stat-value">7</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaClock />
            </div>

            <div className="stat-content">
              <span className="stat-label">In Progress</span>
              <strong className="stat-value">4</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <FaExclamationTriangle />
            </div>

            <div className="stat-content">
              <span className="stat-label">Needs Attention</span>
              <strong className="stat-value">1</strong>
            </div>
          </div>

        </section>

        {/* Property Owner Dashboard */}
        {role === 'property_owner' ? (

          <section className="owner-dashboard">

            <div className="owner-dashboard-header">
              <div>
                <h2>Property Owner Dashboard</h2>
                <p>
                  Monitor your construction and agricultural projects.
                </p>
              </div>

              <button className="primary-action">
                <FaPlus />
                <span>New Project</span>
              </button>
            </div>

            <div className="owner-project-grid">

              <div className="owner-project-card">
                <div className="owner-project-icon">
                  <FaBuilding />
                </div>

                <div className="owner-project-content">
                  <h3>Construction Projects</h3>
                  <p>
                    Track the progress of your construction projects.
                  </p>

                  <div className="owner-project-meta">
                    <span>
                      <FaHardHat />
                      4 projects
                    </span>

                    <span>
                      <FaArrowRight />
                    </span>
                  </div>
                </div>
              </div>

              <div className="owner-project-card">
                <div className="owner-project-icon">
                  <FaLeaf />
                </div>

                <div className="owner-project-content">
                  <h3>Agricultural Projects</h3>
                  <p>
                    Monitor your agricultural activities and progress.
                  </p>

                  <div className="owner-project-meta">
                    <span>
                      <FaSeedling />
                      3 projects
                    </span>

                    <span>
                      <FaArrowRight />
                    </span>
                  </div>
                </div>
              </div>

              <div className="owner-project-card">
                <div className="owner-project-icon">
                  <FaMapMarkerAlt />
                </div>

                <div className="owner-project-content">
                  <h3>Land & Locations</h3>
                  <p>
                    View and manage the land associated with your projects.
                  </p>

                  <div className="owner-project-meta">
                    <span>
                      <FaMapMarkerAlt />
                      5 locations
                    </span>

                    <span>
                      <FaArrowRight />
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <div className="owner-dashboard-section">
              <div className="section-heading">
                <div>
                  <h2>Recent Activity</h2>
                  <p>
                    Keep track of the latest updates on your projects.
                  </p>
                </div>

                <button className="view-all-button">
                  View all
                  <FaArrowRight />
                </button>
              </div>

              <div className="activity-list">

                <div className="activity-item">
                  <div className="activity-icon success">
                    <FaCheckCircle />
                  </div>

                  <div className="activity-content">
                    <strong>Project milestone completed</strong>
                    <span>
                      Construction project reached a new milestone.
                    </span>
                  </div>

                  <time>Today</time>
                </div>

                <div className="activity-item">
                  <div className="activity-icon">
                    <FaClock />
                  </div>

                  <div className="activity-content">
                    <strong>New project update</strong>
                    <span>
                      A professional submitted a new progress update.
                    </span>
                  </div>

                  <time>Yesterday</time>
                </div>

                <div className="activity-item">
                  <div className="activity-icon warning">
                    <FaExclamationTriangle />
                  </div>

                  <div className="activity-content">
                    <strong>Project requires attention</strong>
                    <span>
                      Review the latest information submitted for your project.
                    </span>
                  </div>

                  <time>2 days ago</time>
                </div>

              </div>
            </div>

          </section>

        ) : (

          /* General Dashboard */
          <section className="workspace-content">

            <div className="workspace-section-header">
              <div>
                <h2>Recent Projects</h2>
                <p>
                  Here are the latest projects associated with your account.
                </p>
              </div>

              <button className="primary-action">
                <FaPlus />
                <span>New Project</span>
              </button>
            </div>

            <div className="workspace-project-grid">

              <article className="workspace-project-card">
                <div className="project-card-icon">
                  <FaBuilding />
                </div>

                <div className="project-card-body">
                  <h3>Residential Construction</h3>

                  <p>
                    Residential construction project currently in progress.
                  </p>

                  <div className="project-card-footer">
                    <span className="project-status in-progress">
                      <FaClock />
                      In Progress
                    </span>

                    <span className="project-location">
                      <FaMapMarkerAlt />
                      Yaoundé
                    </span>
                  </div>
                </div>
              </article>

              <article className="workspace-project-card">
                <div className="project-card-icon">
                  <FaLeaf />
                </div>

                <div className="project-card-body">
                  <h3>Agricultural Project</h3>

                  <p>
                    Agricultural development project being monitored remotely.
                  </p>

                  <div className="project-card-footer">
                    <span className="project-status completed">
                      <FaCheckCircle />
                      Completed
                    </span>

                    <span className="project-location">
                      <FaMapMarkerAlt />
                      West Region
                    </span>
                  </div>
                </div>
              </article>

              <article className="workspace-project-card">
                <div className="project-card-icon">
                  <FaHardHat />
                </div>

                <div className="project-card-body">
                  <h3>Building Renovation</h3>

                  <p>
                    Renovation project currently under professional supervision.
                  </p>

                  <div className="project-card-footer">
                    <span className="project-status pending">
                      <FaClock />
                      Pending
                    </span>

                    <span className="project-location">
                      <FaMapMarkerAlt />
                      Douala
                    </span>
                  </div>
                </div>
              </article>

            </div>

          </section>
        )}

      </main>
    </div>
  );
};

export default Workspace;