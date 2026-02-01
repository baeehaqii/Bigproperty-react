"use client"

import { useState, useEffect, useRef } from "react"
import { PopularPropertyCard } from "./popular-properties-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
  location: string
  city?: string
  province?: string
  bedrooms: string
  landSize: string
  buildingSize: string
  additionalInfo?: string
  condition?: string
  lastUpdated: string
  buttonType: "view" | "chat"
  available: boolean
  countClicked?: number
}

export function PopularProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Fetch all properties on mount
  useEffect(() => {
    fetchAllProperties()
  }, [])

  const fetchAllProperties = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/popular-properties/all')
      const data = await response.json()

      if (data.success && data.data) {
        setProperties(data.data.properties || [])
      } else {
        setError(data.message || 'Gagal memuat properti')
        setProperties([])
      }
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError('Gagal memuat data properti')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  if (loading) {
    return (
      <section className="py-12 px-4 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Memuat data...</div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 px-4 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </section>
    )
  }

  if (properties.length === 0) {
    return null // Don't show section if no properties
  }

  return (
    <section className="py-6 px-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hunian Populer</h2>
          <p className="text-gray-600">Properti yang paling banyak dilihat pembeli</p>
        </div>
        <a href="/beli" className="text-[#ECEC5C] font-medium text-sm whitespace-nowrap hover:underline">
          Lihat Semua
        </a>
      </div>

      {/* Property Cards with Navigation */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>

        {/* Cards Container */}
        <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4">
          {properties.map((property) => (
            <PopularPropertyCard key={property.id} {...property} />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </section>
  )
}