import { useState, useEffect, useRef } from "react"
import { ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Link } from "@inertiajs/react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [heights, setHeights] = useState({ full: 130, shrunk: 90 }) // Default fallback heights

  const navRef = useRef<HTMLElement>(null)
  const topNavRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Calculate precise height on initial mount to perfectly match the element without gaps
    const calculateHeights = () => {
      if (navRef.current && topNavRef.current) {
        const fullHeight = navRef.current.offsetHeight
        const topNavHeight = topNavRef.current.offsetHeight

        // Prevent setting 0 if hidden during calculate
        if (fullHeight > 0) {
          setHeights({
            full: fullHeight,
            shrunk: fullHeight - topNavHeight
          })
        }
      }
    }

    // Run after a tiny delay to ensure fonts/images have applied layout calculation
    setTimeout(calculateHeights, 100)
    window.addEventListener("resize", calculateHeights)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", calculateHeights)
    }
  }, [])
  return (
    <>
      <div
        className="w-full transition-all duration-500 ease-in-out"
        style={{ height: `${isScrolled ? heights.shrunk : heights.full}px` }}
      />

      <nav ref={navRef} className="w-full fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-gray-100" style={{
        boxShadow: isScrolled ? '0 1px 20px rgba(0,0,0,0.08)' : '0 1px 6px rgba(0,0,0,0.04)',
      }}>

        {/* Top Navigation */}
        <div
          ref={topNavRef}
          className={`relative overflow-hidden transition-all duration-500 ease-in-out ${isScrolled ? 'max-h-0 opacity-0 border-transparent' : 'max-h-[60px] opacity-100 border-gray-100 border-b'
            }`}
        >
          <div className="mx-auto max-w-7xl flex items-center justify-end gap-6 px-6 py-2.5 text-sm" style={{ fontFamily: "'Outfit', sans-serif", color: '#6B7280' }}>
            <Link href="/research-insights" className="transition-colors" style={{ color: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#3B9EF5')}
              onMouseLeave={e => (e.currentTarget.style.color = '')}>
              Research Insights
            </Link>
            <Link href="/agent/register" className="transition-colors" style={{ color: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#3B9EF5')}
              onMouseLeave={e => (e.currentTarget.style.color = '')}>
              Agen
            </Link>
            <Link href="/developer" className="transition-colors" style={{ color: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#3B9EF5')}
              onMouseLeave={e => (e.currentTarget.style.color = '')}>
              Developer
            </Link>
            <Link href="/kerja-sama" className="transition-colors" style={{ color: 'inherit' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#3B9EF5')}
              onMouseLeave={e => (e.currentTarget.style.color = '')}>
              Kerja Sama
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 transition-colors cursor-pointer" style={{ color: '#6B7280' }}>
                Berita Properti
                <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-gray-100 shadow-xl rounded-xl">
                <DropdownMenuItem asChild className="text-[#1A1A2E] focus:bg-[#C5E62A]/10 focus:text-[#1A1A2E] rounded-lg cursor-pointer" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  <Link href="/berita/terbaru">Berita Terbaru</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-[#1A1A2E] focus:bg-[#C5E62A]/10 focus:text-[#1A1A2E] rounded-lg cursor-pointer" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  <Link href="/berita/tips">Tips Properti</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-[#1A1A2E] focus:bg-[#C5E62A]/10 focus:text-[#1A1A2E] rounded-lg cursor-pointer" style={{ fontFamily: "'Outfit', sans-serif" }}>
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
                  <img
                    src="/logo-carihunian-warna.svg"
                    alt="CariHunian Logo"
                    className="w-[70px] h-[70px] object-contain transition-all duration-300"
                    style={{ transform: isScrolled ? 'scale(0.9)' : 'scale(1)' }}
                  />
                </div>
              </Link>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center gap-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {/* Nav link style helper via inline */}
              {[
                { label: 'Beli', items: [{ label: 'Rumah Dijual', href: '/beli?kategori=beli-rumah' }, { label: 'Apartemen Dijual', href: '/beli?kategori=apartemen' }, { label: 'Tanah Dijual', href: '/beli?kategori=tanah' }] },
                { label: 'Sewa', items: [{ label: 'Rumah Disewa', href: '/sewa?kategori=sewa-rumah' }, { label: 'Apartemen Disewa', href: '/sewa?kategori=sewa-apartemen' }, { label: 'Kost', href: '/sewa?kategori=kost' }] },
                { label: 'KPR & Take Over', items: [{ label: 'Simulasi KPR Konvensional', href: '/simulasi-kpr/konvensional' }, { label: 'Simulasi KPR Syariah', href: '/simulasi-kpr/syariah' }, { label: 'Take Over KPR', href: '/kpr/take-over' }] },
              ].map(({ label, items }) => (
                <DropdownMenu key={label}>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer outline-none" style={{ color: '#1A1A2E' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#C5E62A20'; (e.currentTarget as HTMLElement).style.color = '#1A1A2E' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; (e.currentTarget as HTMLElement).style.color = '#1A1A2E' }}>
                    {label}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border border-gray-100 shadow-xl rounded-xl p-1 min-w-[180px]">
                    {items.map(item => (
                      <DropdownMenuItem key={item.href} asChild className="rounded-lg cursor-pointer text-sm focus:bg-[#C5E62A]/15 focus:text-[#1A1A2E] hover:bg-[#C5E62A]/15 hover:text-[#1A1A2E]" style={{ color: '#1A1A2E', fontFamily: "'Outfit', sans-serif" }}>
                        <Link href={item.href}
                          className="block px-3 py-2 rounded-lg transition-colors">{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}

              <Link href="/estimasi-nilai" className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150" style={{ color: '#1A1A2E' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#C5E62A20' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '' }}>
                Estimasi Nilai
              </Link>

              <Link href="/jasa" className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150" style={{ color: '#1A1A2E' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#C5E62A20' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '' }}>
                Jasa
              </Link>

              <button className="p-2 rounded-lg transition-all duration-150 cursor-pointer ml-1" style={{ color: '#1A1A2E' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#C5E62A20' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '' }}>
                <Search className="h-4 w-4" />
              </button>

              <Link href="/agent/register" className="ml-2">
                <Button variant="outline" className="text-sm font-semibold rounded-xl cursor-pointer transition-all duration-150"
                  style={{ borderColor: '#3B9EF5', color: '#3B9EF5', backgroundColor: 'transparent', fontFamily: "'Outfit', sans-serif" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#3B9EF510' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                  Pasang Iklan Gratis
                </Button>
              </Link>

              <Link href="/agent/login" className="ml-1">
                <Button className="text-sm font-bold rounded-xl cursor-pointer transition-all duration-150"
                  style={{ backgroundColor: '#C5E62A', color: '#1A1A2E', fontFamily: "'Outfit', sans-serif", boxShadow: '0 2px 12px rgba(197,230,42,0.35)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#b8d922' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#C5E62A' }}>
                  Daftar / Masuk
                </Button>
              </Link>
            </div>

            {/* Mobile menu */}
            <div className="md:hidden">
              <button className="p-2 rounded-lg cursor-pointer" style={{ color: '#1A1A2E' }}>
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
