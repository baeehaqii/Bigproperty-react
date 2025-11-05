"use client"

import { Heart, MapPin, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Link } from "@inertiajs/react"

interface PropertyFeature {
  icon: string
  text: string
}

interface PopularPropertyCardProps {
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
  developerLogo: string
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

export function PopularPropertyCard({
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
  location,
  bedrooms,
  landSize,
  buildingSize,
  additionalInfo,
  lastUpdated,
  buttonType,
  available,
  countClicked = 0,
}: PopularPropertyCardProps) {
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
    <div className="flex-shrink-0 w-[320px] bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <Link href={`/property/${id}`} className="block">
        <div className="relative h-[200px] group cursor-pointer">
          <img
            src={allImages[currentImageIndex] || "/placeholder.svg"}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/30 text-4xl font-bold">Pinhome</span>
          </div>

          {!available && (
            <div className="absolute top-3 left-3 bg-gray-600/90 text-white text-xs font-semibold px-3 py-1 rounded">
              TIDAK TERSEDIA
            </div>
          )}

          {/* Views Counter Badge */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{formatViews(countClicked)}</span>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsFavorite(!isFavorite)
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>

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

          {promoText && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#ECEC5C] to-[#d4d44a] text-gray-900 text-xs font-semibold text-center py-2">
              {promoText}
            </div>
          )}

          {allImages.length > 1 && (
            <div
              className={`absolute left-1/2 -translate-x-1/2 flex gap-1.5 z-10 ${promoText ? "bottom-10" : "bottom-3"}`}
            >
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
      </Link>

      <Link href={`/property/${id}`} className="block">
        <div className="p-4 cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">{type}</span>
            {units && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-600">{units}</span>
              </>
            )}
          </div>

          <div className="mb-1">
            <p className="text-lg font-bold text-gray-900">{priceRange}</p>
          </div>

          <p className="text-sm text-gray-600 mb-3">{installment}</p>

          <div className="flex items-start gap-2 mb-2">
            <img
              src={developerLogo || "/placeholder.svg"}
              alt={developer}
              width={32}
              height={32}
              loading="lazy"
              className="rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
              <p className="text-xs text-gray-500">by {developer}</p>
            </div>
          </div>

          <div className="flex items-start gap-1 mb-3">
            <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600">{location}</p>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
            <span>{bedrooms} KT</span>
            <span>LT {landSize}</span>
            <span>LB {buildingSize}</span>
            {additionalInfo && <span>{additionalInfo}</span>}
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400">{lastUpdated}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="w-3 h-3" />
              <span>{countClicked.toLocaleString('id-ID')} views</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        {buttonType === "view" ? (
          <Button className="w-full bg-[#ECEC5C] hover:bg-[#d4d44a] text-gray-900">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Lihat Properti Serupa
          </Button>
        ) : (
          <Button className="w-full bg-[#ECEC5C] hover:bg-[#d4d44a] text-gray-900">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Chat
          </Button>
        )}
      </div>
    </div>
  )
}