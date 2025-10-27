"use client"

import type React from "react"

import {
    Home,
    CheckCircle2,
    PlusCircle,
    Building2,
    Layers,
    Store,
    FileText,
    Factory,
    UserX,
    Coins,
    Handshake,
    Users,
    TrendingUp,
} from "lucide-react"

interface CategoryCardProps {
    icon: React.ReactNode
    label: string
    badge?: string
    highlighted?: boolean
}

function CategoryCard({ icon, label, badge, highlighted = false }: CategoryCardProps) {
    return (
        <div className="relative flex min-w-[140px] flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-blue-200 cursor-pointer">
            {badge && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-3 py-0.5 text-xs font-bold text-white">
                    {badge}
                </div>
            )}
            <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${highlighted ? "bg-gradient-to-br from-blue-600 to-blue-500" : "bg-blue-50"
                    }`}
            >
                <div className={highlighted ? "text-white" : "text-blue-600"}>{icon}</div>
            </div>
            <span className="text-center text-sm font-medium text-gray-800 leading-tight">{label}</span>
        </div>
    )
}

export function PropertyCategories() {
    const buyCategories = [
        {
            icon: <Coins className="h-6 w-6" />,
            label: "Cashback 80jt 🔥",
            highlighted: true,
        },
        { icon: <CheckCircle2 className="h-6 w-6" />, label: "Terverifikasi" },
        { icon: <PlusCircle className="h-6 w-6" />, label: "Rumah Baru" },
        { icon: <Home className="h-6 w-6" />, label: "Rumah Second" },
        { icon: <Building2 className="h-6 w-6" />, label: "Apartemen Baru" },
        { icon: <Building2 className="h-6 w-6" />, label: "Apartemen Second" },
        { icon: <Layers className="h-6 w-6" />, label: "Tanah" },
        { icon: <Store className="h-6 w-6" />, label: "Tempat Usaha" },
        { icon: <FileText className="h-6 w-6" />, label: "Kost" },
        { icon: <Factory className="h-6 w-6" />, label: "Gudang & Pabrik" },
        { icon: <UserX className="h-6 w-6" />, label: "Tanpa Perantara" },
    ]

    const rentCategories = [
        {
            icon: <Handshake className="h-6 w-6" />,
            label: "Transaksi di Big Property",
            highlighted: true,
        },
        { icon: <Users className="h-6 w-6" />, label: "Rumah Kontrakan" },
        { icon: <Building2 className="h-6 w-6" />, label: "Apartemen" },
        { icon: <UserX className="h-6 w-6" />, label: "Tanpa Perantara" },
    ]

    const listingCategories = [
        {
            icon: <PlusCircle className="h-6 w-6" />,
            label: "Pasang Iklan Jual & Sewa",
            highlighted: true,
            isOrange: true,
        },
        {
            icon: <TrendingUp className="h-6 w-6" />,
            label: "Estimasi Nilai Properti",
            highlighted: true,
            isOrange: true,
        },
    ]

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">
            {/* Beli Properti Section */}
            <div className="mb-12">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Beli Properti</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {buyCategories.map((category, index) => (
                        <CategoryCard key={index} icon={category.icon} label={category.label} highlighted={category.highlighted} />
                    ))}
                </div>
            </div>

            {/* Sewa Properti Section */}
            <div className="mb-12">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Sewa Properti</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {rentCategories.map((category, index) => (
                        <CategoryCard
                            key={index}
                            icon={category.icon}
                            label={category.label}
                            badge={index === 0 ? "BARU" : undefined}
                            highlighted={category.highlighted}
                        />
                    ))}
                </div>
            </div>

            {/* Titip Jual & Sewa Properti Section */}
            <div className="mb-12">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Titip Jual & Sewa Properti</h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {listingCategories.map((category, index) => (
                        <div
                            key={index}
                            className="relative flex min-w-[140px] flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md hover:border-orange-200 cursor-pointer"
                        >
                            {index === 0 && (
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-3 py-0.5 text-xs font-bold text-white">
                                    BARU
                                </div>
                            )}
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-400">
                                <div className="text-white">{category.icon}</div>
                            </div>
                            <span className="text-center text-sm font-medium text-gray-800 leading-tight">{category.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
