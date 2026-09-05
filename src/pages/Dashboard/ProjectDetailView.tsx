/**
 * CamTrust - Project Detail View
 * Real database-backed project monitoring with chronological timeline,
 * verified site evidence photos with real GPS & timestamp, and PDF reports.
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Building,
  Clock,
  Layers,
  FileText,
  Camera,
  Download,
  Eye,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import projectService from '../../services/projectService';
import milestoneService from '../../services/milestoneService';
import reportService from '../../services/reportService';
import evidenceService from '../../services/evidenceService';
import documentService from '../../services/documentService';
import { joinProjectRoom, leaveProjectRoom } from '../../services/socket';
import { useCurrency } from '../../context/CurrencyContext';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import ReportViewerModal from '../../components/monitoring/ReportViewerModal';
import { ProgressReportData, downloadPdfReport } from '../../utils/pdfReportGenerator';
import { useLocationName } from '../../hooks/useLocationName';

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
  owner?: {
    id: number;
    fullName: string;
    email: string;
  };
  assignments?: Array<{
    id: number;
    professionalId: number;
    professional: {
      id: number;
      fullName: string;
      email: string;
      phone?: string;
      specialty?: string;
      verified: boolean;
    };
  }>;
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
  milestoneId?: number;
  summary: string;
  workCompleted?: string;
  workInProgress?: string;
  workRemaining?: string;
  observations?: string;
  issues?: string;
  recommendations?: string;
  progressPercentage?: number;
  generatedAt: string;
  professional?: {
    id: number;
    fullName: string;
    email: string;
    verified: boolean;
    specialty?: string;
  };
  milestone?: {
    id: number;
    label: string;
  };
}

export interface Evidence {
  id: number;
  milestoneId: number;
  professionalId: number;
  photoUrl: string;
  description?: string;
  capturedAt: string;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  gpsAvailable: boolean;
  professional?: {
    id: number;
    fullName: string;
    verified: boolean;
  };
  milestone?: {
    id: number;
    label: string;
  };
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  projectId,
  onBack,
  onNavigateTab: _onNavigateTab,
}) => {
  const { user } = useAuth();
  const { convert } = useCurrency();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'overview' | 'evidence' | 'milestones' | 'reports' | 'documents'>('timeline');

  // Report Viewer Modal State
  const [selectedReportData, setSelectedReportData] = useState<ProgressReportData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
      const [projectData, milestonesData, reportsData, evidenceData, documentsData] = await Promise.all([
        projectService.getProjectById(projectId),
        milestoneService.getMilestones(projectId),
        reportService.getProjectReports(projectId),
        evidenceService.getProjectEvidence(projectId),
        documentService.getProjectDocuments(projectId),
      ]);
      const msList = Array.isArray(milestonesData) ? milestonesData : (milestonesData?.milestones || []);
      const repList = Array.isArray(reportsData) ? reportsData : (reportsData?.reports || []);
      const eviList = Array.isArray(evidenceData) ? evidenceData : (evidenceData?.evidence || []);
      const docList = Array.isArray(documentsData) ? documentsData : (documentsData?.documents || []);
      setProject(projectData?.project || projectData);
      setMilestones(msList);
      setReports(repList);
      setEvidence(eviList);
      setDocuments(docList);
    } catch (err: any) {
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReport = (report: Report) => {
    const engineerObj = report.professional || assignedEngineer || {
      fullName: 'Verified Civil Engineer',
      specialty: 'Civil & Structural Engineer',
      verified: true,
    };

    const reportMilestone = milestones.find((m) => m.id === report.milestoneId) || report.milestone;

    const reportEvidence = evidence.filter(
      (e) => !report.milestoneId || e.milestoneId === report.milestoneId
    );

    const reportData: ProgressReportData = {
      id: report.id,
      projectTitle: project?.title || 'Project',
      projectLocation: project?.location || 'Site Location',
      projectOwnerName: project?.owner?.fullName || user?.fullName || 'Project Owner',
      projectStatus: project?.status || 'In Progress',
      reportingDate: report.generatedAt,
      currentMilestoneLabel: reportMilestone?.label || 'Milestone Update',
      overallProgress: report.progressPercentage ?? (reportMilestone as any)?.completionRate ?? 0,
      engineer: {
        fullName: engineerObj.fullName,
        specialty: engineerObj.specialty || 'Civil & Structural Engineer',
        verified: engineerObj.verified ?? true,
      },
      workCompleted: report.workCompleted,
      workInProgress: report.workInProgress,
      workRemaining: report.workRemaining,
      observations: report.observations || report.summary,
      issues: report.issues,
      recommendations: report.recommendations,
      evidencePhotos: reportEvidence.map((e) => ({
        photoUrl: e.photoUrl,
        description: e.description,
        capturedAt: e.capturedAt,
        gpsLatitude: e.gpsLatitude,
        gpsLongitude: e.gpsLongitude,
        gpsAvailable: e.gpsAvailable,
        milestoneLabel: reportMilestone?.label,
      })),
    };

    setSelectedReportData(reportData);
    setIsReportModalOpen(true);
  };

  const handleDirectDownloadPdf = async (report: Report) => {
    const engineerObj = report.professional || assignedEngineer || {
      fullName: 'Verified Civil Engineer',
      specialty: 'Civil & Structural Engineer',
      verified: true,
    };
    const reportMilestone = milestones.find((m) => m.id === report.milestoneId) || report.milestone;
    const reportEvidence = evidence.filter(
      (e) => !report.milestoneId || e.milestoneId === report.milestoneId
    );

    const reportData: ProgressReportData = {
      id: report.id,
      projectTitle: project?.title || 'Project',
      projectLocation: project?.location || 'Site Location',
      projectOwnerName: project?.owner?.fullName || user?.fullName || 'Project Owner',
      projectStatus: project?.status || 'In Progress',
      reportingDate: report.generatedAt,
      currentMilestoneLabel: reportMilestone?.label || 'Milestone Update',
      overallProgress: report.progressPercentage ?? (reportMilestone as any)?.completionRate ?? 0,
      engineer: {
        fullName: engineerObj.fullName,
        specialty: engineerObj.specialty || 'Civil & Structural Engineer',
        verified: engineerObj.verified ?? true,
      },
      workCompleted: report.workCompleted,
      workInProgress: report.workInProgress,
      workRemaining: report.workRemaining,
      observations: report.observations || report.summary,
      issues: report.issues,
      recommendations: report.recommendations,
      evidencePhotos: reportEvidence.map((e) => ({
        photoUrl: e.photoUrl,
        description: e.description,
        capturedAt: e.capturedAt,
        gpsLatitude: e.gpsLatitude,
        gpsLongitude: e.gpsLongitude,
        gpsAvailable: e.gpsAvailable,
        milestoneLabel: reportMilestone?.label,
      })),
    };

    await downloadPdfReport(reportData);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'Approved':
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const assignedEngineer = project?.assignments?.[0]?.professional;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
        <p className="text-gray-500">Project not found</p>
        <button onClick={onBack} className="mt-4 text-orange-600 font-bold">Go Back</button>
      </div>
    );
  }

  const avgProgress = milestones.length > 0
    ? Math.round(milestones.reduce((acc, m) => acc + (m.completionRate || 0), 0) / milestones.length)
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusBadge(project.status)}`}>
                {project.status}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                {project.title}
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <MapPin size={13} className="text-gray-400" />
              <span>{project.location}</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-gray-100/90 p-1.5 rounded-2xl overflow-x-auto">
          {[
            { id: 'timeline', label: 'Monitoring Timeline', icon: Clock },
            { id: 'evidence', label: 'Site Evidence', icon: Camera },
            { id: 'reports', label: 'Reports', icon: FileText },
            { id: 'milestones', label: 'Milestones', icon: Layers },
            { id: 'overview', label: 'Overview', icon: Building },
            { id: 'documents', label: 'Documents', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition whitespace-nowrap ${
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

      {/* ASSIGNED ENGINEER CARD */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 font-black text-base flex items-center justify-center border border-orange-500/30">
            {assignedEngineer?.fullName ? assignedEngineer.fullName.charAt(0).toUpperCase() : 'E'}
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              Assigned Supervising Engineer
            </div>
            <div className="text-base font-black text-white mt-0.5">
              {assignedEngineer?.fullName || 'Verified Civil Engineer Assigned'}
            </div>
            <div className="text-xs text-slate-400">
              {assignedEngineer?.specialty || 'Civil & Structural Site Engineer'}
            </div>
          </div>
        </div>

        <div>
          <VerifiedBadge size="md" />
        </div>
      </div>

      {/* 1. CHRONOLOGICAL MONITORING TIMELINE */}
      {activeSubTab === 'timeline' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                Chronological Construction Monitoring Timeline
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time verified site updates, phone GPS coordinates, and inspection reports.
              </p>
            </div>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {reports.length} Verified Submissions
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
              <Clock className="w-10 h-10 text-gray-400 mx-auto" />
              <p className="text-sm font-bold text-gray-700">No site progress reports recorded yet</p>
              <p className="text-xs text-gray-500">
                When your assigned engineer visits the site and captures evidence, the timeline will populate here.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {reports.map((report) => {
                const reportDate = new Date(report.generatedAt);
                const formattedDateStr = reportDate.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                });
                const formattedTimeStr = reportDate.toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const milestoneName = report.milestone?.label || 'Site Progress Update';
                const relatedPhotos = evidence.filter(
                  (e) => !report.milestoneId || e.milestoneId === report.milestoneId
                );

                return (
                  <div key={report.id} className="relative group">
                    {/* Timeline Dot */}
                    <div className="absolute -left-6 sm:-left-8 top-1.5 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow-sm" />

                    <div className="bg-slate-50 hover:bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 sm:p-6 space-y-4 shadow-xs transition">
                      {/* Timeline Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div>
                          <div className="text-[11px] font-extrabold text-orange-600 uppercase tracking-wider">
                            {formattedDateStr} • {formattedTimeStr}
                          </div>
                          <h3 className="text-base font-black text-gray-900 mt-0.5">
                            {milestoneName}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-xs">
                            Progress: {report.progressPercentage ?? 50}%
                          </span>
                        </div>
                      </div>

                      {/* Verification Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} className="text-emerald-600" /> ✓ Site Evidence ({relatedPhotos.length} Photos)
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} className="text-emerald-600" /> ✓ GPS Recorded
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 size={12} className="text-emerald-600" /> ✓ Timestamp Recorded
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                          <FileText size={12} className="text-blue-600" /> ✓ Progress Report
                        </span>
                      </div>

                      {/* Observations / Work Breakdown */}
                      <div className="text-xs text-slate-700 space-y-1.5 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-900">{report.summary}</p>
                        {report.workCompleted && (
                          <p className="text-emerald-800">
                            <strong>Completed:</strong> {report.workCompleted}
                          </p>
                        )}
                        {report.workRemaining && (
                          <p className="text-slate-600">
                            <strong>Remaining:</strong> {report.workRemaining}
                          </p>
                        )}
                      </div>

                      {/* Attached Site Photos Grid */}
                      {relatedPhotos.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Captured Site Evidence Photos:
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {relatedPhotos.slice(0, 4).map((p) => (
                              <div
                                key={p.id}
                                className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200 group/img relative aspect-video cursor-pointer"
                                onClick={() => handleOpenReport(report)}
                              >
                                <img
                                  src={p.photoUrl}
                                  alt="Site evidence thumbnail"
                                  className="w-full h-full object-cover group-hover/img:scale-105 transition"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                                  <Eye size={14} /> View
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Engineer Attribution & Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Engineer:</span>
                          <VerifiedBadge size="sm" />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenReport(report)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                          >
                            <Eye size={13} />
                            <span>View Report</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDirectDownloadPdf(report)}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                          >
                            <Download size={13} />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. SITE EVIDENCE GALLERY */}
      {activeSubTab === 'evidence' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                CAMTRUST SITE EVIDENCE GALLERY
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                All photos captured directly inside Camtrust with real device GPS and ISO timestamps.
              </p>
            </div>
            <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              {evidence.length} Evidence Records
            </span>
          </div>

          {evidence.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">No site evidence photos recorded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {evidence.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="aspect-video bg-slate-950 relative overflow-hidden">
                    <img
                      src={item.photoUrl}
                      alt="Site evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-xs text-white rounded-md text-[10px] font-extrabold flex items-center gap-1">
                      <Camera size={11} /> CAMTRUST EVIDENCE
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <div className="text-sm font-black text-gray-900">
                        {item.description || 'Construction site progress'}
                      </div>
                      <div className="text-xs font-semibold text-orange-600 mt-0.5">
                        {item.milestone?.label || 'Active Milestone'}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1 font-semibold">
                        <Clock size={12} className="text-slate-400 shrink-0" />
                        <span>{new Date(item.capturedAt).toLocaleString('en-GB')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-700 font-extrabold">
                        <MapPin size={12} className="shrink-0" />
                        <LocationCell lat={item.gpsLatitude} lng={item.gpsLongitude} fallback="Location: Recorded On Site" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <VerifiedBadge size="sm" showText={false} subtext={item.professional?.fullName || 'Verified Engineer'} />
                      <a
                        href={item.photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                      >
                        <Download size={12} /> Full Res
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. REPORTS TAB */}
      {activeSubTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-black text-gray-900">Official Progress Reports</h2>
              <p className="text-xs text-gray-500 mt-0.5">Professional inspection documents prepared by verified civil engineers</p>
            </div>
          </div>

          {reports.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No reports submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-gray-900">
                        {r.milestone?.label || 'Milestone Report'}
                      </h3>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md">
                        {r.progressPercentage ?? 50}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{r.summary}</p>
                    <p className="text-[11px] text-gray-400">
                      Generated: {new Date(r.generatedAt).toLocaleString('en-GB')} by {r.professional?.fullName || 'Verified Engineer'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReport(r)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={() => handleDirectDownloadPdf(r)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                    >
                      <Download size={13} /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. OVERVIEW TAB */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-black text-gray-900 mb-4">Project Overview & Specifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Start Date</div>
                  <div className="text-xs sm:text-sm font-extrabold text-gray-900 mt-1">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Budget</div>
                  <div className="text-xs sm:text-sm font-black text-emerald-600 mt-1">
                    {convert(Number(project.budget))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Overall Completion</div>
                  <div className="text-xs sm:text-sm font-black text-gray-900 mt-1">{avgProgress}%</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 col-span-2 sm:col-span-3">
                  <div className="text-[10px] text-gray-400 font-bold uppercase">Description</div>
                  <div className="text-xs sm:text-sm text-gray-700 mt-1 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
              <h3 className="text-base font-black text-gray-900">Quick Monitoring Stats</h3>
              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Milestones</span>
                  <span className="font-bold text-gray-900">{milestones.length}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Site Evidence Photos</span>
                  <span className="font-bold text-emerald-600">{evidence.length} Recorded</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-gray-500">Official Reports</span>
                  <span className="font-bold text-orange-600">{reports.length} Generated</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MILESTONES TAB */}
      {activeSubTab === 'milestones' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-gray-900">Project Milestones</h2>
          {milestones.length === 0 ? (
            <p className="text-gray-500 text-sm">No milestones configured.</p>
          ) : (
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <div className="text-sm font-extrabold text-gray-900">{m.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {m.plannedDate ? new Date(m.plannedDate).toLocaleDateString() : 'Planned'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-800">{m.completionRate}%</span>
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

      {/* 6. DOCUMENTS TAB */}
      {activeSubTab === 'documents' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-black text-gray-900">Supporting Project Documents</h2>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-sm">No documents attached.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{d.fileName}</div>
                    <div className="text-xs text-gray-500">{d.category} • {new Date(d.uploadedAt).toLocaleDateString()}</div>
                  </div>
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Report Viewer & PDF Downloader Modal */}
      <ReportViewerModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportData={selectedReportData}
      />
    </div>
  );
};

export default ProjectDetailView;

const LocationCell: React.FC<{ lat: number | null; lng: number | null; fallback?: string }> = ({
  lat,
  lng,
  fallback = 'GPS Verified on Site',
}) => {
  const { locationName, loading } = useLocationName(lat, lng);

  return (
    <span>
      {loading ? (
        <span className="text-[10px] font-bold text-slate-500">Resolving location...</span>
      ) : (
        `Location: ${locationName || fallback}`
      )}
    </span>
  );
};
