/**
 * CamTrust - Engineer Dashboard View
 * Matches reference poster (Engineer Pages): Assigned projects, live progress, and field report shortcut.
 */

import React from 'react';
import {
  HardHat,
  UploadCloud,
  ArrowRight,
  MapPin,
  Calendar
} from 'lucide-react';
import { ProjectItem } from '../../utils/dashboardData';

export interface EngineerDashboardProps {
  projects: ProjectItem[];
  onSelectProject: (id: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const EngineerDashboard: React.FC<EngineerDashboardProps> = ({
  projects,
  onSelectProject,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-700/15 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
            <HardHat size={13} /> Licensed Civil Engineer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Engineer Site Dashboard 🏗️
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base mt-2 leading-relaxed">
            Monitor assigned construction sites, submit verified photo logs, and sign off on completed building milestones.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => onNavigateTab('update-progress')}
              className="px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition"
            >
              <UploadCloud size={16} />
              <span>Submit Progress Update</span>
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="px-4 py-2.5 bg-emerald-900/50 hover:bg-emerald-900/70 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition"
            >
              View Site Reports
            </button>
          </div>
        </div>
      </div>

      {/* Assigned Projects Section (Matching Engineer Poster) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Assigned Projects</h2>
            <p className="text-xs text-gray-500 mt-0.5">Active sites requiring weekly structural oversight</p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            {projects.length} Sites Under Supervision
          </span>
        </div>

        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition">
                      {p.name}
                    </h3>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {p.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400" />
                      {p.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400" />
                      Due {p.expectedEndDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 min-w-[200px] justify-between sm:justify-end">
                <div className="text-right">
                  <div className="text-lg font-extrabold text-emerald-600">{p.progress}%</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Progress</div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateTab('update-progress');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-1"
                >
                  <span>Update</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EngineerDashboard;
