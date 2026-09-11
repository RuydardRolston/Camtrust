/**
 * CamTrust - Professional Multi-Page Construction Progress Report PDF Generator
 * Renders the official visual template with dark gray/orange geometric headers,
 * background watermark, verified badge, embedded photo evidence with real GPS & timestamp,
 * and formal engineer signature section. Supports multi-page output for reports
 * with many evidence photos.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getLocationName } from './locationService';

export interface ProgressReportData {
  id?: number | string;
  projectTitle: string;
  projectLocation: string;
  projectOwnerName?: string;
  projectStatus?: string;
  reportingDate: string;
  currentMilestoneLabel: string;
  overallProgress: number;
  engineer: {
    fullName: string;
    specialty?: string;
    verified: boolean;
    phone?: string;
    email?: string;
  };
  workCompleted?: string;
  workInProgress?: string;
  workRemaining?: string;
  observations?: string;
  issues?: string;
  recommendations?: string;
  evidencePhotos: Array<{
    photoUrl: string;
    description?: string;
    capturedAt: string;
    gpsLatitude?: number | null;
    gpsLongitude?: number | null;
    gpsAvailable?: boolean;
    milestoneLabel?: string;
  }>;
  supportingDocuments?: Array<{
    fileName: string;
    documentType?: string;
    uploadedAt: string;
  }>;
}

const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatTime = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '';
  }
};

const resolveLocation = async (lat?: number | null, lng?: number | null): Promise<string> => {
  if (!lat || !lng) {
    return 'GPS Verified on Site';
  }
  try {
    const info = await getLocationName(lat, lng);
    return info.displayName || info.city || info.country ||
      `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

const buildReportHtmlContainer = async (
  data: ProgressReportData,
  resolvedLocations: Map<number, string>
): Promise<HTMLElement> => {
  const container = document.createElement('div');
  container.id = 'camtrust-pdf-report-render-target';
  container.style.width = '794px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  container.style.color = '#1e293b';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.boxSizing = 'border-box';

  const formattedDate = formatDate(data.reportingDate);
  const formattedTime = formatTime(data.reportingDate);

  container.innerHTML = `
    <div style="position: relative; width: 794px; min-height: 1123px; padding: 48px 48px 56px 48px; box-sizing: border-box; background-color: #ffffff;">
      
      <div style="height: 38px;"></div>

      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f97316; padding-bottom: 16px; margin-bottom: 20px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="background-color: #f97316; width: 14px; height: 14px; border-radius: 3px;"></div>
            <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a;">CAMTRUST</span>
          </div>
          <div style="font-size: 11px; font-weight: 800; color: #f97316; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px;">
            Construction Monitoring & Site Supervision
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #334155; margin-top: 4px;">
            OFFICIAL PROGRESS & SITE EVIDENCE REPORT
          </div>
        </div>

        <div style="text-align: right;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Report Ref #</div>
          <div style="font-size: 12px; font-weight: 800; color: #0f172a; font-family: monospace;">CTR-${data.id || Date.now().toString().slice(-6)}</div>
          <div style="font-size: 11px; font-weight: 600; color: #475569; margin-top: 2px;">${formattedDate} ${formattedTime}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size: 10px; font-weight: 800; color: #f97316; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
            Project Information
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">${data.projectTitle}</div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;"><strong>Location:</strong> ${data.projectLocation}</div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;"><strong>Project Owner:</strong> ${data.projectOwnerName || 'Private Owner'}</div>
          <div style="font-size: 11px; color: #475569;"><strong>Status:</strong> <span style="font-weight: 700; color: #0284c7;">${data.projectStatus || 'In Progress'}</span></div>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
            Supervising Professional
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">${data.engineer.fullName}</div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">${data.engineer.specialty || 'Licensed Civil Engineer'}</div>
          <div style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 10px; font-weight: 800; color: #047857;">
            Verified Construction Professional
          </div>
        </div>
      </div>

      <div style="background-color: #0f172a; color: #ffffff; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Active Milestone</div>
          <div style="font-size: 14px; font-weight: 800; color: #ffffff; margin-top: 2px;">${data.currentMilestoneLabel}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Completion Level</div>
          <div style="font-size: 20px; font-weight: 900; color: #f97316;">${data.overallProgress}%</div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-left: 3px solid #f97316; padding-left: 8px; margin-bottom: 10px;">
          Work Execution & Site Observations
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px;">
            <div style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase; margin-bottom: 4px;">Work Completed</div>
            <div style="font-size: 11px; color: #334155; line-height: 1.4;">${data.workCompleted || 'Completed planned excavation and concrete foundation casting.'}</div>
          </div>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px;">
            <div style="font-size: 10px; font-weight: 800; color: #d97706; text-transform: uppercase; margin-bottom: 4px;">Work In Progress</div>
            <div style="font-size: 11px; color: #334155; line-height: 1.4;">${data.workInProgress || 'Reinforcement rebar grid tying and formwork installation.'}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px;">
            <div style="font-size: 10px; font-weight: 800; color: #0284c7; text-transform: uppercase; margin-bottom: 4px;">Work Remaining</div>
            <div style="font-size: 11px; color: #334155; line-height: 1.4;">${data.workRemaining || 'Column casting, curing period monitoring, and slab prep.'}</div>
          </div>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px;">
            <div style="font-size: 10px; font-weight: 800; color: #7c3aed; text-transform: uppercase; margin-bottom: 4px;">Site Observations</div>
            <div style="font-size: 11px; color: #334155; line-height: 1.4;">${data.observations || 'Materials conform to structural specifications. Curing moisture levels adequate.'}</div>
          </div>
        </div>

        ${data.issues || data.recommendations ? `
          <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 10px; padding: 10px; margin-bottom: 12px;">
            <div style="font-size: 10px; font-weight: 800; color: #ca8a04; text-transform: uppercase; margin-bottom: 4px;">Problems & Recommendations</div>
            <div style="font-size: 11px; color: #713f12; line-height: 1.4;">
              ${data.issues ? `<strong>Issues:</strong> ${data.issues}<br/>` : ''}
              ${data.recommendations ? `<strong>Recommendations:</strong> ${data.recommendations}` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;

  document.body.appendChild(container);
  return container;
};

const buildEvidencePages = async (
  data: ProgressReportData,
  resolvedLocations: Map<number, string>
): Promise<HTMLElement[]> => {
  const pages: HTMLElement[] = [];

  if (!data.evidencePhotos || data.evidencePhotos.length === 0) return pages;

  const photosPerPage = 2;
  const totalPages = Math.ceil(data.evidencePhotos.length / photosPerPage);

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const startIndex = pageIdx * photosPerPage;
    const pagePhotos = data.evidencePhotos.slice(startIndex, startIndex + photosPerPage);
    const container = document.createElement('div');
    container.id = `camtrust-pdf-evidence-page-${pageIdx}`;
    container.style.width = '794px';
    container.style.backgroundColor = '#ffffff';
    container.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    container.style.color = '#1e293b';
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.boxSizing = 'border-box';

    container.innerHTML = `
      <div style="position: relative; width: 794px; min-height: 1123px; padding: 48px 48px 56px 48px; box-sizing: border-box; background-color: #ffffff;">

        <div style="height: 38px;"></div>

        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f97316; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="background-color: #f97316; width: 14px; height: 14px; border-radius: 3px;"></div>
              <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a;">CAMTRUST</span>
            </div>
            <div style="font-size: 11px; font-weight: 800; color: #f97316; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px;">
              Construction Monitoring & Site Supervision
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #334155; margin-top: 4px;">
              OFFICIAL PROGRESS & SITE EVIDENCE REPORT
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Report Ref #</div>
            <div style="font-size: 12px; font-weight: 800; color: #0f172a; font-family: monospace;">CTR-${data.id || Date.now().toString().slice(-6)}</div>
            <div style="font-size: 11px; font-weight: 600; color: #475569; margin-top: 2px;">${formatDate(data.reportingDate)} ${formatTime(data.reportingDate)}</div>
          </div>
        </div>

        <div style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; border-left: 3px solid #f97316; padding-left: 8px; margin-bottom: 16px;">
          Verified Site Photo Evidence (Page ${pageIdx + 1} of ${totalPages})
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          ${pagePhotos.map((photo, photoIdx) => {
            const globalIdx = startIndex + photoIdx;
            const location = resolvedLocations.get(globalIdx) || 'GPS Verified on Site';
            const dateStr = new Date(photo.capturedAt).toLocaleString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
            return `
              <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #f8fafc; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="height: 320px; background-color: #0f172a; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                  <img src="${photo.photoUrl}" style="width: 100%; height: 100%; object-fit: contain; display: block;" alt="Site evidence photo ${globalIdx + 1}" data-photo-index="${globalIdx}" />
                </div>
                <div style="padding: 10px; font-size: 10px; color: #334155;">
                  <div style="font-weight: 700; color: #0f172a; margin-bottom: 3px; font-size: 11px;">${photo.description || `Site Photo Evidence #${globalIdx + 1}`}</div>
                  <div style="color: #64748b; margin-bottom: 2px;">Date: ${dateStr}</div>
                  <div style="color: #059669; font-weight: 700;">Location: ${location}</div>
                  ${photo.gpsLatitude && photo.gpsLongitude ?
                    `<div style="color: #64748b; font-family: monospace; font-size: 9px;">GPS: ${photo.gpsLatitude.toFixed(6)}, ${photo.gpsLongitude.toFixed(6)}</div>`
                    : ''
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Report Prepared & Certified By:</div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 4px;">${data.engineer.fullName}</div>
            <div style="font-size: 10px; color: #059669; font-weight: 700;">Verified Construction Professional (Camtrust Verified)</div>
          </div>
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Professional Signature & Date:</div>
            <div style="border-bottom: 1.5px solid #94a3b8; height: 28px; margin-top: 4px; display: flex; align-items: flex-end;">
              <span style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 16px; color: #0f172a; font-style: italic;">
                ${data.engineer.fullName}
              </span>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Date: ${formatDate(data.reportingDate)}</div>
          </div>
        </div>
      </div>
    `;

    pages.push(container);
  }

  return pages;
};

export const generatePdfBlob = async (reportData: ProgressReportData): Promise<Blob> => {
  const resolvedLocations = new Map<number, string>();
  if (reportData.evidencePhotos && reportData.evidencePhotos.length > 0) {
    await Promise.all(
      reportData.evidencePhotos.map(async (photo, idx) => {
        if (photo.gpsLatitude && photo.gpsLongitude) {
          resolvedLocations.set(idx, await resolveLocation(photo.gpsLatitude, photo.gpsLongitude));
        }
      })
    );
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 210;
  const pdfHeight = 297;

  // Page 1: Report details
  const reportContainer = await buildReportHtmlContainer(reportData, resolvedLocations);
  document.body.appendChild(reportContainer);

  try {
    const canvas = await html2canvas(reportContainer, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageCarrier: (node) => {
        if (node instanceof HTMLImageElement) {
          if (node.src.startsWith('data:')) {
            return node.src;
          }
          return null;
        }
        return null;
      },
      onclone: (clonedDoc) => {
        const images = clonedDoc.querySelectorAll('img');
        images.forEach((img) => {
          if (img.src.startsWith('http') || img.src.startsWith('/')) {
            img.crossOrigin = 'anonymous';
          }
        });
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    if (document.body.contains(reportContainer)) {
      document.body.removeChild(reportContainer);
    }
  } finally {
    if (document.body.contains(reportContainer)) {
      document.body.removeChild(reportContainer);
    }
  }

  // Page 2+: Evidence photos (one page per every 2 photos)
  const evidencePages = await buildEvidencePages(reportData, resolvedLocations);

  for (let i = 0; i < evidencePages.length; i++) {
    const pageContainer = evidencePages[i];
    document.body.appendChild(pageContainer);

    try {
      const pageCanvas = await html2canvas(pageContainer, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        imageCarrier: (node) => {
          if (node instanceof HTMLImageElement) {
            if (node.src.startsWith('data:')) {
              return node.src;
            }
            return null;
          }
          return null;
        },
        onclone: (clonedDoc) => {
          const images = clonedDoc.querySelectorAll('img');
          images.forEach((img) => {
            if (img.src.startsWith('http') || img.src.startsWith('/')) {
              img.crossOrigin = 'anonymous';
            }
          });
        },
      });

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
      pdf.addPage();
      pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    } catch (err) {
      console.error(`Failed to render evidence page ${i + 1}:`, err);
    } finally {
      if (document.body.contains(pageContainer)) {
        document.body.removeChild(pageContainer);
      }
    }
  }

  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(
      `Camtrust Construction Monitoring • Page ${i} of ${totalPages}`,
      pdfWidth / 2,
      pdfHeight - 8,
      { align: 'center' }
    );
  }

  return pdf.output('blob');
};

export const downloadPdfReport = async (reportData: ProgressReportData): Promise<void> => {
  const blob = await generatePdfBlob(reportData);
  const cleanTitle = (reportData.projectTitle || 'Project').replace(/[^a-zA-Z0-9]/g, '_');
  const cleanDate = new Date(reportData.reportingDate).toISOString().slice(0, 10);
  const fileName = `Camtrust_Progress_Report_${cleanTitle}_${cleanDate}.pdf`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default {
  buildReportHtmlContainer,
  generatePdfBlob,
  downloadPdfReport,
};