import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  MapPin,
  Loader2,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { ProgressReportData, downloadPdfReport } from '../../utils/pdfReportGenerator';
import VerifiedBadge from '../common/VerifiedBadge';
import reportService from '../../services/reportService';

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ProgressReportData | null;
  reportId?: number | string | null;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  isOpen,
  onClose,
  reportData,
  reportId,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendToOwner = async () => {
    if (!reportId) {
      alert('Report ID is required to send email.');
      return;
    }
    try {
      setSending(true);
      const result = await reportService.sendToOwner(reportId);
      setSent(true);
      if (result.previewUrl) {
        console.log('Email preview (test):', result.previewUrl);
      }
      setTimeout(() => setSent(false), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to send report to owner.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !reportData) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadPdfReport(reportData);
    } catch (err) {
      console.error('Failed to download PDF report:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const formattedDate = reportData.reportingDate
    ? new Date(reportData.reportingDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Construction Progress Report
              </h2>
              <p className="text-xs text-slate-400">
                Official verified engineering audit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              {downloading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
              <span>Download PDF</span>
            </button>

            {reportId && (
              <button
                type="button"
                onClick={handleSendToOwner}
                disabled={sending || sent}
                className={`flex items-center gap-2 px-3.5 py-2 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer ${
                  sent ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title="Send report notification to project owner"
              >
                {sending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : sent ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <Send size={15} />
                )}
                <span>{sent ? 'Sent!' : sending ? 'Sending...' : 'Send to Owner'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-900 bg-white">
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-6">
            {/* Header / Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">
                  CamTrust Certified Inspection
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  {reportData.projectTitle}
                </h1>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  {reportData.projectLocation || 'Site Location Not Specified'}
                </p>
              </div>

              <div className="text-right sm:border-l sm:pl-6 border-slate-200">
                <div className="text-[11px] text-slate-500 font-semibold">Audit Date</div>
                <div className="text-sm font-bold text-slate-900">{formattedDate}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">
                  Overall: {reportData.overallProgress ?? 0}% Complete
                </div>
              </div>
            </div>

            {/* Engineer and Owner Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Project Details
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {reportData.projectTitle}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  <strong>Owner:</strong> {reportData.projectOwnerName || 'Project Owner'}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  <strong>Status:</strong> {reportData.projectStatus || 'In Progress'}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Supervising Engineer
                </div>
                <div className="text-xs font-bold text-slate-900">
                  {reportData.engineer?.fullName || 'Assigned Engineer'}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {reportData.engineer?.specialty || 'Civil & Structural Engineer'}
                </div>
                <div className="mt-2">
                  <VerifiedBadge size="sm" />
                </div>
              </div>
            </div>

            {/* Sections */}
            {reportData.workCompleted && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-l-3 border-emerald-500 pl-2 mb-2">
                  Work Completed
                </h3>
                <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                  {reportData.workCompleted}
                </p>
              </div>
            )}

            {reportData.workInProgress && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-l-3 border-blue-500 pl-2 mb-2">
                  Work In Progress
                </h3>
                <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                  {reportData.workInProgress}
                </p>
              </div>
            )}

            {reportData.workRemaining && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-l-3 border-orange-500 pl-2 mb-2">
                  Work Remaining
                </h3>
                <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                  {reportData.workRemaining}
                </p>
              </div>
            )}

            {reportData.observations && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-l-3 border-slate-700 pl-2 mb-2">
                  Site Observations & Slump / Compliance Notes
                </h3>
                <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                  {reportData.observations}
                </p>
              </div>
            )}

            {reportData.issues && (
              <div>
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider border-l-3 border-amber-500 pl-2 mb-2">
                  Identified Issues & Hazards
                </h3>
                <p className="text-xs text-amber-900 bg-amber-50 p-3.5 rounded-xl border border-amber-200 leading-relaxed">
                  {reportData.issues}
                </p>
              </div>
            )}

            {reportData.recommendations && (
              <div>
                <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider border-l-3 border-blue-500 pl-2 mb-2">
                  Professional Recommendations
                </h3>
                <p className="text-xs text-blue-900 bg-blue-50 p-3.5 rounded-xl border border-blue-200 leading-relaxed">
                  {reportData.recommendations}
                </p>
              </div>
            )}

            {/* Evidence Photos */}
            {reportData.evidencePhotos && reportData.evidencePhotos.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-l-3 border-orange-500 pl-2 mb-3">
                  Verified Site Photo Evidence ({reportData.evidencePhotos.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {reportData.evidencePhotos.map((photo: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition flex flex-col"
                    >
                      <div className="w-full bg-slate-950 flex items-center justify-center overflow-hidden min-h-56 max-h-80">
                        <img
                          src={photo.photoUrl}
                          alt="Site evidence"
                          className="w-full h-auto max-h-80 object-contain"
                        />
                      </div>
                      <div className="p-3.5 text-xs text-slate-700 space-y-1.5 bg-slate-50/80 border-t border-slate-200 flex-1">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {photo.description || `Site Photo #${idx + 1}`}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            {photo.capturedAt ? new Date(photo.capturedAt).toLocaleString() : 'N/A'}
                          </span>
                          {photo.gpsAvailable && photo.gpsLatitude && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <MapPin size={11} className="text-emerald-600" /> GPS: {photo.gpsLatitude}, {photo.gpsLongitude}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signature Block */}
            <div className="border-t border-slate-200 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Prepared & Supervised By</div>
                <div className="text-sm font-extrabold text-slate-900 mt-1">
                  {reportData.engineer?.fullName || 'Assigned Engineer'}
                </div>
                <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={13} /> Verified Construction Professional
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Engineer Signature & Date</div>
                <div className="border-b-2 border-slate-400 h-8 flex items-end font-serif italic text-base text-slate-900">
                  {reportData.engineer?.fullName || 'Assigned Engineer'}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Date: {formattedDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportViewerModal;
