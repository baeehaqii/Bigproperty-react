"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Hero() {
  const [searchType, setSearchType] = useState<"Beli" | "Sewa">("Beli")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [current, setCurrent] = useState(0)

  // State untuk data dari database
  const [heroes, setHeroes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data dari Laravel
  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        setLoading(true)
        // Langsung ke route web.php
        const response = await fetch('/heroes-data')

        if (!response.ok) {
          throw new Error('Failed to fetch heroes')
        }

        const result = await response.json()

        if (result.success && result.data) {
          setHeroes(result.data)
        }
      } catch (err) {
        console.error('Error fetching heroes:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchHeroes()
  }, [])

  // Fallback slides kalo belum ada data
  const defaultSlides = [
    "https://res.cloudinary.com/dneebbl5v/image/upload/v1763110873/banner-bigpro-5_vbn47k.png",
    "https://res.cloudinary.com/dneebbl5v/image/upload/v1763110873/banner-bigpro-5_vbn47k.png",
    "https://res.cloudinary.com/dneebbl5v/image/upload/v1763110873/banner-bigpro-5_vbn47k.png",
  ]

  // Gunakan images dari database atau fallback
  const slides = heroes.length > 0
    ? heroes.flatMap(hero => hero.image || [])
    : defaultSlides

  // Auto slide
  useEffect(() => {
    if (slides.length === 0) return

    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 15000)

    return () => {
      clearInterval(id)
    }
  }, [slides.length])

  // Ambil hero yang aktif saat ini
  const activeHero = heroes[0]

  return (
    <section
      className="relative w-full h-[520px] rounded-2xl bg-linear-to-br overflow-hidden"
      style={{
        backgroundImage: activeHero?.main_color
          ? `linear-gradient(to bottom right, ${activeHero.main_color}, ${activeHero.main_color}dd, ${activeHero.main_color}bb)`
          : 'linear-gradient(to bottom right, #ECEC5C, #d4d44a, #c4a747)'
      }}
    >
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm z-20 rounded-2xl">
          <div className="text-white text-xl font-semibold">Loading...</div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-20">
          Error: {error}
        </div>
      )}

      {/* Sliding Banner */}
      <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-center bg-cover">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((src, idx) => (
            <div key={idx} className="h-full w-full shrink-0 flex items-center justify-center">
              <img src={src || "/placeholder.svg"} alt={`slide-${idx}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-[520px] flex-col items-center justify-end px-6 pb-6">
        {/* Search Box - Bottom Center */}
        <div className="mx-auto w-full max-w-3xl">
          <div className="relative rounded-lg bg-white p-2 shadow-lg">
            <div className="flex items-center gap-2">
              {/* Search Type Dropdown */}
              <div className="relative">
                <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-4 text-base font-medium">
                      {searchType}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-32">
                    <DropdownMenuItem
                      onClick={() => {
                        setSearchType("Beli")
                        setIsDropdownOpen(false)
                      }}
                      className="flex items-center justify-between"
                    >
                      Beli
                      {searchType === "Beli" && <div className="h-2 w-2 rounded-full bg-[#c4a747]" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSearchType("Sewa")
                        setIsDropdownOpen(false)
                      }}
                      className="flex items-center justify-between"
                    >
                      Sewa
                      {searchType === "Sewa" && <div className="h-2 w-2 rounded-full bg-[#c4a747]" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Divider */}
              <div className="h-8 w-px bg-gray-200" />

              {/* Search Input */}
              <div className="flex flex-1 items-center gap-2">
                <Input
                  type="text"
                  placeholder='Cari "Siap Pakai"'
                  className="flex-1 border-0 text-base placeholder-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button size="icon" className="bg-[#c4a747] hover:bg-[#b39640] text-white rounded-[30px] p-3">
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero