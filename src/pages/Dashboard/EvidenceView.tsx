/**
 * CamTrust - Evidence View (Administrator & Monitoring)
 * Displays site photos with real GPS location, ISO timestamp, milestone, and verified badge.
 */

import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  Loader2,
  Search,
  Download,
  Eye,
  FileDown,
  Send,
  CheckCircle2,
} from 'lucide-react';
import evidenceService from '../../services/evidenceService';
import documentService from '../../services/documentService';
import useAuth from '../../hooks/useAuth';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import { useLocationName } from '../../hooks/useLocationName';
import { downloadEvidencePhotoPdf, generateEvidencePhotoPdfBlob } from '../../utils/pdfReportGenerator';

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
  milestone?: {
    id: number;
    label: string;
    projectId: number;
    project?: {
      id: number;
      title: string;
      location: string;
    };
  };
  professional?: {
    id: number;
    fullName: string;
    email: string;
    verified: boolean;
    specialty?: string;
  };
  project?: {
    id: number;
    title: string;
    location: string;
  };
}

export const EvidenceView: React.FC = () => {
  const { user } = useAuth();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Evidence | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [statusAlert, setStatusAlert] = useState<string | null>(null);

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const data = await evidenceService.getAllEvidence();
      setEvidence(data.evidence || []);
    } catch (err) {
      console.error('Failed to load evidence:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (item: Evidence) => {
    try {
      setDownloadingId(item.id);
      const projectTitle = item.milestone?.project?.title || item.project?.title || 'Construction Site Evidence';
      const projectLocation = item.milestone?.project?.location || item.project?.location || 'Site Location';
      const milestoneLabel = item.milestone?.label || 'Milestone Evidence';

      await downloadEvidencePhotoPdf({
        projectTitle,
        projectLocation,
        milestoneLabel,
        photoUrl: item.photoUrl,
        description: item.description || 'Verified site progress evidence photo',
        capturedAt: item.capturedAt,
        gpsLatitude: item.gpsLatitude,
        gpsLongitude: item.gpsLongitude,
        gpsAvailable: item.gpsAvailable !== false,
        engineerName: item.professional?.fullName || user?.fullName || 'Verified Civil Engineer',
        engineerSpecialty: item.professional?.specialty || (user as any)?.specialty || 'Lead Construction Engineer',
      });
    } catch (err: any) {
      console.error('Failed to download PDF:', err);
      alert('Failed to generate PDF: ' + (err.message || 'Please try again'));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendPdfToOwner = async (item: Evidence) => {
    const projectId = item.milestone?.projectId || item.project?.id;
    if (!projectId) {
      alert('Project ID not associated with this evidence item.');
      return;
    }

    try {
      setSendingId(item.id);
      const projectTitle = item.milestone?.project?.title || item.project?.title || 'Construction Site Evidence';
      const projectLocation = item.milestone?.project?.location || item.project?.location || 'Site Location';
      const milestoneLabel = item.milestone?.label || 'Milestone Evidence';

      const { blob, fileName } = await generateEvidencePhotoPdfBlob({
        projectTitle,
        projectLocation,
        milestoneLabel,
        photoUrl: item.photoUrl,
        description: item.description || 'Verified site progress evidence photo',
        capturedAt: item.capturedAt,
        gpsLatitude: item.gpsLatitude,
        gpsLongitude: item.gpsLongitude,
        gpsAvailable: item.gpsAvailable !== false,
        engineerName: item.professional?.fullName || user?.fullName || 'Verified Civil Engineer',
        engineerSpecialty: item.professional?.specialty || (user as any)?.specialty || 'Lead Construction Engineer',
      });

      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('document', pdfFile);
      formData.append('projectId', String(projectId));
      formData.append('category', 'Reports');
      formData.append('targetRecipient', 'property_owner');
      formData.append(
        'notes',
        `Official Accredited Site Evidence Certificate for milestone "${milestoneLabel}" verified with real GPS telemetry.`
      );

      await documentService.uploadDocument(formData);
      setStatusAlert(`Certified Site Evidence Certificate successfully delivered to Project Owner!`);
      setTimeout(() => setStatusAlert(null), 5000);
    } catch (err: any) {
      console.error('Failed to send PDF to owner:', err);
      alert('Failed to send PDF: ' + (err.message || 'Please try again'));
    } finally {
      setSendingId(null);
    }
  };

  const filtered = evidence.filter((e) => {
    const projectTitle = e.milestone?.project?.title || e.project?.title || '';
    const engineerName = e.professional?.fullName || '';
    const desc = e.description || '';
    return (
      projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
              <Camera size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              CAMTRUST SITE EVIDENCE
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Certified site photos captured directly on construction sites with real device GPS coordinates & timestamps.
          </p>
        </div>

        <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-black rounded-full border border-emerald-200">
          {evidence.length} Stamped Photos
        </span>
      </div>

      {/* Success Alert */}
      {statusAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3 animate-fadeIn shadow-xs">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span>{statusAlert}</span>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by project, engineer or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center">
          <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No site evidence uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const projectTitle = item.milestone?.project?.title || item.project?.title || 'Construction Site';
            const milestoneLabel = item.milestone?.label || 'General Progress';
            const dateObj = new Date(item.capturedAt);
            const dateStr = dateObj.toLocaleDateString('en-GB');
            const timeStr = dateObj.toLocaleTimeString('en-GB');

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col justify-between"
              >
                <div
                  className="aspect-video bg-slate-950 relative overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedPhoto(item)}
                >
                  <img
                    src={item.photoUrl}
                    alt="Site evidence"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/75 backdrop-blur-xs text-white rounded-lg text-[10px] font-black uppercase tracking-wider">
                    CAMTRUST EVIDENCE
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                    <Eye size={16} /> View Full Photo
                  </div>
                </div>

                <div className="p-5 space-y-3.5">
                  {/* Evidence Metadata Block */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest">
                      CAMTRUST SITE EVIDENCE
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      Project: <span className="font-bold text-slate-700">{projectTitle}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-600">
                      Milestone: <span className="font-normal text-slate-700">{milestoneLabel}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs text-slate-600 font-medium">
                    <div>
                      <strong>Captured by:</strong> {item.professional?.fullName || 'Civil Engineer'}
                    </div>
                    <div>
                      <strong>Date:</strong> {dateStr} • <strong>Time:</strong> {timeStr}
                    </div>
                    <LocationCell lat={item.gpsLatitude} lng={item.gpsLongitude} />
                    {item.description && (
                      <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-700 italic">
                        "{item.description}"
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    <VerifiedBadge size="sm" showText={false} subtext={item.professional?.fullName} />
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSendPdfToOwner(item)}
                        disabled={sendingId === item.id}
                        className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-black transition flex items-center gap-1 cursor-pointer border border-orange-200 disabled:opacity-50"
                        title="Deliver certified PDF Certificate directly to Project Owner"
                      >
                        {sendingId === item.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Send size={11} />
                        )}
                        <span>Send to Owner</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(item)}
                        disabled={downloadingId === item.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Download accredited A4 PDF certificate"
                      >
                        {downloadingId === item.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <FileDown size={11} />
                        )}
                        <span>PDF</span>
                      </button>

                      <a
                        href={item.photoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition"
                        title="Download original photo file"
                      >
                        <Download size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Enlarged Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-[90vh] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl p-2 relative flex flex-col">
            <img
              src={selectedPhoto.photoUrl}
              alt="Enlarged site evidence"
              className="max-h-[75vh] w-auto object-contain mx-auto rounded-2xl"
            />
            <div className="p-4 text-white text-xs space-y-1 text-center bg-slate-900/80 mt-2 rounded-2xl">
              <p className="font-extrabold text-sm">{selectedPhoto.description || 'CAMTRUST SITE EVIDENCE'}</p>
              <LightboxLocation lat={selectedPhoto.gpsLatitude} lng={selectedPhoto.gpsLongitude} capturedAt={selectedPhoto.capturedAt} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceView;

const LocationCell: React.FC<{ lat: number | null; lng: number | null }> = ({ lat, lng }) => {
  const { locationName, loading } = useLocationName(lat, lng);

  return (
    <div className="text-emerald-700 font-extrabold flex items-center gap-1">
      <MapPin size={12} className="shrink-0" />
      {loading ? (
        <span className="text-[10px] font-bold text-slate-500">Resolving location...</span>
      ) : (
        <span>Location: {locationName || 'GPS Verified on Site'}</span>
      )}
    </div>
  );
};

const LightboxLocation: React.FC<{ lat: number | null; lng: number | null; capturedAt: string }> = ({ lat, lng, capturedAt }) => {
  const { locationName, loading } = useLocationName(lat, lng);

  return (
    <p className="text-emerald-400 font-bold">
      {loading ? (
        <span>Resolving location...</span>
      ) : (
        <span>
          Location: {locationName || (lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'GPS Verified on Site')} • {new Date(capturedAt).toLocaleString('en-GB')}
        </span>
      )}
    </p>
  );
};
