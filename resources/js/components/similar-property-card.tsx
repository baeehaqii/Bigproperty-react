"use client"

import { Heart, MapPin, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { useState } from "react"
import { Link } from "@inertiajs/react"

interface PropertyFeature {
    icon: string
    text: string
}

interface SimilarPropertyCardProps {
    id: string
    image: string
    images?: string[]
    badge?: string
    promoText?: string
    features: PropertyFeature[]
    type: string
    units?: string
    priceRange: string
    installment: string
    name: string
    developer: string
    developerLogo?: string
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

export function SimilarPropertyCard({
    id,
    image,
    images = [],
    badge,
    promoText,
    features,
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
    additionalInfo,
    lastUpdated,
    buttonType,
    available,
    countClicked = 0,
}: SimilarPropertyCardProps) {
    const [isFavorite, setIsFavorite] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const allImages = [image, ...images]

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }

    // Format angka views (1000 -> 1K, 1000000 -> 1M)
    const formatViews = (count: number) => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`
        }
        return count.toString()
    }

    return (
        <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            {/* Image Section with Link */}
            <div className="relative h-[180px] group cursor-pointer">
                <Link href={`/property/${id}`} className="block h-full w-full">
                    <img
                        src={allImages[currentImageIndex] || "/placeholder.svg"}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-opacity duration-300"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-white/20 text-2xl font-bold">Big Property</span>
                    </div>
                </Link>

                {!available && (
                    <div className="absolute top-3 left-3 bg-gray-600/90 text-white text-xs font-semibold px-2 py-1 rounded">
                        TIDAK TERSEDIA
                    </div>
                )}

                {/* Views Counter Badge */}
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
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                prevImage()
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 z-10"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                nextImage()
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 z-10"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-700" />
                        </button>
                    </>
                )}

                {promoText && (
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-r from-[#ECEC5C] to-[#d4d44a] text-gray-900 text-xs font-semibold text-center py-1.5">
                        {promoText}
                    </div>
                )}

                {allImages.length > 1 && (
                    <div
                        className={`absolute left-1/2 -translate-x-1/2 flex gap-1 z-10 ${promoText ? "bottom-8" : "bottom-3"}`}
                    >
                        {allImages.slice(0, 4).map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setCurrentImageIndex(index)
                                }}
                                className={`h-1 rounded-full transition-all ${index === currentImageIndex ? "bg-white w-3" : "bg-white/60 w-1"
                                    }`}
                                aria-label={`Go to image ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Content Section with Link */}
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
                        {/* Agent/Developer Avatar */}
                        <div className="w-6 h-6 rounded-full flex-shrink-0 overflow-hidden">
                            {(agent?.photo || developerLogo) ? (
                                <img
                                    src={agent?.photo || developerLogo || "/placeholder.svg"}
                                    alt={developer}
                                    width={24}
                                    height={24}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.querySelector('.avatar-fallback')?.classList.remove('hidden') }}
                                />
                            ) : null}
                            <div className={`avatar-fallback w-full h-full bg-blue-600 flex items-center justify-center ${(agent?.photo || developerLogo) ? 'hidden' : ''}`}>
                                <span className="text-white font-bold text-xs">
                                    {(agent?.name || developer)?.charAt(0)?.toUpperCase() || 'A'}
                                </span>
                            </div>
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
