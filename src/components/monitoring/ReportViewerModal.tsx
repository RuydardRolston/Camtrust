import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  MapPin,
  Loader2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { ProgressReportData, downloadPdfReport } from '../../utils/pdfReportGenerator';
import VerifiedBadge from '../common/VerifiedBadge';
import { useLocationName } from '../../hooks/useLocationName';

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ProgressReportData | null;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  isOpen,
  onClose,
  reportData,
}) => {
  const [downloading, setDownloading] = useState(false);

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

  const formattedDate = new Date(reportData.reportingDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

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
                {reportData.projectTitle} • {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download size={14} /> Download PDF
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Report Document View */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {/* A4 Sheet Container */}
          <div
            className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-lg relative"
            style={{
              backgroundImage: 'url(/report_background.jpg)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Top clearance for background design */}
            <div className="h-6" />

            {/* Document Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-orange-500 pb-4 mb-6 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-orange-500 rounded-sm" />
                  <span className="text-xl font-black text-slate-900 tracking-tight">CAMTRUST</span>
                </div>
                <div className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest mt-0.5">
                  Construction Monitoring & Site Supervision
                </div>
                <div className="text-xs font-bold text-slate-700 mt-1">
                  OFFICIAL PROGRESS & SITE EVIDENCE REPORT
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Report Ref</div>
                <div className="text-xs font-mono font-bold text-slate-900">
                  CTR-{reportData.id || 'LIVE'}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{formattedDate}</div>
              </div>
            </div>

            {/* Project & Engineer Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-4">
                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2">
                  🏗️ Project Information
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">{reportData.projectTitle}</h3>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  {reportData.projectLocation}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Owner:</strong> {reportData.projectOwnerName || 'Private Owner'}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Status:</strong>{' '}
                  <span className="font-bold text-blue-600">{reportData.projectStatus || 'In Progress'}</span>
                </p>
              </div>

              <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
                    👷 Lead Supervising Engineer
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">{reportData.engineer.fullName}</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {reportData.engineer.specialty || 'Civil & Structural Engineer'}
                  </p>
                </div>

                <div className="mt-3">
                  <VerifiedBadge size="sm" />
                </div>
              </div>
            </div>

            {/* Active Milestone Banner */}
            <div className="bg-slate-900 text-white rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Current Milestone Under Inspection
                </span>
                <h4 className="text-base font-extrabold text-white mt-0.5">
                  {reportData.currentMilestoneLabel}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Milestone Progress
                </span>
                <div className="text-2xl font-black text-orange-500">
                  {reportData.overallProgress}%
                </div>
              </div>
            </div>

            {/* Work Execution Grid */}
            <div className="space-y-4 mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-l-3 border-orange-500 pl-2">
                Work Execution & Technical Observations
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">✓ Work Completed</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {reportData.workCompleted || 'Completed planned excavation and concrete foundation casting.'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-700 uppercase">⏳ Work In Progress</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {reportData.workInProgress || 'Reinforcement rebar grid tying and formwork installation.'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-blue-700 uppercase">📋 Work Remaining</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {reportData.workRemaining || 'Column casting, curing period monitoring, and slab prep.'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-purple-700 uppercase">🔍 Site Observations</span>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {reportData.observations || 'Materials conform to structural specifications. Curing moisture levels adequate.'}
                  </p>
                </div>
              </div>

              {(reportData.issues || reportData.recommendations) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
                  {reportData.issues && (
                    <p>
                      <strong>Identified Issues:</strong> {reportData.issues}
                    </p>
                  )}
                  {reportData.recommendations && (
                    <p>
                      <strong>Engineer Recommendations:</strong> {reportData.recommendations}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Site Evidence Photos */}
            <div className="space-y-3 mb-8">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-l-3 border-orange-500 pl-2">
                Verified Site Photo Evidence ({reportData.evidencePhotos?.length || 0})
              </h4>

              {reportData.evidencePhotos && reportData.evidencePhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reportData.evidencePhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-xs"
                    >
                      <div className="aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                        <img
                          src={photo.photoUrl}
                          alt="Site evidence"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2.5 text-[11px] text-slate-600 space-y-0.5">
                        <div className="font-bold text-slate-900">{photo.description || `Site Photo #${idx + 1}`}</div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Clock size={10} />
                          {new Date(photo.capturedAt).toLocaleString('en-GB')}
                        </div>
                        <LocationText lat={photo.gpsLatitude} lng={photo.gpsLongitude} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No site photos attached to this report update.
                </div>
              )}
            </div>

            {/* Signature Block */}
            <div className="border-t border-slate-200 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Prepared & Supervised By</div>
                <div className="text-sm font-extrabold text-slate-900 mt-1">{reportData.engineer.fullName}</div>
                <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={13} /> Verified Construction Professional
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Engineer Signature & Date</div>
                <div className="border-b-2 border-slate-400 h-8 flex items-end font-serif italic text-base text-slate-900">
                  {reportData.engineer.fullName}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Date: {formattedDate}</div>
              </div>
            </div>

            {/* Bottom clearance */}
            <div className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportViewerModal;

const LocationText: React.FC<{ lat: number | null | undefined; lng: number | null | undefined }> = ({ lat, lng }) => {
  const { locationName, loading } = useLocationName(lat, lng);

  return (
    <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
      <MapPin size={10} />
      {loading ? (
        <span className="text-[10px] font-bold text-slate-500">Resolving location...</span>
      ) : (
        <span>Location: {locationName || (lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Recorded on Device')}</span>
      )}
    </div>
  );
};
