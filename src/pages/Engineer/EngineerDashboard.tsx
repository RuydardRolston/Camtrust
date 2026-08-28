/**
 * CamTrust - Engineer Dashboard View
 * Real database-backed engineer dashboard with assigned projects.
 */

import React, { useState, useEffect } from 'react';
import {
  HardHat,
  UploadCloud,
  ArrowRight,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react';
import assignmentService from '../../services/assignmentService';
import projectService from '../../services/projectService';

export interface Project {
  id: number;
  title: string;
  location: string;
  budget: string;
  status: string;
  startDate: string;
  completionRate?: number;
}

export interface EngineerDashboardProps {
  onSelectProject: (projectId: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export const EngineerDashboard: React.FC<EngineerDashboardProps> = ({
  onSelectProject,
  onNavigateTab,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const assignments = await assignmentService.getMyAssignments();
      const projectPromises = (assignments.assignments || []).map((a: any) =>
        projectService.getProjectById(a.projectId)
      );
      const projectsData = await Promise.all(projectPromises);
      setProjects(projectsData.map((p: any) => p.project).filter(Boolean));
    } catch (err) {
      console.error('Failed to load assigned projects:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-700/15 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
            <HardHat size={13} /> Licensed Civil Engineer Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Engineer Site Dashboard
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base mt-2 leading-relaxed">
            Monitor assigned construction sites and submit verified progress updates.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => onNavigateTab('update-progress')}
              className="px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition"
            >
              <UploadCloud size={16} />
              <span>Submit Progress Update</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Assigned Projects</h2>
            <p className="text-xs text-gray-500 mt-0.5">Active sites requiring oversight</p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            {projects.length} Sites
          </span>
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No projects assigned yet</p>
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(String(p.id))}
                className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">{p.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        p.status === 'Approved' || p.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        {p.location}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateTab('update-progress');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1"
                >
                  <span>Update</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EngineerDashboard;
