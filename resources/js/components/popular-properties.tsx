"use client"

import { useState, useEffect, useRef } from "react"
import { PopularPropertyCard } from "./popular-properties-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface City {
  id: string
  name: string
}

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
  bedrooms: string
  landSize: string
  buildingSize: string
  additionalInfo?: string
  lastUpdated: string
  buttonType: "view" | "chat"
  available: boolean
  countClicked?: number
}

export function PopularProperties() {
  const [cities, setCities] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Fetch cities on mount
  useEffect(() => {
    fetchCities()
  }, [])

  // Fetch properties when city changes
  useEffect(() => {
    if (selectedCity) {
      fetchPropertiesByCity(selectedCity)
    }
  }, [selectedCity])

  const fetchCities = async () => {
    try {
      const response = await fetch('/popular-properties/cities')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Cities response:', data) // Debug log

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        // Handle both old format (string[]) and new format ({code, name}[])
        const formattedCities = data.data.map((city: string | { code: string, name: string }) => {
          if (typeof city === 'string') {
            // Old format: just a string
            return {
              id: city,
              name: city
            }
          } else {
            // New format: {code, name}
            return {
              id: city.code,
              name: city.name
            }
          }
        })

        setCities(formattedCities)
        setSelectedCity(formattedCities[0].id)
      } else {
        console.error('Invalid data format:', data)
        setError('Tidak ada kota tersedia')
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
      setError('Gagal memuat data kota: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const fetchPropertiesByCity = async (cityId: string) => {
    setLoading(true)
    setError(null)

    try {
      // Find city from ID (which is the city code)
      const city = cities.find(c => c.id === cityId)
      if (!city) return

      // Use the city ID (code) for API call, not the name
      const response = await fetch(`/popular-properties/city/${encodeURIComponent(city.id)}`)
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

  if (loading && cities.length === 0) {
    return (
      <section className="py-12 px-4 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Memuat data...</div>
        </div>
      </section>
    )
  }

  if (error && cities.length === 0) {
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hunian Populer</h2>
        <p className="text-gray-600">Properti yang paling banyak dilihat pembeli</p>
      </div>

      {/* City Tabs and See All */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCity === city.id
                ? "bg-[#ECEC5C] text-gray-900"
                : "bg-white text-gray-600 border border-gray-300 hover:border-gray-400"
                }`}
            >
              {city.name}
            </button>
          ))}
        </div>
        <a href="#" className="text-[#ECEC5C] font-medium text-sm whitespace-nowrap hover:underline">
          Lihat Semua
        </a>
      </div>

      {/* Property Cards with Navigation */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Memuat properti...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      ) : properties.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Tidak ada properti populer di kota ini</div>
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
      )}
    </section>
  )
}