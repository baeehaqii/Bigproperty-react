"use client"

import type React from "react"

import {
  Home,
  CheckCircle2,
  PlusCircle,
  Building2,
  Layers,
  Store,
  Factory,
  UserX,
  Coins,
  Handshake,
  TrendingUp,
  Bed,
} from "lucide-react"

interface CategoryCardProps {
  icon: React.ReactNode
  label: string
  badge?: string
  highlighted?: boolean
  isOrange?: boolean
}

function CategoryCard({ icon, label, badge, highlighted = false, isOrange = false }: CategoryCardProps) {
  return (
    <div className="relative flex min-w-[90px] flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer flex-shrink-0">
      {badge && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap z-10">
          {badge}
        </div>
      )}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${
          isOrange
            ? "bg-gradient-to-br from-orange-500 to-orange-600"
            : highlighted
              ? "bg-gradient-to-br from-[#ECEC5C] to-[#c4a747]"
              : "bg-blue-500"
        }`}
      >
        <div className={isOrange || highlighted ? "text-white" : "text-white"}>{icon}</div>
      </div>
      <span className="text-center text-xs font-medium text-gray-800 leading-tight">{label}</span>
    </div>
  )
}

export function PropertyCategories() {
  const buyCategories = [
    {
      icon: <Coins className="h-5 w-5" />,
      label: "Cashback 80jt 🔥",
      highlighted: true,
    },
    { icon: <CheckCircle2 className="h-5 w-5" />, label: "Terverifikasi" },
    { icon: <Home className="h-5 w-5" />, label: "Rumah" },
    { icon: <Home className="h-5 w-5" />, label: "Rumah Baru" },
    { icon: <Building2 className="h-5 w-5" />, label: "Apartemen" },
    { icon: <Layers className="h-5 w-5" />, label: "Tanah" },
    { icon: <Store className="h-5 w-5" />, label: "Ruko" },
    { icon: <Store className="h-5 w-5" />, label: "Tempat Usaha" },
    { icon: <Bed className="h-5 w-5" />, label: "Kost" },
    { icon: <Factory className="h-5 w-5" />, label: "Gudang & Pabrik" },
    { icon: <UserX className="h-5 w-5" />, label: "Tanpa Perantara" },
  ]

  const rentCategories = [
    {
      icon: <Handshake className="h-5 w-5" />,
      label: "Transaksi di Pinhome",
      highlighted: true,
    },
    { icon: <Home className="h-5 w-5" />, label: "Rumah Kontrakan" },
    { icon: <Building2 className="h-5 w-5" />, label: "Apartemen" },
    { icon: <UserX className="h-5 w-5" />, label: "Tanpa Perantara" },
  ]

  const listingCategories = [
    {
      icon: <PlusCircle className="h-5 w-5" />,
      label: "Pasang Iklan Jual & Sewa",
      isOrange: true,
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Estimasi Nilai Properti",
      isOrange: true,
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {/* Beli Properti Section */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Beli Properti</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {buyCategories.map((category, index) => (
            <CategoryCard key={index} icon={category.icon} label={category.label} highlighted={category.highlighted} />
          ))}
        </div>
      </div>

      {/* Sewa Properti Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Sewa Properti</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 pt-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
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
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Titip Jual & Sewa Properti</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 pt-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {listingCategories.map((category, index) => (
            <CategoryCard
              key={index}
              icon={category.icon}
              label={category.label}
              badge={index === 0 ? "BARU" : undefined}
              isOrange={category.isOrange}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
