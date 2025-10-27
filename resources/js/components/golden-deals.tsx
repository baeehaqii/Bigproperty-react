"use client"

import { GoldenDealsCard } from "./golden-deals-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"
import { Button } from "./ui/button"

const goldenDealsProperties = [
    {
        id: "1",
        image: "/placeholder.svg?height=160&width=280",
        type: "Rumah Baru",
        priceRange: "Rp 1,2 M - Rp 2,1 M",
        installment: "Angsuran mulai dari Rp8,3 Jt/bln",
        propertyName: "Villa Bogor Indah 6",
        developer: "Kalindo Land",
        developerLogo: "/placeholder.svg?height=20&width=20",
        location: "Sukaraja, Kab. Bogor",
        bedrooms: "2-3 KT",
        landSize: "LT 72-84m²",
        buildingSize: "LB 60-",
        updatedAt: "Diperbarui lebih dari 1 bulan lalu",
    },
    {
        id: "2",
        image: "/placeholder.svg?height=160&width=280",
        type: "Rumah Baru",
        priceRange: "Rp 850 Jt - Rp 1,1 M",
        installment: "Angsuran mulai dari Rp5,8 Jt/bln",
        propertyName: "Mulia Kerta Residence",
        developer: "PT Agung Mulia Kerta",
        developerLogo: "/placeholder.svg?height=20&width=20",
        location: "Cipayung, Kota Jakarta Timur",
        bedrooms: "2-3 KT",
        landSize: "LT 60-81m²",
        buildingSize: "LB 45-",
        updatedAt: "Diperbarui lebih dari 1 bulan lalu",
    },
    {
        id: "3",
        image: "/placeholder.svg?height=160&width=280",
        badge: "SIAP HUNI",
        type: "Rumah Baru",
        typeExtra: "Sisa 4 Unit",
        priceRange: "Rp 420 Jt - Rp 515 Jt",
        installment: "Angsuran mulai dari Rp2,9 Jt/bln",
        propertyName: "Kavling Malaika Sandrina Tania",
        developer: "Indanaland",
        developerLogo: "/placeholder.svg?height=20&width=20",
        location: "Tambun Utara, Kab. Bekasi",
        bedrooms: "2 KT",
        landSize: "LT 60m²",
        buildingSize: "LB 36m²",
        shm: true,
        updatedAt: "Diperbarui lebih dari 1 bulan lalu",
    },
    {
        id: "4",
        image: "/placeholder.svg?height=160&width=280",
        type: "Rumah Baru",
        priceRange: "Rp 1,9 M - Rp 3,7 M",
        installment: "Angsuran mulai dari Rp13,5 Jt/bln",
        propertyName: "Summarecon Crown Gading",
        developer: "PT Summarecon Agung Tbk",
        developerLogo: "/placeholder.svg?height=20&width=20",
        location: "Tarumajaya, Kab. Bekasi",
        bedrooms: "2-5 KT",
        landSize: "LT 55-192m²",
        buildingSize: "LB 50-",
        updatedAt: "Diperbarui lebih dari 1 bulan lalu",
    },
    {
        id: "5",
        image: "/placeholder.svg?height=160&width=280",
        badge: "READY",
        type: "Apartemen",
        priceRange: "Rp 750 Jt - Rp 1,05 M",
        installment: "Angsuran mulai dari Rp4,9 Jt/bln",
        propertyName: "Skyline Residence Tower A",
        developer: "PT Cipta Properti Nusantara",
        developerLogo: "/placeholder.svg?height=20&width=20",
        location: "Kebayoran, Kota Jakarta Selatan",
        bedrooms: "1-2 KT",
        landSize: "LT -",
        buildingSize: "LB 36-72m²",
        updatedAt: "Diperbarui 2 minggu lalu",
    },
    {
        id: "6",
        image: "/placeholder.svg?height=160&width=280",
        type: "Kavling",
        typeExtra: "Sisa 12 Lot",
        priceRange: "Rp 320 Jt - Rp 450 Jt",
        installment: "Angsuran mulai dari Rp2,1 Jt/bln",
        propertyName: "Greenfield Kavling Asri",
        developer: "Greenfield Developments",
        developerLogo: "/placeholder.svg?height=20&width=20",
        location: "Cileungsi, Kab. Bogor",
        bedrooms: "-",
        landSize: "LT 90-120m²",
        buildingSize: "-",
        updatedAt: "Diperbarui 3 hari lalu",
    },
]

export function GoldenDeals() {
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 296 // card width + gap
            const newScrollLeft =
                scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount)

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: "smooth",
            })
        }
    }

    return (
        <section className="relative px-4 overflow-hidden">
            <div
                className="absolute inset-x-0 top-0 h-[280px] bg-cover bg-center rounded-3xl mx-4"
                style={{
                    backgroundImage: "url('/placeholder.svg?height=280&width=1400')",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-500/90 to-blue-400/90 rounded-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto pt-12 pb-8">
                <div className="flex items-start justify-between mb-8">
                    <div className="relative flex items-center gap-3">
                        <div>
                            <h2
                                className="text-5xl font-black leading-none mb-0"
                                style={{
                                    color: "#fbbf24",
                                    textShadow: "3px 3px 0px rgba(30, 64, 175, 0.8), -1px -1px 0px rgba(255, 255, 255, 0.3)",
                                    WebkitTextStroke: "2px #1e40af",
                                }}
                            >
                                GOLDEN
                            </h2>
                            <h2
                                className="text-5xl font-black leading-none"
                                style={{
                                    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                                    filter: "drop-shadow(2px 2px 0px #1e40af)",
                                }}
                            >
                                DEALS
                            </h2>
                        </div>
                    </div>
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-6 rounded-full">
                        LIHAT SEMUA
                    </Button>
                </div>

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
                        {goldenDealsProperties.map((property) => (
                            <GoldenDealsCard key={property.id} {...property} />
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
