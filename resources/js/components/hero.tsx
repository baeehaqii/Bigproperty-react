"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { OptimizedImage, usePreloadImage } from "@/components/optimized-image"

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
    "https://storage.googleapis.com/bigproperty_image/website_assets/banner-bigpro-5.png",
    "https://storage.googleapis.com/bigproperty_image/website_assets/banner-bigpro-5.png",
  ]

  // Gunakan images dari database atau fallback
  const slides = heroes.length > 0
    ? heroes.flatMap(hero => hero.image || [])
    : defaultSlides

  // Preload first slide for LCP
  usePreloadImage(slides[0], true)

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
      className="relative w-full h-[580px] rounded-2xl overflow-hidden bg-gray-900"
    >
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 z-20 rounded-2xl">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span className="text-white/70 text-sm">Memuat...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg z-20 text-sm">
          {error}
        </div>
      )}

      {/* Sliding Banner */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((src, idx) => (
            <div key={idx} className="h-full w-full shrink-0">
              <OptimizedImage
                src={src || "/placeholder.svg"}
                alt={`Hero Banner ${idx + 1} - Big Property`}
                priority={idx === 0}
                layout="full"
                blur={false}
                containerClassName="h-full w-full"
                className="h-full w-full"
                objectFit="cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Overlay — dark top and bottom, transparent middle */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
        background: 'linear-gradient(to bottom, rgba(10,18,30,0.65) 0%, rgba(10,18,30,0.25) 45%, rgba(10,18,30,0.70) 100%)'
      }} />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-6 py-10">

        {/* Center — Headline & Subheadline */}
        <div className="flex flex-1 flex-col items-center justify-center text-center gap-4 -mt-6">
          {/* Brand tagline chip */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ backgroundColor: '#C5E62A', fontFamily: "'Outfit', sans-serif" }}>
            <span className="text-xs font-bold tracking-wider uppercase" style={{ color: '#1A1A2E' }}>
              Tepat. Bukan sekadar dekat.
            </span>
          </div>

          <h1
            className="text-4xl md:text-[3.25rem] font-bold text-white leading-tight"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              textShadow: '0 2px 32px rgba(0,0,0,0.6)',
              letterSpacing: '-0.02em'
            }}
          >
            Temukan Hunian<br />yang Tepat Untukmu
          </h1>
          <p
            className="text-base md:text-lg max-w-md leading-relaxed"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 300,
              color: 'rgba(255,255,255,0.82)',
              textShadow: '0 1px 12px rgba(0,0,0,0.4)'
            }}
          >
            Ribuan properti terverifikasi di seluruh Indonesia — rumah, apartemen, tanah & lebih banyak lagi
          </p>
        </div>

        {/* Bottom — Search Bar */}
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl bg-white p-1.5 shadow-2xl shadow-black/30" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="flex items-center gap-2">
              {/* Search Type Dropdown */}
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-1.5 px-4 text-sm rounded-xl cursor-pointer min-w-[76px]"
                    style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#1A1A2E' }}
                  >
                    {searchType}
                    <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-32 bg-white border-gray-100 shadow-xl rounded-xl p-1">
                  <DropdownMenuItem
                    onClick={() => { setSearchType("Beli"); setIsDropdownOpen(false) }}
                    className="flex items-center justify-between rounded-lg cursor-pointer"
                    style={{ fontFamily: "'Outfit', sans-serif", color: '#1A1A2E' }}
                  >
                    Beli
                    {searchType === "Beli" && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#C5E62A' }} />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => { setSearchType("Sewa"); setIsDropdownOpen(false) }}
                    className="flex items-center justify-between rounded-lg cursor-pointer"
                    style={{ fontFamily: "'Outfit', sans-serif", color: '#1A1A2E' }}
                  >
                    Sewa
                    {searchType === "Sewa" && <div className="h-2 w-2 rounded-full" style={{ backgroundColor: '#C5E62A' }} />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Divider */}
              <div className="h-7 w-px bg-gray-200" />

              {/* Search Input */}
              <Input
                type="text"
                placeholder='Cari lokasi, nama proyek, atau kata kunci...'
                className="flex-1 border-0 text-sm placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                style={{ fontFamily: "'Outfit', sans-serif", color: '#1A1A2E' }}
              />

              <Button
                size="icon"
                className="h-9 w-9 rounded-xl flex-shrink-0 cursor-pointer transition-all duration-150 active:scale-95"
                style={{ backgroundColor: '#C5E62A', color: '#1A1A2E', boxShadow: '0 2px 12px rgba(197,230,42,0.4)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#b8d922' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#C5E62A' }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            <span className="text-xs text-white/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Populer:</span>
            {['Rumah Jakarta', 'Apartemen Surabaya', 'Tanah Bali', 'Ruko Bekasi'].map((tag) => (
              <button
                key={tag}
                className="text-xs rounded-full px-3 py-1 transition-all duration-150 cursor-pointer"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: 'rgba(255,255,255,0.75)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.05)'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#C5E62A20';
                  (e.currentTarget as HTMLElement).style.borderColor = '#C5E62A60';
                  (e.currentTarget as HTMLElement).style.color = '#C5E62A';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-20 right-6 flex gap-1.5 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === current ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default Hero