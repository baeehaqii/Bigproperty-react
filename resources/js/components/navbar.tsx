import { ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Link } from "@inertiajs/react"
import { OptimizedImage } from "@/components/optimized-image"

export function Navbar() {
  return (
    <nav className="w-full backdrop-blur-xl" style={{
      background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.9) 50%, rgba(92, 93, 38, 1) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(214, 214, 103, 0.2)',
    }}>
      {/* Accent glow effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to right, rgba(214, 214, 103, 0.05), transparent, rgba(214, 214, 103, 0.05))'
      }} />

      {/* Top Navigation */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto max-w-7xl flex items-center justify-end gap-6 px-6 py-3 text-sm text-gray-300">
          <Link href="/research-insights" className="hover:text-[#D6D667] transition-colors">
            Research Insights
          </Link>
          <Link href="/agent/register" className="hover:text-[#D6D667] transition-colors">
            Agen
          </Link>
          <Link href="/developer" className="hover:text-[#D6D667] transition-colors">
            Developer
          </Link>
          <Link href="/kerja-sama" className="hover:text-[#D6D667] transition-colors">
            Kerja Sama
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-gray-300 hover:text-[#D6D667] transition-colors">
              Berita Properti
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700">
              <DropdownMenuItem asChild className="text-gray-300 hover:text-[#D6D667] focus:text-[#D6D667] focus:bg-gray-800">
                <Link href="/berita/terbaru">Berita Terbaru</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-300 hover:text-[#D6D667] focus:text-[#D6D667] focus:bg-gray-800">
                <Link href="/berita/tips">Tips Properti</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-gray-300 hover:text-[#D6D667] focus:text-[#D6D667] focus:bg-gray-800">
                <Link href="/berita/panduan">Panduan</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="relative mx-auto max-w-7xl">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center justify-center">
                <OptimizedImage
                  src="https://storage.googleapis.com/bigproperty_image/website_assets/logo-bigproperty.png"
                  alt="Big Property Logo"
                  width={70}
                  height={70}
                  priority={true}
                  blur={false}
                  containerClassName="w-[70px] h-[70px] flex items-center justify-center"
                  className="w-full h-full object-contain"
                  objectFit="contain"
                />
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-white font-medium hover:text-[#D6D667] transition-colors">
                Beli
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700">
                <DropdownMenuItem asChild className="text-gray-300 hover:text-[#D6D667] focus:text-[#D6D667] focus:bg-gray-800">
                  <Link href="/beli?kategori=beli-rumah">Rumah Dijual</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 hover:text-[#D6D667] focus:text-[#D6D667] focus:bg-gray-800">
                  <Link href="/beli?kategori=apartemen">Apartemen Dijual</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 hover:text-[#D6D667] focus:text-[#D6D667] focus:bg-gray-800">
                  <Link href="/beli?kategori=tanah">Tanah Dijual</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-white font-medium hover:text-[#D6D667] transition-colors">
                Sewa
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700">
                <DropdownMenuItem asChild className="text-gray-300 hover:text-[#D6D667] focus:text-[#D6D667] focus:bg-gray-800">
                  <Link href="/sewa?kategori=sewa-rumah">Rumah Disewa</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 hover:text-[#D6D667] focus:text-[#D6D667] focus:bg-gray-800">
                  <Link href="/sewa?kategori=sewa-apartemen">Apartemen Disewa</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 hover:text-[#D6D667] focus:text-[#D6D667] focus:bg-gray-800">
                  <Link href="/sewa?kategori=kost">Kost</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-white font-medium hover:text-[#D6D667] transition-colors">
                KPR & Take Over
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700">
                <DropdownMenuItem asChild className="text-gray-300 hover:text-[#D6D667] focus:text-[#D6D667] focus:bg-gray-800">
                  <Link href="/simulasi-kpr/konvensional">Simulasi KPR Konvensional</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 hover:text-[#D6D667] focus:text-[#D6D667] focus:bg-gray-800">
                  <Link href="/simulasi-kpr/syariah">Simulasi KPR Syariah</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-gray-300 hover:text-[#D6D667] focus:text-[#D6D667] focus:bg-gray-800">
                  <Link href="/kpr/take-over">Take Over KPR</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/estimasi-nilai" className="text-white font-medium hover:text-[#D6D667] transition-colors">
              Estimasi Nilai Properti
            </Link>

            <Link href="/jasa" className="text-white font-medium hover:text-[#D6D667] transition-colors">
              Jasa
            </Link>

            <button className="text-white hover:text-[#D6D667] transition-colors">
              <Search className="h-5 w-5" />
            </button>

            <Link href="/agent/register">
              <Button
                variant="outline"
                className="backdrop-blur-sm transition-all"
                style={{
                  borderColor: 'rgba(214, 214, 103, 0.5)',
                  backgroundColor: 'rgba(214, 214, 103, 0.1)',
                  color: '#D6D667',
                }}
              >
                Pasang Iklan Gratis
              </Button>
            </Link>

            <Link href="/agent/login">
              <Button
                className="font-semibold transition-all"
                style={{
                  background: 'linear-gradient(to right, #D6D667, #c4c45a)',
                  color: '#1f2937',
                  boxShadow: '0 8px 24px rgba(214, 214, 103, 0.25)',
                }}
              >
                Daftar / Masuk
              </Button>
            </Link>
          </div>

          {/* Mobile menu placeholder */}
          <div className="md:hidden">
            <button className="text-white">Menu</button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
