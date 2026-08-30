/**
 * CamTrust - Professionals Verification View
 * Admin can review engineer verification requests with uploaded documents.
 */

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Clock,
  XCircle,
  Award,
  Search,
  Loader2,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import verificationService from '../../services/verificationService';

export interface Verification {
  id: number;
  professionalId: number;
  professional: {
    id: number;
    fullName: string;
    email: string;
  };
  status: string;
  date: string;
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
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    loadVerifications();
  }, []);

  const loadVerifications = async () => {
    try {
      const data = await verificationService.getPendingVerifications();
      const verificationsWithDocs = await Promise.all(
        (data.verifications || []).map(async (v: Verification) => {
          try {
            const docs = await verificationService.getVerificationDocuments(v.id);
            return { ...v, documents: docs.documents || [] };
          } catch {
            return { ...v, documents: [] };
          }
        })
      );
      setVerifications(verificationsWithDocs);
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await verificationService.approveVerification(id);
      await loadVerifications();
      setSelectedVerification(null);
    } catch (err) {
      alert('Failed to approve verification');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await verificationService.rejectVerification(id);
      await loadVerifications();
      setSelectedVerification(null);
    } catch (err) {
      alert('Failed to reject verification');
    }
  };

  const handleUploadDocument = async (verificationId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('document', files[0]);
      formData.append('documentType', 'license');

      await verificationService.uploadVerificationDocument(verificationId, formData);
      await loadVerifications();
    } catch (err) {
      alert('Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const filtered = verifications.filter((a) =>
    a.professional?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <UserCheck className="text-emerald-600" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Professionals Verification
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review engineer licenses, certificates, and approve qualified professionals.
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by engineer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <p className="text-gray-500 text-sm">No pending verifications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              onClick={() => setSelectedVerification(a)}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-gray-900">{a.professional?.fullName || 'Unknown'}</h3>
                  <div className="text-xs text-gray-500">{a.professional?.email}</div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(a.date).toLocaleDateString()}
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    a.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : a.status === 'Rejected'
                       ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {a.status === 'Pending' && <><Clock size={13} /> Pending</>}
                  {a.status === 'Approved' && <><ShieldCheck size={13} /> Verified</>}
                  {a.status === 'Rejected' && <><XCircle size={13} /> Rejected</>}
                </span>
              </div>

              {a.documents && a.documents.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Uploaded Documents</div>
                  {a.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <FileText size={12} />
                      <span>{doc.fileName}</span>
                      <span className="text-[10px] text-gray-400">({doc.documentType})</span>
                    </a>
                  ))}
                </div>
              )}

              {a.status === 'Pending' && (
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                    <Upload size={12} />
                    Add Document
                  </label>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleUploadDocument(a.id, e)}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReject(a.id); }}
                      className="px-3 py-1.5 rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-semibold transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleApprove(a.id); }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Verification Details</h3>
              <button onClick={() => setSelectedVerification(null)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">Engineer</div>
                <div className="text-sm font-bold text-gray-900">{selectedVerification.professional?.fullName}</div>
                <div className="text-xs text-gray-500">{selectedVerification.professional?.email}</div>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">Status</div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  selectedVerification.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                  selectedVerification.status === 'Rejected' ? 'bg-orange-50 text-orange-700' :
                  'bg-amber-50 text-amber-700'
                }`}>
                  {selectedVerification.status}
                </span>
              </div>

              <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-2">Documents</div>
                {selectedVerification.documents && selectedVerification.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedVerification.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-gray-50"
                      >
                        <FileText size={16} className="text-orange-500" />
                        <div>
                          <div className="text-xs font-bold text-gray-900">{doc.fileName}</div>
                          <div className="text-[10px] text-gray-500">{doc.documentType}</div>
                        </div>
                        <Download size={14} className="ml-auto text-gray-400" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No documents uploaded yet</p>
                )}

                {selectedVerification.status === 'Pending' && (
                  <div className="mt-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                      <Upload size={14} className="text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700">Upload Document</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUploadDocument(selectedVerification.id, e)}
                      />
                    </label>
                  </div>
                )}
              </div>

              {selectedVerification.status === 'Pending' && (
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleReject(selectedVerification.id)}
                    className="px-4 py-2 rounded-xl border border-orange-200 text-orange-600 hover:bg-orange-50 text-xs font-semibold"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedVerification.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    Approve Verification
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalsVerificationView;
