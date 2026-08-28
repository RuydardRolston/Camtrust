/**
 * CamTrust - Owner Dashboard View
 * Real database-backed dashboard with live stats.
 */

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building,
  Loader2
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import projectService from '../../services/projectService';
import milestoneService from '../../services/milestoneService';
import reportService from '../../services/reportService';

export interface OwnerDashboardViewProps {
  onSelectProject: (projectId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export interface Project {
  id: number;
  title: string;
  location: string;
  description: string;
  budget: string;
  status: string;
  startDate: string;
  completionRate?: number;
}

export interface Milestone {
  id: number;
  projectId: number;
  label: string;
  plannedDate: string;
  completionRate: number;
  status: string;
}

export interface Report {
  id: number;
  projectId: number;
  summary: string;
  generatedAt: string;
}

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = ({
  onSelectProject,
  onNavigateTab,
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsData, milestonesData, reportsData] = await Promise.all([
        projectService.getMyProjects(),
        milestoneService.getMyMilestones(),
        reportService.getMyReports(),
      ]);

      const projectsList = projectsData.projects || [];
      setProjects(projectsList);

      const allMilestones = milestonesData.milestones || [];
      setMilestones(allMilestones);

      const allReports = reportsData.reports || [];
      setReports(allReports);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalProjects = projects.length;
  const inProgressProjects = projects.filter((p) => p.status === 'In Progress' || p.status === 'Approved').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;
  const avgProgress = totalProjects > 0
    ? Math.round(projects.reduce((acc, curr) => acc + (curr.completionRate || 0), 0) / totalProjects)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
            <Building size={13} /> Project Owner Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome, {user?.fullName || 'User'} 👋
          </h1>
          <p className="text-orange-100 text-sm sm:text-base mt-2 leading-relaxed">
            Here's what's happening with your construction projects today.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => onNavigateTab('projects')}
              className="px-5 py-2.5 bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs sm:text-sm rounded-xl shadow-md transition"
            >
              Browse Projects
            </button>
            <button
              onClick={() => onNavigateTab('ai-assistant')}
              className="px-4 py-2.5 bg-orange-700/40 hover:bg-orange-700/60 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 flex items-center gap-2 transition"
            >
              <Sparkles size={16} />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Projects</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{totalProjects}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">In Progress</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{inProgressProjects}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{completedProjects}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Progress</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{avgProgress}%</div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">My Projects</h2>
            <p className="text-xs text-gray-500 mt-0.5">Live monitoring from verified engineers</p>
          </div>
          <button
            onClick={() => onNavigateTab('projects')}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No projects yet</p>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(String(project.id))}
                className="p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/20 transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{project.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        project.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        project.status === 'Approved' || project.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        {project.location}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboardView;
