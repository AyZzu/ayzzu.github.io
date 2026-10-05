/**
 * Utility for optimizing images to WebP format before uploading.
 * - Automatically converts JPG, PNG, BMP, TIFF, etc., to lightweight WebP.
 * - Scales down oversized images (default max dimension: 2048px) to save memory & disk space.
 * - Returns lightweight File object ready for FormData multipart upload.
 */

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function convertImageToWebP(file, options = {}) {
  const {
    quality = 0.85,
    maxDimension = 2048
  } = options;

  // Non-image files (e.g. PDF) are returned as-is
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  // SVG vectors should remain SVGs
  if (file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Downscale proportionally if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Derive new name with .webp extension
            const originalName = file.name || 'image';
            const lastDot = originalName.lastIndexOf('.');
            const baseName = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
            const newFileName = `${baseName}.webp`;

            const webpFile = new File([blob], newFileName, {
              type: 'image/webp',
              lastModified: Date.now()
            });

            // Metadata for UI feedback
            webpFile.originalSize = file.size;
            webpFile.optimizedSize = webpFile.size;
            webpFile.isWebPConverted = true;
            webpFile.savingsPercent = file.size > 0
              ? Math.max(0, Math.round(((file.size - webpFile.size) / file.size) * 100))
              : 0;

            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => {
        resolve(file);
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
}

export async function convertMultipleImagesToWebP(fileList, options = {}) {
  const files = Array.from(fileList);
  return Promise.all(files.map(f => convertImageToWebP(f, options)));
}
