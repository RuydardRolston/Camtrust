/**
 * CamTrust - Projects Management View (Administrator)
 * Admin reviews projects, approves/rejects, and assigns verified civil engineers.
 */

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import projectService from '../../services/projectService';
import assignmentService from '../../services/assignmentService';
import VerifiedBadge from '../../components/common/VerifiedBadge';

export interface Project {
  id: number;
  title: string;
  location: string;
  description: string;
  budget: string;
  status: string;
  startDate: string;
  ownerId: number;
  owner?: {
    fullName: string;
    email: string;
  };
  assignments?: Array<{
    professional: {
      fullName: string;
      verified: boolean;
    };
  }>;
}

export interface Professional {
  id: number;
  fullName: string;
  email: string;
  specialty?: string;
  verified: boolean;
}

export interface ProjectsManagementViewProps {
  onSelectProject: (projectId: string) => void;
}

export const ProjectsManagementView: React.FC<ProjectsManagementViewProps> = ({
  onSelectProject,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [assigningProjectId, setAssigningProjectId] = useState<number | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number>(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsRes, verifiedRes] = await Promise.all([
        projectService.getAllProjects(),
        assignmentService.getVerifiedEngineers(),
      ]);

      const projectList = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.projects || []);
      const engineerList = Array.isArray(verifiedRes) ? verifiedRes : (verifiedRes?.engineers || []);

      setProjects(projectList);
      setProfessionals(engineerList);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await projectService.updateProjectStatus(id, { status: 'Approved' });
      await loadData();
      alert('Project approved! You can now assign a verified civil engineer.');
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
      await loadData();
    } catch (err) {
      alert('Failed to reject project');
    }
  };

  const handleAssignEngineer = async (projectId: number) => {
    if (!selectedProfessionalId) {
      alert('Please select a verified engineer to assign.');
      return;
    }
    try {
      setProcessing(true);
      await assignmentService.assignProfessional(projectId, selectedProfessionalId);
      setAssigningProjectId(null);
      setSelectedProfessionalId(0);
      await loadData();
      alert('Verified Engineer successfully assigned to project!');
    } catch (err: any) {
      alert(err.message || 'Failed to assign engineer');
    } finally {
      setProcessing(false);
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
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
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
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <FolderKanban size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Projects Management & Assignment
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review construction projects, grant approval, and assign verified civil engineers.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Filter by project title or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-4 px-6">Project Title</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Assigned Engineer</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.map((p) => {
                const assignedEng = p.assignments?.[0]?.professional;

                return (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-4 px-6 font-bold text-gray-900">
                      <div>{p.title}</div>
                      <div className="text-[11px] text-gray-400 font-normal">
                        Owner: {p.owner?.fullName || 'Private Owner'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700">{p.location}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {assignedEng ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900">{assignedEng.fullName}</span>
                          <VerifiedBadge size="sm" showText={false} />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {p.status === 'Under Review' && (
                        <>
                          <button
                            onClick={() => handleApprove(p.id)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            title="Approve Project"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            onClick={() => setRejectingId(p.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition"
                            title="Reject Project"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}

                      {(p.status === 'Approved' || p.status === 'In Progress') && (
                        <button
                          onClick={() => setAssigningProjectId(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition inline-flex items-center gap-1"
                          title="Assign Verified Engineer"
                        >
                          <UserPlus size={14} />
                          <span>Assign</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSelectProject(String(p.id))}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition"
                        title="View Details & Timeline"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-gray-900">Reject Construction Project</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason for the Project Owner..."
              className="w-full p-3.5 border border-gray-200 rounded-xl text-xs"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setRejectingId(null); setRejectReason(''); }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingId)}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-black"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Verified Engineer Modal */}
      {assigningProjectId && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <UserPlus size={20} className="text-emerald-600" />
                <span>Assign Verified Civil Engineer</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Select a verified construction professional to supervise this project site.
              </p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {professionals.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-xs text-gray-500">
                  No verified engineers available. Approve engineer KYC requests first.
                </div>
              ) : (
                professionals.map((prof) => (
                  <div
                    key={prof.id}
                    onClick={() => setSelectedProfessionalId(prof.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      selectedProfessionalId === prof.id
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-extrabold text-gray-900">{prof.fullName}</div>
                      <div className="text-xs text-gray-500">{prof.email}</div>
                      <div className="text-[10px] text-gray-400">{prof.specialty || 'Civil & Structural Engineer'}</div>
                    </div>

                    <VerifiedBadge size="sm" showText={false} />
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => { setAssigningProjectId(null); setSelectedProfessionalId(0); }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignEngineer(assigningProjectId)}
                disabled={!selectedProfessionalId || processing}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {processing ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                <span>Assign Engineer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsManagementView;
