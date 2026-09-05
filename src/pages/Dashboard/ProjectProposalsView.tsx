/**
 * CamTrust - Project Proposals View
 * Project owner can see proposed engineers and accept/reject them.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Loader2,
  MapPin,
  Award
} from 'lucide-react';
import assignmentService from '../../services/assignmentService';

export interface Proposal {
  id: number;
  projectId: number;
  project: {
    id: number;
    title: string;
    location: string;
    status: string;
  };
  professional: {
    id: number;
    fullName: string;
    email: string;
    specialty?: string;
    verified: boolean;
  };
  status: string;
  assignedAt: string;
}

export const ProjectProposalsView: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const data = await assignmentService.getPendingAssignments();
      setProposals(data.assignments || []);
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await assignmentService.acceptAssignment(id);
      await loadProposals();
    } catch (err) {
      alert('Failed to accept proposal');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await assignmentService.rejectAssignment(id);
      await loadProposals();
    } catch (err) {
      alert('Failed to reject proposal');
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
            <Users className="text-orange-500" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Engineer Proposals
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review and select engineers proposed by the administrator for your projects.
          </p>
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <p className="text-gray-500 text-sm">No pending proposals</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-gray-900">{proposal.project?.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin size={12} className="text-gray-400" />
                      {proposal.project?.location}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    proposal.project?.status === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    proposal.project?.status === 'Rejected' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {proposal.project?.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={14} className="text-orange-500" />
                    <span className="text-xs font-bold text-gray-700">Proposed Engineer</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{proposal.professional?.fullName}</div>
                  <div className="text-xs text-gray-500">{proposal.professional?.email}</div>
                  {proposal.professional?.specialty && (
                    <div className="text-[10px] text-gray-400 mt-1">{proposal.professional.specialty}</div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleReject(proposal.id)}
                  className="px-3 py-1.5 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-semibold transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAccept(proposal.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                >
                  Accept Engineer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectProposalsView;
