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
} from 'lucide-react';
import evidenceService from '../../services/evidenceService';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import { useLocationName } from '../../hooks/useLocationName';

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
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Evidence | null>(null);

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

                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <VerifiedBadge size="sm" showText={false} subtext={item.professional?.fullName} />
                    <a
                      href={item.photoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <Download size={13} /> Original
                    </a>
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
