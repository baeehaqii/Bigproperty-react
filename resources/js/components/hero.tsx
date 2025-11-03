"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Hero() {
  const [searchType, setSearchType] = useState<"Beli" | "Sewa">("Beli")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const slides = [
    "https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761071664/Gate_lkgdrn.avif",
    "https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761071337/type_90_qpwdco.avif",
    "https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761071336/Type_85_zmze7h.avif",
  ]
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, 15000)

    return () => {
      clearInterval(id)
    }
  }, [slides.length])

  return (
    <section className="relative min-h-[480px] overflow-hidden bg-gradient-to-br from-[#ECEC5C] via-[#d4d44a] to-[#c4a747] rounded-2xl">
      {/* Sliding Banner (hidden on small screens) */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div
          className="flex h-full w-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)`, width: `${slides.length * 100}%` }}
        >
          {slides.map((src, idx) => (
            <div key={idx} className="h-full flex-shrink-0 w-full lg:w-full">
              <img src={src || "/placeholder.svg"} alt={`slide-${idx}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[480px] flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-5xl text-center">
          <h1 className="mb-4 text-center text-4xl md:text-5xl font-extrabold text-gray-900">#FindYourWayHome</h1>
          <p className="mb-8 text-center text-lg text-gray-900">
            Semua kebutuhan properti ada di <span className="font-bold">Pinhome</span>
          </p>

          {/* Search Box */}
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
      </div>
    </section>
  )
}

export default Hero
