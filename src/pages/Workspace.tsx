/**
 * CamTrust - Unified Workspace Container
 * Static fixed sidebar on the left, independently scrolling content area on the right,
 * strictly routed by the authenticated user's role.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Layout Components
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';

// Shared State & Initial Data
import {
  INITIAL_PROJECTS,
  INITIAL_MILESTONES,
  INITIAL_REPORTS,
  INITIAL_TEAM,
  ProjectItem,
  MilestoneItem,
  ReportItem,
  TeamMember,
} from '../utils/dashboardData';

// Owner Views
import OwnerDashboardView from './Dashboard/OwnerDashboardView';
import ProjectsListView from './Dashboard/ProjectsListView';
import ProjectDetailView from './Dashboard/ProjectDetailView';
import MilestonesView from './Dashboard/MilestonesView';
import ProgressReportsView from './Dashboard/ProgressReportsView';
import DocumentsView from './Dashboard/DocumentsView';
import NotificationsView from './Dashboard/NotificationsView';
import AIAssistantView from './Dashboard/AIAssistantView';
import TeamView from './Dashboard/TeamView';
import FinanceView from './Dashboard/FinanceView';

// Engineer Views
import EngineerDashboard from './Engineer/EngineerDashboard';
import UpdateProgressView from './Engineer/UpdateProgressView';

// Admin Views
import AdminDashboard from './Admin/AdminDashboard';
import UsersManagementView from './Admin/UsersManagementView';
import ProfessionalsVerificationView from './Admin/ProfessionalsVerificationView';
import ProjectsManagementView from './Admin/ProjectsManagementView';

export const Workspace: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Authentication guard
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Live Shared Data State
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [milestones, setMilestones] = useState<MilestoneItem[]>(INITIAL_MILESTONES);
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [team] = useState<TeamMember[]>(INITIAL_TEAM);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    if (tabId === 'projects') {
      setSelectedProjectId(null);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('project-detail');
  };

  const handleAddProject = (newProject: Omit<ProjectItem, 'id'>) => {
    const created: ProjectItem = {
      ...newProject,
      id: String(projects.length + 1),
    };
    setProjects([created, ...projects]);
  };

  const handleAddMilestone = (newMilestone: Omit<MilestoneItem, 'id'>) => {
    const created: MilestoneItem = {
      ...newMilestone,
      id: 'm' + (milestones.length + 1),
    };
    setMilestones([...milestones, created]);
  };

  const handleToggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus =
            m.status === 'Completed'
              ? 'Pending'
              : m.status === 'Pending'
              ? 'In Progress'
              : 'Completed';
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleAddReport = (newReport: Omit<ReportItem, 'id'>) => {
    const created: ReportItem = {
      ...newReport,
      id: 'r' + (reports.length + 1),
    };
    setReports([created, ...reports]);
  };

  const handleEngineerProgressSubmit = (updateData: {
    projectId: string;
    milestone: string;
    progress: number;
    notes: string;
    photos: string[];
  }) => {
    // 1. Update project overall progress
    setProjects((prev) =>
      prev.map((p) => (p.id === updateData.projectId ? { ...p, progress: updateData.progress } : p))
    );

    // 2. Add verified field report with stamped photos
    const newReport: ReportItem = {
      id: 'r' + (reports.length + 1),
      projectId: updateData.projectId,
      projectName: projects.find((p) => p.id === updateData.projectId)?.name || 'Construction Site',
      title: `${updateData.milestone} Update (${updateData.progress}%)`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      author: user?.fullName || 'Eng. Mark Tala',
      authorRole: 'Civil Engineer',
      photosCount: updateData.photos.length,
      images: updateData.photos,
      notes: updateData.notes,
      milestone: updateData.milestone,
    };

    setReports([newReport, ...reports]);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // The role is strictly the authenticated user's role
  const role = user.role;
  const isOwner = role === 'property_owner';
  const isEngineer = role === 'professional' || role === 'engineer';
  const isAdmin = role === 'administrator' || role === 'admin';

  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased">
      {/* 1. Left Static Non-Moving Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Right Main Scrollable Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">
        {/* Sticky Header */}
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onSelectTab={handleSelectTab}
        />

        {/* Dynamic Role-Based Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {/* PROPERTY OWNER ROLE VIEWS */}
          {isOwner && (
            <>
              {activeTab === 'dashboard' && (
                <OwnerDashboardView
                  userName={user?.fullName || 'John'}
                  projects={projects}
                  milestones={milestones}
                  reports={reports}
                  onSelectProject={handleSelectProject}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsListView
                  projects={projects}
                  onSelectProject={handleSelectProject}
                  onAddProject={handleAddProject}
                />
              )}

              {activeTab === 'project-detail' && selectedProject && (
                <ProjectDetailView
                  project={selectedProject}
                  milestones={milestones}
                  reports={reports}
                  team={team}
                  onBack={() => handleSelectTab('projects')}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {activeTab === 'milestones' && (
                <MilestonesView
                  milestones={milestones}
                  onAddMilestone={handleAddMilestone}
                  onToggleMilestoneStatus={handleToggleMilestone}
                />
              )}

              {activeTab === 'reports' && (
                <ProgressReportsView
                  reports={reports}
                  onAddReport={handleAddReport}
                />
              )}

              {activeTab === 'documents' && <DocumentsView />}
              {activeTab === 'notifications' && <NotificationsView />}
              {activeTab === 'ai-assistant' && <AIAssistantView />}
              {activeTab === 'team' && <TeamView />}
              {activeTab === 'finance' && <FinanceView />}

              {activeTab === 'messages' && (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center space-y-3">
                  <h2 className="text-xl font-bold text-gray-900">Project Messaging</h2>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    Direct communications with verified engineers and site supervisors are logged and verified.
                  </p>
                  <button
                    onClick={() => handleSelectTab('team')}
                    className="px-5 py-2.5 bg-orange-500 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20"
                  >
                    Open Team Contacts
                  </button>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5 max-w-xl">
                  <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                      <input type="text" readOnly value={user.email} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                      <input type="text" readOnly value={user.fullName || 'User'} className="w-full p-2.5 bg-gray-50 border rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Assigned Role</label>
                      <input type="text" readOnly value="Project Owner" className="w-full p-2.5 bg-gray-50 border rounded-xl font-bold text-orange-600" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* CIVIL ENGINEER / PROFESSIONAL ROLE VIEWS */}
          {isEngineer && (
            <>
              {activeTab === 'dashboard' && (
                <EngineerDashboard
                  projects={projects}
                  onSelectProject={handleSelectProject}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsListView
                  projects={projects}
                  onSelectProject={handleSelectProject}
                  onAddProject={handleAddProject}
                />
              )}

              {activeTab === 'project-detail' && selectedProject && (
                <ProjectDetailView
                  project={selectedProject}
                  milestones={milestones}
                  reports={reports}
                  team={team}
                  onBack={() => handleSelectTab('projects')}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {activeTab === 'update-progress' && (
                <UpdateProgressView
                  projects={projects}
                  onSubmitUpdate={handleEngineerProgressSubmit}
                />
              )}

              {activeTab === 'reports' && (
                <ProgressReportsView
                  reports={reports}
                  onAddReport={handleAddReport}
                />
              )}

              {activeTab === 'documents' && <DocumentsView />}
              {activeTab === 'messages' && <TeamView />}
              {activeTab === 'settings' && <DocumentsView />}
            </>
          )}

          {/* ADMINISTRATOR ROLE VIEWS */}
          {isAdmin && (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboard onNavigateTab={handleSelectTab} />
              )}

              {activeTab === 'users-mgmt' && <UsersManagementView />}
              {activeTab === 'verification' && <ProfessionalsVerificationView />}
              {activeTab === 'projects-mgmt' && (
                <ProjectsManagementView
                  projects={projects}
                  onSelectProject={handleSelectProject}
                />
              )}
              {activeTab === 'reports' && (
                <ProgressReportsView
                  reports={reports}
                  onAddReport={handleAddReport}
                />
              )}
              {activeTab === 'settings' && <UsersManagementView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Workspace;