/**
 * CamTrust - Project Detail View (Screen 8)
 * Matches the reference poster: Tab navigation (Overview, Milestones, Reports, Team, Finance),
 * 72% overall progress gauge, metadata grid, and verified site photo gallery.
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ShieldCheck,
  Building,
  Clock,
  Layers,
  FileText,
  Users as UsersIcon,
  PieChart
} from 'lucide-react';
import { ProjectItem, MilestoneItem, ReportItem, TeamMember } from '../../utils/dashboardData';

export interface ProjectDetailViewProps {
  project: ProjectItem;
  milestones: MilestoneItem[];
  reports: ReportItem[];
  team: TeamMember[];
  onBack: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  milestones,
  reports,
  team,
  onBack,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'milestones' | 'reports' | 'team' | 'finance'>('overview');

  const projectMilestones = milestones.filter((m) => m.projectId === project.id);
  const projectReports = reports.filter((r) => r.projectId === project.id);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Top Header with Back Navigation */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition"
            title="Back to all projects"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md">
                {project.code}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {project.name}
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <MapPin size={13} className="text-gray-400" />
              <span>{project.location}</span>
              <span>•</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                Verified Site
              </span>
            </p>
          </div>
        </div>

        {/* Tab Navigation Pill Bar (Matching Screen 8 Tabs) */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-2xl overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Building },
            { id: 'milestones', label: 'Milestones', icon: Layers },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'team', label: 'Team', icon: UsersIcon },
            { id: 'finance', label: 'Finance', icon: PieChart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-orange-500' : 'text-gray-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. OVERVIEW TAB CONTENT (Screen 8) */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Left Column: Progress Ring & Specs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overall Progress Widget */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* SVG Progress Circle */}
                <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f3f4f6"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f97316"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * project.progress) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold text-gray-900">{project.progress}%</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Progress</span>
                  </div>
                </div>

                {/* Progress Details */}
                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    <ShieldCheck size={14} /> On Schedule & Inspected
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {project.name}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1 justify-center sm:justify-start">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-orange-500" />
                      <span>Roofing phase in progress</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-blue-500" />
                      <span>Target: {project.expectedEndDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Project Parameters & Metadata
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Start Date</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 mt-1">{project.startDate}</div>
                </div>

                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Expected End Date</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 mt-1">{project.expectedEndDate}</div>
                </div>

                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Total Budget</div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-600 mt-1">
                    ${project.budget.toLocaleString()}
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Location</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 mt-1">{project.location}</div>
                </div>

                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Project Type</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 mt-1">{project.type}</div>
                </div>

                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Project Manager</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 mt-1">{project.projectManager}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Site Photos Gallery & Recent Updates */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Verified Photo Evidence
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=400&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=400&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=400&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop',
                ].map((img, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 group">
                    <img
                      src={img}
                      alt="Evidence"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                      GPS Verified
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveSubTab('reports')}
                className="w-full mt-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold text-center transition"
              >
                View all 36 site photos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MILESTONES TAB (Delegates to project milestones) */}
      {activeSubTab === 'milestones' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Project Milestones & Timeline</h2>
              <p className="text-xs text-gray-500">Track each construction phase and verified inspection dates</p>
            </div>
            <button
              onClick={() => onNavigateTab('milestones')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20"
            >
              Open Full Milestones View
            </button>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
            {projectMilestones.map((m) => (
              <div key={m.id} className="relative flex items-start justify-between gap-4">
                <span
                  className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                    m.status === 'Completed'
                      ? 'bg-emerald-500'
                      : m.status === 'In Progress'
                      ? 'bg-orange-500 animate-pulse'
                      : 'bg-gray-300'
                  }`}
                />
                <div>
                  <div className="text-sm font-bold text-gray-900">{m.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.date || 'Pending start'}</div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    m.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : m.status === 'In Progress'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. REPORTS TAB */}
      {activeSubTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fadeIn space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">Verified Site Reports</h2>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
            >
              View All Reports
            </button>
          </div>

          {projectReports.map((r) => (
            <div key={r.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-gray-900">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.date} • By {r.author} ({r.authorRole})</div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> Verified
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{r.notes}</p>
              <div className="flex gap-2 overflow-x-auto py-1">
                {r.images.map((img, i) => (
                  <img key={i} src={img} alt="Evidence" className="h-16 w-24 rounded-lg object-cover flex-shrink-0" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. TEAM TAB */}
      {activeSubTab === 'team' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fadeIn space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Project Personnel & Engineers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 font-bold flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{t.name}</div>
                  <div className="text-xs text-orange-600 font-semibold">{t.role}</div>
                  <div className="text-[11px] text-gray-500">{t.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. FINANCE TAB */}
      {activeSubTab === 'finance' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fadeIn space-y-5">
          <h2 className="text-lg font-bold text-gray-900">Financial Snapshot</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-xs text-gray-500 font-semibold">Total Budget</div>
              <div className="text-lg font-bold text-gray-900 mt-1">${project.budget.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="text-xs text-orange-700 font-semibold">Spent (65%)</div>
              <div className="text-lg font-bold text-orange-600 mt-1">${project.spent.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="text-xs text-emerald-700 font-semibold">Remaining</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">
                ${(project.budget - project.spent).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailView;
