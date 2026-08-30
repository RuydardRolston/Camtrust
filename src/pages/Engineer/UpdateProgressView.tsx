/**
 * CamTrust - Engineer Update Progress View
 * Enables engineers to capture photos with GPS location name, update milestones, and submit progress reports.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  HardHat,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Camera,
  Loader2,
  X
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import assignmentService from '../../services/assignmentService';
import projectService from '../../services/projectService';
import milestoneService from '../../services/milestoneService';
import reportService from '../../services/reportService';
import evidenceService from '../../services/evidenceService';
import { stampPhotoWithMetadata } from '../../utils/photoWaterMark';
import { getLocationName, formatLocationForWatermark, LocationInfo } from '../../utils/locationService';

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
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Photo capture state
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadMilestones(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const assignments = await assignmentService.getMyAssignments();
      const projectPromises = (assignments.assignments || []).map((a: any) =>
        projectService.getProjectById(a.projectId)
      );
      const projectsData = await Promise.all(projectPromises);
      const projectsList = projectsData.map((p: any) => p.project).filter(Boolean);
      setProjects(projectsList);
      if (projectsList.length > 0) {
        setSelectedProjectId(projectsList[0].id);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
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

  const handleMilestoneChange = (milestoneId: number) => {
    setSelectedMilestoneId(milestoneId);
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (milestone) {
      setProgress(milestone.completionRate || 0);
    }
  };

  const acquireLocation = async (): Promise<LocationInfo> => {
    setLocationLoading(true);
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true,
          });
        });

        const { latitude, longitude } = position.coords;
        const location = await getLocationName(latitude, longitude);
        setLocationInfo(location);
        return location;
      } else {
        const fallback: LocationInfo = {
          displayName: 'Location unavailable',
          city: '',
          country: '',
        };
        setLocationInfo(fallback);
        return fallback;
      }
    } catch (error) {
      const fallback: LocationInfo = {
        displayName: 'Location unavailable',
        city: '',
        country: '',
      };
      setLocationInfo(fallback);
      return fallback;
    } finally {
      setLocationLoading(false);
    }
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCapturing(true);
    const location = locationInfo || (await acquireLocation());
    const now = new Date();
    const timestamp = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const locationName = formatLocationForWatermark(location);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const stampedBlob = await stampPhotoWithMetadata(
          file,
          locationName,
          timestamp,
          user?.fullName || 'Engineer'
        );

        const stampedFile = new File([stampedBlob], `stamped_${file.name}`, { type: 'image/jpeg' });
        const reader = new FileReader();

        await new Promise<void>((resolve) => {
          reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setPhotos((prev) => [...prev, base64]);
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(stampedFile);
        });
      } catch (error) {
        console.error('Failed to stamp photo:', error);
      }
    }

    setIsCapturing(false);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestoneId) return;

    try {
      setSubmitting(true);

      // Upload photos as evidence if any
      if (photos.length > 0) {
        const location = locationInfo || await acquireLocation();
        const now = new Date();
        const timestamp = now.toISOString();
        const locationName = formatLocationForWatermark(location);

        for (const photoDataUrl of photos) {
          const blob = dataUrlToBlob(photoDataUrl);
          const formData = new FormData();
          formData.append('photo', blob, `evidence_${Date.now()}.jpg`);
          formData.append('milestoneId', String(selectedMilestoneId));
          formData.append('capturedAt', timestamp);
          formData.append('locationName', locationName);
          formData.append('gpsAvailable', locationName === 'Location unavailable' ? 'false' : 'true');

          if (location.displayName && location.displayName !== 'Location unavailable') {
            formData.append('gpsLatitude', '0');
            formData.append('gpsLongitude', '0');
          }

          await evidenceService.uploadEvidence(formData);
        }
      }

      await milestoneService.updateMilestone(selectedMilestoneId, {
        completionRate: progress,
        status: progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Pending',
      });

      await reportService.submitReport({
        projectId: String(selectedProjectId),
        summary: notes || `Progress update: ${progress}% completion`,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      setNotes('');
      setPhotos([]);
    } catch (err: any) {
      alert(err.message || 'Failed to submit progress');
    } finally {
      setSubmitting(false);
    }
  };

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(parts[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HardHat className="text-emerald-600" size={22} />
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Update Progress & Site Evidence
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Capture site photos with timestamp & location, update milestones, and submit progress reports.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
          <ShieldCheck size={15} /> Verified Engineer Portal
        </span>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>Progress update submitted successfully with stamped evidence!</span>
        </div>
      )}

      <form onSubmit={handleSubmitProgress} className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
            Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} - {p.location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
            Milestone
          </label>
          <select
            value={selectedMilestoneId}
            onChange={(e) => handleMilestoneChange(Number(e.target.value))}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {milestones.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.completionRate}%)
              </option>
            ))}
          </select>
        </div>

        <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Milestone Progress
            </label>
            <span className="text-xl font-extrabold text-emerald-600 bg-white px-3 py-1 rounded-xl shadow-sm border border-gray-200">
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
            className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />

          <div className="flex justify-between text-[11px] text-gray-400 font-semibold">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Photo & Video Evidence with Location Name Stamp */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
              Site Evidence Photos ({photos.length})
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <MapPin size={12} />
                {locationLoading ? 'Acquiring location...' : locationInfo ? 'Location acquired' : 'Get Location'}
              </button>
            </div>
          </div>

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoCapture}
            accept="image/*"
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handlePhotoCapture}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {photos.map((img, idx) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden bg-gray-100 group border border-gray-200 shadow-sm aspect-video">
                  <img src={img} alt="Evidence thumbnail" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-orange-600/85 text-white rounded-xl shadow-md opacity-90 hover:opacity-100 transition"
                    title="Remove Photo"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-4 text-center bg-gray-50/50 hover:bg-emerald-50/20 cursor-pointer transition flex flex-col items-center justify-center gap-2"
            >
              {isCapturing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">Processing photo...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Camera size={20} />
                  </div>
                  <div className="text-xs font-bold text-gray-900">Upload Photos</div>
                  <div className="text-[10px] text-gray-400">From gallery</div>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-2xl p-4 text-center bg-gray-50/50 hover:bg-emerald-50/20 cursor-pointer transition flex flex-col items-center justify-center gap-2"
            >
              {isCapturing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">Processing...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Camera size={20} />
                  </div>
                  <div className="text-xs font-bold text-gray-900">Take Photo</div>
                  <div className="text-[10px] text-gray-400">Use camera</div>
                </>
              )}
            </button>
          </div>

          {locationInfo && (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500">
              <MapPin size={10} />
              <span>Location: {formatLocationForWatermark(locationInfo)}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
            Site Notes & Observations
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document structural inspection, materials, curing status..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Verified Progress Update'}
        </button>
      </form>
    </div>
  );
};

export default UpdateProgressView;
