/**
 * CamTrust - Projects Management View
 * Real database-backed admin projects table with approve/reject actions.
 */

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import projectService from '../../services/projectService';
import { useCurrency } from '../../context/CurrencyContext';

export interface Project {
  id: number;
  title: string;
  location: string;
  description: string;
  budget: string;
  status: string;
  startDate: string;
  ownerId: number;
}

export interface ProjectsManagementViewProps {
  onSelectProject: (projectId: string) => void;
}

export const ProjectsManagementView: React.FC<ProjectsManagementViewProps> = ({
  onSelectProject,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { convert } = useCurrency();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await projectService.updateProjectStatus(id, { status: 'Approved' });
      await loadProjects();
    } catch (err) {
      alert('Failed to approve project');
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      await projectService.updateProjectStatus(id, { status: 'Rejected', rejectionReason: rejectReason });
      setRejectingId(null);
      setRejectReason('');
      await loadProjects();
    } catch (err) {
      alert('Failed to reject project');
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Approved':
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
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
          <div className="flex items-center gap-2">
            <FolderKanban className="text-orange-500" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Projects Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review and manage all construction projects.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by project name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3.5 px-5">Project</th>
                <th className="py-3.5 px-5">Location</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Budget</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition">
                  <td className="py-3.5 px-5 font-bold text-gray-900">
                    <div>{p.title}</div>
                  </td>
                  <td className="py-3.5 px-5 text-gray-700">{p.location}</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-gray-700">{convert(Number(p.budget))}</td>
                  <td className="py-3.5 px-5 text-right space-x-2">
                    {p.status === 'Under Review' && (
                      <>
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                          title="Approve"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                        <button
                          onClick={() => setRejectingId(p.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Reject Project</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-200 rounded-xl text-sm mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setRejectingId(null); setRejectReason(''); }} className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold">
                Cancel
              </button>
              <button onClick={() => handleReject(rejectingId)} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManagementView;
