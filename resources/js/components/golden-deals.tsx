// golden-deals.tsx
"use client"

import { GoldenDealsCard } from "./golden-deals-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Button } from "./ui/button"

interface Property {
  id: string
  image: string | null
  images: string[]
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
  posted_by_name: string
  posted_by_logo: string | null
  count_clicked: number
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#C5E62A]/90 via-[#d4d44a]/90 to-[#c4a747]/90 rounded-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto pt-12 pb-8">
        <div className="flex items-start justify-between mb-8">
          <div className="relative flex items-center gap-3">
            <div>
              <h2
                className="text-5xl leading-none mb-0"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800,
                  color: '#C5E62A',
                  letterSpacing: '-0.03em',
                }}
              >
                {goldenDeals.event.name.split(' ')[0] || 'GOLDEN'}
              </h2>
              <h2
                className="text-5xl leading-none"
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 800,
                  color: '#1A1A2E',
                  letterSpacing: '-0.03em',
                }}
              >
                {goldenDeals.event.name.split(' ')[1] || 'DEALS'}
              </h2>
            </div>
          </div>
          <Button className="cursor-pointer rounded-xl font-bold px-6 transition-all active:scale-[0.98]"
            style={{ backgroundColor: '#C5E62A', color: '#1A1A2E', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
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
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: '#fff', border: '1.5px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C5E62A'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(197,230,42,0.25)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)' }}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: '#1A1A2E' }} />
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
                image={property.image || '/placeholder.svg'}
                images={property.images || []}
                badge={property.promo_text || undefined}
                type={property.kategori?.[0] || 'Properti'}
                typeExtra={property.units_remaining ? `Sisa ${property.units_remaining} Unit` : undefined}
                priceRange={property.price_range}
                installment={property.installment}
                propertyName={property.property_name}
                developer={property.posted_by_name}
                promoText={property.promo_text}
                developerLogo={property.posted_by_logo || undefined}
                location={property.location}
                bedrooms={property.bedrooms}
                landSize={property.land_size}
                buildingSize={property.building_size}
                shm={property.certificate_type === 'SHM'}
                updatedAt={property.last_updated || 'Baru diperbarui'}
                countClicked={property.count_clicked || 0}
              />
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: '#fff', border: '1.5px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C5E62A'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(197,230,42,0.25)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)' }}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" style={{ color: '#1A1A2E' }} />
          </button>
        </div>
      </div>
    </section>
  )
}