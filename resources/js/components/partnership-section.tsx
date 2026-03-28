"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { OptimizedImage } from "./optimized-image"

// Dummy partner logos (placeholder URLs)
const partnerLogosRow1 = [
    { name: "Bank A", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768130629/mandiri_dl9cr2.png" },
    { name: "Bank B", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768130629/btn_a0o4ip.png" },
    { name: "Bank C", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768130629/bsi_xgeqmx.png" },
    { name: "Bank D", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768130629/bri_zprbf0.png" },
    { name: "Bank E", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768130629/bsn_dzbzhs.png" },
    { name: "Bank F", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768130629/muamalat_qeghta.png" },
    { name: "Bank G", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768130629/bgs_r3osm2.png" },
    { name: "Bank H", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768130630/ocbc_ahldlb.png" },
    { name: "Bank I", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768130818/bca_xon0f9.png" },
    { name: "Bank J", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768130938/bank-jateng_jp01ct.png" },
]

const partnerLogosRow2 = [
    { name: "Partner 1", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768129495/quinland-graha_pgaxmb.png" },
    { name: "Partner 2", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768129547/griyaland-sumbang_wv5cjp.png" },
    { name: "Partner 3", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768129547/alexandria_wrycs2.png" },
    { name: "Partner 4", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768129990/sapphire-griya_ef0lrd.png" },
    { name: "Partner 5", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768129990/sgm_wazmhp.png" },
    { name: "Partner 6", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768129989/samara-griya_btlxqr.png" },
    { name: "Partner 7", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768129989/samara-graha_fuso4e.png" },
    { name: "Partner 8", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768129989/graha_nkppm4.png" },
    { name: "Partner 9", logo: "https://res.cloudinary.com/dtlhdbzcf/image/upload/v1768129989/atalas_cknaoe.png" },
]

// Property categories with links
const propertyCategories = [
    {
        title: "Beli Rumah",
        links: [
            { name: "Rumah di Jakarta Barat", href: "/beli?city=jakarta-barat" },
            { name: "Rumah di Jakarta Pusat", href: "/beli?city=jakarta-pusat" },
            { name: "Rumah di Jakarta Selatan", href: "/beli?city=jakarta-selatan" },
            { name: "Rumah di Jakarta Timur", href: "/beli?city=jakarta-timur" },
            { name: "Rumah di Bandung", href: "/beli?city=bandung" },
            { name: "Rumah di Bogor", href: "/beli?city=bogor" },
            { name: "Rumah di Bekasi", href: "/beli?city=bekasi" },
            { name: "Rumah di Depok", href: "/beli?city=depok" },
            { name: "Rumah di Semarang", href: "/beli?city=semarang" },
            { name: "Rumah di Surabaya", href: "/beli?city=surabaya" },
        ]
    },
    {
        title: "Beli Rumah Baru",
        links: [
            { name: "Rumah Baru di Jakarta", href: "/beli?type=baru&city=jakarta" },
            { name: "Rumah Baru di Bandung", href: "/beli?type=baru&city=bandung" },
            { name: "Rumah Baru di Tangerang", href: "/beli?type=baru&city=tangerang" },
            { name: "Rumah Baru di Bekasi", href: "/beli?type=baru&city=bekasi" },
            { name: "Rumah Baru di Bogor", href: "/beli?type=baru&city=bogor" },
        ]
    },
    {
        title: "Beli Apartemen",
        links: [
            { name: "Apartemen di Jakarta", href: "/beli?type=apartemen&city=jakarta" },
            { name: "Apartemen di Bandung", href: "/beli?type=apartemen&city=bandung" },
            { name: "Apartemen di Surabaya", href: "/beli?type=apartemen&city=surabaya" },
            { name: "Apartemen di Tangerang", href: "/beli?type=apartemen&city=tangerang" },
        ]
    },
    {
        title: "Beli Ruko",
        links: [
            { name: "Ruko di Jakarta", href: "/beli?type=ruko&city=jakarta" },
            { name: "Ruko di Bandung", href: "/beli?type=ruko&city=bandung" },
            { name: "Ruko di Surabaya", href: "/beli?type=ruko&city=surabaya" },
            { name: "Ruko di Tangerang", href: "/beli?type=ruko&city=tangerang" },
        ]
    },
    {
        title: "Jual Tanah",
        links: [
            { name: "Tanah di Jakarta", href: "/beli?type=tanah&city=jakarta" },
            { name: "Tanah di Bogor", href: "/beli?type=tanah&city=bogor" },
            { name: "Tanah di Bandung", href: "/beli?type=tanah&city=bandung" },
            { name: "Tanah di Bali", href: "/beli?type=tanah&city=bali" },
        ]
    },
    {
        title: "Area Populer Jual",
        links: [
            { name: "Properti di BSD", href: "/beli?area=bsd" },
            { name: "Properti di PIK", href: "/beli?area=pik" },
            { name: "Properti di Alam Sutera", href: "/beli?area=alam-sutera" },
            { name: "Properti di Kelapa Gading", href: "/beli?area=kelapa-gading" },
        ]
    },
    {
        title: "Sewa Rumah",
        links: [
            { name: "Sewa Rumah di Jakarta", href: "/sewa?type=rumah&city=jakarta" },
            { name: "Sewa Rumah di Bandung", href: "/sewa?type=rumah&city=bandung" },
            { name: "Sewa Rumah di Bali", href: "/sewa?type=rumah&city=bali" },
            { name: "Sewa Rumah di Surabaya", href: "/sewa?type=rumah&city=surabaya" },
        ]
    },
    {
        title: "Sewa Apartemen",
        links: [
            { name: "Sewa Apartemen di Jakarta", href: "/sewa?type=apartemen&city=jakarta" },
            { name: "Sewa Apartemen di Bandung", href: "/sewa?type=apartemen&city=bandung" },
            { name: "Sewa Apartemen di Surabaya", href: "/sewa?type=apartemen&city=surabaya" },
        ]
    },
]

// Infinite scroll logo component
function LogoMarquee({ logos, direction = "right" }: { logos: typeof partnerLogosRow1, direction?: "left" | "right" }) {
    const scrollRef = useRef<HTMLDivElement>(null)

    // Duplicate logos for seamless loop
    const duplicatedLogos = [...logos, ...logos, ...logos]

    return (
        <div className="relative overflow-hidden py-4">
            <div
                ref={scrollRef}
                className={`flex gap-8 ${direction === "right" ? "animate-scroll-right" : "animate-scroll-left"}`}
                style={{ width: "max-content" }}
            >
                {duplicatedLogos.map((partner, index) => (
                    <div
                        key={`${partner.name}-${index}`}
                        className="flex-shrink-0 bg-white rounded-lg px-6 py-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                    >
                        <OptimizedImage
                            src={partner.logo}
                            alt={`Partner ${partner.name}`}
                            height={40}
                            blur={false}
                            containerClassName="h-10 w-auto"
                            className="h-10 w-auto"
                            objectFit="contain"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

// Category dropdown component
function CategoryDropdown({ category }: { category: typeof propertyCategories[0] }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-3 text-left hover:text-gray-900 transition-colors"
            >
                <span className="text-sm font-medium text-gray-700">{category.title}</span>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
            </button>
            {isOpen && (
                <div className="pb-3 pl-4 space-y-2">
                    {category.links.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="block text-sm text-gray-600 hover:text-[#ECEC5C] hover:underline transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}

export function PartnershipSection() {
    return (
        <section className="py-12 bg-gray-50">
            <div className="max-w-[1400px] mx-auto px-4">
                {/* Partnership Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        Kerja Sama dengan Big Property
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                        Big Property terbuka untuk berbagai bentuk kerja sama, baik paid partnership, co-branding, penyediaan atau pembiayaan properti, dan lainnya.
                    </p>
                    <a
                        href="/404"
                        className="inline-flex items-center px-6 py-3 bg-[#ECEC5C] hover:bg-[#d4d44a] text-gray-900 font-semibold rounded-full transition-colors shadow-md hover:shadow-lg"
                    >
                        Hubungi Kami Untuk Kolaborasi
                    </a>
                </div>

                {/* Partner Logos - 2 rows with opposite scroll directions */}
                <div className="mt-10 space-y-2 overflow-hidden">
                    <LogoMarquee logos={partnerLogosRow1} direction="right" />
                    <LogoMarquee logos={partnerLogosRow2} direction="left" />
                </div>
            </div>

            {/* Property Links Section */}
            <div className="max-w-[1400px] mx-auto px-4 mt-16">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-8">
                    Big Property, Situs Online Jual Beli Properti Terpercaya
                </h3>

                {/* Desktop: Grid layout */}
                <div className="hidden md:grid md:grid-cols-4 gap-x-8 gap-y-6">
                    {propertyCategories.map((category) => (
                        <CategoryDropdown key={category.title} category={category} />
                    ))}
                </div>

                {/* Mobile: Accordion layout */}
                <div className="md:hidden space-y-0 bg-white rounded-xl shadow-sm p-4">
                    {propertyCategories.map((category) => (
                        <CategoryDropdown key={category.title} category={category} />
                    ))}
                </div>
            </div>

            {/* CSS for smooth infinite scroll animation */}
            <style>{`
                @keyframes scroll-right {
                    0% {
                        transform: translateX(-33.33%);
                    }
                    100% {
                        transform: translateX(0%);
                    }
                }

                @keyframes scroll-left {
                    0% {
                        transform: translateX(0%);
                    }
                    100% {
                        transform: translateX(-33.33%);
                    }
                }

                .animate-scroll-right {
                    animation: scroll-right 30s linear infinite;
                }

                .animate-scroll-left {
                    animation: scroll-left 30s linear infinite;
                }

                .animate-scroll-right:hover,
                .animate-scroll-left:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    )
}
