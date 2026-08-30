/**
 * CamTrust - Evidence View (Admin)
 * Admin can view all site evidence uploaded by engineers across projects.
 */

import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  UserCheck,
  UserX,
  Loader2,
  Search,
  Download,
  ShieldCheck
} from 'lucide-react';
import evidenceService from '../../services/evidenceService';

export interface Evidence {
  id: number;
  milestoneId: number;
  professionalId: number;
  photoUrl: string;
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
  };
}

export const EvidenceView: React.FC = () => {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = async () => {
    try {
      const data = await evidenceService.getAllEvidence();
      setEvidence(data.evidence || []);
    } catch (err) {
      console.error('Failed to load evidence:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = evidence.filter((e) => {
    const projectTitle = e.milestone?.project?.title || '';
    const engineerName = e.professional?.fullName || '';
    return projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      engineerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Camera className="text-orange-500" size={22} />
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Site Evidence
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              All uploaded site photos with timestamp, GPS, and engineer verification status.
            </p>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by project or engineer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <p className="text-gray-500 text-sm">No evidence uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
            >
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={item.photoUrl}
                  alt="Site evidence"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-gray-900">
                    {item.milestone?.project?.title || 'Unknown Project'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.milestone?.label || 'Unknown Milestone'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-bold text-[10px] flex items-center justify-center">
                      {(item.professional?.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">
                      {item.professional?.fullName || 'Unknown Engineer'}
                    </span>
                  </div>
                  {item.professional?.verified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <UserCheck size={10} /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      <UserX size={10} /> Unverified
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-[11px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <Camera size={10} className="text-gray-400" />
                    {new Date(item.capturedAt).toLocaleString()}
                  </div>
                  {item.gpsAvailable && (
                    <div className="flex items-center gap-1">
                      <MapPin size={10} className="text-gray-400" />
                      GPS: {item.gpsLatitude?.toFixed(4)}, {item.gpsLongitude?.toFixed(4)}
                    </div>
                  )}
                </div>

                <a
                  href={item.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  <Download size={12} />
                  Download Original
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvidenceView;
