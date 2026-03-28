"use client"

import { useState, useEffect } from "react"
import { Heart, MapPin, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { Link } from "@inertiajs/react"

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
    bedrooms: string
    landSize: string
    buildingSize: string
    additionalInfo?: string
    lastUpdated: string
    buttonType: "view" | "chat"
    available: boolean
    countClicked?: number
}

interface SimilarPropertiesProps {
    propertyId: string | number
}

import { OptimizedImage } from "./optimized-image"

// Property Card Component (inline to avoid import issues)
function SimilarPropertyCard({
    id,
    image,
    images = [],
    promoText,
    type,
    units,
    priceRange,
    installment,
    name,
    developer,
    developerLogo,
    agent,
    location,
    bedrooms,
    landSize,
    buildingSize,
    lastUpdated,
    available,
    countClicked = 0,
}: Property) {
    const [isFavorite, setIsFavorite] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const allImages = [image, ...images].filter(Boolean)

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }

    const formatViews = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
        return count.toString()
    }

    return (
        <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Image Section */}
            <div className="relative h-[180px] group cursor-pointer">
                <Link href={`/property/${id}`} className="block h-full w-full">
                    <OptimizedImage
                        src={allImages[currentImageIndex] || "/placeholder.svg"}
                        alt={`${name} - ${type}`}
                        layout="card"
                        blur={true}
                        containerClassName="w-full h-full"
                        className="w-full h-full"
                        objectFit="cover"
                        fallback="/placeholder.svg"
                        width={300}
                        height={180}
                    />
                </Link>

                {!available && (
                    <div className="absolute top-3 left-3 bg-gray-600/90 text-white text-xs font-semibold px-2 py-1 rounded">
                        TIDAK TERSEDIA
                    </div>
                )}

                {/* Views Counter */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{formatViews(countClicked)}</span>
                </div>

                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsFavorite(!isFavorite)
                    }}
                    className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
                >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                </button>

                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage() }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 z-10"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage() }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 z-10"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-700" />
                        </button>
                    </>
                )}

                {promoText && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#ECEC5C] to-[#d4d44a] text-gray-900 text-xs font-semibold text-center py-1.5">
                        {promoText}
                    </div>
                )}

                {allImages.length > 1 && (
                    <div className={`absolute left-1/2 -translate-x-1/2 flex gap-1 z-10 ${promoText ? "bottom-8" : "bottom-3"}`}>
                        {allImages.slice(0, 4).map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(index) }}
                                className={`h-1 rounded-full transition-all ${index === currentImageIndex ? "bg-white w-3" : "bg-white/60 w-1"}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <Link href={`/property/${id}`} className="block">
                <div className="p-3 cursor-pointer">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs text-gray-600">{type}</span>
                        {units && (
                            <>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-600">{units}</span>
                            </>
                        )}
                    </div>

                    <div className="mb-1">
                        <p className="text-base font-bold text-gray-900">{priceRange}</p>
                    </div>

                    <p className="text-xs text-gray-600 mb-2">{installment}</p>

                    <div className="flex items-start gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden bg-blue-600 flex items-center justify-center">
                            {(agent?.photo || developerLogo) ? (
                                <OptimizedImage
                                    src={agent?.photo || developerLogo || "/placeholder.svg"}
                                    alt={developer}
                                    width={24}
                                    height={24}
                                    blur={false}
                                    containerClassName="w-full h-full"
                                    className="w-full h-full"
                                    objectFit="cover"
                                />
                            ) : (
                                <span className="text-white font-bold text-xs">
                                    {(agent?.name || developer)?.charAt(0)?.toUpperCase() || 'A'}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-xs truncate">{name}</p>
                            <p className="text-xs text-gray-500 truncate">by {developer}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-1 mb-2">
                        <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600 line-clamp-1">{location}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <span>{bedrooms} KT</span>
                        <span>LT {landSize}</span>
                        <span>LB {buildingSize}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">{lastUpdated}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Eye className="w-3 h-3" />
                            <span>{countClicked.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* CTA Button */}
            <div className="px-3 pb-3">
                <Link
                    href={`/property/${id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    Lihat Detail
                </Link>
            </div>
        </div>
    )
}

// Main Similar Properties Component
export function SimilarProperties({ propertyId }: SimilarPropertiesProps) {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchSimilarProperties()
    }, [propertyId])

    const fetchSimilarProperties = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/property/${propertyId}/similar`)
            const data = await response.json()

            if (data.success && data.data) {
                setProperties(data.data.properties || [])
            } else {
                setError(data.message || 'Gagal memuat properti serupa')
                setProperties([])
            }
        } catch (err) {
            console.error('Error fetching similar properties:', err)
            setError('Gagal memuat properti serupa')
            setProperties([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <section id="similar-properties" className="w-full mt-8 mb-12">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Properti Serupa</h2>
                <p className="text-sm text-gray-500">Properti di lokasi dan harga yang serupa</p>
            </div>

            {/* Property Cards Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                            <div className="h-[180px] bg-gray-200"></div>
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="flex items-center justify-center h-32 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">{error}</p>
                </div>
            ) : properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-gray-500 text-center">Belum ada properti serupa di lokasi ini</p>
                    <p className="text-gray-400 text-sm text-center mt-1">Coba lihat properti lainnya</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {properties.map((property) => (
                        <SimilarPropertyCard key={property.id} {...property} />
                    ))}
                </div>
            )}
        </section>
    )
}
