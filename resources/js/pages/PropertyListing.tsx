"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Head, Link, usePage, router } from "@inertiajs/react"
import Navbar from "@/components/navbar"
import { SearchWithSuggestions } from "@/components/search-with-suggestions"
import {
    Search,
    Filter,
    ChevronDown,
    Heart,
    Share2,
    ChevronLeft,
    ChevronRight,
    Home,
    Building2,
    Store,
    Hotel,
    MapPin,
    Bed,
    Bath,
    Maximize,
    Zap,
    Info,
    X,
    Grid3X3,
    List,
    ArrowUpDown,
    SlidersHorizontal,
    CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { PropertyFilterModal, type FilterState, type Developer } from "@/components/property-filter-modal"

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

interface Property {
    id: string
    name: string
    type: string
    images: string[]
    mainImage: string
    priceRange: string
    pricePerPeriod?: string
    installment?: string
    location: string
    city: string
    bedrooms: number
    bathrooms?: number
    landSize: string
    buildingSize: string
    certificateType?: string
    marketType?: string
    developer?: {
        name: string
        logo: string
    }
    isFurnished?: boolean
    isVerified?: boolean
    hasPromo?: boolean
    lastUpdated: string
    countClicked: number
    isAvailable: boolean
    buttonType: "view" | "chat"
}

interface FilterOptions {
    developers: Developer[]
    certificateTypes: string[]
    cities: string[]
}

interface PropertyListingProps {
    type: "beli" | "sewa"
    properties: Property[]
    categories: PropertyCategory[]
    developers: Developer[]
    pagination: {
        total: number
        perPage: number
        currentPage: number
        lastPage: number
    }
    filters: Record<string, unknown>
    filterOptions: FilterOptions
}

// Icon mapping
const categoryIconMap: Record<string, React.ReactNode> = {
    "heroicon-o-home": <Home className="h-4 w-4" />,
    "heroicon-o-building-office": <Building2 className="h-4 w-4" />,
    "heroicon-o-building-storefront": <Store className="h-4 w-4" />,
    "heroicon-o-building-office-2": <Hotel className="h-4 w-4" />,
    Home: <Home className="h-4 w-4" />,
    Building2: <Building2 className="h-4 w-4" />,
    Store: <Store className="h-4 w-4" />,
    Hotel: <Hotel className="h-4 w-4" />,
}

// Property Card Component - Matches reference design with main image + thumbnail grid
function PropertyListingCard({ property }: { property: Property }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isFavorite, setIsFavorite] = useState(false)

    const allImages = property.mainImage
        ? [property.mainImage, ...(property.images || [])]
        : property.images || []

    // Get first 3 thumbnails for the grid (main image is already the first)
    const thumbnails = allImages.slice(1, 4)

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    }

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
    }

    const formatViews = (count: number) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
        return count.toString()
    }

    return (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all group">
            {/* Image Section - Main + Thumbnails Grid */}
            <div className="relative">
                <Link href={`/property/${property.id}`} className="block">
                    <div className="flex h-[220px]">
                        {/* Main Image - Left Side */}
                        <div className="relative flex-1 min-w-0 overflow-hidden">
                            <img
                                src={allImages[currentImageIndex] || "/placeholder.svg"}
                                alt={property.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />

                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-white/20 text-2xl font-bold">BigProperty</span>
                            </div>

                            {/* Image Counter Badge */}
                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                <Grid3X3 className="w-3 h-3" />
                                <span>{currentImageIndex + 1}/{allImages.length}</span>
                            </div>
                        </div>

                        {/* Thumbnail Grid - Right Side (if more than 1 image) */}
                        {thumbnails.length > 0 && (
                            <div className="w-[140px] flex-shrink-0 grid grid-cols-2 gap-0.5 ml-0.5">
                                {thumbnails.map((img, idx) => (
                                    <div
                                        key={idx}
                                        className="relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            setCurrentImageIndex(idx + 1)
                                        }}
                                    >
                                        <img
                                            src={img || "/placeholder.svg"}
                                            alt={`${property.name} - ${idx + 2}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Watermark on thumbnails */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-white/10 text-xs font-bold">BP</span>
                                        </div>
                                    </div>
                                ))}
                                {/* Empty slots if less than 4 thumbnails */}
                                {thumbnails.length < 4 && Array.from({ length: 4 - thumbnails.length }, (_, i) => (
                                    <div key={`empty-${i}`} className="bg-gray-100" />
                                ))}
                            </div>
                        )}
                    </div>
                </Link>

                {/* Image Gallery Navigation - Only show on main image area */}
                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-[156px] top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-10"
                            style={{ right: thumbnails.length > 0 ? '156px' : '8px' }}
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    </>
                )}

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                        }}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    >
                        <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsFavorite(!isFavorite)
                        }}
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <Link href={`/property/${property.id}`} className="block">
                <div className="p-4">
                    {/* Category Tag */}
                    <div className="mb-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {property.type}
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-lg font-bold text-gray-900">{property.priceRange}</span>
                        {property.pricePerPeriod && (
                            <span className="text-sm text-gray-500">{property.pricePerPeriod}</span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px]">
                        {property.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-start gap-1 mb-3 text-gray-500">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="text-xs line-clamp-1">{property.location}</span>
                    </div>

                    {/* Property Specs */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-3 pb-3 border-b border-gray-100">
                        {property.bedrooms > 0 && (
                            <div className="flex items-center gap-1">
                                <Bed className="w-3.5 h-3.5" />
                                <span>{property.bedrooms}</span>
                            </div>
                        )}
                        {property.bathrooms && property.bathrooms > 0 && (
                            <div className="flex items-center gap-1">
                                <Bath className="w-3.5 h-3.5" />
                                <span>{property.bathrooms}</span>
                            </div>
                        )}
                        {property.landSize && (
                            <div className="flex items-center gap-1">
                                <span>LT {property.landSize}</span>
                            </div>
                        )}
                        {property.buildingSize && (
                            <div className="flex items-center gap-1">
                                <span>LB {property.buildingSize}</span>
                            </div>
                        )}
                        {property.isFurnished && (
                            <div className="flex items-center gap-1">
                                <span>• Furnished</span>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                            Diperbarui {property.lastUpdated}
                        </span>
                        <Button
                            size="sm"
                            className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full px-4 h-8 text-xs font-medium"
                        >
                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                            Chat
                        </Button>
                    </div>
                </div>
            </Link>
        </div>
    )
}

// Main Component
export default function PropertyListing({
    type,
    properties = [],
    categories = [],
    developers = [],
    pagination = { total: 0, perPage: 20, currentPage: 1, lastPage: 1 },
    filters = {},
    filterOptions = { developers: [], certificateTypes: [], cities: [] },
}: PropertyListingProps) {
    const [searchQuery, setSearchQuery] = useState((filters.search as string) || "")
    const [activeCategory, setActiveCategory] = useState<string | null>((filters.category as string) || null)
    const [priceRange, setPriceRange] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("terbaru")
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [activeFiltersCount, setActiveFiltersCount] = useState(0)

    const isBeli = type === "beli"
    const pageTitle = isBeli ? "Beli Properti" : "Sewa Properti"
    const pageSubtitle = isBeli ? "Jual Properti di Seluruh Indonesia" : "Sewa Properti di Seluruh Indonesia"

    // Calculate active filters count
    useEffect(() => {
        let count = 0
        if (filters.priceMin || filters.priceMax) count++
        if (filters.marketType && (filters.marketType as string[]).length > 0) count++
        if (filters.propertyTypes && (filters.propertyTypes as string[]).length > 0) count++
        if (filters.developerId) count++
        if (filters.bedrooms && filters.bedrooms !== 'semua') count++
        if (filters.bathrooms && filters.bathrooms !== 'semua') count++
        if (filters.landSizeMin || filters.landSizeMax) count++
        if (filters.buildingSizeMin || filters.buildingSizeMax) count++
        if (filters.certificates && (filters.certificates as string[]).length > 0) count++
        if (filters.carport && filters.carport !== 'semua') count++
        if (filters.listrik && (filters.listrik as string[]).length > 0) count++
        if (filters.isVerified) count++
        if (filters.hasPromo) count++
        if (filters.tanpaPerantara) count++
        setActiveFiltersCount(count)
    }, [filters])

    // Handle filter application
    const handleApplyFilters = useCallback((newFilters: FilterState) => {
        // Build query params from filters
        const params: Record<string, unknown> = {
            search: searchQuery || undefined,
            category: activeCategory || undefined,
            sort: sortBy,
        }

        // Add all filter values
        if (newFilters.marketType.length > 0) params.market_type = newFilters.marketType
        if (newFilters.priceMin) params.price_min = newFilters.priceMin
        if (newFilters.priceMax) params.price_max = newFilters.priceMax
        if (newFilters.propertyTypes.length > 0) params.property_types = newFilters.propertyTypes
        if (newFilters.developerId) params.developer_id = newFilters.developerId
        if (newFilters.bedrooms !== 'semua') params.bedrooms = newFilters.bedrooms
        if (newFilters.bathrooms !== 'semua') params.bathrooms = newFilters.bathrooms
        if (newFilters.landSizeMin) params.land_size_min = newFilters.landSizeMin
        if (newFilters.landSizeMax) params.land_size_max = newFilters.landSizeMax
        if (newFilters.buildingSizeMin) params.building_size_min = newFilters.buildingSizeMin
        if (newFilters.buildingSizeMax) params.building_size_max = newFilters.buildingSizeMax
        if (newFilters.certificates.length > 0) params.certificates = newFilters.certificates
        if (newFilters.carport !== 'semua') params.carport = newFilters.carport
        if (newFilters.listrik.length > 0) params.listrik = newFilters.listrik

        // Navigate based on listing type from filter
        const targetUrl = newFilters.listingType === 'beli' ? '/beli' : '/sewa'
        router.get(targetUrl, params as Record<string, string | string[] | boolean | number | undefined>, {
            preserveState: true,
            preserveScroll: true,
        })
    }, [searchQuery, activeCategory, sortBy])

    // Handle search
    const handleSearch = useCallback(() => {
        const params: Record<string, unknown> = {
            ...filters,
            search: searchQuery || undefined,
            sort: sortBy,
        }
        router.get(`/${type}`, params as Record<string, string | string[] | boolean | number | undefined>, {
            preserveState: true,
            preserveScroll: true,
        })
    }, [searchQuery, sortBy, filters, type])

    // Handle smart search from suggestions
    const handleSmartSearch = useCallback((query: string, searchType?: "city" | "developer" | "property" | "location", id?: string | number) => {
        setSearchQuery(query)

        // Reset unrelated filters but keep active listing type
        const params: Record<string, unknown> = {
            search: (!searchType || searchType === 'property') ? query : undefined,
            city: (searchType === 'city' || searchType === 'location') ? query : undefined,
            developer_id: searchType === 'developer' ? id : undefined,
            // Keep sort
            sort: sortBy,
        }

        router.get(`/${type}`, params as any, {
            preserveState: true,
            preserveScroll: true,
        })
    }, [type, sortBy])

    // Handle sort change
    const handleSortChange = useCallback((newSort: string) => {
        setSortBy(newSort)
        const params: Record<string, unknown> = {
            ...filters,
            search: searchQuery || undefined,
            sort: newSort,
        }
        router.get(`/${type}`, params as Record<string, string | string[] | boolean | number | undefined>, {
            preserveState: true,
            preserveScroll: true,
        })
    }, [filters, searchQuery, type])

    // Handle category change
    const handleCategoryChange = useCallback((categorySlug: string | null) => {
        setActiveCategory(categorySlug)
        const params: Record<string, unknown> = {
            ...filters,
            category: categorySlug || undefined,
            search: searchQuery || undefined,
            sort: sortBy,
        }
        router.get(`/${type}`, params as Record<string, string | string[] | boolean | number | undefined>, {
            preserveState: true,
            preserveScroll: true,
        })
    }, [filters, searchQuery, sortBy, type])

    // Price range options based on type (for quick filter buttons)
    const priceOptions = isBeli
        ? [
            { value: "all", label: "Semua Harga" },
            { value: "0-500000000", label: "< 500 Jt" },
            { value: "500000000-1000000000", label: "500 Jt - 1 M" },
            { value: "1000000000-2000000000", label: "1 M - 2 M" },
            { value: "2000000000+", label: "> 2 M" },
        ]
        : [
            { value: "all", label: "Semua Harga Sewa" },
            { value: "0-5000000", label: "< 5 Jt/Bulan" },
            { value: "5000000-10000000", label: "5 - 10 Jt/Bulan" },
            { value: "10000000-25000000", label: "10 - 25 Jt/Bulan" },
            { value: "25000000+", label: "> 25 Jt/Bulan" },
        ]

    const minimumSewaOptions = [
        { value: "all", label: "Minimum Sewa" },
        { value: "bulanan", label: "Bulanan" },
        { value: "tahunan", label: "Tahunan" },
    ]

    return (
        <>
            <Head title={pageTitle}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gray-50">
                {/* Navbar */}
                <Navbar />

                {/* Search Header */}
                <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            {/* Smart Search Bar */}
                            <div className="relative flex-1 w-full md:w-auto">
                                <SearchWithSuggestions
                                    onSearch={handleSmartSearch}
                                    initialQuery={searchQuery}
                                    placeholder="Cari lokasi, nama properti, atau nama proyek..."
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {/* Filter Button */}
                                <Button
                                    onClick={() => setIsFilterOpen(true)}
                                    variant="outline"
                                    className="flex-1 md:flex-none gap-2 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    <span>Filter</span>
                                    {activeFiltersCount > 0 && (
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-900 hover:bg-gray-200">
                                            {activeFiltersCount}
                                        </Badge>
                                    )}
                                </Button>

                                {/* Sort Button (Dropdown) */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex-1 md:flex-none gap-2 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                                        >
                                            <ArrowUpDown className="w-4 h-4" />
                                            <span>Urutkan</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[200px]">
                                        <DropdownMenuItem onClick={() => handleSortChange("terbaru")} className="justify-between">
                                            Terbaru
                                            {sortBy === "terbaru" && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSortChange("termurah")} className="justify-between">
                                            Harga Terendah
                                            {sortBy === "termurah" && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSortChange("termahal")} className="justify-between">
                                            Harga Tertinggi
                                            {sortBy === "termahal" && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSortChange("populer")} className="justify-between">
                                            Paling Populer
                                            {sortBy === "populer" && <CheckCircle className="w-4 h-4 text-blue-600" />}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
                            {/* Beli/Sewa Toggle */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1 flex-shrink-0">
                                <Link href="/beli">
                                    <button
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${isBeli
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        Beli
                                    </button>
                                </Link>
                                <Link href="/sewa">
                                    <button
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${!isBeli
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        Sewa
                                    </button>
                                </Link>
                            </div>

                            {/* Separator */}
                            <div className="h-6 w-px bg-gray-300 flex-shrink-0" />

                            {/* Category Pills */}
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryChange(activeCategory === category.slug ? null : category.slug)}
                                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all flex-shrink-0 ${activeCategory === category.slug
                                        ? "bg-[#ECEC5C] border-[#c4a747] text-gray-900"
                                        : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                                        }`}
                                >
                                    {categoryIconMap[category.icon] || <Home className="w-4 h-4" />}
                                    <span>{category.name}</span>
                                </button>
                            ))}

                            {/* Separator */}
                            <div className="h-6 w-px bg-gray-300 flex-shrink-0" />

                            {/* Price Filter */}
                            {/* Price Filter */}
                            <Select
                                value={priceRange}
                                onValueChange={(value) => {
                                    setPriceRange(value)
                                    // Parse value filtering logic
                                    let min = ""
                                    let max = ""
                                    if (value !== "all") {
                                        if (value.includes("+")) {
                                            min = value.replace("+", "")
                                        } else {
                                            const parts = value.split("-")
                                            min = parts[0]
                                            max = parts[1]
                                        }
                                    }

                                    // Apply existing filters + new price
                                    handleApplyFilters({
                                        listingType: type,
                                        marketType: (filters.marketType as string[]) || [],
                                        priceMin: min,
                                        priceMax: max,
                                        propertyTypes: (filters.propertyTypes as string[]) || [],
                                        developerId: (filters.developerId as number) || null,
                                        developerName: "",
                                        bedrooms: (filters.bedrooms as string) || "semua",
                                        bathrooms: (filters.bathrooms as string) || "semua",
                                        landSizeMin: (filters.landSizeMin as string) || "",
                                        landSizeMax: (filters.landSizeMax as string) || "",
                                        buildingSizeMin: (filters.buildingSizeMin as string) || "",
                                        buildingSizeMax: (filters.buildingSizeMax as string) || "",
                                        certificates: (filters.certificates as string[]) || [],
                                        carport: (filters.carport as string) || "semua",
                                        listrik: (filters.listrik as string[]) || [],
                                    })
                                }}
                            >
                                <SelectTrigger className="w-auto min-w-[140px] border-gray-300 rounded-full h-9 flex-shrink-0">
                                    <SelectValue placeholder={isBeli ? "Harga" : "Harga Sewa"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {priceOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Minimum Sewa (only for sewa) */}
                            {/* Minimum Sewa (only for sewa) - Placeholder logic as backend support might be needed */}
                            {!isBeli && (
                                <Select>
                                    <SelectTrigger className="w-auto min-w-[140px] border-gray-300 rounded-full h-9 flex-shrink-0">
                                        <SelectValue placeholder="Minimum Sewa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {minimumSewaOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}


                        </div>
                    </div>
                </div >

                {/* Main Content */}
                < div className="max-w-7xl mx-auto px-4 py-6" >
                    {/* Page Title & Count */}
                    < div className="mb-4" >
                        <h1 className="text-xl font-bold text-gray-900">{pageSubtitle}</h1>
                        <p className="text-sm text-gray-500">
                            Menampilkan {((pagination.currentPage - 1) * pagination.perPage) + 1} -{" "}
                            {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} dari{" "}
                            {pagination.total.toLocaleString("id-ID")} properti
                        </p>
                    </div >

                    {/* Info Banner */}
                    < div className="bg-[#2563EB] text-white rounded-xl p-4 mb-6 flex items-center gap-3" >
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Info className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm">
                                Transaksi {isBeli ? "jual beli" : "sewa"} kini bisa di BigProperty! Lebih aman, untung, dan ringan.{" "}
                                <a href="#" className="underline font-semibold hover:text-white/90">
                                    Lihat Keuntungannya →
                                </a>
                            </p>
                        </div>
                        <button className="text-white/80 hover:text-white flex-shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                    </div >

                    {/* Property Grid - 2 Columns */}
                    {
                        properties.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {properties.map((property) => (
                                    <PropertyListingCard key={property.id} property={property} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Home className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Tidak ada properti ditemukan
                                </h3>
                                <p className="text-gray-500 text-center max-w-md">
                                    Coba ubah filter pencarian atau gunakan kata kunci lain untuk menemukan properti yang Anda cari.
                                </p>
                            </div>
                        )
                    }

                    {/* Pagination */}
                    {
                        pagination.lastPage > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.currentPage === 1}
                                    className="border-gray-300"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                {Array.from({ length: Math.min(5, pagination.lastPage) }, (_, i) => {
                                    const pageNum = i + 1
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pagination.currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            className={
                                                pagination.currentPage === pageNum
                                                    ? "bg-[#ECEC5C] text-gray-900 hover:bg-[#d4d44a]"
                                                    : "border-gray-300"
                                            }
                                        >
                                            {pageNum}
                                        </Button>
                                    )
                                })}

                                {pagination.lastPage > 5 && (
                                    <>
                                        <span className="text-gray-400">...</span>
                                        <Button variant="outline" size="sm" className="border-gray-300">
                                            {pagination.lastPage}
                                        </Button>
                                    </>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.currentPage === pagination.lastPage}
                                    className="border-gray-300"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )
                    }
                </div >

                {/* Footer Spacer */}
                < div className="h-10" />
            </div >

            {/* Filter Modal */}
            < PropertyFilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)
                }
                onApply={handleApplyFilters}
                developers={developers}
                totalCount={pagination.total}
                listingType={type}
                initialFilters={{
                    listingType: type,
                    marketType: (filters.marketType as string[]) || [],
                    priceMin: (filters.priceMin as string) || "",
                    priceMax: (filters.priceMax as string) || "",
                    propertyTypes: (filters.propertyTypes as string[]) || [],
                    developerId: (filters.developerId as number) || null,
                    developerName: "",
                    bedrooms: (filters.bedrooms as string) || "semua",
                    bathrooms: (filters.bathrooms as string) || "semua",
                    landSizeMin: (filters.landSizeMin as string) || "",
                    landSizeMax: (filters.landSizeMax as string) || "",
                    buildingSizeMin: (filters.buildingSizeMin as string) || "",
                    buildingSizeMax: (filters.buildingSizeMax as string) || "",
                    certificates: (filters.certificates as string[]) || [],
                    carport: (filters.carport as string) || "semua",
                    listrik: (filters.listrik as string[]) || [],
                }}
            />
        </>
    )
}
