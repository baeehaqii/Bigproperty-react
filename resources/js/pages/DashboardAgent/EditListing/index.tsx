"use client"

import { useState, useEffect } from "react"
import { router, Link } from "@inertiajs/react"
import {
    Info,
    DollarSign,
    Home,
    Star,
    Building2,
    MapPin,
    Megaphone,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    AlertCircle,
    CheckCircle,
    Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardAgentLayout } from "../components/DashboardAgentLayout"

// Types
interface Agent {
    id: number
    name: string
    email: string
    phone: string
    photo?: string
}

interface Developer {
    id: number
    name: string
}

interface PropertyCategory {
    id: number
    name: string
    slug: string
}

interface Property {
    id: number
    name: string
    provinsi: string
    city: string
    location: string
    url_maps: string | null
    units_remaining: number | null
    developer_id: number | null
    kategori: string[] | null
    price_min: number
    price_max: number | null
    installment_start: number
    bedrooms: number
    bathrooms: number | null
    carport: number | null
    listrik: number | null
    certificate_type: string | null
    land_size_min: number
    land_size_max: number | null
    building_size_min: number | null
    building_size_max: number | null
    keunggulan: any[] | null
    fasilitas: any[] | null
    nearest_place: any[] | null
    promo_text: string | null
    is_available: boolean
    main_image: string | null
    images: string[] | null
}

interface EditListingProps {
    agent: Agent
    property: Property
    developers?: Developer[]
    categories?: PropertyCategory[]
}

// Collapsible Section Component
function CollapsibleSection({
    title,
    subtitle,
    icon: Icon,
    children,
    defaultOpen = false
}: {
    title: string
    subtitle: string
    icon: React.ElementType
    children: React.ReactNode
    defaultOpen?: boolean
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="bg-white rounded-[20px] border border-[#DCDEDD] overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div className="text-left">
                        <h3 className="text-[#0C1C3C] font-bold">{title}</h3>
                        <p className="text-gray-500 text-sm">{subtitle}</p>
                    </div>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>
            {isOpen && (
                <div className="px-6 pb-6 border-t border-gray-100">
                    {children}
                </div>
            )}
        </div>
    )
}

// Certificate options
const certificateOptions = [
    { value: 'SHM', label: 'SHM (Sertifikat Hak Milik)' },
    { value: 'SHGB', label: 'SHGB (Sertifikat Hak Guna Bangunan)' },
    { value: 'HGB', label: 'HGB (Hak Guna Bangunan)' },
    { value: 'Girik', label: 'Girik' },
    { value: 'AJB', label: 'AJB (Akta Jual Beli)' },
    { value: 'PPJB', label: 'PPJB (Perjanjian Pengikatan Jual Beli)' },
    { value: 'Strata Title', label: 'Strata Title' },
]

