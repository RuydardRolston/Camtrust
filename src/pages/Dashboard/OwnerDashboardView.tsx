/**
 * CamTrust - Owner Dashboard View
 * Real database-backed dashboard with live monitoring statistics,
 * verified site evidence updates, and assigned civil engineers.
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  FolderKanban,
  Loader2,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import projectService from '../../services/projectService';
import milestoneService from '../../services/milestoneService';
import reportService from '../../services/reportService';
import VerifiedBadge from '../../components/common/VerifiedBadge';

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
  assignments?: Array<{
    professional: {
      fullName: string;
      verified: boolean;
      specialty?: string;
    };
  }>;
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
  professional?: {
    fullName: string;
  };
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [projectsData, milestonesData, reportsData] = await Promise.all([
          projectService.getMyProjects(),
          milestoneService.getMyMilestones(),
          reportService.getMyReports(),
        ]);

        if (!isMounted) return;

        setProjects((projectsData as any)?.projects || []);
        setMilestones((milestonesData as any)?.milestones || []);
        setReports((reportsData as any)?.reports || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        if (isMounted) {
          setError('Unable to load your dashboard right now. Please try refreshing.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalProjects = projects.length;
  const awaitingAssignment = projects.filter((p) => p.status === 'Approved').length;
  const inProgressProjects = projects.filter(
    (p) => p.status === 'In Progress' || p.status === 'Awaiting Confirmation'
  ).length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;
  const avgProgress =
    totalProjects > 0
      ? Math.round(
          projects.reduce((acc, curr) => acc + (curr.completionRate || 0), 0) / totalProjects
        )
      : 0;

  const recentActivity = [
    ...milestones.map((m) => ({
      id: `milestone-${m.id}`,
      projectId: m.projectId,
      date: m.plannedDate,
      label: `Milestone "${m.label}" — ${m.status} (${m.completionRate}%)`,
      icon: 'milestone' as const,
    })),
    ...reports.map((r) => ({
      id: `report-${r.id}`,
      projectId: r.projectId,
      date: r.generatedAt,
      label: r.summary,
      icon: 'report' as const,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-wider mb-3">
            <Building size={13} /> Project Owner Monitoring Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome, {user?.fullName || 'Project Owner'} 👋
          </h1>
          <p className="text-orange-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Remotely supervise your construction projects with verified in-app site photos, phone GPS timestamps, and official engineering progress reports.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigateTab('projects')}
              className="px-5 py-2.5 bg-white text-orange-600 hover:bg-orange-50 font-black text-xs sm:text-sm rounded-xl shadow-md transition"
            >
              Browse My Projects
            </button>
            <button
              onClick={() => onNavigateTab('ai-assistant')}
              className="px-4 py-2.5 bg-orange-700/40 hover:bg-orange-700/60 text-white font-extrabold text-xs sm:text-sm rounded-xl border border-white/20 flex items-center gap-2 transition"
            >
              <Sparkles size={16} />
              <span>Ask AI Construction Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sites</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 mt-3">{totalProjects}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Awaiting Engineer</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 mt-3">{awaitingAssignment}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">In Progress</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 mt-3">{inProgressProjects}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 mt-3">{completedProjects}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Progress</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 mt-3">{avgProgress}%</div>
        </div>
      </div>

      {/* Active Monitored Projects */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900">Active Construction Projects</h2>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" />
              Direct supervision by verified construction professionals
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('projects')}
            className="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Building className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No construction projects created yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => {
              const eng = project.assignments?.[0]?.professional;

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(String(project.id))}
                  className="p-5 rounded-2xl border border-gray-100 hover:border-orange-300 hover:bg-orange-50/20 transition-all cursor-pointer shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-gray-900">{project.title}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          project.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : project.status === 'In Progress' || project.status === 'Awaiting Confirmation'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : project.status === 'Rejected'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        {project.location}
                      </span>
                      {project.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400" />
                          {new Date(project.startDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Assigned Engineer Badge */}
                    <div className="pt-1">
                      {eng ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-500 font-medium">Supervisor:</span>
                          <VerifiedBadge size="sm" subtext={eng.fullName} />
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Awaiting Engineer Assignment by Administrator
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(String(project.id));
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                    >
                      <span>Open Timeline</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-gray-900">Recent Construction Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-xs text-center py-6">No recent monitoring activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {recentActivity.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 text-xs text-gray-700 border-b border-gray-50 pb-3 last:border-0 last:pb-0"
              >
                <span
                  className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    item.icon === 'milestone' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{item.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(item.date).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboardView;