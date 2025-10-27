"use client"

import { useRef } from "react"
import { VerifiedProjectCard } from "./verified-project-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

const verifiedProjects = [
  {
    id: "1",
    image: "/placeholder.svg?height=200&width=320",
    images: [
      "/placeholder.svg?height=200&width=320",
      "/placeholder.svg?height=200&width=320",
      "/placeholder.svg?height=200&width=320",
    ],
    type: "Rumah Baru",
    units: "Sisa 0 Unit",
    priceRange: "Rp 500 Jt - Rp 800 Jt",
    installment: "Angsuran mulai dari Rp3,4 Jt/bln",
    name: "Aria Residence Tamansari",
    developer: "PT Dayamas Citra Abadi Properindo",
    developerLogo: "/placeholder.svg?height=32&width=32",
    location: "Karawaci, Kota Tangerang",
    bedrooms: "2 KT",
    landSize: "63-79m²",
    buildingSize: "37-46m²",
    lastUpdated: "Diperbarui 2 hari lalu",
  },
  {
    id: "2",
    image: "/placeholder.svg?height=200&width=320",
    images: [
      "/placeholder.svg?height=200&width=320",
      "/placeholder.svg?height=200&width=320",
      "/placeholder.svg?height=200&width=320",
    ],
    type: "Rumah Baru",
    units: "Sisa 0 Unit",
    priceRange: "Rp 750 Jt - Rp 2,6 M",
    installment: "Angsuran mulai dari Rp5,1 Jt/bln",
    name: "Arsa Royal Bekasi",
    developer: "PT Triarsa Property",
    developerLogo: "/placeholder.svg?height=32&width=32",
    location: "Jatisampurna (Jati Sampurna), Kota Bekasi",
    bedrooms: "2-3 KT",
    landSize: "60-81m²",
    buildingSize: "45-",
    lastUpdated: "Diperbarui 8 hari lalu",
  },
  {
    id: "3",
    image: "/placeholder.svg?height=200&width=320",
    images: [
      "/placeholder.svg?height=200&width=320",
      "/placeholder.svg?height=200&width=320",
      "/placeholder.svg?height=200&width=320",
    ],
    type: "Rumah Baru",
    units: "Sisa 0 Unit",
    priceRange: "Rp 450 Jt - Rp 680 Jt",
    installment: "Angsuran mulai dari Rp3,1 Jt/bln",
    name: "Wynn Residence",
    developer: "PT Dayamas Citra Abadi Properindo",
    developerLogo: "/placeholder.svg?height=32&width=32",
    location: "Setu, Kab. Bekasi",
    bedrooms: "2 KT",
    landSize: "60m²",
    buildingSize: "36m²",
    additionalInfo: "SHM",
    lastUpdated: "Diperbarui 8 hari lalu",
  },
  {
    id: "4",
    image: "/placeholder.svg?height=200&width=320",
    images: [
      "/placeholder.svg?height=200&width=320",
      "/placeholder.svg?height=200&width=320",
      "/placeholder.svg?height=200&width=320",
    ],
    type: "Rumah Baru",
    units: "Sisa 0 Unit",
    priceRange: "Rp 400 Jt - Rp 700 Jt",
    installment: "Angsuran mulai dari Rp2,7 Jt/bln",
    name: "Permata Arco Sawangan",
    developer: "PT Lentera Mitra Strategis",
    developerLogo: "/placeholder.svg?height=32&width=32",
    location: "Tajurhalang, Kab. Bogor",
    bedrooms: "2 KT",
    landSize: "60m²",
    buildingSize: "30m²",
    additionalInfo: "HGB",
    lastUpdated: "Diperbarui 18 hari lalu",
  },
]

export function VerifiedProjects() {
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
          {verifiedProjects.map((project) => (
            <VerifiedProjectCard key={project.id} {...project} />
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
