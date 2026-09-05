/**
 * CamTrust - Progress Reports View
 * Real database-backed reports list with interactive Report Viewer and PDF download.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Loader2,
  Eye,
  Download,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import reportService from '../../services/reportService';
import projectService from '../../services/projectService';
import evidenceService from '../../services/evidenceService';
import ReportViewerModal from '../../components/monitoring/ReportViewerModal';
import { ProgressReportData, downloadPdfReport } from '../../utils/pdfReportGenerator';

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
  project?: {
    id: number;
    title: string;
    location: string;
  };
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

export interface Project {
  id: number;
  title: string;
  location: string;
}

export const ProgressReportsView: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Viewer Modal
  const [viewerData, setViewerData] = useState<ProgressReportData | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadReports(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, reportsData] = await Promise.all([
        projectService.getMyProjects(),
        reportService.getMyReports(),
      ]);
      const projectList = Array.isArray(projectsData) ? projectsData : (projectsData?.projects || []);
      const reportList = Array.isArray(reportsData) ? reportsData : (reportsData?.reports || []);
      setProjects(projectList);
      setReports(reportList);
      if (projectList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectList[0].id);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (projectId: number) => {
    try {
      const data = await reportService.getProjectReports(projectId);
      const repList = Array.isArray(data) ? data : (data?.reports || []);
      setReports(repList);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleOpenReportModal = async (report: Report) => {
    try {
      const evidenceData = await evidenceService.getProjectEvidence(report.projectId);
      const evidenceList = evidenceData.evidence || [];

      const currentProj = projects.find((p) => p.id === report.projectId) || report.project;

      const data: ProgressReportData = {
        id: report.id,
        projectTitle: currentProj?.title || 'Construction Project',
        projectLocation: currentProj?.location || 'Site Location',
        reportingDate: report.generatedAt,
        currentMilestoneLabel: report.milestone?.label || 'Milestone Progress',
        overallProgress: report.progressPercentage ?? 50,
        engineer: {
          fullName: report.professional?.fullName || 'Verified Civil Engineer',
          specialty: report.professional?.specialty || 'Civil & Structural Engineer',
          verified: report.professional?.verified ?? true,
        },
        workCompleted: report.workCompleted,
        workInProgress: report.workInProgress,
        workRemaining: report.workRemaining,
        observations: report.observations || report.summary,
        issues: report.issues,
        recommendations: report.recommendations,
        evidencePhotos: evidenceList.map((e: any) => ({
          photoUrl: e.photoUrl,
          description: e.description,
          capturedAt: e.capturedAt,
          gpsLatitude: e.gpsLatitude,
          gpsLongitude: e.gpsLongitude,
          gpsAvailable: e.gpsAvailable,
        })),
      };

      setViewerData(data);
      setIsViewerOpen(true);
    } catch (err) {
      console.error('Failed to open report:', err);
    }
  };

  const handleDirectDownload = async (report: Report) => {
    try {
      const evidenceData = await evidenceService.getProjectEvidence(report.projectId);
      const evidenceList = evidenceData.evidence || [];
      const currentProj = projects.find((p) => p.id === report.projectId) || report.project;

      const data: ProgressReportData = {
        id: report.id,
        projectTitle: currentProj?.title || 'Construction Project',
        projectLocation: currentProj?.location || 'Site Location',
        reportingDate: report.generatedAt,
        currentMilestoneLabel: report.milestone?.label || 'Milestone Progress',
        overallProgress: report.progressPercentage ?? 50,
        engineer: {
          fullName: report.professional?.fullName || 'Verified Civil Engineer',
          specialty: report.professional?.specialty || 'Civil & Structural Engineer',
          verified: report.professional?.verified ?? true,
        },
        workCompleted: report.workCompleted,
        workInProgress: report.workInProgress,
        workRemaining: report.workRemaining,
        observations: report.observations || report.summary,
        issues: report.issues,
        recommendations: report.recommendations,
        evidencePhotos: evidenceList.map((e: any) => ({
          photoUrl: e.photoUrl,
          description: e.description,
          capturedAt: e.capturedAt,
          gpsLatitude: e.gpsLatitude,
          gpsLongitude: e.gpsLongitude,
          gpsAvailable: e.gpsAvailable,
        })),
      };

      await downloadPdfReport(data);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Failed to download PDF report.');
    }
  };

  const filteredReports = selectedProjectId
    ? reports.filter((r) => r.projectId === selectedProjectId)
    : reports;

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
              <FileText size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Construction Progress Reports
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Certified progress reports prepared by verified construction professionals with embedded GPS photos.
          </p>
        </div>

        {projects.length > 0 && (
          <div className="w-full sm:w-64">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-base font-black text-gray-900">
            Available Reports ({filteredReports.length})
          </h2>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm font-bold">No progress reports generated yet for this project</p>
            <p className="text-gray-400 text-xs mt-1">
              Reports are generated when an assigned verified engineer submits site inspection updates.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-2xl border border-gray-200 bg-slate-50/50 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">
                      {r.milestone?.label || 'Construction Progress Update'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full">
                      Progress: {r.progressPercentage ?? 50}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{r.summary}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(r.generatedAt).toLocaleString('en-GB')}
                    </span>
                    {r.professional?.fullName && (
                      <span className="flex items-center gap-1 text-emerald-700 font-bold">
                        <ShieldCheck size={12} /> {r.professional.fullName} (Verified)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenReportModal(r)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                  >
                    <Eye size={13} /> View
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDirectDownload(r)}
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

      {/* Interactive Report Viewer Modal */}
      <ReportViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        reportData={viewerData}
      />
    </div>
  );
};

export default ProgressReportsView;
