/**
 * CamTrust - Milestones View
 * Real database-backed milestones list.
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Loader2
} from 'lucide-react';
import milestoneService from '../../services/milestoneService';
import projectService from '../../services/projectService';

export interface Milestone {
  id: number;
  projectId: number;
  label: string;
  plannedDate: string;
  completionRate: number;
  status: string;
}

export interface Project {
  id: number;
  title: string;
  location: string;
}

export const MilestonesView: React.FC = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadMilestones(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, milestonesData] = await Promise.all([
        projectService.getMyProjects(),
        milestoneService.getMyMilestones(),
      ]);
      const projectList = Array.isArray(projectsData) ? projectsData : (projectsData?.projects || []);
      const msList = Array.isArray(milestonesData) ? milestonesData : (milestonesData?.milestones || []);
      setProjects(projectList);
      setMilestones(msList);
      if (projectList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectList[0].id);
      }
    } catch (err) {
      console.error('Failed to load milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async (projectId: number) => {
    try {
      const data = await milestoneService.getMilestones(projectId);
      const msList = Array.isArray(data) ? data : (data?.milestones || []);
      setMilestones(msList);
    } catch (err) {
      console.error('Failed to load milestones:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !selectedProjectId) return;

    try {
      await milestoneService.createMilestone({
        projectId: selectedProjectId,
        label: newLabel,
        plannedDate: newDate,
        completionRate: 0,
        status: 'Pending',
      });
      setIsModalOpen(false);
      setNewLabel('');
      setNewDate('');
      await loadMilestones(selectedProjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to create milestone');
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Milestones
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track construction phases and completion
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition"
        >
          <Plus size={18} />
          <span>New Milestone</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {milestones.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm">No milestones yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-5">Label</th>
                  <th className="py-3.5 px-5">Project</th>
                  <th className="py-3.5 px-5">Planned Date</th>
                  <th className="py-3.5 px-5">Progress</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {milestones.map((m) => {
                  const project = projects.find((p) => p.id === m.projectId);
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/60 transition">
                      <td className="py-3.5 px-5 font-bold text-gray-900">{m.label}</td>
                      <td className="py-3.5 px-5 text-gray-700">{project?.title || 'Unknown'}</td>
                      <td className="py-3.5 px-5 text-gray-700">
                        {m.plannedDate ? new Date(m.plannedDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                m.completionRate >= 70 ? 'bg-orange-500' : m.completionRate >= 40 ? 'bg-amber-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${m.completionRate}%` }}
                            />
                          </div>
                          <span className="font-bold text-gray-900 text-xs">{m.completionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge(m.status)}`}>
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">New Milestone</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Planned Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestonesView;
