"use client"

import { useState, useEffect, useCallback } from "react"
import { PopularPropertyCard } from "./popular-properties-card"
import { ChevronLeft, ChevronRight, Home, RefreshCw } from "lucide-react"

interface PropertyFeature {
    icon: string
    text: string
}

interface Property {
    id: string
    image: string
    images: string[]
    promoText: string
    features: PropertyFeature[]
    type: string
    units?: string
    priceRange: string
    installment: string
    name: string
    developer: string
    developerLogo: string
    agent?: {
        name: string
        photo?: string
    }
    location: string
    city?: string
    province?: string
    bedrooms: string
    landSize: string
    buildingSize: string
    additionalInfo?: string
    lastUpdated: string
    buttonType: "view" | "chat"
    available: boolean
    countClicked?: number
}

interface Pagination {
    current_page: number
    last_page: number
    per_page: number
    total: number
    has_more_pages: boolean
    from: number | null
    to: number | null
}

export function LatestProperties() {
    const [properties, setProperties] = useState<Property[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const fetchLatestProperties = useCallback(async (page: number) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/latest-properties?page=${page}`)
            const data = await response.json()

            if (data.success && data.data) {
                setProperties(data.data.properties || [])
                setPagination(data.data.pagination || null)
            } else {
                setError(data.message || 'Gagal memuat properti terbaru')
                setProperties([])
            }
        } catch (err) {
            console.error('Error fetching latest properties:', err)
            setError('Gagal memuat data properti')
            setProperties([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch on mount and page change
    useEffect(() => {
        fetchLatestProperties(currentPage)
    }, [currentPage, fetchLatestProperties])

    const handlePageChange = (page: number) => {
        if (page < 1 || (pagination && page > pagination.last_page)) return
        setCurrentPage(page)
        // Scroll to section top
        const section = document.getElementById('latest-properties-section')
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        if (!pagination) return []

        const { current_page, last_page } = pagination
        const pages: (number | string)[] = []

        // Always show first page
        pages.push(1)

        // Add ellipsis if current page is far from start
        if (current_page > 3) {
            pages.push('...')
        }

        // Add pages around current page
        for (let i = Math.max(2, current_page - 1); i <= Math.min(last_page - 1, current_page + 1); i++) {
            if (!pages.includes(i)) {
                pages.push(i)
            }
        }

        // Add ellipsis if current page is far from end
        if (current_page < last_page - 2) {
            pages.push('...')
        }

        // Always show last page if more than 1 page
        if (last_page > 1 && !pages.includes(last_page)) {
            pages.push(last_page)
        }

        return pages
    }

    // Loading state with header
    if (loading && properties.length === 0) {
        return (
            <section id="latest-properties-section" className="py-6 px-4 max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Properti Terbaru</h2>
                        <p className="text-gray-600">Listing baru yang sudah diverifikasi dan siap untuk Anda</p>
                    </div>
                    <a href="/beli" className="text-[#ECEC5C] font-medium text-sm whitespace-nowrap hover:underline">
                        Lihat Semua
                    </a>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#ECEC5C] border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-gray-500">Memuat properti terbaru...</div>
                    </div>
                </div>
            </section>
        )
    }

    // Error state with header and retry button
    if (error && properties.length === 0) {
        return (
            <section id="latest-properties-section" className="py-6 px-4 max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Properti Terbaru</h2>
                        <p className="text-gray-600">Listing baru yang sudah diverifikasi dan siap untuk Anda</p>
                    </div>
                    <a href="/beli" className="text-[#ECEC5C] font-medium text-sm whitespace-nowrap hover:underline">
                        Lihat Semua
                    </a>
                </div>
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                            <Home className="w-8 h-8 text-red-400" />
                        </div>
                        <div>
                            <p className="text-gray-700 font-medium mb-1">Gagal memuat data</p>
                            <p className="text-gray-500 text-sm">{error}</p>
                        </div>
                        <button
                            onClick={() => fetchLatestProperties(1)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#ECEC5C] hover:bg-[#d4d44a] text-gray-900 font-medium rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Coba Lagi
                        </button>
                    </div>
                </div>
            </section>
        )
    }

    // Empty state - no properties available (not error)
    if (!loading && properties.length === 0) {
        return (
            <section id="latest-properties-section" className="py-6 px-4 max-w-[1400px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Properti Terbaru</h2>
                        <p className="text-gray-600">Listing baru yang sudah diverifikasi dan siap untuk Anda</p>
                    </div>
                    <a href="/beli" className="text-[#ECEC5C] font-medium text-sm whitespace-nowrap hover:underline">
                        Lihat Semua
                    </a>
                </div>
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                            <Home className="w-10 h-10 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-gray-700 font-medium mb-1">Belum ada properti terbaru</p>
                            <p className="text-gray-500 text-sm max-w-md">Properti baru yang sudah diverifikasi akan muncul di sini. Kunjungi kembali nanti untuk melihat listing terbaru.</p>
                        </div>
                        <a
                            href="/beli"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#ECEC5C] hover:bg-[#d4d44a] text-gray-900 font-medium rounded-lg transition-colors"
                        >
                            Lihat Semua Properti
                            <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section id="latest-properties-section" className="py-6 px-4 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Properti Terbaru</h2>
                    <p className="text-gray-600">Listing baru yang sudah diverifikasi dan siap untuk Anda</p>
                </div>
                <a href="/beli" className="text-[#ECEC5C] font-medium text-sm whitespace-nowrap hover:underline">
                    Lihat Semua
                </a>
            </div>

            {/* Loading overlay for page transitions */}
            {loading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
                    <div className="w-8 h-8 border-4 border-[#ECEC5C] border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Property Grid - 4 columns */}
            <div className="relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {properties.map((property) => (
                        <PopularPropertyCard key={property.id} {...property} />
                    ))}
                </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Info text */}
                    <div className="text-sm text-gray-500 order-2 sm:order-1">
                        Menampilkan {pagination.from || 0} - {pagination.to || 0} dari {pagination.total} properti
                    </div>

                    {/* Pagination controls */}
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        {/* Previous button */}
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#ECEC5C] hover:bg-[#ECEC5C]/10'
                                }`}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page as number)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === page
                                            ? 'bg-gradient-to-br from-[#ECEC5C] to-[#d4d44a] text-gray-900 shadow-md'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:border-[#ECEC5C] hover:bg-[#ECEC5C]/10'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                        </div>

                        {/* Next button */}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!pagination.has_more_pages}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${!pagination.has_more_pages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#ECEC5C] hover:bg-[#ECEC5C]/10'
                                }`}
                            aria-label="Next page"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

        </section>
    )
}
