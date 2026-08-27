/**
 * CamTrust - Owner Dashboard View (Screen 6)
 * Matches the reference poster: Welcome greeting, 4 summary metric cards, My Projects list with progress,
 * recent milestones preview, recent reports, and quick AI Assistant shortcut.
 */

import React from 'react';
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
  Building
} from 'lucide-react';
import { ProjectItem, MilestoneItem, ReportItem } from '../../utils/dashboardData';

export interface OwnerDashboardViewProps {
  userName: string;
  projects: ProjectItem[];
  milestones: MilestoneItem[];
  reports: ReportItem[];
  onSelectProject: (projectId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = ({
  userName,
  projects,
  milestones,
  reports,
  onSelectProject,
  onNavigateTab,
}) => {
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter((p) => p.status === 'In Progress' || p.status === 'On Track').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;
  const avgProgress = Math.round(
    projects.reduce((acc, curr) => acc + curr.progress, 0) / (totalProjects || 1)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Welcome Greeting Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
            <Building size={13} /> Project Owner Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome, {userName || 'John'} 👋
          </h1>
          <p className="text-orange-100 text-sm sm:text-base mt-2 leading-relaxed">
            Here's what's happening with your construction projects today. All 3 active sites are verified by licensed engineers.
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

      {/* 2. Four Summary Stat Cards (Matching Poster 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Projects</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{totalProjects}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>+1 new site</span>
            <span className="text-gray-400 font-normal">this month</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">In Progress</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{inProgressProjects}</div>
          <div className="text-xs text-blue-600 font-semibold mt-1">
            Actively being built
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{completedProjects}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            Handed over & certified
          </div>
        </div>

        {/* Avg Progress */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Progress</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-3">{avgProgress}%</div>
          <div className="text-xs text-purple-600 font-semibold mt-1">
            Across active portfolio
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: "My Projects" List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">My Projects</h2>
                <p className="text-xs text-gray-500 mt-0.5">Live monitoring from verified engineers</p>
              </div>
              <button
                onClick={() => onNavigateTab('projects')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group"
              >
                <span>View All</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
              </button>
            </div>

            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className="p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/20 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={project.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=200&auto=format&fit=crop'}
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition">
                            {project.name}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              project.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : project.status === 'At Risk'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-orange-50 text-orange-700 border border-orange-200'
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-gray-400" />
                            {project.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-gray-400" />
                            Due {project.expectedEndDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 min-w-[150px] justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="text-base font-extrabold text-gray-900">{project.progress}%</div>
                        <div className="text-[10px] text-gray-400 font-medium">Completed</div>
                      </div>
                      <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            project.progress >= 70
                              ? 'bg-orange-500'
                              : project.progress >= 40
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-500 transition hidden sm:block" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Site Reports */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Latest Field Reports</h2>
                <p className="text-xs text-gray-500 mt-0.5">Verified photo evidence submitted by site engineers</p>
              </div>
              <button
                onClick={() => onNavigateTab('reports')}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>All Reports</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {reports.slice(0, 2).map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{r.title}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck size={10} /> Verified
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1">{r.notes}</p>
                    <div className="text-[11px] text-gray-400 flex items-center gap-2 pt-1">
                      <span>By {r.author}</span>
                      <span>•</span>
                      <span>{r.date}</span>
                    </div>
                  </div>
                  <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
                    {r.images.slice(0, 3).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="Evidence"
                        className="inline-block h-10 w-10 rounded-lg ring-2 ring-white object-cover"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Milestones Timeline Preview & Quick AI Assistant */}
        <div className="space-y-6">
          {/* Milestones / Timeline Widget (Matching Screen 9 preview) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Active Milestones</h2>
              <button
                onClick={() => onNavigateTab('milestones')}
                className="text-xs text-orange-600 font-semibold hover:underline"
              >
                View timeline
              </button>
            </div>

            <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {milestones.slice(0, 5).map((m) => (
                <div key={m.id} className="relative">
                  <span
                    className={`absolute -left-5 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                      m.status === 'Completed'
                        ? 'bg-emerald-500'
                        : m.status === 'In Progress'
                        ? 'bg-orange-500 animate-pulse'
                        : 'bg-gray-300'
                    }`}
                  />
                  <div className="text-xs font-bold text-gray-900 leading-tight">
                    {m.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-0.5">
                    <span>{m.date || 'Pending'}</span>
                    <span
                      className={`font-semibold ${
                        m.status === 'Completed'
                          ? 'text-emerald-600'
                          : m.status === 'In Progress'
                          ? 'text-orange-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Construction Assistant Card (Matching Screen 13 preview) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">AI Construction Assistant</div>
                <div className="text-[10px] text-slate-400">CamTrust Intelligence</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              "What is the next step after roofing?"
            </p>
            <div className="bg-slate-800/80 rounded-xl p-3 text-[11px] text-slate-300 border border-slate-700/60 mb-3">
              After roofing, proceed to electrical & plumbing rough-in before wall plastering.
            </div>

            <button
              onClick={() => onNavigateTab('ai-assistant')}
              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Ask a question</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardView;
