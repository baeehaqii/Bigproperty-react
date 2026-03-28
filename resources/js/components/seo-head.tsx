"use client"

import { Head } from '@inertiajs/react'
import { ReactNode } from 'react'

interface SEOHeadProps {
    /** Page title - will be appended with site name */
    title?: string
    /** Meta description for search engines */
    description?: string
    /** Canonical URL for the page */
    canonical?: string
    /** Open Graph image URL */
    ogImage?: string
    /** Open Graph type */
    ogType?: 'website' | 'article' | 'product' | 'profile'
    /** Twitter card type */
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
    /** Keywords for meta tag (less important for modern SEO but still useful) */
    keywords?: string[]
    /** Article publish date (for article type) */
    publishedTime?: string
    /** Article modified date */
    modifiedTime?: string
    /** Author name */
    author?: string
    /** Disable indexing for this page */
    noIndex?: boolean
    /** Disable following links on this page */
    noFollow?: boolean
    /** Additional meta tags */
    additionalMeta?: ReactNode
    /** JSON-LD structured data */
    structuredData?: object
    /** Preload resources */
    preload?: Array<{
        href: string
        as: 'image' | 'font' | 'style' | 'script'
        type?: string
        crossOrigin?: 'anonymous' | 'use-credentials'
    }>
    /** Preconnect to external origins */
    preconnect?: string[]
    /** DNS prefetch for external origins */
    dnsPrefetch?: string[]
}

const SITE_NAME = 'Big Property'
const SITE_URL = 'https://bigproperty.id'
const DEFAULT_DESCRIPTION = 'Big Property - Situs jual beli properti terpercaya di Indonesia. Temukan rumah, apartemen, tanah, dan properti impian Anda dengan mudah.'
const DEFAULT_OG_IMAGE = 'https://storage.googleapis.com/bigproperty_image/website_assets/og-image-bigproperty.png'

/**
 * SEOHead Component
 * 
 * Comprehensive SEO meta tags component for better search engine optimization.
 * Handles:
 * - Title tags with proper formatting
 * - Meta description
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 * - Canonical URLs
 * - Robots meta tag
 * - JSON-LD structured data
 * - Resource preloading for performance
 */
export function SEOHead({
    title,
    description = DEFAULT_DESCRIPTION,
    canonical,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    twitterCard = 'summary_large_image',
    keywords = [],
    publishedTime,
    modifiedTime,
    author,
    noIndex = false,
    noFollow = false,
    additionalMeta,
    structuredData,
    preload = [],
    preconnect = [],
    dnsPrefetch = [],
}: SEOHeadProps) {
    // Format title properly
    const formattedTitle = title
        ? `${title} | ${SITE_NAME}`
        : `${SITE_NAME} - Situs Jual Beli Properti Terpercaya`

    // Build robots meta content
    const robotsContent = [
        noIndex ? 'noindex' : 'index',
        noFollow ? 'nofollow' : 'follow',
        'max-image-preview:large',
        'max-snippet:-1',
        'max-video-preview:-1',
    ].join(', ')

    // Canonical URL
    const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : SITE_URL)

    // Default preconnect origins for performance
    const defaultPreconnect = [
        'https://res.cloudinary.com',
        'https://storage.googleapis.com',
        'https://fonts.bunny.net',
        ...preconnect,
    ]

    // Default DNS prefetch
    const defaultDnsPrefetch = [
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        ...dnsPrefetch,
    ]

    return (
        <Head title={title || ''}>
            {/* Primary Meta Tags */}
            <meta name="description" content={description} />
            <meta name="robots" content={robotsContent} />
            {keywords.length > 0 && (
                <meta name="keywords" content={keywords.join(', ')} />
            )}
            {author && <meta name="author" content={author} />}

            {/* Canonical URL */}
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={formattedTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="id_ID" />

            {/* Article-specific Open Graph */}
            {ogType === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {ogType === 'article' && modifiedTime && (
                <meta property="article:modified_time" content={modifiedTime} />
            )}
            {ogType === 'article' && author && (
                <meta property="article:author" content={author} />
            )}

            {/* Twitter */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={formattedTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Mobile & PWA */}
            <meta name="theme-color" content="#ECEC5C" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />

            {/* Preconnect to external origins for faster resource loading */}
            {defaultPreconnect.map((origin) => (
                <link key={origin} rel="preconnect" href={origin} crossOrigin="anonymous" />
            ))}

            {/* DNS Prefetch */}
            {defaultDnsPrefetch.map((origin) => (
                <link key={origin} rel="dns-prefetch" href={origin} />
            ))}

            {/* Preload critical resources */}
            {preload.map((resource, index) => (
                <link
                    key={`preload-${index}`}
                    rel="preload"
                    href={resource.href}
                    as={resource.as}
                    type={resource.type}
                    crossOrigin={resource.crossOrigin}
                />
            ))}

            {/* JSON-LD Structured Data */}
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            )}

            {/* Additional custom meta tags */}
            {additionalMeta}
        </Head>
    )
}

/**
 * Generate Organization structured data
 */
export function getOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Big Property',
        url: SITE_URL,
        logo: 'https://storage.googleapis.com/bigproperty_image/website_assets/logo-bigproperty.png',
        sameAs: [
            'https://www.facebook.com/bigproperty.id',
            'https://www.instagram.com/bigproperty.id',
            'https://twitter.com/bigproperty_id',
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+62-xxx-xxxx-xxxx',
            contactType: 'customer service',
            availableLanguage: ['Indonesian', 'English'],
        },
    }
}

/**
 * Generate Website structured data
 */
export function getWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Big Property',
        url: SITE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/beli?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    }
}

/**
 * Generate RealEstateListing structured data for property pages
 */
export function getPropertySchema(property: {
    id: string
    name: string
    description: string
    price: number
    address: string
    city: string
    province: string
    image: string
    bedrooms?: number
    bathrooms?: number
    landSize?: number
    buildingSize?: number
    propertyType: string
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        '@id': `${SITE_URL}/property/${property.id}`,
        name: property.name,
        description: property.description,
        url: `${SITE_URL}/property/${property.id}`,
        image: property.image,
        offers: {
            '@type': 'Offer',
            price: property.price,
            priceCurrency: 'IDR',
            availability: 'https://schema.org/InStock',
        },
        address: {
            '@type': 'PostalAddress',
            streetAddress: property.address,
            addressLocality: property.city,
            addressRegion: property.province,
            addressCountry: 'ID',
        },
        ...(property.bedrooms && { numberOfRooms: property.bedrooms }),
        ...(property.landSize && {
            floorSize: {
                '@type': 'QuantitativeValue',
                value: property.landSize,
                unitCode: 'MTK',
            },
        }),
    }
}

/**
 * Generate BreadcrumbList structured data
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    }
}

export default SEOHead