export default function EditListing({ agent, property, developers = [], categories = [] }: EditListingProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Form state initialized with property data
    const [formData, setFormData] = useState({
        name: property.name || '',
        provinsi: property.provinsi || '',
        city: property.city || '',
        location: property.location || '',
        url_maps: property.url_maps || '',
        units_remaining: property.units_remaining?.toString() || '',
        developer_id: property.developer_id?.toString() || '',
        kategori: property.kategori || [],

        price_min: property.price_min?.toString() || '',
        price_max: property.price_max?.toString() || '',
        installment_start: property.installment_start?.toString() || '',

        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        carport: property.carport?.toString() || '',
        listrik: property.listrik?.toString() || '',
        certificate_type: property.certificate_type || '',
        land_size_min: property.land_size_min?.toString() || '',
        land_size_max: property.land_size_max?.toString() || '',
        building_size_min: property.building_size_min?.toString() || '',
        building_size_max: property.building_size_max?.toString() || '',

        promo_text: property.promo_text || '',
        is_available: property.is_available ?? true,
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleCategoryChange = (categoryId: string) => {
        setFormData(prev => {
            const isSelected = prev.kategori.includes(categoryId)
            return {
                ...prev,
                kategori: isSelected
                    ? prev.kategori.filter(id => id !== categoryId)
                    : [...prev.kategori, categoryId]
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitStatus('idle')

        try {
            const submitData = {
                ...formData,
                kategori: JSON.stringify(formData.kategori),
                keunggulan: JSON.stringify(property.keunggulan || []),
                fasilitas: JSON.stringify(property.fasilitas || []),
                nearest_place: JSON.stringify(property.nearest_place || []),
            }

            router.put(`/agent/dashboard/edit-listing/${property.id}`, submitData, {
                onSuccess: () => {
                    setSubmitStatus('success')
                    setIsSubmitting(false)
                },
                onError: (validationErrors) => {
                    console.error('Form submission errors:', validationErrors)
                    setErrors(validationErrors)
                    setSubmitStatus('error')
                    setIsSubmitting(false)
                },
                onFinish: () => {
                    setIsSubmitting(false)
                }
            })
        } catch (error) {
            console.error('Form submission error:', error)
            setSubmitStatus('error')
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardAgentLayout agent={agent} title="Edit Listing" activeMenu="listing-saya">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/agent/dashboard/listing-saya">
                        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-[#0C1C3C] text-2xl md:text-3xl font-bold mb-1">
                            Edit Listing
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base">
                            "{property.name}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Success/Error Alert */}
            {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-[16px] flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">Properti berhasil diperbarui!</p>
                </div>
            )}

            {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[16px] flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                        <p className="text-red-800 font-medium">Terjadi kesalahan saat menyimpan.</p>
                        {Object.keys(errors).length > 0 && (
                            <ul className="text-red-700 text-sm mt-1">
                                {Object.entries(errors).map(([key, value]) => (
                                    <li key={key}>• {value}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Warning about re-verification */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-[16px] flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800 text-sm">
                    <strong>Perhatian:</strong> Setelah mengedit listing, properti akan memerlukan verifikasi ulang dari admin.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <CollapsibleSection
                    title="Informasi Dasar"
                    subtitle="Nama, lokasi, dan kategori properti"
                    icon={Info}
                    defaultOpen={true}
                >
                    <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Nama Properti <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Grand City Surabaya"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Alamat Lengkap <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Jl. Merdeka No. 123, Surabaya"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Kota <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Surabaya"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Provinsi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="provinsi"
                                    value={formData.provinsi}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Jawa Timur"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[#0C1C3C] text-sm font-medium">
                                Link Google Maps
                            </label>
                            <input
                                type="url"
                                name="url_maps"
                                value={formData.url_maps}
                                onChange={handleInputChange}
                                placeholder="https://maps.google.com/..."
                                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                            />
                        </div>

                        {/* Category Selection */}
                        {categories.length > 0 && (
                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">Kategori</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map(category => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => handleCategoryChange(category.id.toString())}
                                            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${formData.kategori.includes(category.id.toString())
                                                    ? 'bg-[#D6D667] text-[#0C1C3C]'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Price & Financing */}
                <CollapsibleSection
                    title="Harga & Pembayaran"
                    subtitle="Rentang harga dan informasi cicilan"
                    icon={DollarSign}
                    defaultOpen={true}
                >
                    <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Harga Minimum (Rp) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price_min"
                                    value={formData.price_min}
                                    onChange={handleInputChange}
                                    placeholder="750000000"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Harga Maksimum (Rp)
                                </label>
                                <input
                                    type="number"
                                    name="price_max"
                                    value={formData.price_max}
                                    onChange={handleInputChange}
                                    placeholder="1500000000"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Cicilan Mulai (Rp/bulan) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="installment_start"
                                    value={formData.installment_start}
                                    onChange={handleInputChange}
                                    placeholder="5000000"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Property Specifications */}
                <CollapsibleSection
                    title="Spesifikasi Properti"
                    subtitle="Detail ukuran dan fasilitas properti"
                    icon={Home}
                    defaultOpen={true}
                >
                    <div className="pt-4 space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Kamar Tidur <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleInputChange}
                                    placeholder="3"
                                    min="0"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Kamar Mandi
                                </label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleInputChange}
                                    placeholder="2"
                                    min="0"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Carport
                                </label>
                                <input
                                    type="number"
                                    name="carport"
                                    value={formData.carport}
                                    onChange={handleInputChange}
                                    placeholder="1"
                                    min="0"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Listrik (Watt)
                                </label>
                                <input
                                    type="number"
                                    name="listrik"
                                    value={formData.listrik}
                                    onChange={handleInputChange}
                                    placeholder="2200"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Luas Tanah Min (m²) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="land_size_min"
                                    value={formData.land_size_min}
                                    onChange={handleInputChange}
                                    placeholder="60"
                                    min="0"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Luas Tanah Max (m²)
                                </label>
                                <input
                                    type="number"
                                    name="land_size_max"
                                    value={formData.land_size_max}
                                    onChange={handleInputChange}
                                    placeholder="120"
                                    min="0"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Luas Bangunan Min (m²) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="building_size_min"
                                    value={formData.building_size_min}
                                    onChange={handleInputChange}
                                    placeholder="45"
                                    min="0"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Luas Bangunan Max (m²)
                                </label>
                                <input
                                    type="number"
                                    name="building_size_max"
                                    value={formData.building_size_max}
                                    onChange={handleInputChange}
                                    placeholder="100"
                                    min="0"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Tipe Sertifikat
                                </label>
                                <select
                                    name="certificate_type"
                                    value={formData.certificate_type}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                                >
                                    <option value="">Pilih Tipe Sertifikat</option>
                                    {certificateOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Sisa Unit
                                </label>
                                <input
                                    type="number"
                                    name="units_remaining"
                                    value={formData.units_remaining}
                                    onChange={handleInputChange}
                                    placeholder="10"
                                    min="0"
                                    className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                                />
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Marketing & Promotion */}
                <CollapsibleSection
                    title="Marketing & Promosi"
                    subtitle="Teks promo dan informasi marketing"
                    icon={Megaphone}
                    defaultOpen={false}
                >
                    <div className="pt-4 space-y-4">
                        <div className="space-y-2">
                            <label className="block text-[#0C1C3C] text-sm font-medium">
                                Teks Promo
                            </label>
                            <textarea
                                name="promo_text"
                                value={formData.promo_text}
                                onChange={handleInputChange}
                                placeholder="Contoh: Diskon DP 0%, Free biaya KPR, dll"
                                rows={3}
                                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200 resize-none"
                            />
                            <p className="text-gray-500 text-xs">Text promo yang menarik akan ditampilkan di halaman listing</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[#0C1C3C] text-sm font-medium">Status Ketersediaan</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="is_available"
                                        checked={formData.is_available === true}
                                        onChange={() => setFormData(prev => ({ ...prev, is_available: true }))}
                                        className="w-4 h-4 text-[#D6D667] focus:ring-[#D6D667]"
                                    />
                                    <span className="text-[#0C1C3C]">Tersedia</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="is_available"
                                        checked={formData.is_available === false}
                                        onChange={() => setFormData(prev => ({ ...prev, is_available: false }))}
                                        className="w-4 h-4 text-[#D6D667] focus:ring-[#D6D667]"
                                    />
                                    <span className="text-[#0C1C3C]">Tidak Tersedia</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Current Images Preview */}
                {property.main_image || (property.images && property.images.length > 0) ? (
                    <div className="bg-[#F7F7F7] rounded-[20px] p-5">
                        <h3 className="text-[#0C1C3C] text-lg font-bold mb-4">Gambar Saat Ini</h3>
                        <p className="text-gray-500 text-sm mb-4">Untuk mengganti gambar, silakan upload ulang dari halaman Upload Listing.</p>
                        <div className="flex flex-wrap gap-3">
                            {property.main_image && (
                                <div className="relative">
                                    <img
                                        src={property.main_image}
                                        alt="Main Image"
                                        className="w-24 h-24 object-cover rounded-lg border-2 border-[#D6D667]"
                                    />
                                    <span className="absolute bottom-1 left-1 text-xs bg-[#D6D667] text-[#0C1C3C] px-1.5 py-0.5 rounded font-medium">
                                        Utama
                                    </span>
                                </div>
                            )}
                            {property.images?.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`Image ${idx + 1}`}
                                    className="w-24 h-24 object-cover rounded-lg"
                                />
                            ))}
                        </div>
                    </div>
                ) : null}

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4">
                    <Link href="/agent/dashboard/listing-saya">
                        <Button
                            type="button"
                            variant="outline"
                            className="px-6 py-3 rounded-[16px]"
                        >
                            Batal
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-[#D6D667] text-[#0C1C3C] hover:bg-[#c5c55f] rounded-[16px] font-medium disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Simpan Perubahan
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </DashboardAgentLayout>
    )
}
