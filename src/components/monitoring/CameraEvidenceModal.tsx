import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  MapPin,
  RotateCw,
  X,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import evidenceService from '../../services/evidenceService';
import useAuth from '../../hooks/useAuth';
import { useLocationName } from '../../hooks/useLocationName';

interface CameraEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number | string;
  projectTitle: string;
  milestones: Array<{ id: number; label: string; completionRate?: number }>;
  defaultMilestoneId?: number;
  onEvidenceSubmitted?: (evidence: any) => void;
}

export const CameraEvidenceModal: React.FC<CameraEvidenceModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  milestones,
  defaultMilestoneId,
  onEvidenceSubmitted,
}) => {
  const { user } = useAuth();
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number>(
    defaultMilestoneId || (milestones[0]?.id ?? 0)
  );
  const [description, setDescription] = useState('');

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fallbackFileRef = useRef<HTMLInputElement | null>(null);

  // Captured photo preview state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  // Real Geolocation state
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'recorded' | 'denied' | 'unavailable'>('acquiring');
  const [capturedTimestamp, setCapturedTimestamp] = useState<Date | null>(null);
  const { locationName: resolvedLocationName, loading: locationLoading } = useLocationName(gpsLatitude, gpsLongitude);

  // Submission state
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (defaultMilestoneId) {
      setSelectedMilestoneId(defaultMilestoneId);
    } else if (milestones.length > 0 && !selectedMilestoneId) {
      setSelectedMilestoneId(milestones[0].id);
    }
  }, [defaultMilestoneId, milestones]);

  useEffect(() => {
    if (isOpen) {
      acquireRealGPS();
      startCamera();
    } else {
      stopCamera();
      resetState();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const acquireRealGPS = () => {
    setGpsStatus('acquiring');
    if (!('geolocation' in navigator)) {
      setGpsStatus('unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLatitude(pos.coords.latitude);
        setGpsLongitude(pos.coords.longitude);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setGpsStatus('recorded');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsStatus('denied');
        } else {
          setGpsStatus('unavailable');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const startCamera = async () => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Direct browser camera stream not supported. Please use the camera file upload below.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Failed to open camera stream:', err);
      setCameraError('Camera access required. Tap below to capture with phone camera.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Stamp metadata on canvas and take photo
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const now = new Date();
    setCapturedTimestamp(now);

    // Apply Camtrust Site Evidence Watermark
    applyWatermark(ctx, canvas.width, canvas.height, now);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (blob) setCapturedBlob(blob);
      },
      'image/jpeg',
      0.92
    );

    stopCamera();
  };

  const handleFallbackFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const now = new Date();
    setCapturedTimestamp(now);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          applyWatermark(ctx, canvas.width, canvas.height, now);
          const stampedUrl = canvas.toDataURL('image/jpeg', 0.92);
          setCapturedImage(stampedUrl);
          canvas.toBlob((blob) => {
            if (blob) setCapturedBlob(blob);
          }, 'image/jpeg', 0.92);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number, date: Date) => {
    const bannerHeight = Math.max(90, Math.round(height * 0.14));
    const padding = 20;

    // Gradient banner at bottom
    const gradient = ctx.createLinearGradient(0, height - bannerHeight, 0, height);
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.88)');
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

    // Orange accent bar
    ctx.fillStyle = '#f97316';
    ctx.fillRect(0, height - bannerHeight, width, 4);

    const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);
    const msLabel = selectedMilestone?.label || 'Milestone';
    const engName = user?.fullName || 'Verified Civil Engineer';
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    ctx.fillStyle = '#f97316';
    ctx.font = `bold ${Math.max(14, Math.round(width * 0.018))}px sans-serif`;
    ctx.fillText('CAMTRUST SITE EVIDENCE', padding, height - bannerHeight + 28);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(12, Math.round(width * 0.015))}px sans-serif`;
    ctx.fillText(`Project: ${projectTitle} | Milestone: ${msLabel}`, padding, height - bannerHeight + 52);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = `${Math.max(11, Math.round(width * 0.013))}px sans-serif`;
    const locationDisplay = resolvedLocationName || (gpsLatitude && gpsLongitude ? `${gpsLatitude.toFixed(4)}, ${gpsLongitude.toFixed(4)}` : 'GPS: Pending acquisition');
    const gpsText = gpsLatitude && gpsLongitude
      ? `Location: ${locationDisplay} (✓ Recorded)`
      : `GPS: Pending acquisition`;

    ctx.fillText(
      `Captured by: ${engName} | ${dateStr} ${timeStr} | ${gpsText}`,
      padding,
      height - bannerHeight + 74
    );
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!capturedBlob || !selectedMilestoneId) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('photo', capturedBlob, `site_evidence_${Date.now()}.jpg`);
      formData.append('projectId', String(projectId));
      formData.append('milestoneId', String(selectedMilestoneId));
      formData.append('description', description || 'Site construction progress photo');
      formData.append('capturedAt', (capturedTimestamp || new Date()).toISOString());
      formData.append('gpsAvailable', gpsStatus === 'recorded' ? 'true' : 'false');

      if (gpsLatitude !== null && gpsLongitude !== null) {
        formData.append('gpsLatitude', String(gpsLatitude));
        formData.append('gpsLongitude', String(gpsLongitude));
      }

      const res = await evidenceService.uploadEvidence(formData);
      setUploadSuccess(true);

      if (onEvidenceSubmitted) {
        onEvidenceSubmitted(res.evidence);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit site evidence');
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setDescription('');
    setUploadSuccess(false);
    setUploading(false);
    setCameraError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-2">
                <span>📷 Capture Site Evidence</span>
              </h2>
              <p className="text-xs text-slate-400">
                {projectTitle} • In-App Verified Capture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* GPS Status Indicator */}
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 ${
              gpsStatus === 'recorded'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : gpsStatus === 'denied'
                ? 'bg-red-950/50 border-red-800 text-red-300'
                : 'bg-amber-950/40 border-amber-800 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin size={16} className="shrink-0" />
              {gpsStatus === 'recorded' && (
                <span>
                  Real GPS Location: <strong>{resolvedLocationName || `${gpsLatitude?.toFixed(4)}, ${gpsLongitude?.toFixed(4)}`}</strong> (±{gpsAccuracy}m)
                </span>
              )}
              {gpsStatus === 'acquiring' && (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" /> Acquiring high-accuracy site GPS...
                </span>
              )}
              {gpsStatus === 'denied' && (
                <span>
                  ⚠️ GPS Permission Denied. Camtrust requires real device geolocation for site evidence.
                </span>
              )}
              {gpsStatus === 'unavailable' && (
                <span>GPS unavailable on device. Location will be marked unverified.</span>
              )}
            </div>

            <button
              type="button"
              onClick={acquireRealGPS}
              className="p-1 rounded-lg hover:bg-white/10 transition text-slate-400 hover:text-white"
              title="Refresh GPS location"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Milestone Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Construction Milestone
            </label>
            <select
              value={selectedMilestoneId}
              onChange={(e) => setSelectedMilestoneId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {milestones.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                  {m.label} ({m.completionRate || 0}%)
                </option>
              ))}
            </select>
          </div>

          {/* Camera Viewfinder or Snapshot Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 border border-slate-800 shadow-inner flex items-center justify-center">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured site evidence preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />

                {!cameraActive && (
                  <div className="text-center p-6 space-y-3">
                    <Camera size={40} className="mx-auto text-slate-500 animate-pulse" />
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      {cameraError || 'Initializing device camera with live GPS recorder...'}
                    </p>
                    <button
                      type="button"
                      onClick={() => fallbackFileRef.current?.click()}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition inline-flex items-center gap-1.5"
                    >
                      <Camera size={14} />
                      <span>Take Photo on Device</span>
                    </button>
                  </div>
                )}

                {/* Flip camera control overlay */}
                {cameraActive && (
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition backdrop-blur-xs border border-white/20"
                    title="Flip camera"
                  >
                    <RotateCw size={16} />
                  </button>
                )}
              </>
            )}

            {/* Hidden fallback file input */}
            <input
              type="file"
              ref={fallbackFileRef}
              accept="image/*"
              capture="environment"
              onChange={handleFallbackFileCapture}
              className="hidden"
            />
          </div>

          {/* Shutter / Retake Controls */}
          {!capturedImage ? (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={takeSnapshot}
                disabled={!cameraActive}
                className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition border-4 border-white/30 disabled:opacity-50"
                title="Capture construction photo"
              >
                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                  <Camera size={22} />
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
              >
                Retake Photo
              </button>

              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} /> Real GPS & Timestamp Stamped
              </span>
            </div>
          )}

          {/* Evidence Description */}
          {capturedImage && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Engineer Site Observations / Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current structural progress, materials inspected, reinforcement status..."
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition"
          >
            Cancel
          </button>

          {capturedImage && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={uploading || uploadSuccess}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting Evidence...
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle2 size={16} /> Evidence Recorded!
                </>
              ) : (
                <>
                  <ShieldCheck size={16} /> Submit Verified Site Evidence
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraEvidenceModal;
