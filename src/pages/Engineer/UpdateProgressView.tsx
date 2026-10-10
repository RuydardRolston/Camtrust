/**
 * CamTrust - Engineer Update Progress & In-App Evidence View
 * Allows verified civil engineers to update milestones, capture in-app photos with real GPS,
 * and submit detailed construction progress reports.
 */

import React, { useState, useEffect } from 'react';
import {
  HardHat,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Camera,
  Loader2,
  AlertCircle,
  Eye,
  FileDown,
  Download,
  Send,
  Users,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import assignmentService from '../../services/assignmentService';
import milestoneService from '../../services/milestoneService';
import reportService from '../../services/reportService';
import evidenceService from '../../services/evidenceService';
import documentService from '../../services/documentService';
import CameraEvidenceModal from '../../components/monitoring/CameraEvidenceModal';
import ReportViewerModal from '../../components/monitoring/ReportViewerModal';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import {
  ProgressReportData,
  downloadEvidencePhotoPdf,
  downloadPdfReport,
  generateEvidencePhotoPdfBlob,
  generatePdfReportBlob,
} from '../../utils/pdfReportGenerator';

export interface Project {
  id: number;
  title: string;
  location: string;
  budget: string;
  status: string;
  startDate: string;
}

export interface Milestone {
  id: number;
  projectId: number;
  label: string;
  plannedDate: string;
  completionRate: number;
  status: string;
}

export const UpdateProgressView: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number>(0);

  // Detailed Progress State
  const [progress, setProgress] = useState(0);
  const [workCompleted, setWorkCompleted] = useState('');
  const [workInProgress, setWorkInProgress] = useState('');
  const [workRemaining, setWorkRemaining] = useState('');
  const [observations, setObservations] = useState('');
  const [issues, setIssues] = useState('');
  const [recommendations, setRecommendations] = useState('');

  // Site Evidence state
  const [recordedEvidence, setRecordedEvidence] = useState<any[]>([]);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [downloadingEvidenceId, setDownloadingEvidenceId] = useState<number | string | null>(null);
  const [sendingEvidenceId, setSendingEvidenceId] = useState<number | string | null>(null);
  const [sendingAllPdf, setSendingAllPdf] = useState(false);
  const [autoSendPdfToOwner, setAutoSendPdfToOwner] = useState(true);

  // Report Preview Modal state
  const [previewReportData, setPreviewReportData] = useState<ProgressReportData | null>(null);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadMilestones(selectedProjectId);
      loadProjectEvidence(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const assignments = await assignmentService.getMyAssignments();
      const projectList = (assignments.assignments || []).map((a: any) => a.project).filter(Boolean);
      setProjects(projectList);

      if (projectList.length > 0) {
        setSelectedProjectId(projectList[0].id);
      }
    } catch (err) {
      console.error('Failed to load assigned projects:', err);
      setErrorMessage('Failed to load assigned projects. Please verify your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async (projectId: number) => {
    try {
      const data = await milestoneService.getMilestones(projectId);
      const ms = data.milestones || [];
      setMilestones(ms);
      if (ms.length > 0) {
        setSelectedMilestoneId(ms[0].id);
        setProgress(ms[0].completionRate || 0);
      }
    } catch (err) {
      console.error('Failed to load milestones:', err);
    }
  };

  const loadProjectEvidence = async (projectId: number) => {
    try {
      const data = await evidenceService.getProjectEvidence(projectId);
      setRecordedEvidence(data.evidence || []);
    } catch (err) {
      console.error('Failed to load project evidence:', err);
    }
  };

  const handleMilestoneChange = (milestoneId: number) => {
    setSelectedMilestoneId(milestoneId);
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (milestone) {
      setProgress(milestone.completionRate || 0);
    }
  };

  const handleEvidenceCaptured = (newEvidence: any) => {
    setRecordedEvidence((prev) => [newEvidence, ...prev]);
  };

  const handlePreviewCurrentReport = () => {
    const selectedProject = projects.find((p) => p.id === selectedProjectId);
    const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);

    const reportData: ProgressReportData = {
      projectTitle: selectedProject?.title || 'Project',
      projectLocation: selectedProject?.location || 'Site Location',
      projectStatus: selectedProject?.status || 'In Progress',
      reportingDate: new Date().toISOString(),
      currentMilestoneLabel: selectedMilestone?.label || 'Milestone',
      overallProgress: progress,
      engineer: {
        fullName: user?.fullName || 'Verified Civil Engineer',
        specialty: (user as any)?.specialty || 'Lead Construction Engineer',
        verified: true,
      },
      workCompleted: workCompleted || 'Completed excavation, reinforcement tying, and concrete curing.',
      workInProgress: workInProgress || 'Formwork assembly and column alignment.',
      workRemaining: workRemaining || 'Superstructure beam casting and quality tests.',
      observations: observations || 'All materials comply with engineering standards and slump tests passed.',
      issues: issues || undefined,
      recommendations: recommendations || undefined,
      evidencePhotos: recordedEvidence.map((e) => ({
        photoUrl: e.photoUrl,
        description: e.description,
        capturedAt: e.capturedAt,
        gpsLatitude: e.gpsLatitude,
        gpsLongitude: e.gpsLongitude,
        gpsAvailable: e.gpsAvailable,
        milestoneLabel: selectedMilestone?.label,
      })),
    };

    setPreviewReportData(reportData);
    setIsViewerModalOpen(true);
  };

  const handleDownloadSingleEvidencePdf = async (item: any) => {
    try {
      setDownloadingEvidenceId(item.id || 'single');
      const milestone = milestones.find((m) => m.id === item.milestoneId || m.id === selectedMilestoneId);
      await downloadEvidencePhotoPdf({
        projectTitle: currentProject?.title || 'Construction Site Evidence',
        projectLocation: currentProject?.location || 'Site Location',
        milestoneLabel: milestone?.label || 'Milestone Inspection',
        photoUrl: item.photoUrl,
        description: item.description || 'Verified site progress evidence photo',
        capturedAt: item.capturedAt || item.createdAt || new Date().toISOString(),
        gpsLatitude: item.gpsLatitude,
        gpsLongitude: item.gpsLongitude,
        gpsAvailable: item.gpsAvailable !== false,
        engineerName: user?.fullName || 'Verified Civil Engineer',
        engineerSpecialty: (user as any)?.specialty || 'Lead Construction Engineer',
      });
    } catch (err: any) {
      console.error('Failed to download single evidence PDF:', err);
      alert('Failed to generate PDF: ' + (err.message || 'Please try again'));
    } finally {
      setDownloadingEvidenceId(null);
    }
  };

  const handleSendSingleEvidencePdfToOwner = async (item: any, target: 'property_owner' | 'administrator' | 'both' = 'property_owner') => {
    try {
      setSendingEvidenceId(item.id || 'single');
      const milestone = milestones.find((m) => m.id === item.milestoneId || m.id === selectedMilestoneId);
      const { blob, fileName } = await generateEvidencePhotoPdfBlob({
        projectTitle: currentProject?.title || 'Construction Site Evidence',
        projectLocation: currentProject?.location || 'Site Location',
        milestoneLabel: milestone?.label || 'Milestone Inspection',
        photoUrl: item.photoUrl,
        description: item.description || 'Verified site progress evidence photo',
        capturedAt: item.capturedAt || item.createdAt || new Date().toISOString(),
        gpsLatitude: item.gpsLatitude,
        gpsLongitude: item.gpsLongitude,
        gpsAvailable: item.gpsAvailable !== false,
        engineerName: user?.fullName || 'Verified Civil Engineer',
        engineerSpecialty: (user as any)?.specialty || 'Lead Construction Engineer',
      });

      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('document', pdfFile);
      formData.append('projectId', String(selectedProjectId));
      formData.append('category', 'Reports');
      formData.append('targetRecipient', target);
      formData.append(
        'notes',
        `Official Accredited Site Evidence Certificate for milestone "${milestone?.label || 'Inspection'}" verified by Eng. ${user?.fullName || 'Civil Engineer'} with live GPS telemetry.`
      );

      await documentService.uploadDocument(formData);
      const label =
        target === 'property_owner'
          ? 'Project Owner'
          : target === 'administrator'
          ? 'Administrator'
          : 'Project Owner & Administrator';
      setSuccessMessage(`Site Evidence Certificate successfully delivered to ${label}!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to send evidence PDF:', err);
      alert('Failed to transmit PDF: ' + (err.message || 'Please try again'));
    } finally {
      setSendingEvidenceId(null);
    }
  };

  const handleDownloadAllEvidencePdf = async () => {
    if (recordedEvidence.length === 0) return;
    try {
      const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);
      const reportData: ProgressReportData = {
        projectTitle: currentProject?.title || 'Construction Project Evidence Audit',
        projectLocation: currentProject?.location || 'Site Location',
        projectStatus: currentProject?.status || 'In Progress',
        reportingDate: new Date().toISOString(),
        currentMilestoneLabel: selectedMilestone?.label || 'All Milestones',
        overallProgress: progress,
        engineer: {
          fullName: user?.fullName || 'Verified Civil Engineer',
          specialty: (user as any)?.specialty || 'Lead Construction Engineer',
          verified: true,
        },
        workCompleted: `Compilation of ${recordedEvidence.length} certified on-site photographic evidence records with real-time GPS telemetry.`,
        workInProgress: workInProgress || 'Active construction monitoring.',
        observations: 'All evidence photos verified and stamped with cryptographic GPS coordinates and tamper-proof EXIF signatures.',
        evidencePhotos: recordedEvidence.map((e) => ({
          photoUrl: e.photoUrl,
          description: e.description,
          capturedAt: e.capturedAt,
          gpsLatitude: e.gpsLatitude,
          gpsLongitude: e.gpsLongitude,
          gpsAvailable: e.gpsAvailable,
          milestoneLabel: milestones.find((m) => m.id === e.milestoneId)?.label || selectedMilestone?.label,
        })),
      };
      await downloadPdfReport(reportData);
    } catch (err: any) {
      console.error('Failed to download all evidence PDF:', err);
      alert('Failed to generate all evidence PDF: ' + (err.message || 'Please try again'));
    }
  };

  const handleSendAllEvidencePdfToOwner = async (target: 'property_owner' | 'administrator' | 'both' = 'property_owner') => {
    if (recordedEvidence.length === 0) {
      alert('No evidence photos recorded yet for this project.');
      return;
    }
    try {
      setSendingAllPdf(true);
      const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);
      const reportData: ProgressReportData = {
        projectTitle: currentProject?.title || 'Construction Project Evidence Audit',
        projectLocation: currentProject?.location || 'Site Location',
        projectStatus: currentProject?.status || 'In Progress',
        reportingDate: new Date().toISOString(),
        currentMilestoneLabel: selectedMilestone?.label || 'All Milestones',
        overallProgress: progress,
        engineer: {
          fullName: user?.fullName || 'Verified Civil Engineer',
          specialty: (user as any)?.specialty || 'Lead Construction Engineer',
          verified: true,
        },
        workCompleted: `Compilation of ${recordedEvidence.length} certified on-site photographic evidence records with real-time GPS telemetry.`,
        workInProgress: workInProgress || 'Active construction monitoring.',
        observations: 'All evidence photos verified and stamped with cryptographic GPS coordinates and tamper-proof EXIF signatures.',
        evidencePhotos: recordedEvidence.map((e) => ({
          photoUrl: e.photoUrl,
          description: e.description,
          capturedAt: e.capturedAt,
          gpsLatitude: e.gpsLatitude,
          gpsLongitude: e.gpsLongitude,
          gpsAvailable: e.gpsAvailable,
          milestoneLabel: milestones.find((m) => m.id === e.milestoneId)?.label || selectedMilestone?.label,
        })),
      };

      const { blob, fileName } = await generatePdfReportBlob(reportData);
      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('document', pdfFile);
      formData.append('projectId', String(selectedProjectId));
      formData.append('category', 'Reports');
      formData.append('targetRecipient', target);
      formData.append(
        'notes',
        `Official Certified Site Evidence Audit Dossier (${recordedEvidence.length} stamped inspection photos) delivered by Eng. ${user?.fullName || 'Civil Engineer'}.`
      );

      await documentService.uploadDocument(formData);
      const label =
        target === 'property_owner'
          ? 'Project Owner'
          : target === 'administrator'
          ? 'Administrator'
          : 'Project Owner & Administrator';
      setSuccessMessage(`Site Evidence Audit PDF Dossier delivered directly to ${label}!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to send all evidence PDF:', err);
      alert('Failed to transmit PDF: ' + (err.message || 'Please try again'));
    } finally {
      setSendingAllPdf(false);
    }
  };

  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestoneId || !selectedProjectId) {
      alert('Please select an assigned project and milestone.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);
      const summaryText = `${selectedMilestone?.label || 'Milestone'} reached ${progress}% completion. ${observations || workCompleted || ''}`.trim();

      // Submit comprehensive progress report
      await reportService.submitReport({
        projectId: String(selectedProjectId),
        milestoneId: selectedMilestoneId,
        summary: summaryText,
        workCompleted,
        workInProgress,
        workRemaining,
        observations,
        issues,
        recommendations,
        progressPercentage: progress,
      });

      // Update milestone
      await milestoneService.updateMilestone(selectedMilestoneId, {
        completionRate: progress,
        status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Pending',
      });

      // Automatically dispatch certified PDF report to Project Owner if selected
      if (autoSendPdfToOwner) {
        try {
          const reportData: ProgressReportData = {
            projectTitle: currentProject?.title || 'Construction Project',
            projectLocation: currentProject?.location || 'Site Location',
            projectStatus: progress >= 100 ? 'Completed' : 'In Progress',
            reportingDate: new Date().toISOString(),
            currentMilestoneLabel: selectedMilestone?.label || 'Milestone Report',
            overallProgress: progress,
            engineer: {
              fullName: user?.fullName || 'Verified Civil Engineer',
              specialty: (user as any)?.specialty || 'Lead Construction Engineer',
              verified: true,
            },
            workCompleted: workCompleted || summaryText,
            workInProgress: workInProgress || undefined,
            workRemaining: workRemaining || undefined,
            observations: observations || undefined,
            issues: issues || undefined,
            recommendations: recommendations || undefined,
            evidencePhotos: recordedEvidence.map((e) => ({
              photoUrl: e.photoUrl,
              description: e.description,
              capturedAt: e.capturedAt,
              gpsLatitude: e.gpsLatitude,
              gpsLongitude: e.gpsLongitude,
              gpsAvailable: e.gpsAvailable,
              milestoneLabel: milestones.find((m) => m.id === e.milestoneId)?.label || selectedMilestone?.label,
            })),
          };

          const { blob, fileName } = await generatePdfReportBlob(reportData);
          const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
          const formData = new FormData();
          formData.append('document', pdfFile);
          formData.append('projectId', String(selectedProjectId));
          formData.append('category', 'Reports');
          formData.append('targetRecipient', 'property_owner');
          formData.append(
            'notes',
            `Official Certified Progress & Site Evidence Report for milestone "${selectedMilestone?.label || 'Milestone'}" (Progress: ${progress}%) delivered directly to Project Owner.`
          );

          await documentService.uploadDocument(formData);
        } catch (pdfErr) {
          console.warn('Auto-generation of PDF for owner warning:', pdfErr);
        }
      }

      setSuccessMessage(
        autoSendPdfToOwner
          ? 'Progress updated and certified PDF report delivered directly to Project Owner!'
          : 'Progress update and official construction report submitted successfully!'
      );
      setTimeout(() => setSuccessMessage(null), 5000);

      // Refresh milestones
      await loadMilestones(selectedProjectId);
    } catch (err: any) {
      console.error('Failed to submit progress:', err);
      setErrorMessage(err.message || 'Failed to submit progress update.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-4 shadow-sm max-w-xl mx-auto">
        <HardHat className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">No Projects Assigned Yet</h2>
        <p className="text-sm text-gray-500">
          You must be assigned to an approved project by the Administrator before submitting progress and site evidence.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <HardHat size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Site Progress & Evidence Update
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Capture verified in-app site photos with real GPS, update milestones, and generate official reports.
          </p>
        </div>

        <VerifiedBadge size="md" />
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={handlePreviewCurrentReport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <FileDown size={14} />
            <span>Download Official PDF Report</span>
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm font-bold flex items-center gap-3 animate-fadeIn">
          <AlertCircle size={20} className="text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmitProgress} className="space-y-6">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Project & Milestone Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Assigned Construction Project
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Construction Milestone
              </label>
              <select
                value={selectedMilestoneId}
                onChange={(e) => handleMilestoneChange(Number(e.target.value))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} ({m.completionRate}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Milestone Progress Percentage Slider */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                Milestone Progress Completion
              </label>
              <span className="text-2xl font-black text-emerald-600 bg-white px-4 py-1 rounded-xl shadow-xs border border-gray-200">
                {progress}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />

            <div className="flex justify-between text-[11px] text-gray-500 font-bold">
              <span>0% (Not Started)</span>
              <span>50% (Underway)</span>
              <span>100% (Completed Milestone)</span>
            </div>
          </div>

          {/* IN-APP CAMERA & GPS SITE EVIDENCE CAPTURE */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Camera size={13} /> Core Verification Protocol
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  Direct In-App Camera & Real GPS Capture
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Photos must be captured directly on-site inside Camtrust to record phone GPS coordinates and certified timestamp.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className="px-5 py-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Camera size={18} />
                <span>📷 CAPTURE SITE EVIDENCE</span>
              </button>
            </div>

            {/* Recorded Evidence Preview List */}
            {recordedEvidence.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Recorded Evidence for this Project ({recordedEvidence.length})
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendAllEvidencePdfToOwner('property_owner')}
                      disabled={sendingAllPdf}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                      title="Deliver certified evidence compilation dossier directly to Project Owner"
                    >
                      {sendingAllPdf ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Send size={13} />
                      )}
                      <span>Deliver Evidence PDF to Owner</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadAllEvidencePdf}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      title="Export all evidence photos as a certified multi-page PDF"
                    >
                      <FileDown size={13} />
                      <span>Export Local PDF</span>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {recordedEvidence.slice(0, 8).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="rounded-xl overflow-hidden bg-slate-800 border border-slate-700 group relative flex flex-col justify-between"
                    >
                      <div className="aspect-video bg-black flex items-center justify-center overflow-hidden relative">
                        <img
                          src={item.photoUrl}
                          alt="Evidence"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <button
                          type="button"
                          onClick={() => handleDownloadSingleEvidencePdf(item)}
                          disabled={downloadingEvidenceId === (item.id || idx)}
                          className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold p-2 cursor-pointer"
                          title="Download certified PDF report for this evidence"
                        >
                          {downloadingEvidenceId === (item.id || idx) ? (
                            <Loader2 size={16} className="animate-spin text-orange-400" />
                          ) : (
                            <>
                              <Download size={14} className="text-orange-400" />
                              <span>Download PDF</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-2 text-[10px] space-y-1.5">
                        <div className="font-bold text-white truncate">{item.description || 'Site photo'}</div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                            <MapPin size={9} /> GPS ✓
                          </span>
                          <span className="text-slate-400 text-[9px]">
                            {item.capturedAt ? new Date(item.capturedAt).toLocaleDateString('en-GB') : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-700/60">
                          <button
                            type="button"
                            onClick={() => handleSendSingleEvidencePdfToOwner(item, 'property_owner')}
                            disabled={sendingEvidenceId === (item.id || idx)}
                            className="px-2 py-1 bg-orange-500/20 hover:bg-orange-500/40 text-orange-400 rounded-md font-extrabold text-[10px] flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                            title="Deliver certified PDF certificate directly to Project Owner"
                          >
                            {sendingEvidenceId === (item.id || idx) ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <Send size={10} />
                            )}
                            <span>Send to Owner</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleEvidencePdf(item)}
                            className="text-slate-400 hover:text-white p-1 cursor-pointer"
                            title="Download PDF"
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Work Breakdown Inputs */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider border-l-3 border-emerald-500 pl-2">
              Progress & Work Details Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5">
                  ✓ Work Completed
                </label>
                <textarea
                  rows={3}
                  value={workCompleted}
                  onChange={(e) => setWorkCompleted(e.target.value)}
                  placeholder="e.g., Completed footing concrete pour and rebar grid tying..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">
                  ⏳ Work In Progress
                </label>
                <textarea
                  rows={3}
                  value={workInProgress}
                  onChange={(e) => setWorkInProgress(e.target.value)}
                  placeholder="e.g., Installing formwork for ground floor columns and conduits..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5">
                  📋 Work Remaining on Milestone
                </label>
                <textarea
                  rows={3}
                  value={workRemaining}
                  onChange={(e) => setWorkRemaining(e.target.value)}
                  placeholder="e.g., Concrete curing inspection, slump testing, and backfilling..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider mb-1.5">
                  🔍 Site Observations & Materials
                </label>
                <textarea
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="e.g., High-grade cement utilized. Aggregate distribution conforms to specs..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-red-700 uppercase tracking-wider mb-1.5">
                  ⚠️ Problems / Issues Encountered (Optional)
                </label>
                <textarea
                  rows={2}
                  value={issues}
                  onChange={(e) => setIssues(e.target.value)}
                  placeholder="e.g., Minor ground water seepage during deep excavation..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-teal-700 uppercase tracking-wider mb-1.5">
                  💡 Engineer Recommendations (Optional)
                </label>
                <textarea
                  rows={2}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="e.g., Extend water curing period by 48 hours for optimal strength..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Auto-dispatch PDF checkbox */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSendPdfToOwner}
                onChange={(e) => setAutoSendPdfToOwner(e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-black text-gray-900 block">
                  Automatically deliver certified PDF Progress & Evidence Report directly to Project Owner
                </span>
                <span className="text-[11px] text-gray-500 block">
                  Generates accredited engineering report with live GPS coordinates and digital attestation.
                </span>
              </div>
            </label>
            <Send size={18} className="text-amber-600 shrink-0 hidden sm:block" />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePreviewCurrentReport}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <Eye size={15} />
              <span>Preview Official Report (PDF Layout)</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting & Generating Report...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Submit Progress & Generate Official Report
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* In-App Camera Modal */}
      <CameraEvidenceModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        projectId={selectedProjectId}
        projectTitle={currentProject?.title || 'Construction Project'}
        projectLocation={currentProject?.location || 'Site Location'}
        milestones={milestones}
        defaultMilestoneId={selectedMilestoneId}
        onEvidenceSubmitted={handleEvidenceCaptured}
      />

      {/* Report Preview Modal */}
      <ReportViewerModal
        isOpen={isViewerModalOpen}
        onClose={() => setIsViewerModalOpen(false)}
        reportData={previewReportData}
      />
    </div>
  );
};

export default UpdateProgressView;
