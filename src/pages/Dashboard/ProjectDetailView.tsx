/**
 * CamTrust - Project Detail View
 * Real database-backed project detail with milestones, reports, and documents.
 */

import React, { useState, useEffect } from 'react';
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
  PieChart,
  Loader2
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import projectService from '../../services/projectService';
import milestoneService from '../../services/milestoneService';
import reportService from '../../services/reportService';
import documentService from '../../services/documentService';
import { joinProjectRoom, leaveProjectRoom } from '../../services/socket';
import { useCurrency } from '../../context/CurrencyContext';

export interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
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
  ownerId: number;
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
  professionalId: number;
  summary: string;
  generatedAt: string;
}

export interface Document {
  id: number;
  projectId: number;
  fileName: string;
  fileUrl: string;
  category: string;
  uploadedAt: string;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
  onBack,
  onNavigateTab,
}) => {
  const { user } = useAuth();
  const { convert } = useCurrency();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'milestones' | 'reports' | 'documents'>('overview');

  useEffect(() => {
    loadProjectData();

    return () => {
      leaveProjectRoom(projectId);
    };
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      joinProjectRoom(projectId);
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, milestonesData, reportsData, documentsData] = await Promise.all([
        projectService.getProjectById(projectId),
        milestoneService.getMilestones(projectId),
        reportService.getProjectReports(projectId),
        documentService.getProjectDocuments(projectId),
      ]);
      setProject(projectData.project);
      setMilestones(milestonesData.milestones || []);
      setReports(reportsData.reports || []);
      setDocuments(documentsData.documents || []);
    } catch (err: any) {
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-orange-50 text-orange-700 border-orange-200';
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

  if (!project) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
        <p className="text-gray-500">Project not found</p>
        <button onClick={onBack} className="mt-4 text-orange-600 font-semibold">Go Back</button>
      </div>
    );
  }

  const avgProgress = milestones.length > 0
    ? Math.round(milestones.reduce((acc, m) => acc + (m.completionRate || 0), 0) / milestones.length)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge(project.status)}`}>
                {project.status}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {project.title}
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <MapPin size={13} className="text-gray-400" />
              <span>{project.location}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-gray-100/80 p-1.5 rounded-2xl overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Building },
            { id: 'milestones', label: 'Milestones', icon: Layers },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'documents', label: 'Documents', icon: FileText },
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

      {/* Overview */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4">Project Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Start Date</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Budget</div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-600 mt-1">
                    {convert(Number(project.budget))}
                  </div>
                </div>
                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Progress</div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900 mt-1">{avgProgress}%</div>
                </div>
                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-100 col-span-2 sm:col-span-3">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Description</div>
                  <div className="text-xs sm:text-sm text-gray-700 mt-1">{project.description || 'No description'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Milestones</span>
                  <span className="font-bold text-gray-900">{milestones.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reports</span>
                  <span className="font-bold text-gray-900">{reports.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Documents</span>
                  <span className="font-bold text-gray-900">{documents.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones */}
      {activeSubTab === 'milestones' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Milestones</h2>
          {milestones.length === 0 ? (
            <p className="text-gray-500 text-sm">No milestones yet</p>
          ) : (
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{m.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {m.plannedDate ? new Date(m.plannedDate).toLocaleDateString() : 'No date'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-700">{m.completionRate}%</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge(m.status)}`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports */}
      {activeSubTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Progress Reports</h2>
          {reports.length === 0 ? (
            <p className="text-gray-500 text-sm">No reports yet</p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="text-sm font-bold text-gray-900">{r.summary.slice(0, 100)}...</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(r.generatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Documents */}
      {activeSubTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Documents</h2>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-sm">No documents uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {documents.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{d.fileName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{d.category} • {new Date(d.uploadedAt).toLocaleDateString()}</div>
                  </div>
                  <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-orange-600 hover:text-orange-700">
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectDetailView;
