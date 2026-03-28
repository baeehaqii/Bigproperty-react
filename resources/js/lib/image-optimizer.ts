/**
 * Image Optimizer Utility
 * 
 * Provides functions to optimize images from various sources (Cloudinary, GCS)
 * with proper caching, format conversion, and responsive sizing.
 */

interface CloudinaryTransformOptions {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb';
    gravity?: 'auto' | 'face' | 'center';
    blur?: number;
    dpr?: number | 'auto';
}

interface SrcSetOptions {
    widths?: number[];
    baseWidth?: number;
    maxWidth?: number;
}

/**
 * Transform Cloudinary URL with optimization parameters
 */
export function optimizeCloudinaryUrl(
    url: string,
    options: CloudinaryTransformOptions = {}
): string {
    if (!url || !url.includes('cloudinary.com')) {
        return url;
    }

    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        crop = 'fill',
        gravity = 'auto',
        blur,
        dpr = 'auto'
    } = options;

    // Build transformation string
    const transforms: string[] = [];

    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    transforms.push(`q_${quality}`);
    transforms.push(`f_${format}`);
    if (crop) transforms.push(`c_${crop}`);
    if (gravity) transforms.push(`g_${gravity}`);
    if (blur) transforms.push(`e_blur:${blur}`);
    if (dpr) transforms.push(`dpr_${dpr}`);

    // Add caching and optimization flags
    transforms.push('fl_progressive');
    transforms.push('fl_immutable_cache');

    const transformString = transforms.join(',');

    // Insert transforms into URL
    // Cloudinary URL format: https://res.cloudinary.com/{cloud}/image/upload/{transforms}/{path}
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) {
        return url;
    }

    const beforeUpload = url.substring(0, uploadIndex + 8);
    const afterUpload = url.substring(uploadIndex + 8);

    // Check if there are already transforms
    const hasTransforms = afterUpload.startsWith('v') || afterUpload.includes('/');
    if (hasTransforms && afterUpload.match(/^[a-z_0-9,]+\//i)) {
        // Replace existing transforms
        const pathStart = afterUpload.indexOf('/');
        const path = afterUpload.substring(pathStart + 1);
        return `${beforeUpload}${transformString}/${path}`;
    }

    return `${beforeUpload}${transformString}/${afterUpload}`;
}

/**
 * Transform Google Cloud Storage URL with image optimization
 */
export function optimizeGCSUrl(
    url: string,
    options: { width?: number; height?: number } = {}
): string {
    if (!url || !url.includes('storage.googleapis.com')) {
        return url;
    }

    // GCS doesn't support on-the-fly transforms like Cloudinary
    // Return original URL but ensure HTTPS
    return url.replace(/^http:/, 'https:');
}

/**
 * Generate optimized URL for any image source
 */
export function optimizeImageUrl(
    url: string,
    options: CloudinaryTransformOptions = {}
): string {
    if (!url) return '';

    if (url.includes('cloudinary.com')) {
        return optimizeCloudinaryUrl(url, options);
    }

    if (url.includes('storage.googleapis.com')) {
        return optimizeGCSUrl(url, options);
    }

    // Return original URL for other sources
    return url;
}

/**
 * Generate srcSet string for responsive images
 */
export function generateSrcSet(
    url: string,
    options: SrcSetOptions = {}
): string {
    const { widths = [320, 640, 768, 1024, 1280, 1536], baseWidth = 320 } = options;

    if (!url.includes('cloudinary.com')) {
        // For non-Cloudinary images, return single URL
        return url;
    }

    return widths
        .map((width) => {
            const optimizedUrl = optimizeCloudinaryUrl(url, { width, quality: 'auto', format: 'auto' });
            return `${optimizedUrl} ${width}w`;
        })
        .join(', ');
}

/**
 * Get placeholder blur URL (tiny image for blur-up)
 */
export function getBlurPlaceholder(url: string): string {
    if (!url) return '';

    if (url.includes('cloudinary.com')) {
        return optimizeCloudinaryUrl(url, {
            width: 20,
            quality: 10,
            format: 'auto',
            blur: 500,
        });
    }

    // Return empty for non-Cloudinary images
    return '';
}

/**
 * Preload critical images by adding link elements to document head
 */
export function preloadImage(
    url: string,
    options: { as?: 'image'; fetchpriority?: 'high' | 'low' | 'auto' } = {}
): void {
    if (typeof document === 'undefined' || !url) return;

    const { fetchpriority = 'high' } = options;

    // Check if already preloaded
    const existing = document.querySelector(`link[rel="preload"][href="${url}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.setAttribute('fetchpriority', fetchpriority);

    document.head.appendChild(link);
}

/**
 * Intersection Observer-based lazy loading utility
 */
export function createLazyLoadObserver(
    onIntersect: (entry: IntersectionObserverEntry) => void,
    options: IntersectionObserverInit = {}
): IntersectionObserver | null {
    if (typeof IntersectionObserver === 'undefined') {
        return null;
    }

    const defaultOptions: IntersectionObserverInit = {
        root: null,
        rootMargin: '50px 0px',
        threshold: 0.01,
        ...options,
    };

    return new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                onIntersect(entry);
            }
        });
    }, defaultOptions);
}

/**
 * Get responsive sizes attribute based on layout
 */
export function getResponsiveSizes(layout: 'full' | 'half' | 'third' | 'quarter' | 'card'): string {
    switch (layout) {
        case 'full':
            return '100vw';
        case 'half':
            return '(max-width: 768px) 100vw, 50vw';
        case 'third':
            return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
        case 'quarter':
            return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw';
        case 'card':
            return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px';
        default:
            return '100vw';
    }
}

/**
 * Check if image supports native lazy loading
 */
export function supportsNativeLazyLoading(): boolean {
    return typeof HTMLImageElement !== 'undefined' && 'loading' in HTMLImageElement.prototype;
}

/**
 * Cache control headers recommendation for CDN/server
 */
export const CACHE_CONTROL_RECOMMENDATIONS = {
    // For static assets (logo, icons) - 1 year
    static: 'public, max-age=31536000, immutable',
    // For property images - 1 week with revalidation
    property: 'public, max-age=604800, stale-while-revalidate=86400',
    // For user uploads - 1 day with revalidation
    upload: 'public, max-age=86400, stale-while-revalidate=3600',
    // For dynamic content - no cache
    dynamic: 'no-store, no-cache, must-revalidate',
} as const;
