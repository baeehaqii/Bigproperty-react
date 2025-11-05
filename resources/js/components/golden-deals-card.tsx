"use client"

import { Heart, FileText, MessageCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"

interface GoldenDealsCardProps {
  id: string
  image: string
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
}

export function GoldenDealsCard({
  image,
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
}: GoldenDealsCardProps) {
  const [favorite, setFavorite] = useState(isFavorite)

  return (
    <div className="flex-shrink-0 w-[280px] bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Image Container with Banner */}
      <div className="relative h-[160px] overflow-hidden">
        <img src={image || "/placeholder.svg"} alt={propertyName} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#ECEC5C] to-[#d4d44a] text-gray-900 px-3 py-2.5">
          <p className="text-[11px] font-semibold leading-tight">{promoText}</p>
        </div>
        {badge && (
          <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-md text-[10px] font-bold text-gray-800 shadow-sm">
            {badge}
          </div>
        )}
        <button
          onClick={() => setFavorite(!favorite)}
          className="absolute top-3 left-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
        >
          <Heart className={`w-4 h-4 ${favorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-[11px] text-gray-700 font-medium">
            {type}
          </span>
          {typeExtra && <span className="text-[11px] text-gray-600">{typeExtra}</span>}
        </div>

        <div className="mb-2">
          <p className="text-base font-bold text-gray-900 leading-tight mb-1">{priceRange}</p>
          <p className="text-[11px] text-amber-600 font-semibold">{installment}</p>
        </div>

        <div className="mb-2">
          <h3 className="text-sm font-bold text-gray-900 mb-1.5 leading-tight">{propertyName}</h3>
          <div className="flex items-center gap-1.5">
            {developerLogo && (
              <img
                src={developerLogo || "/placeholder.svg"}
                alt={developer}
                className="w-4 h-4 object-contain rounded-sm"
              />
            )}
            <p className="text-[11px] text-gray-600">by {developer}</p>
          </div>
        </div>

        {/* Location */}
        <p className="text-[11px] text-gray-600 mb-3">{location}</p>

        <div className="flex items-center gap-1.5 text-[11px] text-gray-600 mb-2 flex-wrap">
          <span className="font-medium">{bedrooms} KT</span>
          <span className="text-gray-400">•</span>
          <span className="font-medium">{landSize}</span>
          <span className="text-gray-400">•</span>
          <span className="font-medium">{buildingSize}</span>
          {shm && (
            <>
              <span className="text-gray-400">•</span>
              <span className="font-medium">SHM</span>
            </>
          )}
        </div>

        {/* Updated At */}
        <p className="text-[10px] text-gray-500 mb-4">{updatedAt}</p>

        <div className="flex gap-2">
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
    </div>
  )
}
