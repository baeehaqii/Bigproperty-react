"use client"

import type React from "react"
import { useState, useEffect } from "react"

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
  Building,
  MapPin,
  Map,
  Globe,
  Briefcase,
  Banknote,
  DollarSign,
  Grid2X2,
  Plus,
  Columns3,
  Star,
  Heart,
  Flame,
  Sparkles,
  Zap,
  Key,
  ShoppingCart,
  ShoppingBag,
  Tv,
  Wifi,
  Truck,
  Wrench,
  Sun,
  Moon,
  Cloud,
} from "lucide-react"

// Types
interface PropertyCategory {
  id: number
  name: string
  slug: string
  icon: string
  section: "buy" | "rent" | "listing"
  is_highlighted: boolean
  has_badge: boolean
  badge_text: string | null
  badge_color: string | null
  order: number
  is_active: boolean
}

interface CategoriesResponse {
  buy: PropertyCategory[]
  rent: PropertyCategory[]
  listing: PropertyCategory[]
}

interface CategoryCardProps {
  icon: React.ReactNode
  label: string
  badge?: string
  badgeColor?: string
  highlighted?: boolean
  isOrange?: boolean
}

function CategoryCard({ icon, label, badge, badgeColor, highlighted = false, isOrange = false }: CategoryCardProps) {
  return (
    <div className="relative flex min-w-[90px] flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer flex-shrink-0">
      {badge && (
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap z-10"
          style={{ backgroundColor: badgeColor || '#ef4444' }}
        >
          {badge}
        </div>
      )}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full ${isOrange
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

// Heroicon mapping dari backend Laravel (menggunakan Lucide React equivalents)
const heroiconMap: Record<string, React.ReactNode> = {
  // Property & Real Estate
  "heroicon-o-home": <Home className="h-5 w-5" />,
  "heroicon-o-home-modern": <Building className="h-5 w-5" />,
  "heroicon-o-building-office": <Building2 className="h-5 w-5" />,
  "heroicon-o-building-office-2": <Building2 className="h-5 w-5" />,
  "heroicon-o-building-storefront": <Store className="h-5 w-5" />,
  "heroicon-o-building-library": <Building className="h-5 w-5" />,

  // Location
  "heroicon-o-map-pin": <MapPin className="h-5 w-5" />,
  "heroicon-o-map": <Map className="h-5 w-5" />,
  "heroicon-o-globe-alt": <Globe className="h-5 w-5" />,

  // Business
  "heroicon-o-briefcase": <Briefcase className="h-5 w-5" />,
  "heroicon-o-banknotes": <Banknote className="h-5 w-5" />,
  "heroicon-o-currency-dollar": <DollarSign className="h-5 w-5" />,

  // Categories
  "heroicon-o-squares-2x2": <Grid2X2 className="h-5 w-5" />,
  "heroicon-o-squares-plus": <Plus className="h-5 w-5" />,
  "heroicon-o-rectangle-group": <Columns3 className="h-5 w-5" />,

  // Common
  "heroicon-o-star": <Star className="h-5 w-5" />,
  "heroicon-o-heart": <Heart className="h-5 w-5" />,
  "heroicon-o-fire": <Flame className="h-5 w-5" />,
  "heroicon-o-sparkles": <Sparkles className="h-5 w-5" />,
  "heroicon-o-bolt": <Zap className="h-5 w-5" />,
  "heroicon-o-key": <Key className="h-5 w-5" />,
  "heroicon-o-shopping-cart": <ShoppingCart className="h-5 w-5" />,
  "heroicon-o-shopping-bag": <ShoppingBag className="h-5 w-5" />,

  // Facilities
  "heroicon-o-tv": <Tv className="h-5 w-5" />,
  "heroicon-o-wifi": <Wifi className="h-5 w-5" />,
  "heroicon-o-truck": <Truck className="h-5 w-5" />,
  "heroicon-o-wrench-screwdriver": <Wrench className="h-5 w-5" />,

  // Nature
  "heroicon-o-sun": <Sun className="h-5 w-5" />,
  "heroicon-o-moon": <Moon className="h-5 w-5" />,
  "heroicon-o-cloud": <Cloud className="h-5 w-5" />,

  // Legacy mappings (untuk backward compatibility)
  Home: <Home className="h-5 w-5" />,
  CheckCircle2: <CheckCircle2 className="h-5 w-5" />,
  PlusCircle: <PlusCircle className="h-5 w-5" />,
  Building2: <Building2 className="h-5 w-5" />,
  Layers: <Layers className="h-5 w-5" />,
  Store: <Store className="h-5 w-5" />,
  Factory: <Factory className="h-5 w-5" />,
  UserX: <UserX className="h-5 w-5" />,
  Coins: <Coins className="h-5 w-5" />,
  Handshake: <Handshake className="h-5 w-5" />,
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  Bed: <Bed className="h-5 w-5" />,
}

export function PropertyCategories() {
  const [categories, setCategories] = useState<CategoriesResponse>({
    buy: [],
    rent: [],
    listing: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/property-categories')

        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        const result = await response.json()

        if (result.success && result.data) {
          setCategories(result.data)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        // Fallback ke data default kalo error
        setCategories({
          buy: defaultBuyCategories,
          rent: defaultRentCategories,
          listing: defaultListingCategories,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Fallback default categories
  const defaultBuyCategories: PropertyCategory[] = [
    {
      id: 1,
      name: "Cashback 80jt 🔥",
      slug: "cashback-80jt",
      icon: "Coins",
      section: "buy",
      is_highlighted: true,
      has_badge: false,
      badge_text: null,
      badge_color: null,
      order: 1,
      is_active: true,
    },
    {
      id: 2,
      name: "Terverifikasi",
      slug: "terverifikasi",
      icon: "CheckCircle2",
      section: "buy",
      is_highlighted: false,
      has_badge: false,
      badge_text: null,
      badge_color: null,
      order: 2,
      is_active: true,
    },
  ]

  const defaultRentCategories: PropertyCategory[] = [
    {
      id: 12,
      name: "Transaksi di Pinhome",
      slug: "transaksi-di-pinhome",
      icon: "Handshake",
      section: "rent",
      is_highlighted: true,
      has_badge: false,
      badge_text: null,
      badge_color: null,
      order: 1,
      is_active: true,
    },
    {
      id: 13,
      name: "Rumah Kontrakan",
      slug: "rumah-kontrakan",
      icon: "Home",
      section: "rent",
      is_highlighted: false,
      has_badge: false,
      badge_text: null,
      badge_color: null,
      order: 2,
      is_active: true,
    },
    {
      id: 14,
      name: "Apartemen",
      slug: "apartemen-sewa",
      icon: "Building2",
      section: "rent",
      is_highlighted: false,
      has_badge: false,
      badge_text: null,
      badge_color: null,
      order: 3,
      is_active: true,
    },
    {
      id: 15,
      name: "Tanpa Perantara",
      slug: "tanpa-perantara-sewa",
      icon: "UserX",
      section: "rent",
      is_highlighted: false,
      has_badge: false,
      badge_text: null,
      badge_color: null,
      order: 4,
      is_active: true,
    },
  ]

  const defaultListingCategories: PropertyCategory[] = [
    {
      id: 16,
      name: "Pasang Iklan Jual & Sewa",
      slug: "pasang-iklan",
      icon: "PlusCircle",
      section: "listing",
      is_highlighted: false,
      has_badge: false,
      badge_text: null,
      badge_color: null,
      order: 1,
      is_active: true,
    },
    {
      id: 17,
      name: "Estimasi Nilai Properti",
      slug: "estimasi-nilai",
      icon: "TrendingUp",
      section: "listing",
      is_highlighted: false,
      has_badge: false,
      badge_text: null,
      badge_color: null,
      order: 2,
      is_active: true,
    },
  ]

  const buyCategories = categories.buy.length > 0 ? categories.buy : defaultBuyCategories
  const rentCategories = categories.rent.length > 0 ? categories.rent : defaultRentCategories
  const listingCategories = categories.listing.length > 0 ? categories.listing : defaultListingCategories

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading categories...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {/* Beli Properti Section - Full Width */}
      <div className="mb-12">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Beli Properti</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {buyCategories.map((category: PropertyCategory) => (
            <CategoryCard
              key={category.id}
              icon={heroiconMap[category.icon] || <Home className="h-5 w-5" />}
              label={category.name}
              highlighted={category.is_highlighted}
              badge={category.has_badge && category.badge_text ? category.badge_text : undefined}
              badgeColor={category.badge_color || undefined}
            />
          ))}
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Sewa Properti Section - Left Column */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Sewa Properti</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 pt-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {rentCategories.map((category: PropertyCategory) => (
              <CategoryCard
                key={category.id}
                icon={heroiconMap[category.icon] || <Home className="h-5 w-5" />}
                label={category.name}
                badge={category.has_badge && category.badge_text ? category.badge_text : undefined}
                badgeColor={category.badge_color || undefined}
                highlighted={category.is_highlighted}
              />
            ))}
          </div>
        </div>

        {/* Titip Jual & Sewa Properti Section - Right Column */}
        {/* <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Titip Jual & Sewa Properti</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 pt-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {listingCategories.map((category: PropertyCategory) => (
              <CategoryCard
                key={category.id}
                icon={heroiconMap[category.icon] || <PlusCircle className="h-5 w-5" />}
                label={category.name}
                badge={category.has_badge && category.badge_text ? category.badge_text : undefined}
                badgeColor={category.badge_color || undefined}
                isOrange={true}
              />
            ))}
          </div>
        </div> */}
      </div>
    </div>
  )
}