/**
 * CamTrust - Professionals Verification View (Administrator)
 * Admin reviews Engineer KYC verification documents, inspects automated AI KYC analysis
 * recommendations, and performs Approve / Reject / Request New Document actions.
 */

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Clock,
  XCircle,
  Search,
  Loader2,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  X,
  MessageSquare,
} from 'lucide-react';
import verificationService from '../../services/verificationService';
import VerifiedBadge from '../../components/common/VerifiedBadge';

export interface Verification {
  id: number;
  professionalId: number;
  administratorId?: number | null;
  status: string;
  date: string;
  notes?: string;
  aiAnalysis?: string;
  professional?: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    specialty?: string;
    verified: boolean;
  };
  documents?: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    documentType: string;
    uploadedAt: string;
  }>;
}

export const ProfessionalsVerificationView: React.FC = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Detail Modal & Action states
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [requestDocModalOpen, setRequestDocModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const data = await verificationService.getPendingVerifications();
      setVerifications(data.verifications || []);
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setProcessingId(id);
      await verificationService.approveVerification(id, actionNotes || undefined);
      await loadVerifications();
      setSelectedVerification(null);
      setActionNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to approve verification');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Please enter the reason for rejection (this will be sent to the engineer):');
    if (reason === null) return;

    try {
      setProcessingId(id);
      await verificationService.rejectVerification(id, reason);
      await loadVerifications();
      setSelectedVerification(null);
    } catch (err: any) {
      alert(err.message || 'Failed to reject verification');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRequestNewDocument = async (id: number) => {
    if (!actionNotes.trim()) {
      alert('Please enter instructions for the new documents required.');
      return;
    }

    try {
      setProcessingId(id);
      await verificationService.requestNewDocuments(id, actionNotes);
      await loadVerifications();
      setRequestDocModalOpen(false);
      setSelectedVerification(null);
      setActionNotes('');
      alert('Document request sent to the Engineer successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to request new document');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = verifications.filter((v) => {
    const matchesSearch =
      v.professional?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.professional?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && v.status === statusFilter;
  });

  const parseAiAnalysis = (raw: string | undefined) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
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
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Construction Professionals Verification (KYC)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review civil engineer credentials, inspect automated KYC checks, and grant verified status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-black rounded-full border border-emerald-200">
            {verifications.filter((v) => v.status === 'Approved').length} Verified Engineers
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by engineer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 overflow-x-auto w-full sm:w-auto">
          {['all', 'Pending', 'Action Required', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-slate-900 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Verifications Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
          <p className="text-gray-500 text-sm">No verification requests found matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((v) => {
            const analysis = parseAiAnalysis(v.aiAnalysis);

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVerification(v)}
                className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900">
                        {v.professional?.fullName || 'Civil Engineer'}
                      </h3>
                      <div className="text-xs text-gray-500">{v.professional?.email}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {v.professional?.specialty || 'Construction Professional'}
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                        v.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : v.status === 'Rejected'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : v.status === 'Action Required'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {v.status === 'Pending' && <><Clock size={13} /> Under Review</>}
                      {v.status === 'Approved' && <><ShieldCheck size={13} /> Verified</>}
                      {v.status === 'Rejected' && <><XCircle size={13} /> Rejected</>}
                      {v.status === 'Action Required' && <><AlertTriangle size={13} /> Action Required</>}
                    </span>
                  </div>

                  {/* KYC AI Recommendation Summary */}
                  {analysis && (
                    <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                          <Sparkles size={12} className="text-orange-500" /> Automated KYC Check
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            analysis.riskLevel === 'LOW'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Risk: {analysis.riskLevel}
                        </span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {analysis.recommendation}
                      </p>
                    </div>
                  )}

                  {/* Document List */}
                  <div className="mt-4 space-y-1.5">
                    <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                      Uploaded Documents ({v.documents?.length || 0})
                    </div>
                    {v.documents && v.documents.length > 0 ? (
                      <div className="space-y-1">
                        {v.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 text-gray-700"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <FileText size={13} className="text-orange-500 shrink-0" />
                              <span className="truncate">{doc.fileName}</span>
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold shrink-0 ml-2">
                              {doc.documentType.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No documents uploaded yet</p>
                    )}
                  </div>
                </div>

                {/* Administrator Action Bar */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400 font-medium">
                    Submitted: {new Date(v.date).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVerification(v);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                    >
                      Review KYC
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED KYC REVIEW MODAL */}
      {selectedVerification && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={22} className="text-emerald-600" />
                <h3 className="text-lg font-black text-gray-900">
                  Engineer Verification Review
                </h3>
              </div>
              <button
                onClick={() => setSelectedVerification(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Engineer Identity Details */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase">Engineer Name</span>
                <p className="text-sm font-extrabold text-gray-900">{selectedVerification.professional?.fullName}</p>
                <p className="text-gray-500">{selectedVerification.professional?.email}</p>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-gray-400 uppercase">Current Status</span>
                <div className="mt-1">
                  {selectedVerification.status === 'Approved' ? (
                    <VerifiedBadge size="sm" />
                  ) : (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-full border border-amber-200">
                      {selectedVerification.status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Automated KYC Checks Checklist */}
            {selectedVerification.aiAnalysis && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <Sparkles size={14} className="text-orange-500" />
                  <span>Automated KYC Document Analysis Checklist</span>
                </div>

                {parseAiAnalysis(selectedVerification.aiAnalysis)?.checks?.map((chk: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs"
                  >
                    {chk.passed ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-extrabold text-slate-900">{chk.title}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{chk.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Submitted Document Files */}
            <div className="space-y-3">
              <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                Submitted Eligibility Files
              </span>

              {selectedVerification.documents && selectedVerification.documents.length > 0 ? (
                <div className="space-y-2">
                  {selectedVerification.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText size={18} className="text-orange-500" />
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
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1"
                      >
                        <Download size={12} />
                        <span>Inspect Document</span>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No documents attached.</p>
              )}
            </div>

            {/* Administrator Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setRequestDocModalOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-extrabold transition flex items-center gap-1.5"
              >
                <MessageSquare size={14} />
                <span>Request New Document</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReject(selectedVerification.id)}
                  disabled={processingId === selectedVerification.id}
                  className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-extrabold transition"
                >
                  Reject
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(selectedVerification.id)}
                  disabled={processingId === selectedVerification.id}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  <span>Approve & Verify Engineer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST NEW DOCUMENT MODAL */}
      {requestDocModalOpen && selectedVerification && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-black text-gray-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-600" />
              <span>Request New Documents</span>
            </h4>
            <p className="text-xs text-gray-500">
              Provide clear feedback to {selectedVerification.professional?.fullName} on what additional documents or clarification are needed.
            </p>

            <textarea
              rows={4}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g., Please upload your certified degree diploma or a stamped attestation of employment from your current engineering firm."
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRequestDocModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRequestNewDocument(selectedVerification.id)}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black"
              >
                Send Request to Engineer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalsVerificationView;
