"use client"

import { useState, useCallback, useEffect } from "react"
import { router, Link } from "@inertiajs/react"
import { Editor } from 'primereact/editor'
import {
    Info,
    DollarSign,
    Home,
    Star,
    Building2,
    MapPin,
    Megaphone,
    Image,
    Plus,
    Trash2,
    GripVertical,
    Upload as UploadIcon,
    X,
    AlertCircle,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Check,
    Save,
    ChevronLeft,
    Car,
    Wifi,
    Dumbbell,
    Trees,
    Shield,
    Camera,
    UtensilsCrossed,
    ShoppingBag,
    GraduationCap,
    Stethoscope,
    Bus,
    Plane,
    Train,
    Church,
    Landmark,
    LucideIcon,
    Percent,
    Banknote,
    Leaf,
    Heart,
    Zap,
    Clock,
    Award,
    ThumbsUp,
    Target,
    TrendingUp,
    Users,
    Key,
    Droplet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardAgentLayout } from "../components/DashboardAgentLayout"

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
    Home, Building2, Car, Wifi, Dumbbell, Trees, Shield, Camera, UtensilsCrossed,
    ShoppingBag, GraduationCap, Stethoscope, Bus, Plane, Train, Church, Landmark,
    MapPin, Star, Percent, Banknote, Leaf, Heart, Zap, Clock, Award, ThumbsUp,
    Target, TrendingUp, Users, Key, Droplet, Info, DollarSign,
}

const getIconByName = (iconName: string): LucideIcon | null => iconMap[iconName] || Home

// Types
interface Agent {
    id: number
    name: string
    email: string
    phone: string
    photo?: string
    developer_id?: number
}

interface Developer { id: number; name: string }
interface PropertyCategory { id: number; name: string; slug: string }
interface KeunggulanItem { id: number; nama: string; icon: string; keterangan?: string }
interface FasilitasItem { id: number; nama: string; icon: string }
interface KategoriPlaceItem { id: number; nama: string }
interface PromoItem { id: number; nama: string }
interface NearbyPlaceInput { kategori: string; nama: string }

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
    bedrooms: number
    bathrooms: number | null
    carport: number | null
    listrik: number | null
    jenis_air: string | null
    condition: string | null
    certificate_type: string | null
    land_size_min: number
    land_size_max: number | null
    building_size_min: number | null
    building_size_max: number | null
    keunggulan: number[] | null
    fasilitas: number[] | null
    nearest_place: NearbyPlaceInput[] | null
    promo_text: string | null
    has_promo_active: boolean
    promos: number[] | null
    is_available: boolean
    main_image: string | null
    images: string[] | null
}

interface EditListingProps {
    agent: Agent
    property: Property
    developers?: Developer[]
    categories?: PropertyCategory[]
    keunggulanList?: KeunggulanItem[]
    fasilitasList?: FasilitasItem[]
    kategoriPlacesList?: KategoriPlaceItem[]
    promosList?: PromoItem[]
}

// Step configuration
const STEPS = [
    { id: 1, title: "Basic Information", subtitle: "Property basic details", icon: Info },
    { id: 2, title: "Pricing & Features", subtitle: "Price and property features", icon: DollarSign },
    { id: 3, title: "Property Specifications", subtitle: "Detailed specifications", icon: Home },
    { id: 4, title: "Marketing & Promo", subtitle: "Promo and images", icon: Megaphone },
]

// Options
const certificateOptions = [
    { value: 'SHM', label: 'SHM (Sertifikat Hak Milik)' },
    { value: 'HGB', label: 'HGB (Hak Guna Bangunan)' },
    { value: 'SHGB', label: 'SHGB' },
    { value: 'Strata Title', label: 'Strata Title' },
]

const listrikOptions = [
    { value: '450', label: '450 VA' },
    { value: '900', label: '900 VA' },
    { value: '1300', label: '1300 VA' },
    { value: '2200', label: '2200 VA' },
    { value: '3500', label: '3500 VA' },
    { value: '5500', label: '5500 VA' },
    { value: '6600', label: '6600 VA' },
]

const jenisAirOptions = [
    { value: 'PDAM', label: 'PDAM' },
    { value: 'Sumur Bor', label: 'Sumur Bor' },
    { value: 'Sumur Tanah', label: 'Sumur Tanah' },
]

