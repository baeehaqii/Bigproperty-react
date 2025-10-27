"use client"
import { ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
    return (
        <nav className="w-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400">
            {/* Top Navigation */}
            <div className="border-b-2 border-white/10">
                <div className="mx-auto max-w-7xl flex items-center justify-end gap-6 px-6 py-3 text-sm text-white">
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
                        <DropdownMenuTrigger className="flex items-center gap-1 text-white hover:underline">
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
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-blue-600">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white">Big Property</span>
                    </div>

                    {/* Navigation Items */}
                    <div className="hidden md:flex items-center gap-6">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-1 text-white hover:underline">
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
                            <DropdownMenuTrigger className="flex items-center gap-1 text-white hover:underline">
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
                            <DropdownMenuTrigger className="flex items-center gap-1 text-white hover:underline">
                                KPR & Take Over
                                <ChevronDown className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Simulasi KPR</DropdownMenuItem>
                                <DropdownMenuItem>Take Over KPR</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <a href="#" className="text-white hover:underline">
                            Estimasi Nilai Properti
                        </a>

                        <a href="#" className="text-white hover:underline">
                            Jasa
                        </a>

                        <button className="text-white hover:opacity-80">
                            <Search className="h-5 w-5" />
                        </button>

                        <Button
                            variant="outline"
                            className="border-white bg-transparent text-white hover:bg-white hover:text-blue-600"
                        >
                            Pasang Iklan Gratis
                        </Button>

                        <Button className="bg-white text-blue-600 hover:bg-blue-50">Daftar / Masuk</Button>
                    </div>

                    {/* Mobile menu placeholder */}
                    <div className="md:hidden">
                        <button className="text-gray-600">Menu</button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
