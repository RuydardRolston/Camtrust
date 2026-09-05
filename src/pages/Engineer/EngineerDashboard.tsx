/**
 * CamTrust - Engineer Dashboard View
 * Displays assigned construction sites, verification status, and KYC document upload interface.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  HardHat,
  UploadCloud,
  ArrowRight,
  MapPin,
  Calendar,
  Loader2,
  ShieldCheck,
  UserX,
  FileText,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import assignmentService from '../../services/assignmentService';
import projectService from '../../services/projectService';
import verificationService from '../../services/verificationService';
import VerifiedBadge from '../../components/common/VerifiedBadge';

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
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // KYC Verification state
  const [verificationStatus, setVerificationStatus] = useState<string>('none');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [verificationDocs, setVerificationDocs] = useState<any[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('employment_attestation');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [verificationNotes] = useState('');
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProjects();
    loadVerificationStatus();
  }, [user]);

  const loadVerificationStatus = async () => {
    try {
      const data = await verificationService.getMyVerificationStatus();
      if (data.verification) {
        setVerificationStatus(data.verification.status);
        setVerificationData(data.verification);
        setVerificationDocs(data.documents || []);
      } else if (user?.verified || data.verified) {
        setVerificationStatus('Approved');
      } else {
        setVerificationStatus('none');
      }
    } catch (err) {
      console.warn('Could not load verification status:', err);
    }
  };

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

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', selectedDocType);

      await verificationService.uploadVerificationDocument(verificationData?.id || null, formData);
      await loadVerificationStatus();
      alert('Verification document uploaded successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRequestVerification = async () => {
    try {
      setSubmittingKyc(true);
      await verificationService.requestVerification({ notes: verificationNotes });
      await loadVerificationStatus();
      alert('Verification request submitted for Administrator review!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit verification request');
    } finally {
      setSubmittingKyc(false);
    }
  };

  const isVerified = verificationStatus === 'Approved' || user?.verified;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/15 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
              <HardHat size={13} /> Licensed Civil Engineer Portal
            </span>
            {isVerified && <VerifiedBadge size="sm" />}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome, {user?.fullName || 'Engineer'} 👋
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed max-w-xl">
            Supervise assigned construction projects, capture tamper-proof in-app site photos with verified GPS timestamps, and submit progress reports.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigateTab('update-progress')}
              className="px-5 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition"
            >
              <UploadCloud size={16} />
              <span>Update Site Progress</span>
            </button>
          </div>
        </div>
      </div>

      {/* KYC / ENGINEER VERIFICATION SECTION */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-600" size={22} />
              <h2 className="text-lg font-black text-gray-900">
                Engineer KYC & Eligibility Verification
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload professional credentials (attestation of employment, engineering degree, certificates, licenses) to earn the verified badge.
            </p>
          </div>

          <div>
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-200 shadow-xs">
                <CheckCircle2 size={15} className="text-emerald-600" /> Status: Verified
              </span>
            ) : verificationStatus === 'Pending' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-800 font-extrabold text-xs rounded-full border border-amber-200">
                <Clock size={15} className="text-amber-600" /> Status: Under Review
              </span>
            ) : verificationStatus === 'Action Required' ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-50 text-red-800 font-extrabold text-xs rounded-full border border-red-200">
                <AlertCircle size={15} className="text-red-600" /> Status: Action Required
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-50 text-gray-700 font-extrabold text-xs rounded-full border border-gray-200">
                <UserX size={15} className="text-gray-500" /> Status: Unverified
              </span>
            )}
          </div>
        </div>

        {/* Administrator Feedback / Notes Banner */}
        {verificationData?.notes && verificationStatus !== 'Approved' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
            <span className="font-extrabold flex items-center gap-1.5 text-amber-800">
              <AlertCircle size={14} /> Administrator Notes:
            </span>
            <p>{verificationData.notes}</p>
          </div>
        )}

        {/* Document Upload Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="md:col-span-1 space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Upload Verification Document
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Document Type
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="employment_attestation">Attestation of Employment</option>
                <option value="employment_certificate">Employment Certificate</option>
                <option value="certificate">Professional Degree / Certificate</option>
                <option value="license">Civil Engineering License / ID</option>
                <option value="registration">Professional Registration Document</option>
                <option value="other">Other Relevant Eligibility Document</option>
              </select>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUploadDocument}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingDoc}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploadingDoc ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} /> Select & Upload File
                </>
              )}
            </button>

            {!isVerified && verificationStatus !== 'Pending' && (
              <button
                type="button"
                onClick={handleRequestVerification}
                disabled={submittingKyc}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition disabled:opacity-50 mt-2"
              >
                {submittingKyc ? 'Submitting...' : 'Request Final Review'}
              </button>
            )}
          </div>

          {/* Uploaded Documents List */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Submitted Eligibility Documents ({verificationDocs.length})
            </h3>

            {verificationDocs.length === 0 ? (
              <div className="p-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center text-xs text-gray-500">
                No verification documents uploaded yet. Upload your attestation of employment or degree to qualify.
              </div>
            ) : (
              <div className="space-y-2">
                {verificationDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 bg-white border border-gray-200 rounded-xl flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                        <FileText size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">{doc.fileName}</div>
                        <div className="text-[10px] text-gray-500">
                          {doc.documentType.replace('_', ' ')} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-[11px] rounded-lg border border-gray-200 transition"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assigned Projects List */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900">Your Assigned Construction Projects</h2>
            <p className="text-xs text-gray-500 mt-0.5">Active monitoring sites under your civil supervision</p>
          </div>
          <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
            {projects.length} Sites
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="p-10 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">No active project assignments.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(String(p.id))}
                className="p-5 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-gray-900">{p.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : p.status === 'Approved' || p.status === 'In Progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400" />
                      {p.location}
                    </span>
                    {p.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        {new Date(p.startDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateTab('update-progress');
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                  >
                    <span>Update Progress</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EngineerDashboard;
