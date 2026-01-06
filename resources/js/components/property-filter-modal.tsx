"use client"

import { useState, useEffect } from "react"
import { X, Home, Building2, Store, Factory, Bed, MapPin, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// Types
interface Developer {
    id: number
    name: string
    logo?: string
}

interface FilterState {
    listingType: "beli" | "sewa"
    marketType: string[]
    priceMin: string
    priceMax: string
    propertyTypes: string[]
    developerId: number | null
    developerName: string
    bedrooms: string
    bathrooms: string
    landSizeMin: string
    landSizeMax: string
    buildingSizeMin: string
    buildingSizeMax: string
    certificates: string[]
    carport: string
    listrik: string[]
}

interface PropertyFilterModalProps {
    isOpen: boolean
    onClose: () => void
    onApply: (filters: FilterState) => void
    initialFilters?: Partial<FilterState>
    developers: Developer[]
    totalCount: number
    listingType: "beli" | "sewa"
}

const defaultFilters: FilterState = {
    listingType: "beli",
    marketType: [],
    priceMin: "",
    priceMax: "",
    propertyTypes: [],
    developerId: null,
    developerName: "",
    bedrooms: "semua",
    bathrooms: "semua",
    landSizeMin: "",
    landSizeMax: "",
    buildingSizeMin: "",
    buildingSizeMax: "",
    certificates: [],
    carport: "semua",
    listrik: [],
}

// Pill Button Component
function PillButton({
    selected,
    onClick,
    children,
    className = "",
}: {
    selected: boolean
    onClick: () => void
    children: React.ReactNode
    className?: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${selected
                    ? "bg-[#2563EB] border-[#2563EB] text-white"
                    : "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
                } ${className}`}
        >
            {children}
        </button>
    )
}

// Property Type Card
function PropertyTypeCard({
    icon,
    label,
    selected,
    onClick,
}: {
    icon: React.ReactNode
    label: string
    selected: boolean
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${selected
                    ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    )
}

// Filter Section Component
function FilterSection({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
            {children}
        </div>
    )
}

export function PropertyFilterModal({
    isOpen,
    onClose,
    onApply,
    initialFilters,
    developers = [],
    totalCount = 0,
    listingType: initialListingType,
}: PropertyFilterModalProps) {
    const [filters, setFilters] = useState<FilterState>({
        ...defaultFilters,
        listingType: initialListingType,
        ...initialFilters,
    })
    const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false)
    const [developerSearch, setDeveloperSearch] = useState("")

    useEffect(() => {
        if (isOpen) {
            setFilters({
                ...defaultFilters,
                listingType: initialListingType,
                ...initialFilters,
            })
        }
    }, [isOpen, initialFilters, initialListingType])

    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const toggleArrayFilter = (key: keyof FilterState, value: string) => {
        const currentArray = filters[key] as string[]
        if (currentArray.includes(value)) {
            updateFilter(key, currentArray.filter((v) => v !== value) as FilterState[typeof key])
        } else {
            updateFilter(key, [...currentArray, value] as FilterState[typeof key])
        }
    }

    const handleReset = () => {
        setFilters({
            ...defaultFilters,
            listingType: initialListingType,
        })
    }

    const handleApply = () => {
        onApply(filters)
        onClose()
    }

    const filteredDevelopers = developers.filter((dev) =>
        dev.name.toLowerCase().includes(developerSearch.toLowerCase())
    )

    // Property type options
    const propertyTypeOptions = [
        { value: "rumah", label: "Rumah", icon: <Home className="w-5 h-5" /> },
        { value: "apartemen", label: "Apartemen", icon: <Building2 className="w-5 h-5" /> },
        { value: "ruko", label: "Ruko", icon: <Store className="w-5 h-5" /> },
        { value: "tanah", label: "Tanah", icon: <MapPin className="w-5 h-5" /> },
        { value: "kantor", label: "Kantor", icon: <Factory className="w-5 h-5" /> },
        { value: "kost", label: "Kost", icon: <Bed className="w-5 h-5" /> },
    ]

    // Price quick select options
    const priceQuickSelect = filters.listingType === "beli"
        ? [
            { label: "<Rp1 M", min: 0, max: 1000000000 },
            { label: "Rp1 M - Rp2 M", min: 1000000000, max: 2000000000 },
            { label: "Rp2 M - Rp3 M", min: 2000000000, max: 3000000000 },
            { label: "Rp3 M - Rp4 M", min: 3000000000, max: 4000000000 },
            { label: ">Rp4 M", min: 4000000000, max: null },
        ]
        : [
            { label: "<Rp5 Jt", min: 0, max: 5000000 },
            { label: "Rp5 Jt - Rp10 Jt", min: 5000000, max: 10000000 },
            { label: "Rp10 Jt - Rp25 Jt", min: 10000000, max: 25000000 },
            { label: "Rp25 Jt - Rp50 Jt", min: 25000000, max: 50000000 },
            { label: ">Rp50 Jt", min: 50000000, max: null },
        ]

    const roomOptions = ["semua", "1+", "2+", "3+", "4+", "5+"]
    const certificateOptions = ["SHM", "HGB", "Strata", "Girik", "Lainnya"]
    const listrikOptions = ["250", "450", "900", "1300", "2200", "3500"]

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full">
                    {/* Header - Fixed */}
                    <SheetHeader className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <SheetTitle className="text-lg font-semibold">Filter</SheetTitle>
                                <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                                    <button
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filters.listingType === "beli"
                                                ? "bg-[#2563EB] text-white shadow-sm"
                                                : "text-gray-600 hover:text-gray-900"
                                            }`}
                                        onClick={() => updateFilter("listingType", "beli")}
                                    >
                                        Beli
                                    </button>
                                    <button
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${filters.listingType === "sewa"
                                                ? "bg-[#2563EB] text-white shadow-sm"
                                                : "text-gray-600 hover:text-gray-900"
                                            }`}
                                        onClick={() => updateFilter("listingType", "sewa")}
                                    >
                                        Sewa
                                    </button>
                                </div>
                            </div>
                            <SheetClose asChild>
                                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </SheetClose>
                        </div>
                    </SheetHeader>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-4">
                        {/* 1. Tipe Pasar */}
                        <FilterSection title="Tipe Pasar">
                            <div className="flex flex-wrap gap-2">
                                {["baru", "second", "lelang"].map((type) => (
                                    <PillButton
                                        key={type}
                                        selected={filters.marketType.includes(type)}
                                        onClick={() => toggleArrayFilter("marketType", type)}
                                    >
                                        {type === "baru" && "✨ "}
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </PillButton>
                                ))}
                            </div>
                        </FilterSection>

                        {/* 2. Harga */}
                        <FilterSection title="Harga">
                            <div className="flex gap-3 mb-3">
                                <div className="flex-1">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rp</span>
                                        <Input
                                            type="text"
                                            placeholder="Minimum"
                                            value={filters.priceMin}
                                            onChange={(e) => updateFilter("priceMin", e.target.value.replace(/\D/g, ""))}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rp</span>
                                        <Input
                                            type="text"
                                            placeholder="Maksimum"
                                            value={filters.priceMax}
                                            onChange={(e) => updateFilter("priceMax", e.target.value.replace(/\D/g, ""))}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {priceQuickSelect.map((option, idx) => (
                                    <PillButton
                                        key={idx}
                                        selected={
                                            filters.priceMin === String(option.min) &&
                                            (option.max === null
                                                ? filters.priceMax === ""
                                                : filters.priceMax === String(option.max))
                                        }
                                        onClick={() => {
                                            updateFilter("priceMin", String(option.min))
                                            updateFilter("priceMax", option.max === null ? "" : String(option.max))
                                        }}
                                        className="text-xs"
                                    >
                                        {option.label}
                                    </PillButton>
                                ))}
                            </div>
                        </FilterSection>

                        {/* 3. Tipe Properti */}
                        <FilterSection title="Tipe Properti">
                            <div className="grid grid-cols-3 gap-2">
                                {propertyTypeOptions.map((option) => (
                                    <PropertyTypeCard
                                        key={option.value}
                                        icon={option.icon}
                                        label={option.label}
                                        selected={filters.propertyTypes.includes(option.value)}
                                        onClick={() => toggleArrayFilter("propertyTypes", option.value)}
                                    />
                                ))}
                            </div>
                        </FilterSection>

                        {/* 4. Nama Developer */}
                        <FilterSection title="Nama Developer">
                            <button
                                onClick={() => setIsDeveloperModalOpen(true)}
                                className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Home className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-700">
                                        {filters.developerName || "Pilih Developer"}
                                    </span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        </FilterSection>

                        {/* 5. Kamar Tidur */}
                        <FilterSection title="Kamar Tidur">
                            <div className="flex flex-wrap gap-2">
                                {roomOptions.map((option) => (
                                    <PillButton
                                        key={option}
                                        selected={filters.bedrooms === option}
                                        onClick={() => updateFilter("bedrooms", option)}
                                    >
                                        {option === "semua" ? "Semua" : option}
                                    </PillButton>
                                ))}
                            </div>
                        </FilterSection>

                        {/* 6. Kamar Mandi */}
                        <FilterSection title="Kamar Mandi">
                            <div className="flex flex-wrap gap-2">
                                {roomOptions.map((option) => (
                                    <PillButton
                                        key={option}
                                        selected={filters.bathrooms === option}
                                        onClick={() => updateFilter("bathrooms", option)}
                                    >
                                        {option === "semua" ? "Semua" : option}
                                    </PillButton>
                                ))}
                            </div>
                        </FilterSection>

                        {/* 7. Luas Tanah */}
                        <FilterSection title="Luas Tanah">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Minimum"
                                            value={filters.landSizeMin}
                                            onChange={(e) => updateFilter("landSizeMin", e.target.value.replace(/\D/g, ""))}
                                            className="pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Maksimum"
                                            value={filters.landSizeMax}
                                            onChange={(e) => updateFilter("landSizeMax", e.target.value.replace(/\D/g, ""))}
                                            className="pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                                    </div>
                                </div>
                            </div>
                        </FilterSection>

                        {/* 8. Luas Bangunan */}
                        <FilterSection title="Luas Bangunan">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Minimum"
                                            value={filters.buildingSizeMin}
                                            onChange={(e) => updateFilter("buildingSizeMin", e.target.value.replace(/\D/g, ""))}
                                            className="pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="Maksimum"
                                            value={filters.buildingSizeMax}
                                            onChange={(e) => updateFilter("buildingSizeMax", e.target.value.replace(/\D/g, ""))}
                                            className="pr-10"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">m²</span>
                                    </div>
                                </div>
                            </div>
                        </FilterSection>

                        {/* 9. Sertifikat */}
                        <FilterSection title="Sertifikat">
                            <div className="flex flex-wrap gap-2">
                                {certificateOptions.map((option) => (
                                    <PillButton
                                        key={option}
                                        selected={filters.certificates.includes(option)}
                                        onClick={() => toggleArrayFilter("certificates", option)}
                                    >
                                        {option}
                                    </PillButton>
                                ))}
                            </div>
                        </FilterSection>

                        {/* 10. Kapasitas Carport */}
                        <FilterSection title="Kapasitas Carport">
                            <div className="flex flex-wrap gap-2">
                                {["semua", "1+", "2+", "3+", "4+"].map((option) => (
                                    <PillButton
                                        key={option}
                                        selected={filters.carport === option}
                                        onClick={() => updateFilter("carport", option)}
                                    >
                                        {option === "semua" ? "Semua" : option}
                                    </PillButton>
                                ))}
                            </div>
                        </FilterSection>

                        {/* 11. Listrik */}
                        <FilterSection title="Listrik">
                            <div className="flex flex-wrap gap-2">
                                {listrikOptions.map((option) => (
                                    <PillButton
                                        key={option}
                                        selected={filters.listrik.includes(option)}
                                        onClick={() => toggleArrayFilter("listrik", option)}
                                    >
                                        {option} V
                                    </PillButton>
                                ))}
                            </div>
                        </FilterSection>

                        {/* Bottom padding for scroll */}
                        <div className="h-6" />
                    </div>

                    {/* Footer - Fixed */}
                    <SheetFooter className="px-4 py-3 border-t border-gray-200 flex-shrink-0 bg-white">
                        <div className="flex items-center justify-between w-full gap-3">
                            <button
                                onClick={handleReset}
                                className="text-[#2563EB] text-sm font-medium hover:underline"
                            >
                                Reset
                            </button>
                            <Button
                                onClick={handleApply}
                                className="flex-1 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg"
                            >
                                {totalCount.toLocaleString("id-ID")} Properti
                            </Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Developer Selection Modal */}
            <Dialog open={isDeveloperModalOpen} onOpenChange={setIsDeveloperModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Pilih Developer</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            type="text"
                            placeholder="Cari nama developer..."
                            value={developerSearch}
                            onChange={(e) => setDeveloperSearch(e.target.value)}
                            className="mb-4"
                        />
                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                            <button
                                onClick={() => {
                                    updateFilter("developerId", null)
                                    updateFilter("developerName", "")
                                    setIsDeveloperModalOpen(false)
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${filters.developerId === null
                                        ? "bg-blue-50 text-[#2563EB]"
                                        : "hover:bg-gray-50"
                                    }`}
                            >
                                Semua Developer
                            </button>
                            {filteredDevelopers.map((dev) => (
                                <button
                                    key={dev.id}
                                    onClick={() => {
                                        updateFilter("developerId", dev.id)
                                        updateFilter("developerName", dev.name)
                                        setIsDeveloperModalOpen(false)
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${filters.developerId === dev.id
                                            ? "bg-blue-50 text-[#2563EB]"
                                            : "hover:bg-gray-50"
                                        }`}
                                >
                                    {dev.logo && (
                                        <img
                                            src={dev.logo}
                                            alt={dev.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    )}
                                    <span>{dev.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

// Export filter types
export type { FilterState, Developer }
