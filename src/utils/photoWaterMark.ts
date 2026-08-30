/**
 * Photo Watermark Utility
 * Stamps photos with timestamp, location name, and engineer info
 */

export const stampPhotoWithMetadata = async (
  imageFile: File,
  locationName: string,
  timestamp: string,
  engineerName: string
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = img.width || 1200;
      canvas.height = img.height || 800;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const bannerHeight = Math.max(70, Math.round(canvas.height * 0.12));
      const bannerY = canvas.height - bannerHeight;

      const gradient = ctx.createLinearGradient(0, bannerY, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.88)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, bannerY, canvas.width, bannerHeight);

      ctx.fillStyle = '#f97316';
      ctx.fillRect(0, bannerY, canvas.width, Math.max(3, Math.round(bannerHeight * 0.04)));

      const fontSize = Math.max(14, Math.round(bannerHeight * 0.22));
      const smallFontSize = Math.max(11, Math.round(bannerHeight * 0.16));

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillText(
        `📍 ${locationName}`,
        Math.round(canvas.width * 0.03),
        bannerY + Math.round(bannerHeight * 0.42)
      );

      ctx.font = `${smallFontSize}px sans-serif`;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(
        `📅 ${timestamp}  •  🛡️ CamTrust Site Log  •  👷 ${engineerName}`,
        Math.round(canvas.width * 0.03),
        bannerY + Math.round(bannerHeight * 0.78)
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.92
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
};