"use client"

import { Facebook, Instagram, Youtube } from "lucide-react"

interface FooterLink {
    label: string
    href: string
}

interface FooterSection {
    title: string
    links: FooterLink[]
}

const footerSections: FooterSection[] = [
    {
        title: "Tentang Kami",
        links: [
            { label: "Karir", href: "/karir" },
            { label: "Menjadi Rekan", href: "/menjadi-rekan" },
            { label: "Ruang Edukasi Agen", href: "/edukasi-agen" },
            { label: "Info Area", href: "/info-area" },
            { label: "Info Properti", href: "/info-properti" },
        ]
    },
    {
        title: "Transaksi Jual Beli",
        links: [
            { label: "Titip Jual/Sewa", href: "/titip-jual-sewa" },
            { label: "Estimasi Nilai Properti", href: "/estimasi-properti" },
            { label: "Kamus Istilah Properti", href: "/kamus-properti" },
            { label: "KPR & KPA", href: "/kpr-kpa" },
            { label: "Jasa Renovasi", href: "/jasa-renovasi" },
            { label: "Modal Usaha untuk Developer", href: "/modal-developer" },
        ]
    },
    {
        title: "Big Property",
        links: [
            { label: "Big Property Mobile App", href: "/mobile-app" },
            { label: "Kerjasama", href: "/kerjasama" },
            { label: "Pusat Bantuan", href: "/bantuan" },
            { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
            { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
            { label: "Peta Situs", href: "/sitemap" },
        ]
    }
]

import { OptimizedImage } from "./optimized-image"

const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/bigproperty", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/bigproperty", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com/bigproperty", label: "YouTube" },
]

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative w-full bg-[#0a1929] overflow-hidden">
            {/* Decorative curved lines */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Top right decorative curves */}
                <svg
                    className="absolute -right-20 -top-20 w-96 h-96 opacity-10"
                    viewBox="0 0 400 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="200" cy="200" r="150" stroke="url(#gradient1)" strokeWidth="1" fill="none" />
                    <circle cx="200" cy="200" r="180" stroke="url(#gradient1)" strokeWidth="0.5" fill="none" />
                    <circle cx="200" cy="200" r="120" stroke="url(#gradient1)" strokeWidth="0.5" fill="none" />
                    <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Bottom right decorative curves */}
                <svg
                    className="absolute -right-32 bottom-0 w-[500px] h-[400px] opacity-20"
                    viewBox="0 0 500 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M 500 400 Q 400 300 450 200 T 500 0"
                        stroke="url(#gradient2)"
                        strokeWidth="1"
                        fill="none"
                    />
                    <path
                        d="M 500 400 Q 380 280 420 180 T 500 0"
                        stroke="url(#gradient2)"
                        strokeWidth="0.5"
                        fill="none"
                    />
                    <path
                        d="M 500 400 Q 360 260 390 160 T 500 0"
                        stroke="url(#gradient2)"
                        strokeWidth="0.5"
                        fill="none"
                    />
                    <defs>
                        <linearGradient id="gradient2" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Subtle grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: "40px 40px"
                    }}
                />
            </div>

            {/* Main Footer Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
                    {/* Logo & Company Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center">
                                <OptimizedImage
                                    src="https://storage.googleapis.com/bigproperty_image/website_assets/logo-bigproperty.png"
                                    alt="Big Property Logo"
                                    width={70}
                                    height={70}
                                    blur={false}
                                    containerClassName="w-[70px] h-[70px]"
                                    className="w-full h-full object-contain"
                                    objectFit="contain"
                                />
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-gray-400 transition-all duration-300 hover:border-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500"
                                    aria-label={social.label}
                                >
                                    <social.icon className="h-5 w-5" />
                                </a>
                            ))}
                            {/* TikTok Icon (custom) */}
                            <a
                                href="https://tiktok.com/@bigproperty"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-gray-400 transition-all duration-300 hover:border-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500"
                                aria-label="TikTok"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z" />
                                </svg>
                            </a>
                        </div>

                        {/* Company Info */}
                        <div className="space-y-2 text-sm text-gray-400">
                            <p>© {currentYear} PT. Big Property Indonesia</p>
                            <p>Nomor Induk Berusaha: 9120107890063</p>
                        </div>
                    </div>

                    {/* Footer Sections */}
                    {footerSections.map((section, index) => (
                        <div key={index} className="space-y-5">
                            <h3 className="text-white font-medium text-base tracking-wide">
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-gray-400 transition-colors duration-200 hover:text-yellow-500"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="mt-16 pt-8 border-t border-gray-800">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-500">
                            Big Property - Platform properti terpercaya di Indonesia
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="/syarat-ketentuan" className="text-sm text-gray-500 hover:text-yellow-500 transition-colors">
                                Syarat & Ketentuan
                            </a>
                            <a href="/kebijakan-privasi" className="text-sm text-gray-500 hover:text-yellow-500 transition-colors">
                                Kebijakan Privasi
                            </a>
                            <a href="/bantuan" className="text-sm text-gray-500 hover:text-yellow-500 transition-colors">
                                Bantuan
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
