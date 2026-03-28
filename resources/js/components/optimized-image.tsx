"use client"

import { useState, useRef, useEffect, ImgHTMLAttributes, memo } from "react"
import {
    optimizeImageUrl,
    generateSrcSet,
    getBlurPlaceholder,
    getResponsiveSizes,
    supportsNativeLazyLoading,
} from "@/lib/image-optimizer"

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
    /** Image source URL */
    src: string
    /** Alt text for accessibility (required for SEO) */
    alt: string
    /** Width hint for optimization */
    width?: number
    /** Height hint for optimization */
    height?: number
    /** Layout type for responsive sizing */
    layout?: 'full' | 'half' | 'third' | 'quarter' | 'card'
    /** Priority loading (for above-the-fold images) */
    priority?: boolean
    /** Enable blur placeholder effect */
    blur?: boolean
    /** Custom placeholder color while loading */
    placeholderColor?: string
    /** Object fit style */
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
    /** Fallback image URL */
    fallback?: string
    /** Custom widths for srcSet generation */
    srcSetWidths?: number[]
    /** Aspect ratio (e.g., "16/9", "4/3", "1/1") */
    aspectRatio?: string
    /** Quality setting (1-100 or 'auto') */
    quality?: number | 'auto'
    /** Container className for wrapper div */
    containerClassName?: string
    /** Callback when image loads successfully */
    onLoadComplete?: () => void
    /** Callback when image fails to load */
    onLoadError?: () => void
}

/**
 * OptimizedImage Component
 * 
 * A high-performance image component with:
 * - Automatic WebP/AVIF conversion (via Cloudinary)
 * - Responsive srcSet generation
 * - Lazy loading with Intersection Observer fallback
 * - Blur-up placeholder effect
 * - Error handling with fallback
 * - Proper alt text for SEO
 * - Native lazy loading with polyfill
 */
export const OptimizedImage = memo(function OptimizedImage({
    src,
    alt,
    width,
    height,
    layout = 'card',
    priority = false,
    blur = true,
    placeholderColor = '#f3f4f6',
    objectFit = 'cover',
    fallback = '/placeholder.svg',
    srcSetWidths,
    aspectRatio,
    quality = 'auto',
    className = '',
    containerClassName = '',
    style,
    onLoadComplete,
    onLoadError,
    ...imgProps
}: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(priority)
    const [hasError, setHasError] = useState(false)
    const [currentSrc, setCurrentSrc] = useState(src)
    const imgRef = useRef<HTMLImageElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Optimized URLs
    const optimizedSrc = optimizeImageUrl(currentSrc, {
        width,
        height,
        quality,
        format: 'auto',
    })

    const srcSet = srcSetWidths
        ? generateSrcSet(currentSrc, { widths: srcSetWidths })
        : generateSrcSet(currentSrc)

    const blurPlaceholder = blur ? getBlurPlaceholder(currentSrc) : ''
    const sizes = getResponsiveSizes(layout)

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority) {
            setIsInView(true)
            return
        }

        // Use native lazy loading if supported
        if (supportsNativeLazyLoading()) {
            setIsInView(true)
            return
        }

        // Fallback to Intersection Observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true)
                        observer.disconnect()
                    }
                })
            },
            {
                rootMargin: '50px 0px',
                threshold: 0.01,
            }
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [priority])

    // Reset state when src changes
    useEffect(() => {
        setCurrentSrc(src)
        setHasError(false)
        setIsLoaded(false)
    }, [src])

    const handleLoad = () => {
        setIsLoaded(true)
        onLoadComplete?.()
    }

    const handleError = () => {
        if (!hasError && fallback && currentSrc !== fallback) {
            setHasError(true)
            setCurrentSrc(fallback)
            onLoadError?.()
        }
    }

    // Determine loading attribute
    const loadingAttr = priority ? 'eager' : 'lazy'
    const fetchPriority = priority ? 'high' : 'auto'

    // Container styles
    const containerStyles: React.CSSProperties = {
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: placeholderColor,
        ...(aspectRatio && { aspectRatio }),
    }

    // Image styles
    const imageStyles: React.CSSProperties = {
        objectFit,
        width: '100%',
        height: '100%',
        transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out',
        opacity: isLoaded ? 1 : 0,
        filter: isLoaded ? 'none' : 'blur(5px)',
        ...style,
    }

    // Blur placeholder styles
    const placeholderStyles: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        objectFit,
        width: '100%',
        height: '100%',
        filter: 'blur(20px)',
        transform: 'scale(1.1)',
        opacity: isLoaded ? 0 : 1,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: 'none',
    }

    return (
        <div
            ref={containerRef}
            className={containerClassName}
            style={containerStyles}
        >
            {/* Blur placeholder */}
            {blur && blurPlaceholder && !isLoaded && isInView && (
                <img
                    src={blurPlaceholder}
                    alt=""
                    aria-hidden="true"
                    style={placeholderStyles}
                    loading="eager"
                    decoding="async"
                />
            )}

            {/* Main image */}
            {isInView && (
                <img
                    ref={imgRef}
                    src={optimizedSrc}
                    srcSet={srcSet}
                    sizes={sizes}
                    alt={alt}
                    width={width}
                    height={height}
                    loading={loadingAttr}
                    decoding="async"
                    fetchPriority={fetchPriority}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={className}
                    style={imageStyles}
                    {...imgProps}
                />
            )}

            {/* Fallback skeleton when not in view */}
            {!isInView && (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: placeholderColor,
                    }}
                    aria-hidden="true"
                />
            )}
        </div>
    )
})

/**
 * Preload critical images in document head
 * Use this in parent components for above-the-fold images
 */
export function usePreloadImage(src: string, priority: boolean = false) {
    useEffect(() => {
        if (!priority || !src || typeof document === 'undefined') return

        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = optimizeImageUrl(src, { quality: 'auto', format: 'auto' })
        link.setAttribute('fetchpriority', 'high')

        document.head.appendChild(link)

        return () => {
            document.head.removeChild(link)
        }
    }, [src, priority])
}

export default OptimizedImage
