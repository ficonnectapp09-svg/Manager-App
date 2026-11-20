/**
 * Media & Image URL Resolution Utilities
 * Authoritative normalization for Cloudinary, backend static assets, and local media
 */
import { ENV } from '../constants/env';

/**
 * Checks if a given URL is hosted on Cloudinary CDN
 */
export function isCloudinaryUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

/**
 * Resolves any image URL, relative server path, or media reference into a valid URI
 * that can be rendered directly by React Native <Image /> or downloaded.
 *
 * Rules:
 * 1. Absolute HTTPS URLs (including Cloudinary) -> returned directly
 * 2. Insecure HTTP URLs -> upgraded to HTTPS if on Render domain
 * 3. Relative server paths (/uploads/..., /api/...) -> prefixed with ENV.serverUrl
 * 4. Local device URIs (file://, data:, blob:) -> returned directly
 * 5. Plain filenames -> prefixed with ENV.serverUrl/uploads/
 */
export function resolveImageUrl(urlOrPath?: string | null): string {
  if (!urlOrPath || typeof urlOrPath !== 'string') {
    return '';
  }

  const trimmed = urlOrPath.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed.includes('undefined') || trimmed.includes('/uploads/undefined')) {
    return '';
  }

  // Case 1: Local device file URI or Base64 / Blob URI
  if (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('content://')
  ) {
    return trimmed;
  }

  // Case 2: Absolute HTTP / HTTPS URLs
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    // If it's an old insecure HTTP Render reference, upgrade to HTTPS
    if (trimmed.startsWith('http://') && trimmed.includes('onrender.com')) {
      return trimmed.replace('http://', 'https://');
    }
    return trimmed;
  }

  // Case 3: Root-relative server paths (e.g. /uploads/filename.jpg, /api/media/s3/...)
  const serverOrigin = ENV.serverUrl.replace(/\/+$/, '');
  if (trimmed.startsWith('/')) {
    return `${serverOrigin}${trimmed}`;
  }

  // Case 4: uploads/filename.jpg without leading slash
  if (trimmed.startsWith('uploads/')) {
    return `${serverOrigin}/${trimmed}`;
  }

  // Case 5: Plain filename (e.g. avatar_1731568291000.jpg)
  return `${serverOrigin}/uploads/${trimmed}`;
}

/**
 * Generates an optimized Cloudinary delivery URL with dynamic width, height, and auto format.
 * If the URL is not a Cloudinary URL, returns the resolved URL directly.
 */
export function getOptimizedImageUrl(
  urlOrPath?: string | null,
  options?: { width?: number; height?: number; quality?: 'auto' | 'good' | 'eco' }
): string {
  const resolved = resolveImageUrl(urlOrPath);
  if (!resolved || !isCloudinaryUrl(resolved)) {
    return resolved;
  }

  try {
    // Look for /upload/ segment in Cloudinary URL
    const uploadIndex = resolved.indexOf('/upload/');
    if (uploadIndex === -1) return resolved;

    const prefix = resolved.substring(0, uploadIndex + 8);
    const rest = resolved.substring(uploadIndex + 8);

    // If already has transformation parameters right after /upload/, return as-is
    if (rest.startsWith('w_') || rest.startsWith('c_') || rest.startsWith('q_') || rest.startsWith('f_')) {
      return resolved;
    }

    const transformations: string[] = ['f_auto', 'q_auto'];
    if (options?.width) {
      transformations.push(`w_${Math.round(options.width)}`);
    }
    if (options?.height) {
      transformations.push(`h_${Math.round(options.height)}`);
    }
    if (options?.width && options?.height) {
      transformations.push('c_fill');
    }

    const transformStr = transformations.join(',');
    return `${prefix}${transformStr}/${rest}`;
  } catch {
    return resolved;
  }
}

