"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "@inertiajs/react"

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
  slug: string
  section: "buy" | "rent" | "listing"
  badge?: string
  badgeColor?: string
  highlighted?: boolean
  isOrange?: boolean
}

function CategoryCard({ icon, label, slug, section, badge, badgeColor, highlighted = false, isOrange = false }: CategoryCardProps) {
  const getUrl = () => {
    if (section === 'buy') return `/beli?kategori=${slug}`
    if (section === 'rent') return `/sewa?kategori=${slug}`
    return '#'
  }

  const iconBg = highlighted
    ? '#C5E62A'
    : isOrange
      ? '#FF6B6B'
      : '#3B9EF5'

  const iconColor = highlighted || isOrange ? '#1A1A2E' : '#ffffff'

  return (
    <Link href={getUrl()} className="no-underline">
      <div
        className="relative flex min-w-[80px] flex-col items-center gap-2.5 rounded-2xl bg-white px-3 py-3.5 cursor-pointer flex-shrink-0 transition-all duration-200"
        style={{ border: '1.5px solid #F0F0F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = '#C5E62A';
          el.style.boxShadow = '0 4px 16px rgba(197,230,42,0.2)';
          el.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = '#F0F0F0';
          el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
          el.style.transform = '';
        }}
      >
        {badge && (
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[9px] font-bold whitespace-nowrap z-10"
            style={{ backgroundColor: badgeColor || '#FF6B6B', color: '#fff', fontFamily: "'Outfit', sans-serif" }}
          >
            {badge}
          </div>
        )}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        <span
          className="text-center text-[11px] leading-tight"
          style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: '#1A1A2E' }}
        >
          {label}
        </span>
      </div>
    </Link>
  )
}

// Heroicon mapping dari backend Laravel (menggunakan Lucide React equivalents)
const heroiconMap: Record<string, React.ReactNode> = {
  // Property & Real Estate
  "heroicon-o-home": <Home className="h-4 w-4" />,
  "heroicon-o-home-modern": <Building className="h-4 w-4" />,
  "heroicon-o-building-office": <Building2 className="h-4 w-4" />,
  "heroicon-o-building-office-2": <Building2 className="h-4 w-4" />,
  "heroicon-o-building-storefront": <Store className="h-4 w-4" />,
  "heroicon-o-building-library": <Building className="h-4 w-4" />,

  // Location
  "heroicon-o-map-pin": <MapPin className="h-4 w-4" />,
  "heroicon-o-map": <Map className="h-4 w-4" />,
  "heroicon-o-globe-alt": <Globe className="h-4 w-4" />,

  // Business
  "heroicon-o-briefcase": <Briefcase className="h-4 w-4" />,
  "heroicon-o-banknotes": <Banknote className="h-4 w-4" />,
  "heroicon-o-currency-dollar": <DollarSign className="h-4 w-4" />,

  // Categories
  "heroicon-o-squares-2x2": <Grid2X2 className="h-4 w-4" />,
  "heroicon-o-squares-plus": <Plus className="h-4 w-4" />,
  "heroicon-o-rectangle-group": <Columns3 className="h-4 w-4" />,

  // Common
  "heroicon-o-star": <Star className="h-4 w-4" />,
  "heroicon-o-heart": <Heart className="h-4 w-4" />,
  "heroicon-o-fire": <Flame className="h-4 w-4" />,
  "heroicon-o-sparkles": <Sparkles className="h-4 w-4" />,
  "heroicon-o-bolt": <Zap className="h-4 w-4" />,
  "heroicon-o-key": <Key className="h-4 w-4" />,
  "heroicon-o-shopping-cart": <ShoppingCart className="h-4 w-4" />,
  "heroicon-o-shopping-bag": <ShoppingBag className="h-4 w-4" />,

  // Facilities
  "heroicon-o-tv": <Tv className="h-4 w-4" />,
  "heroicon-o-wifi": <Wifi className="h-4 w-4" />,
  "heroicon-o-truck": <Truck className="h-4 w-4" />,
  "heroicon-o-wrench-screwdriver": <Wrench className="h-4 w-4" />,

  // Nature
  "heroicon-o-sun": <Sun className="h-4 w-4" />,
  "heroicon-o-moon": <Moon className="h-4 w-4" />,
  "heroicon-o-cloud": <Cloud className="h-4 w-4" />,

  // Legacy mappings (untuk backward compatibility)
  Home: <Home className="h-4 w-4" />,
  CheckCircle2: <CheckCircle2 className="h-4 w-4" />,
  PlusCircle: <PlusCircle className="h-4 w-4" />,
  Building2: <Building2 className="h-4 w-4" />,
  Layers: <Layers className="h-4 w-4" />,
  Store: <Store className="h-4 w-4" />,
  Factory: <Factory className="h-4 w-4" />,
  UserX: <UserX className="h-4 w-4" />,
  Coins: <Coins className="h-4 w-4" />,
  Handshake: <Handshake className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  Bed: <Bed className="h-4 w-4" />,
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
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[0, 1].map((col) => (
            <div key={col}>
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-4" />
              <div className="flex flex-wrap gap-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-[84px] w-[84px] bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
        {/* Beli Properti */}
        <div>
          <h2 className="mb-3.5 text-base tracking-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: '#1A1A2E' }}>
            Beli Properti
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {buyCategories.map((category: PropertyCategory) => (
              <CategoryCard
                key={category.id}
                icon={heroiconMap[category.icon] || <Home className="h-4 w-4" />}
                label={category.name}
                slug={category.slug}
                section="buy"
                highlighted={category.is_highlighted}
                badge={category.has_badge && category.badge_text ? category.badge_text : undefined}
                badgeColor={category.badge_color || undefined}
              />
            ))}
          </div>
        </div>

        {/* Sewa Properti */}
        <div>
          <h2 className="mb-3.5 text-base tracking-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, color: '#1A1A2E' }}>
            Sewa Properti
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {rentCategories.map((category: PropertyCategory) => (
              <CategoryCard
                key={category.id}
                icon={heroiconMap[category.icon] || <Home className="h-4 w-4" />}
                label={category.name}
                slug={category.slug}
                section="rent"
                badge={category.has_badge && category.badge_text ? category.badge_text : undefined}
                badgeColor={category.badge_color || undefined}
                highlighted={category.is_highlighted}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}