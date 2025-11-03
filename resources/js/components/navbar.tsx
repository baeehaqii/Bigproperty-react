"use client"
import { ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  return (
    <nav className="w-full bg-gradient-to-br from-[#ECEC5C] via-[#d4d44a] to-[#c4a747]">
      {/* Top Navigation */}
      <div className="border-b-2 border-white/10">
        <div className="mx-auto max-w-7xl flex items-center justify-end gap-6 px-6 py-3 text-sm text-gray-900">
          <a href="#" className="hover:underline">
            Research Insights
          </a>
          <a href="#" className="hover:underline">
            Agen
          </a>
          <a href="#" className="hover:underline">
            Developer
          </a>
          <a href="#" className="hover:underline">
            Kerja Sama
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-gray-900 hover:underline">
              Berita Properti
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Berita Terbaru</DropdownMenuItem>
              <DropdownMenuItem>Tips Properti</DropdownMenuItem>
              <DropdownMenuItem>Panduan</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white p-2">
              <img
                src="https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761232717/Logo_Big_t3qpb3.png"
                alt="Big Property Logo"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-900 hover:underline">
                Beli
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rumah Dijual</DropdownMenuItem>
                <DropdownMenuItem>Apartemen Dijual</DropdownMenuItem>
                <DropdownMenuItem>Tanah Dijual</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-900 hover:underline">
                Sewa
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Rumah Disewa</DropdownMenuItem>
                <DropdownMenuItem>Apartemen Disewa</DropdownMenuItem>
                <DropdownMenuItem>Kost</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-gray-900 hover:underline">
                KPR & Take Over
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Simulasi KPR</DropdownMenuItem>
                <DropdownMenuItem>Take Over KPR</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="#" className="text-gray-900 hover:underline">
              Estimasi Nilai Properti
            </a>

            <a href="#" className="text-gray-900 hover:underline">
              Jasa
            </a>

            <button className="text-gray-900 hover:opacity-80">
              <Search className="h-5 w-5" />
            </button>

            <Button
              variant="outline"
              className="border-gray-900 bg-transparent text-gray-900 hover:bg-white hover:text-[#c4a747]"
            >
              Pasang Iklan Gratis
            </Button>

            <Button className="bg-white text-[#c4a747] hover:bg-gray-50">Daftar / Masuk</Button>
          </div>

          {/* Mobile menu placeholder */}
          <div className="md:hidden">
            <button className="text-gray-900">Menu</button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
