/**
 * CamTrust - Unified Workspace Container
 * Real API-backed workspace with role-based views.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';

import OwnerDashboardView from './Dashboard/OwnerDashboardView';
import ProjectsListView from './Dashboard/ProjectsListView';
import ProjectDetailView from './Dashboard/ProjectDetailView';
import MilestonesView from './Dashboard/MilestonesView';
import ProgressReportsView from './Dashboard/ProgressReportsView';
import DocumentsView from './Dashboard/DocumentsView';
import NotificationsView from './Dashboard/NotificationsView';
import AIAssistantView from './Dashboard/AIAssistantView';
import MessagesView from './Dashboard/MessagesView';
import TeamView from './Dashboard/TeamView';
import FinanceView from './Dashboard/FinanceView';
import SettingsView from './Dashboard/SettingsView';
import ProjectProposalsView from './Dashboard/ProjectProposalsView';

import EngineerDashboard from './Engineer/EngineerDashboard';
import UpdateProgressView from './Engineer/UpdateProgressView';
import EvidenceView from './Dashboard/EvidenceView';

import AdminDashboard from './Admin/AdminDashboard';
import UsersManagementView from './Admin/UsersManagementView';
import ProfessionalsVerificationView from './Admin/ProfessionalsVerificationView';
import ProjectsManagementView from './Admin/ProjectsManagementView';

export const Workspace: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  const initialTab = searchParams.get('tab') || 'dashboard';
  const initialProjectId = searchParams.get('projectId');
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId);

  const updateSearchParams = (tabId: string, projectId?: string | null) => {
    const params: Record<string, string> = { tab: tabId };
    if (projectId) params.projectId = projectId;
    setSearchParams(params);
  };

  const handleSelectTab = (tabId: string, projectId?: string | null) => {
    setActiveTab(tabId);
    if (tabId === 'projects') {
      setSelectedProjectId(null);
      updateSearchParams(tabId, null);
    } else {
      const targetPid = projectId !== undefined ? projectId : selectedProjectId;
      if (projectId !== undefined) {
        setSelectedProjectId(targetPid);
      }
      updateSearchParams(tabId, targetPid);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('project-detail');
    updateSearchParams('project-detail', projectId);
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

  const role = user.role;
  const isOwner = role === 'property_owner';
  const isEngineer = role === 'professional' || role === 'engineer';
  const isAdmin = role === 'administrator' || role === 'admin';

  if (!isOwner && !isEngineer && !isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold text-gray-600">Unknown user role</p>
          <p className="text-xs text-gray-400">Role: {role || 'undefined'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onSelectTab={handleSelectTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
          {isOwner && (
            <>
              {activeTab === 'dashboard' && (
                <OwnerDashboardView
                  onSelectProject={handleSelectProject}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsListView
                  onSelectProject={handleSelectProject}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {activeTab === 'project-detail' && selectedProjectId && (
                <ProjectDetailView
                  projectId={selectedProjectId}
                  onBack={() => handleSelectTab('projects')}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {activeTab === 'milestones' && <MilestonesView />}
              {activeTab === 'evidence' && <EvidenceView />}
              {activeTab === 'reports' && <ProgressReportsView />}
              {activeTab === 'documents' && <DocumentsView />}
              {activeTab === 'notifications' && <NotificationsView onNavigateTab={handleSelectTab} />}
              {activeTab === 'ai-assistant' && <AIAssistantView />}
              {activeTab === 'team' && <TeamView />}
              {activeTab === 'finance' && <FinanceView />}
              {activeTab === 'messages' && <MessagesView />}
              {activeTab === 'settings' && <SettingsView />}
              {activeTab === 'proposals' && <ProjectProposalsView />}
            </>
          )}

          {isEngineer && (
            <>
              {activeTab === 'dashboard' && (
                <EngineerDashboard
                  onSelectProject={handleSelectProject}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsListView
                  onSelectProject={handleSelectProject}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {activeTab === 'project-detail' && selectedProjectId && (
                <ProjectDetailView
                  projectId={selectedProjectId}
                  onBack={() => handleSelectTab('projects')}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {activeTab === 'update-progress' && <UpdateProgressView />}
              {activeTab === 'milestones' && <MilestonesView />}
              {activeTab === 'evidence' && <EvidenceView />}
              {activeTab === 'reports' && <ProgressReportsView />}
              {activeTab === 'documents' && <DocumentsView />}
              {activeTab === 'notifications' && <NotificationsView onNavigateTab={handleSelectTab} />}
              {activeTab === 'messages' && <MessagesView />}
              {activeTab === 'settings' && <SettingsView />}
            </>
          )}

          {isAdmin && (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboard onNavigateTab={handleSelectTab} />
              )}

              {activeTab === 'users-mgmt' && <UsersManagementView />}
              {activeTab === 'verification' && <ProfessionalsVerificationView />}
              {activeTab === 'projects-mgmt' && (
                <ProjectsManagementView
                  onSelectProject={handleSelectProject}
                />
              )}
              {activeTab === 'evidence' && <EvidenceView />}
              {activeTab === 'documents' && <DocumentsView />}
              {activeTab === 'notifications' && <NotificationsView onNavigateTab={handleSelectTab} />}
              {activeTab === 'messages' && <MessagesView />}
              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Workspace;
