/**
 * CamTrust - Projects Management View (Screen 20)
 * Matches reference poster: Administrative table of all construction sites, owner association, status, and progress.
 */

import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Eye
} from 'lucide-react';
import { ProjectItem } from '../../utils/dashboardData';

export interface ProjectsManagementViewProps {
  projects: ProjectItem[];
  onSelectProject: (id: string) => void;
}

export const ProjectsManagementView: React.FC<ProjectsManagementViewProps> = ({
  projects,
  onSelectProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectManager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderKanban className="text-orange-500" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Projects Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Global view of all registered construction initiatives across Cameroon.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by project name, owner, city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
      </div>

      {/* Projects Table (Screen 20) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-5">Project</th>
                <th className="py-3.5 px-5">Owner</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Progress</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.map((p) => {
                const statusBadge =
                  p.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : p.status === 'At Risk'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-orange-50 text-orange-700 border-orange-200';

                return (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3.5 px-5 font-bold text-gray-900">
                      <div>{p.name}</div>
                      <div className="text-xs text-gray-400 font-normal">{p.location}</div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-700">{p.projectManager}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.progress >= 70
                                ? 'bg-orange-500'
                                : p.progress >= 40
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 text-xs">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => onSelectProject(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition"
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectsManagementView;
