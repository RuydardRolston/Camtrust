import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  MapPin,
  RotateCw,
  X,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  FileDown,
  Download,
  FileText,
  Check,
  Eye,
  Send,
  Users,
  AlertTriangle,
} from 'lucide-react';
import evidenceService from '../../services/evidenceService';
import documentService from '../../services/documentService';
import useAuth from '../../hooks/useAuth';
import { useLocationName } from '../../hooks/useLocationName';
import { downloadEvidencePhotoPdf, generateEvidencePhotoPdfBlob } from '../../utils/pdfReportGenerator';

interface CameraEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number | string;
  projectTitle: string;
  projectLocation?: string;
  milestones: Array<{ id: number; label: string; completionRate?: number }>;
  defaultMilestoneId?: number;
  onEvidenceSubmitted?: (evidence: any) => void;
}

export const CameraEvidenceModal: React.FC<CameraEvidenceModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  projectLocation,
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
  const [resolvedLocationForWatermark, setResolvedLocationForWatermark] = useState<string | null>(null);

  // Real Geolocation state
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'recorded' | 'denied' | 'unavailable'>('acquiring');
  const [capturedTimestamp, setCapturedTimestamp] = useState<Date | null>(null);
  const { locationName: resolvedLocationName, loading: _locationLoading } = useLocationName(gpsLatitude, gpsLongitude);

  // Submission & PDF states
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [submittedEvidence, setSubmittedEvidence] = useState<any>(null);

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
        timeout: 6000,
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
  const takeSnapshot = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    // Use the full resolution of the video for highest quality
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw frame with high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.filter = 'none';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const now = new Date();
    setCapturedTimestamp(now);

    // Ensure location name is resolved before stamping
    let locationForStamp = resolvedLocationName;
    if (!locationForStamp && gpsLatitude && gpsLongitude) {
      // Directly resolve location if hook hasn't done it yet
      try {
        const { getLocationName } = await import('../../utils/locationService');
        const info = await getLocationName(gpsLatitude, gpsLongitude);
        locationForStamp = info.displayName || info.city || info.country ||
          `${gpsLatitude.toFixed(6)}, ${gpsLongitude.toFixed(6)}`;
      } catch {
        locationForStamp = `${gpsLatitude.toFixed(6)}, ${gpsLongitude.toFixed(6)}`;
      }
    }

    locationForStamp = locationForStamp || resolvedLocationForWatermark ||
      (gpsLatitude && gpsLongitude ? `${gpsLatitude.toFixed(6)}, ${gpsLongitude.toFixed(6)}` : 'GPS: Pending acquisition');
    setResolvedLocationForWatermark(locationForStamp);

    // Apply Camtrust Site Evidence Watermark with high quality
    applyWatermark(ctx, canvas.width, canvas.height, now, locationForStamp);

    // Use high quality JPEG (0.95 for best quality)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);

    canvas.toBlob(
      (blob) => {
        if (blob) setCapturedBlob(blob);
      },
      'image/jpeg',
      0.95
    );

    stopCamera();
  };

  const handleFallbackFileCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const now = new Date();
    setCapturedTimestamp(now);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Use full image resolution for best quality
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0);
          const locationForStamp = resolvedLocationName || resolvedLocationForWatermark ||
            (gpsLatitude && gpsLongitude ? `${gpsLatitude.toFixed(6)}, ${gpsLongitude.toFixed(6)}` : 'GPS: Pending acquisition');
          setResolvedLocationForWatermark(locationForStamp);
          applyWatermark(ctx, canvas.width, canvas.height, now, locationForStamp);
          const stampedUrl = canvas.toDataURL('image/jpeg', 0.95);
          setCapturedImage(stampedUrl);
          canvas.toBlob((blob) => {
            if (blob) setCapturedBlob(blob);
          }, 'image/jpeg', 0.95);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyWatermark = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    date: Date,
    locationDisplay: string
  ) => {
    const bannerHeight = Math.max(120, Math.round(height * 0.16));
    const padding = Math.max(24, Math.round(width * 0.02));

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Semi-transparent gradient banner at bottom
    const gradient = ctx.createLinearGradient(0, height - bannerHeight, 0, height);
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.90)');
    gradient.addColorStop(0.5, 'rgba(15, 23, 42, 0.95)');
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

    // Orange accent bar
    ctx.fillStyle = '#f97316';
    ctx.fillRect(0, height - bannerHeight, width, 5);

    const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);
    const msLabel = selectedMilestone?.label || 'Milestone';
    const engName = user?.fullName || 'Verified Civil Engineer';
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // CAMTRUST header
    ctx.fillStyle = '#f97316';
    ctx.font = `bold ${Math.max(16, Math.round(width * 0.02))}px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText('CAMTRUST SITE EVIDENCE', padding, height - bannerHeight + 16);

    // Project and milestone
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(14, Math.round(width * 0.016))}px sans-serif`;
    ctx.fillText(`Project: ${projectTitle} | Milestone: ${msLabel}`, padding, height - bannerHeight + 44);

    // Location, engineer, timestamp
    ctx.fillStyle = '#cbd5e1';
    ctx.font = `${Math.max(13, Math.round(width * 0.014))}px sans-serif`;
    const gpsText = gpsLatitude && gpsLongitude
      ? `Location: ${locationDisplay} (✓ Recorded)`
      : (gpsStatus === 'denied' ? 'GPS: Permission Denied' : 'GPS: Pending acquisition');
    ctx.fillText(
      `Captured by: ${engName} | ${dateStr} ${timeStr} | ${gpsText}`,
      padding,
      height - bannerHeight + 70
    );

    // Verified badge
    if (gpsStatus === 'recorded') {
      ctx.fillStyle = '#10b91e';
      ctx.font = `bold ${Math.max(12, Math.round(width * 0.012))}px sans-serif`;
      ctx.fillText('✓ VERIFIED GPS COORDINATES', width - padding - 200, height - bannerHeight + 14);
    }
  }, [milestones, selectedMilestoneId, projectTitle, user?.fullName, gpsStatus]);

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    startCamera();
  };

  const [sendingPdf, setSendingPdf] = useState(false);
  const [pdfDeliveredRecipient, setPdfDeliveredRecipient] = useState<string | null>(null);

  const handleSendEvidencePdf = async (target: 'property_owner' | 'administrator' | 'both' = 'property_owner') => {
    try {
      setSendingPdf(true);
      const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);
      const photoToUse = submittedEvidence?.photoUrl || capturedImage;
      if (!photoToUse) {
        alert('No photo available to generate PDF.');
        return;
      }

      const { blob, fileName } = await generateEvidencePhotoPdfBlob({
        projectTitle: projectTitle || 'Construction Site Evidence',
        projectLocation: projectLocation || 'On-site Inspection',
        milestoneLabel: selectedMilestone?.label || 'Milestone Evidence',
        photoUrl: photoToUse,
        description: description || submittedEvidence?.description || 'Verified site construction photographic evidence with GPS telemetry.',
        capturedAt: (capturedTimestamp || new Date()).toISOString(),
        gpsLatitude: gpsLatitude,
        gpsLongitude: gpsLongitude,
        gpsAvailable: gpsStatus === 'recorded',
        engineerName: user?.fullName || 'Verified Civil Engineer',
        engineerSpecialty: (user as any)?.specialty || 'Lead Construction Engineer',
      });

      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('document', pdfFile);
      formData.append('projectId', String(projectId));
      formData.append('category', 'Reports');
      formData.append('targetRecipient', target);
      formData.append(
        'notes',
        `Official Accredited Site Evidence Certificate for milestone "${selectedMilestone?.label || 'Inspection'}" verified by Eng. ${user?.fullName || 'Civil Engineer'} with live GPS telemetry.`
      );

      await documentService.uploadDocument(formData);
      const label =
        target === 'property_owner'
          ? 'Project Owner'
          : target === 'administrator'
          ? 'Platform Administrator'
          : 'Project Owner & Administrator';
      setPdfDeliveredRecipient(label);
    } catch (err: any) {
      console.error('Failed to send PDF certificate:', err);
      alert('Failed to transmit PDF: ' + (err.message || 'Please try again'));
    } finally {
      setSendingPdf(false);
    }
  };

  const handleDownloadEvidencePdf = async (customPhotoUrl?: string) => {
    try {
      setDownloadingPdf(true);
      const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId);
      const photoToUse = customPhotoUrl || submittedEvidence?.photoUrl || capturedImage;
      if (!photoToUse) {
        alert('No photo available to generate PDF.');
        return;
      }

      await downloadEvidencePhotoPdf({
        projectTitle: projectTitle || 'Construction Site Evidence',
        projectLocation: projectLocation || 'On-site Inspection',
        milestoneLabel: selectedMilestone?.label || 'Milestone Evidence',
        photoUrl: photoToUse,
        description: description || submittedEvidence?.description || 'Verified site construction photographic evidence with GPS telemetry.',
        capturedAt: (capturedTimestamp || new Date()).toISOString(),
        gpsLatitude: gpsLatitude,
        gpsLongitude: gpsLongitude,
        gpsAvailable: gpsStatus === 'recorded',
        engineerName: user?.fullName || 'Verified Civil Engineer',
        engineerSpecialty: (user as any)?.specialty || 'Lead Construction Engineer',
      });
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate PDF: ' + (err.message || 'Please try again'));
    } finally {
      setDownloadingPdf(false);
    }
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
        if (gpsAccuracy !== null) {
          formData.append('gpsAccuracy', String(gpsAccuracy));
        }
      }

      const res = await evidenceService.uploadEvidence(formData);
      setSubmittedEvidence(res.evidence);
      setUploadSuccess(true);

      if (onEvidenceSubmitted) {
        onEvidenceSubmitted(res.evidence);
      }
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
    setSubmittedEvidence(null);
    setUploading(false);
    setCameraError(null);
    setPdfDeliveredRecipient(null);
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
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        {uploadSuccess ? (
          /* SUCCESS & PDF GENERATION SCREEN */
          <div className="p-6 sm:p-8 text-center space-y-5 flex-1 flex flex-col items-center justify-center animate-fadeIn overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={38} />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Site Evidence Certified & Saved!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Tamper-proof EXIF watermark, real phone GPS coordinates (±{gpsAccuracy || 5}m), and verified timestamp recorded successfully.
              </p>
            </div>

            {capturedImage && (
              <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 shadow-xl">
                <img
                  src={capturedImage}
                  alt="Certified Evidence"
                  className="w-full h-44 object-cover rounded-xl"
                />
                <div className="mt-2 text-left px-2 py-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold text-white truncate max-w-[200px]">
                    {milestones.find((m) => m.id === selectedMilestoneId)?.label || 'Milestone'}
                  </span>
                  {submittedEvidence?.isMockGps ? (
                    <span className="text-amber-400 font-semibold flex items-center gap-1" title={submittedEvidence?.mockSuspicionReason || 'Geofence / Location Warning'}>
                      <AlertTriangle size={12} /> Geofence / Mock Flag
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <MapPin size={12} /> GPS Verified
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Confirmation Banner */}
            {pdfDeliveredRecipient && (
              <div className="w-full max-w-md p-4 bg-emerald-950/70 border border-emerald-600 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-3 animate-fadeIn">
                <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="font-black text-sm text-white">Delivered Successfully!</p>
                  <p className="text-[11px] text-emerald-300">
                    Official Evidence Certificate transmitted directly to {pdfDeliveredRecipient} and logged in project documents.
                  </p>
                </div>
              </div>
            )}

            {/* High-visibility Action CTAs */}
            <div className="w-full max-w-md space-y-2.5 pt-2">
              {/* Button 1: Send to Project Owner */}
              <button
                type="button"
                onClick={() => handleSendEvidencePdf('property_owner')}
                disabled={sendingPdf || downloadingPdf}
                className="w-full py-3.5 px-6 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-orange-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {sendingPdf ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Delivering PDF Certificate to Owner...
                  </>
                ) : (
                  <>
                    <Send size={17} /> Deliver Certified PDF to Project Owner
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Button 2: Send to Both Owner & Admin */}
                <button
                  type="button"
                  onClick={() => handleSendEvidencePdf('both')}
                  disabled={sendingPdf || downloadingPdf}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Users size={14} /> Send to Owner & Admin
                </button>

                {/* Button 3: Download Local Copy */}
                <button
                  type="button"
                  onClick={() => handleDownloadEvidencePdf()}
                  disabled={downloadingPdf}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {downloadingPdf ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  <span>Download Local Copy</span>
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetState();
                    startCamera();
                  }}
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera size={14} /> Capture Another Photo
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl transition cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD CAPTURE VIEW */
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
                    Real GPS Location: <strong>{resolvedLocationName || resolvedLocationForWatermark || `${gpsLatitude?.toFixed(6)}, ${gpsLongitude?.toFixed(6)}`}</strong> (±{gpsAccuracy}m)
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
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition inline-flex items-center gap-1.5 cursor-pointer"
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
                  className="w-16 h-16 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition border-4 border-white/30 disabled:opacity-50 cursor-pointer"
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
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
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
        )}

        {/* Modal Footer (only when not in uploadSuccess state) */}
        {!uploadSuccess && (
          <div className="p-4 sm:p-5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>

            {capturedImage && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadEvidencePdf()}
                  disabled={downloadingPdf}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Generate instant PDF report directly from this photo"
                >
                  {downloadingPdf ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <FileDown size={14} />
                  )}
                  <span>Export PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Submitting Evidence...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} /> Submit Verified Evidence
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraEvidenceModal;
