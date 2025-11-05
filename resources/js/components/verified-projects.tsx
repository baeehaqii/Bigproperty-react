"use client"

import { useState, useEffect, useRef } from "react"
import { VerifiedProjectCard } from "./verified-project-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Property {
  id: string
  image: string
  images: string[]
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
  countClicked?: number
  isVerified: boolean
}

export function VerifiedProjects() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Fetch properties on mount
  useEffect(() => {
    fetchVerifiedProperties()
  }, [])

  const fetchVerifiedProperties = async () => {
    try {
      const response = await fetch('/verified-projects')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Verified projects response:', data)
      
      if (data.success && data.data) {
        setProperties(data.data || [])
      } else {
        console.error('Invalid data format:', data)
        setError('Tidak ada proyek terverifikasi tersedia')
      }
    } catch (err) {
      console.error('Error fetching verified projects:', err)
      setError('Gagal memuat data proyek terverifikasi: ' + (err instanceof Error ? err.message : 'Unknown error'))
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

  return (
    <section className="py-12 px-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Proyek Terverifikasi</h2>
          <p className="text-gray-600">
            Properti dengan info terbaru, akurat, dan diverifikasi secara berkala ke developer
          </p>
        </div>
        <a href="#" className="text-[#ECEC5C] font-medium text-sm whitespace-nowrap hover:underline">
          Lihat Semua
        </a>
      </div>

      {/* Property Cards with Navigation */}
      {properties.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Tidak ada proyek terverifikasi tersedia</div>
        </div>
      ) : (
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
              <VerifiedProjectCard key={property.id} {...property} />
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
      )}
    </section>
  )
}