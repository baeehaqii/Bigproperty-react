"use client"

import { Heart, FileText, MessageCircle, Eye, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Link } from "@inertiajs/react"

interface GoldenDealsCardProps {
  id: string
  image: string
  images?: string[]
  badge?: string
  type: string
  typeExtra?: string
  priceRange: string
  installment: string
  propertyName: string
  promoText?: string | null
  developer: string
  developerLogo?: string
  location: string
  bedrooms: string
  landSize: string
  buildingSize: string
  shm?: boolean
  updatedAt: string
  isFavorite?: boolean
  countClicked?: number
}

export function GoldenDealsCard({
  id,
  image,
  images = [],
  badge,
  type,
  typeExtra,
  priceRange,
  installment,
  propertyName,
  promoText,
  developer,
  developerLogo,
  location,
  bedrooms,
  landSize,
  buildingSize,
  shm,
  updatedAt,
  isFavorite = false,
  countClicked = 0,
}: GoldenDealsCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const allImages = [image, ...images].filter(Boolean)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  // Format angka views
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
    <div className="flex-shrink-0 w-[320px] bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Image Section */}
      <div className="relative h-[200px] group cursor-pointer">
        <Link href={`/property/${id}`} className="block h-full w-full">
          <img
            src={allImages[currentImageIndex] || "/placeholder.svg"}
            alt={propertyName}
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
          />
        </Link>

        {/* Views Counter Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          <span>{formatViews(countClicked)}</span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setFavorite(!favorite)
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
        >
          <Heart className={`w-4 h-4 ${favorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </button>

        {/* Image Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Image Dots Indicator */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentImageIndex(index)
                }}
                className={`h-1.5 rounded-full transition-all ${index === currentImageIndex ? "bg-white w-4" : "bg-white/60 w-1.5"
                  }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <Link href={`/property/${id}`} className="block">
        <div className="p-4 cursor-pointer">
          {/* Type & Units */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">{type}</span>
            {typeExtra && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">{typeExtra}</span>
              </>
            )}
          </div>

          {/* Price */}
          <div className="mb-1">
            <p className="text-lg font-bold text-gray-900">{priceRange}</p>
          </div>

          {/* Installment */}
          <p className="text-sm text-amber-600 font-medium mb-3">{installment}</p>

          {/* Developer & Property Name */}
          <div className="flex items-start gap-2 mb-2">
            {/* Developer Avatar */}
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
              {developerLogo ? (
                <img
                  src={developerLogo}
                  alt={developer}
                  width={32}
                  height={32}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.querySelector('.avatar-fallback')?.classList.remove('hidden') }}
                />
              ) : null}
              <div className={`avatar-fallback w-full h-full bg-amber-600 flex items-center justify-center ${developerLogo ? 'hidden' : ''}`}>
                <span className="text-white font-bold text-sm">
                  {developer?.charAt(0)?.toUpperCase() || 'D'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{propertyName}</p>
              <p className="text-xs text-gray-500">by {developer}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-1 mb-3">
            <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600">{location}</p>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
            <span>{bedrooms} KT</span>
            <span>LT {landSize}</span>
            <span>LB {buildingSize}</span>
            {shm && <span>SHM</span>}
          </div>

          {/* Updated At */}
          <p className="text-xs text-gray-400 mb-4">{updatedAt}</p>
        </div>
      </Link>

      {/* Buttons - Keep Brosur & Chat */}
      <div className="px-4 pb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-amber-600 border-amber-600 hover:bg-amber-50 bg-white h-9 text-xs font-semibold"
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" />
          Brosur
        </Button>
        <Button size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700 h-9 text-xs font-semibold text-white">
          <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
          Chat
        </Button>
      </div>
    </div>
  )
}
