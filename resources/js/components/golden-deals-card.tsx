"use client"

import { Heart, FileText, MessageCircle, Eye, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Link } from "@inertiajs/react"
import { OptimizedImage } from "./optimized-image"

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
    <div
      className="flex-shrink-0 w-[320px] bg-white rounded-2xl overflow-hidden transition-all duration-200"
      style={{ border: '1.5px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = '0 8px 28px rgba(197,230,42,0.18), 0 2px 8px rgba(0,0,0,0.06)'
        el.style.borderColor = '#C5E62A'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
        el.style.borderColor = '#F0F0F0'
      }}
    >
      {/* Image Section */}
      <div className="relative h-[200px] group cursor-pointer">
        <Link href={`/property/${id}`} className="block h-full w-full">
          <OptimizedImage
            src={allImages[currentImageIndex] || "/placeholder.svg"}
            alt={`${propertyName} - ${type} di ${location}`}
            layout="card"
            blur={true}
            containerClassName="w-full h-full"
            className="w-full h-full"
            objectFit="cover"
            fallback="/placeholder.svg"
            width={320}
            height={200}
          />
        </Link>

        {/* Views Counter Badge */}
        <div className="absolute top-3 left-3 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ backgroundColor: 'rgba(26,26,46,0.75)', fontFamily: "'Outfit', sans-serif" }}>
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
            <span className="text-sm" style={{ fontFamily: "'Outfit', sans-serif", color: '#6B7280' }}>{type}</span>
            {typeExtra && (
              <>
                <span style={{ color: '#D1D5DB' }}>•</span>
                <span className="text-sm" style={{ fontFamily: "'Outfit', sans-serif", color: '#6B7280' }}>{typeExtra}</span>
              </>
            )}
          </div>

          {/* Price */}
          <div className="mb-1">
            <p className="text-xl font-extrabold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: '#1A1A2E', letterSpacing: '-0.02em' }}>{priceRange}</p>
          </div>

          {/* Installment */}
          <p className="text-sm mb-3" style={{ fontFamily: "'Outfit', sans-serif", color: '#3B9EF5', fontWeight: 500 }}>{installment}</p>

          {/* Developer & Property Name */}
          <div className="flex items-start gap-2 mb-2">
            {/* Developer Avatar */}
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden">
              {developerLogo ? (
                <OptimizedImage
                  src={developerLogo}
                  alt={`Logo ${developer}`}
                  width={32}
                  height={32}
                  blur={false}
                  containerClassName="w-full h-full"
                  className="w-full h-full"
                  objectFit="cover"
                />
              ) : null}
              <div className={`avatar-fallback w-full h-full flex items-center justify-center ${developerLogo ? 'hidden' : ''}`} style={{ backgroundColor: '#3B9EF5' }}>
                <span className="text-white font-bold text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {developer?.charAt(0)?.toUpperCase() || 'D'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: '#1A1A2E' }}>{propertyName}</p>
              <p className="text-xs" style={{ fontFamily: "'Outfit', sans-serif", color: '#9CA3AF' }}>by {developer}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-1 mb-3">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#3B9EF5' }} />
            <p className="text-xs" style={{ fontFamily: "'Outfit', sans-serif", color: '#6B7280' }}>{location}</p>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-3 text-xs mb-2" style={{ fontFamily: "'Outfit', sans-serif", color: '#374151' }}>
            <span><span className="font-semibold">{bedrooms}</span> KT</span>
            <span className="text-gray-300">·</span>
            <span>LT <span className="font-semibold">{landSize}</span></span>
            <span className="text-gray-300">·</span>
            <span>LB <span className="font-semibold">{buildingSize}</span></span>
            {shm && <><span className="text-gray-300">·</span><span>SHM</span></>}
          </div>

          {/* Updated At */}
          <p className="text-xs mb-4" style={{ fontFamily: "'Outfit', sans-serif", color: '#9CA3AF' }}>{updatedAt}</p>
        </div>
      </Link>

      {/* Buttons */}
      <div className="px-4 pb-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-9 text-xs cursor-pointer transition-colors"
          style={{ borderColor: '#3B9EF5', color: '#3B9EF5', backgroundColor: 'transparent', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" />
          Brosur
        </Button>
        <Button size="sm" className="flex-1 h-9 text-xs cursor-pointer transition-all active:scale-[0.98]"
          style={{ backgroundColor: '#C5E62A', color: '#1A1A2E', fontFamily: "'Outfit', sans-serif", fontWeight: 700, boxShadow: '0 2px 10px rgba(197,230,42,0.3)' }}>
          <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
          Chat
        </Button>
      </div>
    </div>
  )
}
