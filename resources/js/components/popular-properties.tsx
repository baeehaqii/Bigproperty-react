"use client"

import { useState } from "react"
import { PopularPropertyCard } from "./popular-properties-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

const cities = [
  { id: "bogor", name: "Kab. Bogor" },
  { id: "bekasi", name: "Kab. Bekasi" },
  { id: "tangerang", name: "Kab. Tangerang" },
  { id: "depok", name: "Kota Depok" },
  { id: "kota-bekasi", name: "Kota Bekasi" },
]

const propertiesByCity = {
  bogor: [
    {
      id: "1",
      image: "/placeholder.svg?height=200&width=320",
      images: [
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
      ],
      promoText: "",
      features: [],
      type: "Rumah Baru",
      units: "Sisa 16 Unit",
      priceRange: "Rp 732,2 Jt - Rp 1,8 M",
      installment: "Angsuran mulai dari Rp5 Jt/bln",
      name: "Nuansa Bukit Bitung",
      developer: "PT Hilal Perdana Kreasi",
      developerLogo: "/placeholder.svg?height=32&width=32",
      location: "Ciawi, Kab. Bogor",
      bedrooms: "2-3 KT",
      landSize: "63-155m²",
      buildingSize: "38-",
      lastUpdated: "Diperbarui lebih dari 1 bulan lalu",
      buttonType: "view" as const,
      available: false,
    },
    {
      id: "2",
      image: "/placeholder.svg?height=200&width=320",
      images: [
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
      ],
      promoText: "Cuma di Pinhome: Emas Batangan hingga 12gr",
      features: [],
      type: "Rumah Baru",
      priceRange: "Rp 396,8 Jt - Rp 846 Jt",
      installment: "Angsuran mulai dari Rp2,7 Jt/bln",
      name: "Green Paradise City",
      developer: "PT Samara Insan Sentosa (Samara L...",
      developerLogo: "/placeholder.svg?height=32&width=32",
      location: "Parung Panjang, Kab. Bogor",
      bedrooms: "2-3 KT",
      landSize: "60-84m²",
      buildingSize: "30-",
      lastUpdated: "Diperbarui lebih dari 1 bulan lalu",
      buttonType: "chat" as const,
      available: true,
    },
    {
      id: "3",
      image: "/placeholder.svg?height=200&width=320",
      images: [
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
      ],
      promoText: "",
      features: [],
      type: "Rumah Baru",
      units: "Sisa 3 Unit",
      priceRange: "Rp 695 Jt - Rp 975 Jt",
      installment: "Angsuran mulai dari Rp4,8 Jt/bln",
      name: "Villa Kebun Raya Cibinong 2",
      developer: "PT Samudra Bangun Raya",
      developerLogo: "/placeholder.svg?height=32&width=32",
      location: "Cibinong, Kab. Bogor",
      bedrooms: "3 KT",
      landSize: "60m²",
      buildingSize: "54m²",
      additionalInfo: "SHM",
      lastUpdated: "Diperbarui lebih dari 1 bulan lalu",
      buttonType: "view" as const,
      available: false,
    },
    {
      id: "4",
      image: "/placeholder.svg?height=200&width=320",
      images: [
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
      ],
      promoText: "",
      features: [],
      type: "Rumah Baru",
      priceRange: "Rp 168 Jt",
      installment: "Angsuran mulai dari Rp1,2 Jt/bln",
      name: "Puri Tenjo",
      developer: "PT Triputra Graha Sejahtera",
      developerLogo: "/placeholder.svg?height=32&width=32",
      location: "Tenjo, Kab. Bogor",
      bedrooms: "2 KT",
      landSize: "60m²",
      buildingSize: "30m²",
      additionalInfo: "HGB",
      lastUpdated: "Diperbarui lebih dari 1 bulan lalu",
      buttonType: "view" as const,
      available: false,
    },
  ],
  bekasi: [
    {
      id: "5",
      image: "/placeholder.svg?height=200&width=320",
      images: [
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
      ],
      promoText: "Cuma di Pinhome: Emas Batangan hingga 12gr",
      features: [],
      type: "Rumah Baru",
      units: "Sisa 8 Unit",
      priceRange: "Rp 850 Jt - Rp 1,2 M",
      installment: "Angsuran mulai dari Rp6 Jt/bln",
      name: "Bekasi Garden Residence",
      developer: "PT Bekasi Property",
      developerLogo: "/placeholder.svg?height=32&width=32",
      location: "Bekasi Utara, Kab. Bekasi",
      bedrooms: "3 KT",
      landSize: "72m²",
      buildingSize: "45m²",
      lastUpdated: "Diperbarui lebih dari 1 bulan lalu",
      buttonType: "chat" as const,
      available: true,
    },
  ],
  tangerang: [
    {
      id: "6",
      image: "/placeholder.svg?height=200&width=320",
      images: [
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
      ],
      promoText: "",
      features: [],
      type: "Rumah Baru",
      priceRange: "Rp 1,1 M - Rp 1,5 M",
      installment: "Angsuran mulai dari Rp8 Jt/bln",
      name: "Tangerang Modern Living",
      developer: "PT Tangerang Sejahtera",
      developerLogo: "/placeholder.svg?height=32&width=32",
      location: "Serpong, Kab. Tangerang",
      bedrooms: "3-4 KT",
      landSize: "90m²",
      buildingSize: "60m²",
      lastUpdated: "Diperbarui lebih dari 1 bulan lalu",
      buttonType: "view" as const,
      available: true,
    },
  ],
  depok: [
    {
      id: "7",
      image: "/placeholder.svg?height=200&width=320",
      images: [
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
      ],
      promoText: "Cuma di Pinhome: Emas Batangan hingga 12gr",
      features: [],
      type: "Rumah Baru",
      units: "Sisa 12 Unit",
      priceRange: "Rp 650 Jt - Rp 900 Jt",
      installment: "Angsuran mulai dari Rp5 Jt/bln",
      name: "Depok Green Valley",
      developer: "PT Depok Properti Indah",
      developerLogo: "/placeholder.svg?height=32&width=32",
      location: "Beji, Kota Depok",
      bedrooms: "2-3 KT",
      landSize: "60-80m²",
      buildingSize: "40-50m²",
      lastUpdated: "Diperbarui lebih dari 1 bulan lalu",
      buttonType: "chat" as const,
      available: true,
    },
  ],
  "kota-bekasi": [
    {
      id: "8",
      image: "/placeholder.svg?height=200&width=320",
      images: [
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
        "/placeholder.svg?height=200&width=320",
      ],
      promoText: "",
      features: [],
      type: "Rumah Baru",
      priceRange: "Rp 1,2 M - Rp 1,8 M",
      installment: "Angsuran mulai dari Rp9 Jt/bln",
      name: "Bekasi City Residence",
      developer: "PT Kota Bekasi Makmur",
      developerLogo: "/placeholder.svg?height=32&width=32",
      location: "Bekasi Selatan, Kota Bekasi",
      bedrooms: "3-4 KT",
      landSize: "80-100m²",
      buildingSize: "50-70m²",
      lastUpdated: "Diperbarui lebih dari 1 bulan lalu",
      buttonType: "view" as const,
      available: true,
    },
  ],
}

export function PopularProperties() {
  const [selectedCity, setSelectedCity] = useState("bogor")
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const currentProperties = propertiesByCity[selectedCity as keyof typeof propertiesByCity] || []

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
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCity === city.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:border-gray-400"
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
        <a href="#" className="text-blue-600 font-medium text-sm whitespace-nowrap hover:underline">
          Lihat Semua
        </a>
      </div>

      {/* Property Cards with Navigation */}
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>

        {/* Cards Container */}
        <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4">
          {currentProperties.map((property) => (
            <PopularPropertyCard key={property.id} {...property} />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </section>
  )
}
