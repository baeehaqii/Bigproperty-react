"use client"

import { useState } from "react"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "./ui/button"

interface NearestPlace {
  category: string
  name: string
  distance: string
}

interface PropertyLocationProps {
  location: any
  propertyName: string
}

export function PropertyLocation({ location, propertyName }: PropertyLocationProps) {
  // Get unique categories from nearestPlaces
  const categories = location?.nearestPlaces 
    ? Array.from(new Set(location.nearestPlaces.map((place: NearestPlace) => place.category)))
    : []
  
  const [activeTab, setActiveTab] = useState<string>(categories[0] || "")

  // Filter places by active category
  const displayedPlaces = location?.nearestPlaces?.filter(
    (place: NearestPlace) => place.category === activeTab
  ) || []

  // Get category display name
  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      'sekolah': 'Sekolah & Universitas',
      'tempat belanja': 'Pusat Perbelanjaan',
      'transportasi': 'Transportasi',
      'rumah sakit': 'Rumah Sakit',
      'tempat ibadah': 'Tempat Ibadah',
      'taman': 'Taman & Rekreasi',
    }
    return names[category.toLowerCase()] || category
  }

  return (
    <section className="bg-white border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Lokasi {propertyName}</h2>
        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Tanya Detail Lokasi
        </Button>
      </div>

      <div className="flex items-start gap-2 text-sm text-gray-700">
        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <span className="text-gray-700">
          {location?.full || 'Lokasi tidak tersedia'}
        </span>
      </div>

      {/* Google Maps Embed */}
      {location?.mapUrl && (
  <div className="relative h-[300px] bg-gray-200 rounded-lg overflow-hidden">
    <iframe
      src={location.mapUrl}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
    <div className="absolute bottom-4 left-4">
      <Button
        variant="secondary"
        className="bg-white hover:bg-gray-50 text-black"
        onClick={() => window.open(location.mapUrlOriginal || location.mapUrl, "_blank")}
      >
        <Navigation className="w-4 h-4 mr-2 text-blacks" />
        Buka Peta
      </Button>
    </div>
  </div>
)}

      {/* Category Tabs */}
      {categories.length > 0 && (
        <>
          <div className="flex gap-2 border-b overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors rounded-t-lg whitespace-nowrap ${
                  activeTab === category
                    ? "border-[#ECEC5C] text-gray-900 bg-[#ECEC5C]/10"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>

          {/* Nearby Places List */}
          <div className="space-y-3">
            {displayedPlaces.length > 0 ? (
              displayedPlaces.map((place: NearestPlace, index: number) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{place.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{place.distance}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Tidak ada data untuk kategori ini
              </p>
            )}
          </div>
        </>
      )}
    </section>
  )
}