const conditionOptions = [
    { value: 'Baru', label: 'Baru (Gress)' },
    { value: 'Bekas', label: 'Bekas / Second' },
]

// Helper functions
const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/\D/g, '')
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const parseCurrency = (value: string): string => value.replace(/\./g, '')

// Step Indicator Component
function StepIndicator({ currentStep, completedSteps, onStepClick }: {
    currentStep: number
    completedSteps: Set<number>
    onStepClick: (stepId: number) => void
}) {
    const progressPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100

    return (
        <div className="mb-8">
            <div className="flex justify-between items-start relative">
                <div className="absolute top-5 left-[10%] right-[10%] flex items-center pointer-events-none z-0">
                    <div className="flex-1 bg-gray-200 h-1">
                        <div
                            className="h-full bg-gradient-to-r from-[#C5A847] to-[#E8D677] transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {STEPS.map((step) => {
                    const StepIcon = step.icon
                    const isCompleted = completedSteps.has(step.id)
                    const isCurrent = currentStep === step.id
                    const isPast = step.id < currentStep

                    return (
                        <div key={step.id} className="flex flex-col items-center flex-1 relative z-20">
                            <button
                                type="button"
                                onClick={() => onStepClick(step.id)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 ${isCompleted || isPast
                                    ? 'bg-[#C5A847] text-white shadow-lg shadow-[#C5A847]/30'
                                    : isCurrent
                                        ? 'bg-[#0C1C3C] text-white ring-2 ring-[#C5A847] ring-offset-2'
                                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                    }`}
                            >
                                {isCompleted || isPast ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                            </button>
                            <span
                                className={`mt-3 text-xs font-medium text-center hidden md:block cursor-pointer max-w-[120px] ${isCurrent ? 'text-[#0C1C3C] font-semibold' : (isCompleted || isPast) ? 'text-[#C5A847]' : 'text-gray-500'}`}
                                onClick={() => onStepClick(step.id)}
                            >
                                {step.title}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// Form Components
function FormInput({ label, name, value, onChange, type = "text", placeholder, required = false, prefix, suffix, helpText, error }: {
    label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    type?: string; placeholder?: string; required?: boolean; prefix?: string; suffix?: string; helpText?: string; error?: string
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[#0C1C3C] text-sm font-medium">
                {label}{required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative flex">
                {prefix && <span className="inline-flex items-center px-3 border border-r-0 border-[#DCDEDD] rounded-l-[16px] bg-gray-50 text-gray-500 text-sm">{prefix}</span>}
                <input
                    type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
                    className={`flex-1 px-4 py-3 border border-[#DCDEDD] text-[#0C1C3C] focus:border-[#C5A847] focus:ring-1 focus:ring-[#C5A847] focus:outline-none transition-all duration-200 ${prefix ? 'rounded-r-[16px]' : suffix ? 'rounded-l-[16px]' : 'rounded-[16px]'} ${error ? 'border-red-500' : ''}`}
                />
                {suffix && <span className="inline-flex items-center px-3 border border-l-0 border-[#DCDEDD] rounded-r-[16px] bg-gray-50 text-gray-500 text-sm">{suffix}</span>}
            </div>
            {helpText && <p className="text-gray-500 text-xs">{helpText}</p>}
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    )
}

function FormInputCurrency({ label, name, value, onChange, placeholder, required = false, prefix = "Rp", suffix, helpText, error }: {
    label: string; name: string; value: string; onChange: (name: string, rawValue: string) => void
    placeholder?: string; required?: boolean; prefix?: string; suffix?: string; helpText?: string; error?: string
}) {
    const displayValue = formatCurrency(value)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = parseCurrency(e.target.value)
        if (/^\d*$/.test(rawValue)) onChange(name, rawValue)
    }

    return (
        <div className="space-y-2">
            <label className="block text-[#0C1C3C] text-sm font-medium">{label}{required && <span className="text-red-500">*</span>}</label>
            <div className="relative flex">
                {prefix && <span className="inline-flex items-center px-3 border border-r-0 border-[#DCDEDD] rounded-l-[16px] bg-gray-50 text-gray-500 text-sm">{prefix}</span>}
                <input type="text" name={name} value={displayValue} onChange={handleChange} placeholder={placeholder}
                    className={`flex-1 px-4 py-3 border border-[#DCDEDD] text-[#0C1C3C] focus:border-[#C5A847] focus:ring-1 focus:ring-[#C5A847] focus:outline-none transition-all duration-200 ${prefix ? (suffix ? '' : 'rounded-r-[16px]') : suffix ? 'rounded-l-[16px]' : 'rounded-[16px]'} ${error ? 'border-red-500' : ''}`}
                />
                {suffix && <span className="inline-flex items-center px-3 border border-l-0 border-[#DCDEDD] rounded-r-[16px] bg-gray-50 text-gray-500 text-sm">{suffix}</span>}
            </div>
            {helpText && <p className="text-gray-500 text-xs">{helpText}</p>}
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    )
}

function FormSelect({ label, name, value, onChange, options, placeholder = "Pilih salah satu", required = false, helpText, disabled = false }: {
    label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    options: { value: string; label: string }[]; placeholder?: string; required?: boolean; helpText?: string; disabled?: boolean
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[#0C1C3C] text-sm font-medium">{label}{required && <span className="text-red-500">*</span>}</label>
            <select name={name} value={value} onChange={onChange} disabled={disabled}
                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#C5A847] focus:ring-1 focus:ring-[#C5A847] focus:outline-none transition-all duration-200 appearance-none bg-no-repeat cursor-pointer pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 10px center' }}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            {helpText && <p className="text-gray-500 text-xs">{helpText}</p>}
        </div>
    )
}

// Main Component
export default function EditListing({ agent, property, developers = [], categories = [], keunggulanList = [], fasilitasList = [], kategoriPlacesList = [], promosList = [] }: EditListingProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([1, 2, 3, 4, 5])) // All steps completed for edit
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSavingStep, setIsSavingStep] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [cities, setCities] = useState<{ value: string, label: string }[]>([])
    const [loadingCities, setLoadingCities] = useState(false)
    const [provinceOptions, setProvinceOptions] = useState<{ value: string, label: string }[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showConfirmModal, setShowConfirmModal] = useState(false)

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
        bedrooms: property.bedrooms?.toString() || '',
        bathrooms: property.bathrooms?.toString() || '',
        carport: property.carport?.toString() || '',
        listrik: property.listrik?.toString() || '',
        jenis_air: property.jenis_air || '',
        condition: property.condition || '',
        certificate_type: property.certificate_type || '',
        land_size_min: property.land_size_min?.toString() || '',
        land_size_max: property.land_size_max?.toString() || '',
        building_size_min: property.building_size_min?.toString() || '',
        building_size_max: property.building_size_max?.toString() || '',
        keunggulan: property.keunggulan || [],
        fasilitas: property.fasilitas || [],
        nearby_places: property.nearest_place || [],
        has_promo_active: property.has_promo_active ?? false,
        promos: property.promos || [],
        promo_text: property.promo_text || '',
        is_available: property.is_available ?? true,
    })

    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('/api/wilayah/provinces')
                const data = await response.json()
                if (data.data) {
                    setProvinceOptions(data.data.map((p: any) => ({ value: p.code, label: p.name })))
                }
            } catch (error) {
                console.error('Failed to fetch provinces:', error)
            }
        }
        fetchProvinces()
    }, [])

    // Load cities when province exists
    useEffect(() => {
        if (property.provinsi) {
            const loadCities = async () => {
                try {
                    const response = await fetch(`/api/wilayah/cities/${property.provinsi}`)
                    const data = await response.json()
                    if (data?.data) {
                        setCities(data.data.map((c: any) => ({ value: c.code || c.id, label: c.name })))
                    }
                } catch (error) {
                    console.error('Failed to fetch cities:', error)
                }
            }
            loadCities()
        }
    }, [property.provinsi])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleCurrencyChange = (name: string, rawValue: string) => {
        setFormData(prev => ({ ...prev, [name]: rawValue }))
    }

    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceId = e.target.value
        setFormData(prev => ({ ...prev, provinsi: provinceId, city: '' }))

        if (provinceId) {
            setLoadingCities(true)
            try {
                const response = await fetch(`/api/wilayah/cities/${provinceId}`)
                const data = await response.json()
                if (data?.data) {
                    setCities(data.data.map((c: any) => ({ value: c.code || c.id, label: c.name })))
                } else {
                    setCities([])
                }
            } catch (error) {
                console.error('Failed to fetch cities:', error)
                setCities([])
            } finally {
                setLoadingCities(false)
            }
        } else {
            setCities([])
        }
    }

    const handleCategoryChange = (categoryId: string) => {
        setFormData(prev => ({
            ...prev,
            kategori: prev.kategori.includes(categoryId)
                ? prev.kategori.filter(id => id !== categoryId)
                : [...prev.kategori, categoryId]
        }))
    }

    const toggleKeunggulan = (id: number) => {
        setFormData(prev => ({
            ...prev,
            keunggulan: prev.keunggulan.includes(id)
                ? prev.keunggulan.filter(k => k !== id)
                : [...prev.keunggulan, id]
        }))
    }

    const toggleFasilitas = (id: number) => {
        setFormData(prev => ({
            ...prev,
            fasilitas: prev.fasilitas.includes(id)
                ? prev.fasilitas.filter(f => f !== id)
                : [...prev.fasilitas, id]
        }))
    }

    const capitalizeWords = (str: string): string => {
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    const addNearbyPlace = () => {
        setFormData(prev => ({ ...prev, nearby_places: [...prev.nearby_places, { kategori: '', nama: '' }] }))
    }

    const updateNearbyPlace = (index: number, field: keyof NearbyPlaceInput, value: string) => {
        setFormData(prev => {
            const updated = [...prev.nearby_places]
            updated[index] = { ...updated[index], [field]: field === 'nama' ? capitalizeWords(value) : value }
            return { ...prev, nearby_places: updated }
        })
    }

    const removeNearbyPlace = (index: number) => {
        setFormData(prev => ({ ...prev, nearby_places: prev.nearby_places.filter((_, i) => i !== index) }))
    }

    const togglePromoActive = (value: boolean) => {
        setFormData(prev => ({ ...prev, has_promo_active: value, promos: value ? prev.promos : [] }))
    }

    const togglePromoId = (id: number) => {
        setFormData(prev => ({
            ...prev,
            promos: prev.promos.includes(id) ? prev.promos.filter(p => p !== id) : [...prev.promos, id]
        }))
    }

    const handleStepClick = (stepId: number) => {
        setCurrentStep(stepId)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    const handleShowConfirmation = (e: React.FormEvent) => {
        e.preventDefault()
        setShowConfirmModal(true)
    }

    const handleSubmit = async () => {
        setShowConfirmModal(false)
        setIsSubmitting(true)
        setSubmitStatus('idle')

        try {
            const submitData = {
                ...formData,
                kategori: JSON.stringify(formData.kategori),
                keunggulan: JSON.stringify(formData.keunggulan),
                fasilitas: JSON.stringify(formData.fasilitas),
                nearby_places: JSON.stringify(formData.nearby_places),
                promos: JSON.stringify(formData.promos),
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
                onFinish: () => setIsSubmitting(false)
            })
        } catch (error) {
            console.error('Form submission error:', error)
            setSubmitStatus('error')
            setIsSubmitting(false)
        }
    }

    const renderStepContent = () => {
        const currentStepInfo = STEPS.find(s => s.id === currentStep)

        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#0C1C3C] flex items-center gap-2">
                            {currentStepInfo && <currentStepInfo.icon className="w-6 h-6 text-[#C5A847]" />}
                            {currentStepInfo?.title}
                        </h2>
                        <p className="text-gray-500 mt-1">{currentStepInfo?.subtitle}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {currentStep === 1 && (
                        <>
                            <FormInput label="Nama Properti" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Nuansa Bukit Bitung" required error={errors.name} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormSelect label="Provinsi" name="provinsi" value={formData.provinsi} onChange={handleProvinceChange} options={provinceOptions} placeholder="Pilih Provinsi" required />
                                <FormSelect label="Kota / Kabupaten" name="city" value={formData.city} onChange={handleInputChange} options={cities} placeholder={loadingCities ? "Memuat..." : "Pilih Kota"} disabled={!formData.provinsi || loadingCities} required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Lokasi Detail" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g., Ciawi, Kab. Bogor" required error={errors.location} />
                                <FormInput label="URL Google Maps" name="url_maps" value={formData.url_maps} onChange={handleInputChange} placeholder="https://maps.google.com/..." />
                            </div>
                            {agent.developer_id && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput label="Sisa Unit" name="units_remaining" value={formData.units_remaining} onChange={handleInputChange} type="number" placeholder="Total unit" />
                                    <FormSelect label="Developer" name="developer_id" value={formData.developer_id} onChange={handleInputChange} options={developers.map(d => ({ value: d.id.toString(), label: d.name }))} placeholder="Pilih Developer" />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">Kategori Properti</label>
                                <div className="border border-[#DCDEDD] rounded-[16px] p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category) => (
                                            <button key={category.id} type="button" onClick={() => handleCategoryChange(String(category.id))}
                                                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.kategori.includes(String(category.id)) ? 'bg-[#276874] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                            >{category.name}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            {/* Price Section */}
                            <div className="grid grid-cols-1 gap-4">
                                <FormInputCurrency label="Harga Properti" name="price_min" value={formData.price_min} onChange={handleCurrencyChange} placeholder="2.000.000.000" prefix="Rp" required error={errors.price_min} />
                            </div>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-[#DCDEDD]"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-sm font-medium text-gray-500">Keunggulan & Fasilitas</span>
                                </div>
                            </div>

                            {/* Keunggulan Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <Star className="w-5 h-5 text-[#C5A847]" />
                                    <h3 className="font-semibold text-[#0C1C3C]">Keunggulan Properti</h3>
                                </div>
                                {keunggulanList.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {keunggulanList.map((item) => {
                                            const isSelected = formData.keunggulan.includes(item.id)
                                            const IconComponent = getIconByName(item.icon)
                                            return (
                                                <button key={item.id} type="button" onClick={() => toggleKeunggulan(item.id)}
                                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${isSelected ? 'border-[#C5A847] bg-[#C5A847]/10 text-[#0C1C3C]' : 'border-[#DCDEDD] bg-white hover:border-[#C5A847]/50 text-gray-700'}`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#C5A847] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                        {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="font-medium">{item.nama}</span>
                                                    {isSelected && <Check className="w-4 h-4 text-[#C5A847]" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : <p className="text-gray-500">Tidak ada keunggulan tersedia</p>}
                            </div>

                            <hr className="border-[#DCDEDD] my-6" />

                            {/* Fasilitas Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <Building2 className="w-5 h-5 text-[#C5A847]" />
                                    <h3 className="font-semibold text-[#0C1C3C]">Fasilitas Properti</h3>
                                </div>
                                {fasilitasList.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {fasilitasList.map((item) => {
                                            const isSelected = formData.fasilitas.includes(item.id)
                                            const IconComponent = getIconByName(item.icon)
                                            return (
                                                <button key={item.id} type="button" onClick={() => toggleFasilitas(item.id)}
                                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${isSelected ? 'border-[#C5A847] bg-[#C5A847]/10 text-[#0C1C3C]' : 'border-[#DCDEDD] bg-white hover:border-[#C5A847]/50 text-gray-700'}`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#C5A847] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                        {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="font-medium">{item.nama}</span>
                                                    {isSelected && <Check className="w-4 h-4 text-[#C5A847]" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : <p className="text-gray-500">Tidak ada fasilitas tersedia</p>}
                            </div>

                            <hr className="border-[#DCDEDD] my-6" />

                            {/* Nearby Places */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-5 h-5 text-[#C5A847]" />
                                    <h3 className="font-semibold text-[#0C1C3C]">Lokasi Terdekat</h3>
                                </div>
                                {formData.nearby_places.map((item, index) => (
                                    <div key={index} className="border border-[#DCDEDD] rounded-[16px] p-4 mb-3">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-medium text-[#0C1C3C]">Lokasi {index + 1}</span>
                                            <button type="button" onClick={() => removeNearbyPlace(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput label="Nama Tempat" name={`nearby-nama-${index}`} value={item.nama} onChange={(e) => updateNearbyPlace(index, 'nama', e.target.value)} placeholder="e.g., Gerbang Tol Ciawi" required />
                                            <FormSelect label="Kategori" name={`nearby-kategori-${index}`} value={item.kategori} onChange={(e) => updateNearbyPlace(index, 'kategori', e.target.value)} options={kategoriPlacesList.map(k => ({ value: k.nama, label: k.nama }))} placeholder="Pilih Kategori" required />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addNearbyPlace} className="w-full py-3 border-2 border-dashed border-[#DCDEDD] rounded-[16px] text-gray-600 font-medium hover:border-[#C5A847] hover:text-[#C5A847] transition-colors flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" />Tambahkan Lokasi
                                </button>
                            </div>
                        </>
                    )}

                    {currentStep === 3 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormInput label="Bedrooms" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} type="number" placeholder="2" suffix="KT" required error={errors.bedrooms} />
                                <FormInput label="Bathrooms" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} type="number" placeholder="1" suffix="KM" />
                                <FormInput label="Carport" name="carport" value={formData.carport} onChange={handleInputChange} type="number" placeholder="1" suffix="Unit" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormSelect label="Daya Listrik" name="listrik" value={formData.listrik} onChange={handleInputChange} options={listrikOptions} placeholder="Pilih daya listrik" />
                                <FormSelect label="Sumber Air" name="jenis_air" value={formData.jenis_air} onChange={handleInputChange} options={jenisAirOptions} placeholder="Pilih sumber air" />
                                <FormSelect label="Kondisi Properti" name="condition" value={formData.condition} onChange={handleInputChange} options={conditionOptions} placeholder="Pilih kondisi" />
                            </div>
                            <FormSelect label="Certificate Type" name="certificate_type" value={formData.certificate_type} onChange={handleInputChange} options={certificateOptions} placeholder="Select certificate type" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Land Size Min" name="land_size_min" value={formData.land_size_min} onChange={handleInputChange} type="number" placeholder="120" suffix="m²" required error={errors.land_size_min} />
                                <FormInput label="Land Size Max" name="land_size_max" value={formData.land_size_max} onChange={handleInputChange} type="number" placeholder="123" suffix="m²" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput label="Building Size Min" name="building_size_min" value={formData.building_size_min} onChange={handleInputChange} type="number" placeholder="45" suffix="m²" required error={errors.building_size_min} />
                                <FormInput label="Building Size Max" name="building_size_max" value={formData.building_size_max} onChange={handleInputChange} type="number" placeholder="80" suffix="m²" />
                            </div>
                        </>
                    )}

                    {currentStep === 4 && (
                        <>
                            {/* Promo Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <Megaphone className="w-5 h-5 text-[#C5A847]" />
                                    <h3 className="font-semibold text-[#0C1C3C]">Promosi</h3>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-gray-500 text-sm mb-3">Apakah properti ini memiliki promo aktif?</label>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => togglePromoActive(true)}
                                            className={`flex-1 py-3 px-4 rounded-[12px] border flex items-center justify-center gap-2 transition-all duration-200 ${formData.has_promo_active ? 'border-[#C5A847] bg-[#FFF9E6] text-[#C5A847] ring-1 ring-[#C5A847]' : 'border-[#DCDEDD] hover:border-gray-400 text-gray-600'}`}
                                        >
                                            <CheckCircle className={`w-5 h-5 ${formData.has_promo_active ? 'opacity-100' : 'opacity-0'}`} />
                                            <span className="font-medium">Ya, Ada Promo</span>
                                        </button>
                                        <button type="button" onClick={() => togglePromoActive(false)}
                                            className={`flex-1 py-3 px-4 rounded-[12px] border flex items-center justify-center gap-2 transition-all duration-200 ${!formData.has_promo_active ? 'border-gray-400 bg-gray-50 text-gray-800 ring-1 ring-gray-400' : 'border-[#DCDEDD] hover:border-gray-400 text-gray-600'}`}
                                        >
                                            <span className="font-medium">Tidak Ada</span>
                                        </button>
                                    </div>
                                </div>

                                {formData.has_promo_active && promosList.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-medium text-[#0C1C3C] mb-3">Pilih Promo</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {promosList.map((promo) => (
                                                <div key={promo.id} onClick={() => togglePromoId(promo.id)}
                                                    className={`cursor-pointer p-4 rounded-[12px] border flex items-center justify-between transition-all duration-200 ${formData.promos.includes(promo.id) ? 'border-[#C5A847] bg-[#FFF9E6] shadow-sm' : 'border-[#DCDEDD] hover:border-[#C5A847]'}`}
                                                >
                                                    <span className="font-medium">{promo.nama}</span>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.promos.includes(promo.id) ? 'border-[#C5A847] bg-[#C5A847]' : 'border-gray-300'}`}>
                                                        {formData.promos.includes(promo.id) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-[#0C1C3C] text-sm font-medium">Tentang Property</label>
                                    <Editor
                                        value={formData.promo_text}
                                        onTextChange={(e) => {
                                            const htmlValue = e.htmlValue || '';
                                            const sanitized = htmlValue.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '');
                                            const textContent = e.textValue || '';
                                            if (textContent.length <= 2000) {
                                                setFormData(prev => ({ ...prev, promo_text: sanitized }));
                                            }
                                        }}
                                        style={{ height: '320px' }}
                                        placeholder="Deskripsikan properti Anda..."
                                    />
                                </div>
                            </div>

                            <hr className="border-[#DCDEDD] my-6" />

                            {/* Current Images */}
                            {(property.main_image || (property.images && property.images.length > 0)) && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Image className="w-5 h-5 text-[#C5A847]" />
                                        <h3 className="font-semibold text-[#0C1C3C]">Gambar Saat Ini</h3>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-4">Gambar akan tetap digunakan dari listing sebelumnya.</p>
                                    <div className="flex flex-wrap gap-3">
                                        {property.main_image && (
                                            <div className="relative">
                                                <img src={property.main_image} alt="Main" className="w-24 h-24 object-cover rounded-lg border-2 border-[#C5A847]" />
                                                <span className="absolute bottom-1 left-1 text-xs bg-[#C5A847] text-white px-1.5 py-0.5 rounded font-medium">Utama</span>
                                            </div>
                                        )}
                                        {property.images?.map((img, idx) => (
                                            <img key={idx} src={img} alt={`Image ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        )
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
                        <h1 className="text-[#0C1C3C] text-2xl md:text-3xl font-bold mb-1">Edit Listing</h1>
                        <p className="text-gray-500 text-sm md:text-base">"{property.name}"</p>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-[16px] flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">Properti berhasil diperbarui!</p>
                </div>
            )}

            {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[16px] flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-800 font-medium">Terjadi kesalahan.</p>
                        {Object.keys(errors).length > 0 && (
                            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                {Object.entries(errors).map(([field, message]) => <li key={field}>{message}</li>)}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Warning */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-[16px] flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-800 text-sm"><strong>Perhatian:</strong> Setelah mengedit listing, properti akan memerlukan verifikasi ulang dari admin.</p>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-[20px] border border-[#DCDEDD] p-6 md:p-8">
                <StepIndicator currentStep={currentStep} completedSteps={completedSteps} onStepClick={handleStepClick} />

                <form onSubmit={handleShowConfirmation}>
                    {renderStepContent()}

                    {/* Navigation Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
                        {currentStep > 1 && (
                            <Button type="button" onClick={handleBack} variant="outline" className="flex-1 sm:flex-none h-12 rounded-[16px] border-[#DCDEDD] flex items-center justify-center gap-2">
                                <ArrowLeft className="w-5 h-5" />Kembali
                            </Button>
                        )}
                        <div className="flex-1 flex justify-end gap-3">
                            <Link href="/agent/dashboard/listing-saya">
                                <Button type="button" variant="outline" className="h-12 rounded-[16px] px-6 border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100">Batal</Button>
                            </Link>
                            {currentStep < STEPS.length ? (
                                <Button type="button" onClick={handleNext} className="h-12 rounded-[16px] px-6 bg-[#0C1C3C] text-white hover:bg-[#0a1730] flex items-center gap-2">
                                    Next Step<ArrowRight className="w-5 h-5" />
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting} className="h-12 rounded-[16px] px-6 bg-[#C5A847] text-white hover:bg-[#B09530] flex items-center gap-2">
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    {!isSubmitting && <Save className="w-5 h-5" />}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-[#0C1C3C] to-[#1a3a5c] px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Konfirmasi Perubahan</h2>
                            <button type="button" onClick={() => setShowConfirmModal(false)} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5 text-white" /></button>
                        </div>
                        <div className="p-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-amber-800">Perhatian</p>
                                    <p className="text-amber-700 mt-1">Listing akan diajukan ulang ke admin untuk direview setelah perubahan disimpan.</p>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">Apakah Anda yakin ingin menyimpan perubahan pada listing "{property.name}"?</p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
                            <Button type="button" onClick={() => setShowConfirmModal(false)} variant="outline" className="h-11 rounded-xl px-6">Batal</Button>
                            <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="h-11 rounded-xl px-6 bg-[#C5A847] text-white hover:bg-[#B09530] flex items-center gap-2">
                                {isSubmitting ? 'Menyimpan...' : <><Save className="w-5 h-5" />Simpan</>}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardAgentLayout>
    )
}
