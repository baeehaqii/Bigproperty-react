// golden-deals.tsx
"use client"

import { GoldenDealsCard } from "./golden-deals-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Button } from "./ui/button"

interface Property {
  id: string
  image: string | null
  promo_text: string | null
  kategori: string[]
  units_remaining: number | null
  price_range: string
  installment: string
  property_name: string
  location: string
  city: string
  provinsi: string
  bedrooms: string
  land_size: string
  building_size: string
  certificate_type: string | null
  is_popular: boolean
  last_updated: string | null
  developer_name: string  // Tambah ini
  developer_logo: string | null  // Tambah ini
}

interface GoldenDealsData {
  event: {
    id: number
    name: string
    description: string | null
    banner: string | null
    start_date: string
    end_date: string
  }
  properties: Property[]
}

export function GoldenDeals() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [goldenDeals, setGoldenDeals] = useState<GoldenDealsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGoldenDeals = async () => {
      try {
        setLoading(true)
        console.log('Fetching from:', window.location.origin + '/golden-deals')
        
        const response = await fetch('/golden-deals')
        
        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Response error:', errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }
        
        const result = await response.json()
        console.log('Golden Deals data:', result)
        
        if (result.success && result.data) {
          setGoldenDeals(result.data)
        } else {
          throw new Error(result.message || 'Data tidak valid')
        }
      } catch (err) {
        console.error('Error fetching Golden Deals:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchGoldenDeals()
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 296
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount)

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

  const defaultBanner = "https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761071336/Type_85_zmze7h.avif"
  const bannerImage = goldenDeals?.event?.banner || defaultBanner

  if (loading) {
    return (
      <section className="relative px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto pt-12 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600 text-lg">Memuat Golden Deals...</div>
          </div>
        </div>
      </section>
    )
  }

  if (error && !goldenDeals) {
    return (
      <section className="relative px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto pt-12 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600">Error: {error}</div>
          </div>
        </div>
      </section>
    )
  }

  if (!goldenDeals?.properties || goldenDeals.properties.length === 0) {
    return null
  }

  return (
    <section className="relative px-4 overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[280px] bg-cover bg-center rounded-3xl mx-4"
        style={{
          backgroundImage: `url('${bannerImage}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#ECEC5C]/90 via-[#d4d44a]/90 to-[#c4a747]/90 rounded-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto pt-12 pb-8">
        <div className="flex items-start justify-between mb-8">
          <div className="relative flex items-center gap-3">
            <div>
              <h2
                className="text-5xl font-black leading-none mb-0"
                style={{
                  color: "#fbbf24",
                  textShadow: "3px 3px 0px rgba(139, 92, 246, 0.6), -1px -1px 0px rgba(255, 255, 255, 0.3)",
                  WebkitTextStroke: "2px #7c3aed",
                }}
              >
                {goldenDeals.event.name.split(' ')[0] || 'GOLDEN'}
              </h2>
              <h2
                className="text-5xl font-black leading-none"
                style={{
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                  filter: "drop-shadow(2px 2px 0px #7c3aed)",
                }}
              >
                {goldenDeals.event.name.split(' ')[1] || 'DEALS'}
              </h2>
            </div>
          </div>
          <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 rounded-full">
            LIHAT SEMUA
          </Button>
        </div>

        {error && goldenDeals && (
          <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded">
            Peringatan: {error}
          </div>
        )}

        <div className="relative group">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {goldenDeals.properties.map((property) => (
              <GoldenDealsCard 
                key={property.id} 
                id={property.id}
                image={property.image || '/placeholder.svg?height=160&width=280'}
                badge={property.promo_text || undefined}
                type={property.kategori?.[0] || 'Properti'}
                typeExtra={property.units_remaining ? `Sisa ${property.units_remaining} Unit` : undefined}
                priceRange={property.price_range}
                installment={property.installment}
                propertyName={property.property_name}
                developer={property.developer_name}
                promoText={property.promo_text}
                developerLogo={property.developer_logo || '/placeholder.svg?height=20&width=20'}  // Update ini
                location={property.location}
                bedrooms={property.bedrooms}
                landSize={property.land_size}
                buildingSize={property.building_size}
                shm={property.certificate_type === 'SHM'}
                updatedAt={property.last_updated || 'Baru diperbarui'}
              />
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  )
}