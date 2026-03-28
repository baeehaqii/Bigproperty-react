"use client"

import { useState, useCallback, useEffect } from "react"
import { router } from "@inertiajs/react"
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
    // Additional icons for keunggulan/fasilitas
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

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, LucideIcon> = {
    Home,
    Building2,
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
    MapPin,
    Star,
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
    Info,
    DollarSign,
}

// Helper function to get icon component by name
const getIconByName = (iconName: string): LucideIcon | null => {
    return iconMap[iconName] || Home
}

// Types
interface Agent {
    id: number
    name: string
    email: string
    phone: string
    photo?: string
    developer_id?: number
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

interface Province {
    id: string
    name: string
}

interface City {
    id: string
    name: string
}

interface UploadListingProps {
    agent: Agent
    developers?: Developer[]
    categories?: PropertyCategory[]
    provinces?: Province[]
    keunggulanList?: KeunggulanItem[]
    fasilitasList?: FasilitasItem[]
    kategoriPlacesList?: KategoriPlaceItem[]
    promosList?: PromoItem[]
}

// Database Promo item
interface PromoItem {
    id: number
    nama: string
}

// Database Keunggulan item
interface KeunggulanItem {
    id: number
    nama: string
    icon: string
    keterangan?: string
}

// Database Fasilitas item
interface FasilitasItem {
    id: number
    nama: string
    icon: string
}

// Database KategoriPlace item
interface KategoriPlaceItem {
    id: number
    nama: string
}

// NearbyPlace input item
interface NearbyPlaceInput {
    kategori: string
    nama: string
}

interface FormData {
    // Basic Information
    name: string
    provinsi: string
    city: string
    location: string
    url_maps: string
    units_remaining: string
    developer_id: string
    kategori: string[]

    // Pricing
    price_min: string

    // Property Specifications
    bedrooms: string
    bathrooms: string
    carport: string
    certificate_type: string
    land_size_min: string
    land_size_max: string
    building_size_min: string
    building_size_max: string
    listrik: string
    jenis_air: string
    condition: string

    // Keunggulan (array of IDs)
    keunggulan: number[]

    // Fasilitas (array of IDs)
    fasilitas: number[]

    // Nearby Places (array of objects with kategori and nama)
    nearby_places: NearbyPlaceInput[]

    // Marketing & Promotion
    has_promo_active: boolean
    promos: number[] // Array of Promo IDs
    promo_text: string

    // Images
    main_image: File | null
    images: File[]

    // Status & Settings
    button_type: string
    is_available: boolean
    is_popular: boolean
}

// Step configuration
const STEPS = [
    { id: 1, title: "Basic Information", subtitle: "Property basic details and identification", icon: Info },
    { id: 2, title: "Pricing & Features", subtitle: "Price and property features", icon: DollarSign },
    { id: 3, title: "Property Specifications", subtitle: "Detailed property specifications", icon: Home },
    { id: 4, title: "Marketing & Promo", subtitle: "Promosi dan gambar properti", icon: Megaphone },
]

// Icon options for facilities and keunggulan
const iconOptions = [
    'Home', 'Building2', 'Car', 'Wifi', 'Dumbbell', 'Trees', 'Shield',
    'Camera', 'SwimmingPool', 'UtensilsCrossed', 'ShoppingBag', 'GraduationCap',
    'Stethoscope', 'Bus', 'Plane', 'Train', 'Church', 'Landmark', 'MapPin'
]

// Certificate type options
const certificateOptions = [
    { value: 'SHM', label: 'SHM (Sertifikat Hak Milik)' },
    { value: 'HGB', label: 'HGB (Hak Guna Bangunan)' },
    { value: 'SHGB', label: 'SHGB' },
    { value: 'Strata Title', label: 'Strata Title' },
]

// Daya Listrik options (VA)
const listrikOptions = [
    { value: '450', label: '450 VA' },
    { value: '900', label: '900 VA' },
    { value: '1300', label: '1300 VA' },
    { value: '2200', label: '2200 VA' },
    { value: '3500', label: '3500 VA' },
    { value: '5500', label: '5500 VA' },
    { value: '6600', label: '6600 VA' },
]

// Sumber Air options
const jenisAirOptions = [
    { value: 'PDAM', label: 'PDAM' },
    { value: 'Sumur Bor', label: 'Sumur Bor' },
    { value: 'Sumur Tanah', label: 'Sumur Tanah' },
]

// Kondisi Properti options
const conditionOptions = [
    { value: 'Baru', label: 'Baru (Gress)' },
    { value: 'Bekas', label: 'Bekas / Second' },
]

// Nearest place categories
const nearestPlaceCategories = [
    { value: 'mall', label: 'Mall / Pusat Perbelanjaan', icon: 'ShoppingBag' },
    { value: 'sekolah', label: 'Sekolah', icon: 'GraduationCap' },
    { value: 'rumah_sakit', label: 'Rumah Sakit', icon: 'Stethoscope' },
    { value: 'stasiun', label: 'Stasiun', icon: 'Train' },
    { value: 'bandara', label: 'Bandara', icon: 'Plane' },
    { value: 'tol', label: 'Akses Tol', icon: 'Car' },
    { value: 'transportasi', label: 'Transportasi Umum', icon: 'Bus' },
    { value: 'tempat_ibadah', label: 'Tempat Ibadah', icon: 'Church' },
    { value: 'lainnya', label: 'Lainnya', icon: 'MapPin' },
]

// Step Indicator Component with clickable steps
function StepIndicator({
    currentStep,
    completedSteps,
    onStepClick
}: {
    currentStep: number
    completedSteps: Set<number>
    onStepClick: (stepId: number) => void
}) {
    // Calculate progress based on current step position
    // Progress should reach the center of each step circle
    // For step 1: 0%, step 2: 25%, step 3: 50%, step 4: 75%, step 5: 100%
    const progressPercentage = ((currentStep - 1) / (STEPS.length - 1)) * 100

    return (
        <div className="mb-8">
            {/* Step Dots - Clickable */}
            <div className="flex justify-between items-start relative">
                {/* Progress Bar Behind - centered vertically with step circles */}
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
                        <div
                            key={step.id}
                            className="flex flex-col items-center flex-1 relative z-20"
                        >
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
                                {isCompleted || isPast ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <StepIcon className="w-5 h-5" />
                                )}
                            </button>
                            <span
                                className={`mt-3 text-xs font-medium text-center hidden md:block cursor-pointer max-w-[120px] ${isCurrent ? 'text-[#0C1C3C] font-semibold' : (isCompleted || isPast) ? 'text-[#C5A847]' : 'text-gray-500'
                                    }`}
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

// Helper function to format number with thousand separator
const formatCurrency = (value: string): string => {
    // Remove non-digit characters
    const numericValue = value.replace(/\D/g, '')
    // Format with thousand separator
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Helper function to parse formatted currency back to number
const parseCurrency = (value: string): string => {
    return value.replace(/\./g, '')
}

// Input Component
function FormInput({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder,
    required = false,
    prefix,
    suffix,
    helpText,
    error,
}: {
    label: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    type?: string
    placeholder?: string
    required?: boolean
    prefix?: string
    suffix?: string
    helpText?: string
    error?: string
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[#0C1C3C] text-sm font-medium">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative flex">
                {prefix && (
                    <span className="inline-flex items-center px-3 border border-r-0 border-[#DCDEDD] rounded-l-[16px] bg-gray-50 text-gray-500 text-sm">
                        {prefix}
                    </span>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`flex-1 px-4 py-3 border border-[#DCDEDD] text-[#0C1C3C] focus:border-[#C5A847] focus:ring-1 focus:ring-[#C5A847] focus:outline-none transition-all duration-200 ${prefix ? 'rounded-r-[16px]' : suffix ? 'rounded-l-[16px]' : 'rounded-[16px]'
                        } ${error ? 'border-red-500' : ''}`}
                />
                {suffix && (
                    <span className="inline-flex items-center px-3 border border-l-0 border-[#DCDEDD] rounded-r-[16px] bg-gray-50 text-gray-500 text-sm">
                        {suffix}
                    </span>
                )}
            </div>
            {helpText && <p className="text-gray-500 text-xs">{helpText}</p>}
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    )
}

// Currency Input Component with IDR formatting
function FormInputCurrency({
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
    prefix = "Rp",
    suffix,
    helpText,
    error,
}: {
    label: string
    name: string
    value: string
    onChange: (name: string, rawValue: string) => void
    placeholder?: string
    required?: boolean
    prefix?: string
    suffix?: string
    helpText?: string
    error?: string
}) {
    // Display formatted value
    const displayValue = formatCurrency(value)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value
        // Parse to raw number (remove dots)
        const rawValue = parseCurrency(inputValue)
        // Only allow numbers
        if (/^\d*$/.test(rawValue)) {
            onChange(name, rawValue)
        }
    }

    return (
        <div className="space-y-2">
            <label className="block text-[#0C1C3C] text-sm font-medium">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative flex">
                {prefix && (
                    <span className="inline-flex items-center px-3 border border-r-0 border-[#DCDEDD] rounded-l-[16px] bg-gray-50 text-gray-500 text-sm">
                        {prefix}
                    </span>
                )}
                <input
                    type="text"
                    name={name}
                    value={displayValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`flex-1 px-4 py-3 border border-[#DCDEDD] text-[#0C1C3C] focus:border-[#C5A847] focus:ring-1 focus:ring-[#C5A847] focus:outline-none transition-all duration-200 ${prefix ? (suffix ? '' : 'rounded-r-[16px]') : suffix ? 'rounded-l-[16px]' : 'rounded-[16px]'
                        } ${error ? 'border-red-500' : ''}`}
                />
                {suffix && (
                    <span className="inline-flex items-center px-3 border border-l-0 border-[#DCDEDD] rounded-r-[16px] bg-gray-50 text-gray-500 text-sm">
                        {suffix}
                    </span>
                )}
            </div>
            {helpText && <p className="text-gray-500 text-xs">{helpText}</p>}
            {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    )
}

// Select Component
function FormSelect({
    label,
    name,
    value,
    onChange,
    options,
    placeholder = "Pilih salah satu opsi",
    required = false,
    helpText,
    disabled = false,
}: {
    label: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    options: { value: string; label: string }[]
    placeholder?: string
    required?: boolean
    helpText?: string
    disabled?: boolean
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[#0C1C3C] text-sm font-medium">
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#C5A847] focus:ring-1 focus:ring-[#C5A847] focus:outline-none transition-all duration-200 appearance-none bg-no-repeat cursor-pointer pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 10px center'
                }}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {helpText && <p className="text-gray-500 text-xs">{helpText}</p>}
        </div>
    )
}

// Textarea Component
function FormTextarea({
    label,
    name,
    value,
    onChange,
    placeholder,
    rows = 3,
    helpText,
}: {
    label: string
    name: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    placeholder?: string
    rows?: number
    helpText?: string
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[#0C1C3C] text-sm font-medium">{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#C5A847] focus:ring-1 focus:ring-[#C5A847] focus:outline-none transition-all duration-200 resize-none"
            />
            {helpText && <p className="text-gray-500 text-xs">{helpText}</p>}
        </div>
    )
}

// File Upload Component
function FileUpload({
    label,
    accept = "image/*",
    multiple = false,
    onFilesChange,
    files,
    helpText,
    maxFiles = 10,
}: {
    label: string
    accept?: string
    multiple?: boolean
    onFilesChange: (files: File[]) => void
    files: File[]
    helpText?: string
    maxFiles?: number
}) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        )
        if (multiple) {
            const newFiles = [...files, ...droppedFiles].slice(0, maxFiles)
            onFilesChange(newFiles)
        } else {
            onFilesChange(droppedFiles.slice(0, 1))
        }
    }, [files, multiple, maxFiles, onFilesChange])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        if (multiple) {
            const newFiles = [...files, ...selectedFiles].slice(0, maxFiles)
            onFilesChange(newFiles)
        } else {
            onFilesChange(selectedFiles.slice(0, 1))
        }
    }, [files, multiple, maxFiles, onFilesChange])

    const removeFile = useCallback((index: number) => {
        const newFiles = files.filter((_, i) => i !== index)
        onFilesChange(newFiles)
    }, [files, onFilesChange])

    return (
        <div className="space-y-2">
            <label className="block text-[#0C1C3C] text-sm font-medium">{label}</label>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-[16px] p-6 text-center transition-colors ${isDragging
                    ? 'border-[#C5A847] bg-yellow-50'
                    : 'border-[#DCDEDD] hover:border-[#C5A847]'
                    }`}
            >
                <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileInput}
                    className="hidden"
                    id={`file-upload-${label.replace(/\s+/g, '-')}`}
                />
                <label
                    htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
                    className="cursor-pointer"
                >
                    <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                        Seret & Jatuhkan berkas Anda atau{' '}
                        <span className="text-[#C5A847] font-medium">Jelajahi</span>
                    </p>
                </label>
            </div>

            {files.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                    {files.map((file, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {helpText && <p className="text-gray-500 text-xs">{helpText}</p>}
        </div>
    )
}

// Main Component
export default function UploadListing({ agent, developers = [], categories = [], keunggulanList = [], fasilitasList = [], kategoriPlacesList = [], promosList = [] }: UploadListingProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSavingStep, setIsSavingStep] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [cities, setCities] = useState<{ value: string, label: string }[]>([])
    const [loadingCities, setLoadingCities] = useState(false)
    const [provinceOptions, setProvinceOptions] = useState<{ value: string, label: string }[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showConfirmModal, setShowConfirmModal] = useState(false)

    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('/api/wilayah/provinces')
                const data = await response.json()
                if (data.data) {
                    const formatted = data.data.map((p: any) => ({
                        value: p.code,
                        label: p.name
                    }))
                    setProvinceOptions(formatted)
                }
            } catch (error) {
                console.error('Failed to fetch provinces:', error)
            }
        }
        fetchProvinces()
    }, [])

    const [formData, setFormData] = useState<FormData>({
        // Basic Information
        name: '',
        provinsi: '',
        city: '',
        location: '',
        url_maps: '',
        units_remaining: '',
        developer_id: '',
        kategori: [],

        // Pricing
        price_min: '',

        // Property Specifications
        bedrooms: '',
        bathrooms: '',
        carport: '',
        certificate_type: '',
        land_size_min: '',
        land_size_max: '',
        building_size_min: '',
        building_size_max: '',
        listrik: '',
        jenis_air: '',
        condition: '',

        // Keunggulan
        keunggulan: [],

        // Fasilitas
        fasilitas: [],

        // Nearby Places
        nearby_places: [],

        // Marketing & Promotion
        has_promo_active: false,
        promos: [],
        promo_text: '',

        // Images
        main_image: null,
        images: [],

        // Status & Settings
        button_type: 'view_details',
        is_available: true,
        is_popular: false,
    })

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Handle currency input change (for IDR formatted inputs)
    const handleCurrencyChange = (name: string, rawValue: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: rawValue
        }))
    }

    // Handle province change and load cities
    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceId = e.target.value

        setFormData(prev => ({
            ...prev,
            provinsi: provinceId,
            city: ''
        }))

        if (provinceId) {
            setLoadingCities(true)
            try {
                console.log('Fetching cities for province:', provinceId)
                const response = await fetch(`/api/wilayah/cities/${provinceId}`)

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = await response.json()
                console.log('Cities API Response:', data)

                if (data && data.data && Array.isArray(data.data)) {
                    const formatted = data.data.map((c: any) => ({
                        value: c.code || c.id,
                        label: c.name
                    }))
                    console.log('Formatted cities:', formatted)
                    setCities(formatted)

                    if (formatted.length === 0) {
                        console.warn('No cities found for province:', provinceId)
                    }
                } else {
                    console.warn('Invalid response structure:', data)
                    setCities([])
                }
            } catch (error) {
                console.error('Failed to fetch cities:', error)
                setCities([])
                // Show error message to user
                setSaveMessage({
                    type: 'error',
                    text: 'Gagal memuat data kota. Silakan coba lagi.'
                })
                setTimeout(() => setSaveMessage(null), 3000)
            } finally {
                setLoadingCities(false)
            }
        } else {
            setCities([])
        }
    }

    // Handle keunggulan (advantages) - toggle selection
    const toggleKeunggulan = (id: number) => {
        setFormData(prev => ({
            ...prev,
            keunggulan: prev.keunggulan.includes(id)
                ? prev.keunggulan.filter(k => k !== id)
                : [...prev.keunggulan, id]
        }))
    }

    // Handle fasilitas (facilities) - toggle selection
    const toggleFasilitas = (id: number) => {
        setFormData(prev => ({
            ...prev,
            fasilitas: prev.fasilitas.includes(id)
                ? prev.fasilitas.filter(f => f !== id)
                : [...prev.fasilitas, id]
        }))
    }

    // Helper function to capitalize first letter of each word
    const capitalizeWords = (str: string): string => {
        return str
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    // Handle nearby places - add new entry
    const addNearbyPlace = () => {
        setFormData(prev => ({
            ...prev,
            nearby_places: [...prev.nearby_places, { kategori: '', nama: '' }]
        }))
    }

    // Handle nearby places - update entry
    const updateNearbyPlace = (index: number, field: keyof NearbyPlaceInput, value: string) => {
        setFormData(prev => {
            const updated = [...prev.nearby_places]
            // Capitalize words for 'nama' field when updating
            updated[index] = { ...updated[index], [field]: field === 'nama' ? capitalizeWords(value) : value }
            return { ...prev, nearby_places: updated }
        })
    }

    // Handle nearby places - remove entry
    const removeNearbyPlace = (index: number) => {
        setFormData(prev => ({
            ...prev,
            nearby_places: prev.nearby_places.filter((_, i) => i !== index)
        }))
    }

    // Handle category selection
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

    // Step validation
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {}

        switch (step) {
            case 1: // Basic Information
                if (!formData.name) newErrors.name = 'Nama properti wajib diisi'
                if (!formData.provinsi) newErrors.provinsi = 'Provinsi wajib dipilih'
                if (!formData.city) newErrors.city = 'Kota wajib dipilih'
                if (!formData.location) newErrors.location = 'Lokasi wajib diisi'
                break
            case 2: // Pricing
                if (!formData.price_min) newErrors.price_min = 'Harga minimum wajib diisi'
                break
            case 3: // Property Specifications
                if (!formData.bedrooms) newErrors.bedrooms = 'Jumlah kamar tidur wajib diisi'
                if (!formData.land_size_min) newErrors.land_size_min = 'Luas tanah minimum wajib diisi'
                if (!formData.building_size_min) newErrors.building_size_min = 'Luas bangunan minimum wajib diisi'
                break
            case 5: // Marketing & Promo
                if (formData.has_promo_active && formData.promos.length === 0) {
                    newErrors.promos = 'Pilih minimal satu promo jika status promo aktif'
                }
                break
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Check if step has any data filled
    const isStepFilled = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(formData.name && formData.provinsi && formData.city && formData.location)
            case 2:
                return !!(formData.price_min)
            case 3:
                return !!(formData.bedrooms && formData.land_size_min && formData.building_size_min)
            case 4:
                return true // Keunggulan, Fasilitas, Nearby Places are optional
            case 5:
                return !!(formData.main_image || formData.images.length > 0)
            default:
                return false
        }
    }

    // Handle step click - allow clicking on any step (can skip steps)
    const handleStepClick = (stepId: number) => {
        setCurrentStep(stepId)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // Handle save step - save data for current step and advance to next
    const handleSaveStep = async () => {
        // Validate current step before saving
        if (!validateStep(currentStep)) {
            setSaveMessage({ type: 'error', text: 'Mohon lengkapi field yang wajib diisi' })
            setTimeout(() => setSaveMessage(null), 3000)
            return
        }

        setIsSavingStep(true)

        // Simulate save delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mark current step as completed
        setCompletedSteps(prev => new Set([...prev, currentStep]))

        setSaveMessage({ type: 'success', text: `Step ${currentStep} berhasil disimpan!` })
        setIsSavingStep(false)

        // Auto-advance to next step after a brief delay
        if (currentStep < STEPS.length) {
            setTimeout(() => {
                setCurrentStep(currentStep + 1)
                window.scrollTo({ top: 0, behavior: 'smooth' })
                setSaveMessage(null)
            }, 800)
        } else {
            setTimeout(() => setSaveMessage(null), 3000)
        }
    }

    // Navigation handlers
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

    // Handle form submission
    const togglePromoActive = (value: boolean) => {
        setFormData(prev => ({ ...prev, has_promo_active: value, promos: value ? prev.promos : [] }))
    }

    const togglePromoId = (id: number) => {
        setFormData(prev => {
            const currentPromos = prev.promos
            if (currentPromos.includes(id)) {
                return { ...prev, promos: currentPromos.filter(p => p !== id) }
            } else {
                return { ...prev, promos: [...currentPromos, id] }
            }
        })
    }

    // Show confirmation modal before submitting
    const handleShowConfirmation = (e: React.FormEvent) => {
        e.preventDefault()

        // Check if required steps (1, 2, 3) are completed
        const requiredSteps = [1, 2, 3]
        const missingSteps = requiredSteps.filter(step => !completedSteps.has(step))

        if (missingSteps.length > 0) {
            setSaveMessage({
                type: 'error',
                text: `Mohon selesaikan Step ${missingSteps.join(', ')} terlebih dahulu`
            })
            setTimeout(() => setSaveMessage(null), 5000)
            return
        }

        // Show confirmation modal
        setShowConfirmModal(true)
    }

    const handleSubmit = async () => {
        setShowConfirmModal(false)
        setIsSubmitting(true)
        setSubmitStatus('idle')

        try {
            const formDataToSend = new FormData()

            // Add all text fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'main_image' && value) {
                    formDataToSend.append(key, value as File)
                } else if (key === 'images' && Array.isArray(value)) {
                    (value as File[]).forEach((file, index) => {
                        formDataToSend.append(`images[${index}]`, file)
                    })
                } else if (key === 'promos' || key === 'keunggulan' || key === 'fasilitas' || key === 'nearby_places' || key === 'kategori') {
                    formDataToSend.append(key, JSON.stringify(value))
                } else if (typeof value === 'boolean') {
                    formDataToSend.append(key, value ? '1' : '0')
                } else if (value !== null && value !== '') {
                    formDataToSend.append(key, String(value))
                }
            })

            // Submit to API using Inertia
            router.post('/agent/dashboard/upload-listing', formDataToSend, {
                forceFormData: true,
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

    // Render current step content
    const renderStepContent = () => {
        const currentStepInfo = STEPS.find(s => s.id === currentStep)
        const isCurrentStepCompleted = completedSteps.has(currentStep)

        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Step Header */}
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[#0C1C3C] flex items-center gap-2">
                            {currentStepInfo && <currentStepInfo.icon className="w-6 h-6 text-[#C5A847]" />}
                            {currentStepInfo?.title}
                            {isCurrentStepCompleted && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <Check className="w-3 h-3 mr-1" />
                                    Tersimpan
                                </span>
                            )}
                        </h2>
                        <p className="text-gray-500 mt-1">{currentStepInfo?.subtitle}</p>
                    </div>
                </div>

                {/* Step Content */}
                <div className="space-y-6">
                    {currentStep === 1 && (
                        <>
                            <FormInput
                                label="Nama Properti"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Nuansa Bukit Bitung"
                                required
                                error={errors.name}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormSelect
                                    label="Provinsi"
                                    name="provinsi"
                                    value={formData.provinsi}
                                    onChange={handleProvinceChange}
                                    options={provinceOptions}
                                    placeholder="Pilih Provinsi"
                                    required
                                />
                                <FormSelect
                                    label="Kota / Kabupaten"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    options={cities}
                                    placeholder={loadingCities ? "Memuat kota..." : "Pilih Kota"}
                                    disabled={!formData.provinsi || loadingCities}
                                    required
                                    helpText={!formData.provinsi ? "Pilih provinsi terlebih dahulu" : ""}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Lokasi Detail"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Ciawi, Kab. Bogor"
                                    required
                                    error={errors.location}
                                />
                                <FormInput
                                    label="URL Google Maps"
                                    name="url_maps"
                                    value={formData.url_maps}
                                    onChange={handleInputChange}
                                    placeholder="https://maps.google.com/..."
                                />
                            </div>

                            {agent.developer_id && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Sisa Unit"
                                        name="units_remaining"
                                        value={formData.units_remaining}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="Total unit tersedia"
                                    />

                                    <FormSelect
                                        label="Developer"
                                        name="developer_id"
                                        value={formData.developer_id}
                                        onChange={handleInputChange}
                                        options={developers.map(d => ({ value: d.id.toString(), label: d.name }))}
                                        placeholder="Pilih Developer"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-[#0C1C3C] text-sm font-medium">
                                    Kategori Properti
                                </label>
                                <div className="border border-[#DCDEDD] rounded-[16px] p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {categories.length > 0 ? (
                                            categories.map((category) => (
                                                <button
                                                    key={category.id}
                                                    type="button"
                                                    onClick={() => handleCategoryChange(String(category.id))}
                                                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${formData.kategori.includes(String(category.id))
                                                        ? 'bg-[#276874] text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {category.name}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm">Tidak ada kategori tersedia</p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-500 text-xs">Pilih satu atau lebih kategori untuk properti ini</p>
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <>
                            {/* Price Section */}
                            <div className="grid grid-cols-1 gap-4">
                                <FormInputCurrency
                                    label="Harga Properti"
                                    name="price_min"
                                    value={formData.price_min}
                                    onChange={handleCurrencyChange}
                                    placeholder="2.000.000.000"
                                    prefix="Rp"
                                    required
                                    error={errors.price_min}
                                />
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
                                <p className="text-gray-600 text-sm mb-4">
                                    Pilih keunggulan properti Anda untuk menarik calon pembeli. (Opsional)
                                </p>

                                {keunggulanList.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {keunggulanList.map((item) => {
                                            const isSelected = formData.keunggulan.includes(item.id)
                                            const IconComponent = getIconByName(item.icon)

                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => toggleKeunggulan(item.id)}
                                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${isSelected
                                                        ? 'border-[#C5A847] bg-[#C5A847]/10 text-[#0C1C3C]'
                                                        : 'border-[#DCDEDD] bg-white hover:border-[#C5A847]/50 text-gray-700'
                                                        }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#C5A847] text-white' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="font-medium">{item.nama}</span>
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 text-[#C5A847]" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Tidak ada keunggulan tersedia</p>
                                    </div>
                                )}

                                {formData.keunggulan.length > 0 && (
                                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm text-green-700">
                                            <Check className="w-4 h-4 inline mr-1" />
                                            {formData.keunggulan.length} keunggulan dipilih
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Separator */}
                            <hr className="border-[#DCDEDD] my-6" />

                            {/* Fasilitas Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <Building2 className="w-5 h-5 text-[#C5A847]" />
                                    <h3 className="font-semibold text-[#0C1C3C]">Fasilitas Properti</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Pilih fasilitas yang tersedia di properti Anda. (Opsional)
                                </p>

                                {fasilitasList.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {fasilitasList.map((item) => {
                                            const isSelected = formData.fasilitas.includes(item.id)
                                            const IconComponent = getIconByName(item.icon)

                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => toggleFasilitas(item.id)}
                                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-sm ${isSelected
                                                        ? 'border-[#C5A847] bg-[#C5A847]/10 text-[#0C1C3C]'
                                                        : 'border-[#DCDEDD] bg-white hover:border-[#C5A847]/50 text-gray-700'
                                                        }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#C5A847] text-white' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <span className="font-medium">{item.nama}</span>
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 text-[#C5A847]" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Tidak ada fasilitas tersedia</p>
                                    </div>
                                )}

                                {formData.fasilitas.length > 0 && (
                                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm text-green-700">
                                            <Check className="w-4 h-4 inline mr-1" />
                                            {formData.fasilitas.length} fasilitas dipilih
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Separator */}
                            <hr className="border-[#DCDEDD] my-6" />

                            {/* Nearby Places Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin className="w-5 h-5 text-[#C5A847]" />
                                    <h3 className="font-semibold text-[#0C1C3C]">Lokasi Terdekat</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Masukkan daftar tempat penting di sekitar properti Anda. (Opsional)
                                </p>

                                {formData.nearby_places.map((item, index) => (
                                    <div key={index} className="border border-[#DCDEDD] rounded-[16px] p-4 mb-3">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <GripVertical className="w-4 h-4" />
                                                <span className="text-sm font-medium text-[#0C1C3C]">Lokasi Terdekat {index + 1}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeNearbyPlace(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormInput
                                                label="Nama Tempat / Lokasi"
                                                name={`nearby-nama-${index}`}
                                                value={item.nama}
                                                onChange={(e) => updateNearbyPlace(index, 'nama', e.target.value)}
                                                placeholder="e.g., Gerbang Tol Ciawi"
                                                required
                                            />
                                            <FormSelect
                                                label="Kategori"
                                                name={`nearby-kategori-${index}`}
                                                value={item.kategori}
                                                onChange={(e) => updateNearbyPlace(index, 'kategori', e.target.value)}
                                                options={kategoriPlacesList.map(k => ({ value: k.nama, label: k.nama }))}
                                                placeholder="Pilih Kategori"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addNearbyPlace}
                                    className="w-full py-3 border-2 border-dashed border-[#DCDEDD] rounded-[16px] text-gray-600 font-medium hover:border-[#C5A847] hover:text-[#C5A847] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Tambahkan Lokasi Terdekat
                                </button>

                                {formData.nearby_places.length > 0 && (
                                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm text-green-700">
                                            <Check className="w-4 h-4 inline mr-1" />
                                            {formData.nearby_places.length} lokasi ditambahkan
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {currentStep === 3 && (
                        <>
                            {/* Bedrooms, Bathrooms, Carport - 3 columns */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormInput
                                    label="Bedrooms"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleInputChange}
                                    type="number"
                                    placeholder="2"
                                    suffix="KT"
                                    required
                                    error={errors.bedrooms}
                                />
                                <FormInput
                                    label="Bathrooms"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleInputChange}
                                    type="number"
                                    placeholder="1"
                                    suffix="KM"
                                />
                                <FormInput
                                    label="Carport"
                                    name="carport"
                                    value={formData.carport}
                                    onChange={handleInputChange}
                                    type="number"
                                    placeholder="1"
                                    suffix="Unit"
                                />
                            </div>

                            {/* Daya Listrik, Sumber Air, Kondisi Properti - 3 columns */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormSelect
                                    label="Daya Listrik (VA)"
                                    name="listrik"
                                    value={formData.listrik}
                                    onChange={handleInputChange}
                                    options={listrikOptions}
                                    placeholder="Pilih daya listrik"
                                />
                                <FormSelect
                                    label="Sumber Air"
                                    name="jenis_air"
                                    value={formData.jenis_air}
                                    onChange={handleInputChange}
                                    options={jenisAirOptions}
                                    placeholder="Pilih sumber air"
                                />
                                <FormSelect
                                    label="Kondisi Properti"
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleInputChange}
                                    options={conditionOptions}
                                    placeholder="Pilih kondisi"
                                    required
                                />
                            </div>

                            {/* Certificate Type */}
                            <FormSelect
                                label="Certificate Type"
                                name="certificate_type"
                                value={formData.certificate_type}
                                onChange={handleInputChange}
                                options={certificateOptions}
                                placeholder="Select certificate type"
                            />

                            {/* Land Size */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Land Size Min"
                                    name="land_size_min"
                                    value={formData.land_size_min}
                                    onChange={handleInputChange}
                                    type="number"
                                    placeholder="120"
                                    suffix="m²"
                                    required
                                    error={errors.land_size_min}
                                />
                                <FormInput
                                    label="Land Size Max"
                                    name="land_size_max"
                                    value={formData.land_size_max}
                                    onChange={handleInputChange}
                                    type="number"
                                    placeholder="123"
                                    suffix="m²"
                                />
                            </div>

                            {/* Building Size */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label="Building Size Min"
                                    name="building_size_min"
                                    value={formData.building_size_min}
                                    onChange={handleInputChange}
                                    type="number"
                                    placeholder="45"
                                    suffix="m²"
                                    required
                                    error={errors.building_size_min}
                                />
                                <FormInput
                                    label="Building Size Max"
                                    name="building_size_max"
                                    value={formData.building_size_max}
                                    onChange={handleInputChange}
                                    type="number"
                                    placeholder="80"
                                    suffix="m²"
                                />
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
                                    <label className="block text-gray-500 text-sm mb-3">
                                        Apakah properti ini memiliki promo aktif?
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => togglePromoActive(true)}
                                            className={`flex-1 py-3 px-4 rounded-[12px] border flex items-center justify-center gap-2 transition-all duration-200 ${formData.has_promo_active
                                                ? 'border-[#C5A847] bg-[#FFF9E6] text-[#C5A847] ring-1 ring-[#C5A847]'
                                                : 'border-[#DCDEDD] hover:border-gray-400 text-gray-600'
                                                }`}
                                        >
                                            <CheckCircle className={`w-5 h-5 ${formData.has_promo_active ? 'opacity-100' : 'opacity-0'}`} />
                                            <span className="font-medium">Ya, Ada Promo</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => togglePromoActive(false)}
                                            className={`flex-1 py-3 px-4 rounded-[12px] border flex items-center justify-center gap-2 transition-all duration-200 ${!formData.has_promo_active
                                                ? 'border-gray-400 bg-gray-50 text-gray-800 ring-1 ring-gray-400'
                                                : 'border-[#DCDEDD] hover:border-gray-400 text-gray-600'
                                                }`}
                                        >
                                            <span className="font-medium">Tidak Ada</span>
                                        </button>
                                    </div>
                                </div>

                                {formData.has_promo_active && (
                                    <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <h4 className="font-medium text-[#0C1C3C] mb-3">Pilih Promo Tersedia</h4>
                                        {promosList && promosList.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {promosList.map((promo) => (
                                                    <div
                                                        key={promo.id}
                                                        onClick={() => togglePromoId(promo.id)}
                                                        className={`cursor-pointer p-4 rounded-[12px] border flex items-center justify-between transition-all duration-200 group ${formData.promos.includes(promo.id)
                                                            ? 'border-[#C5A847] bg-[#FFF9E6] shadow-sm'
                                                            : 'border-[#DCDEDD] hover:border-[#C5A847] hover:bg-yellow-50/50'
                                                            }`}
                                                    >
                                                        <span className={`font-medium ${formData.promos.includes(promo.id) ? 'text-[#0C1C3C]' : 'text-gray-600 group-hover:text-[#0C1C3C]'}`}>
                                                            {promo.nama}
                                                        </span>
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.promos.includes(promo.id)
                                                            ? 'border-[#C5A847] bg-[#C5A847]'
                                                            : 'border-gray-300 group-hover:border-[#C5A847]'
                                                            }`}>
                                                            {formData.promos.includes(promo.id) && (
                                                                <Check className="w-3 h-3 text-white" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-gray-50 rounded-[12px] border border-dashed border-gray-300">
                                                <p className="text-gray-500 text-sm">Belum ada data promo tersedia.</p>
                                            </div>
                                        )}
                                        {errors.promos && (
                                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-in slide-in-from-top-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.promos}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-[#0C1C3C] text-sm font-medium">
                                        Tentang Property
                                    </label>
                                    <div>
                                        <Editor
                                            value={formData.promo_text}
                                            onTextChange={(e) => {
                                                const htmlValue = e.htmlValue || '';
                                                // Sanitize - strip script tags and dangerous attributes
                                                const sanitized = htmlValue
                                                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                                    .replace(/javascript:/gi, '')
                                                    .replace(/on\w+\s*=/gi, '')
                                                    .replace(/eval\(/gi, '')
                                                    .replace(/expression\(/gi, '');

                                                // Limit to 2000 characters (plain text)
                                                const textContent = e.textValue || '';
                                                if (textContent.length <= 2000) {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        promo_text: sanitized
                                                    }));
                                                }
                                            }}
                                            style={{ height: '320px' }}
                                            placeholder="Deskripsikan properti Anda secara detail. Ceritakan tentang keunggulan lokasi, fasilitas sekitar, dan hal menarik lainnya..."
                                            headerTemplate={
                                                <span className="ql-formats">
                                                    <button className="ql-bold" aria-label="Bold"></button>
                                                    <button className="ql-italic" aria-label="Italic"></button>
                                                    <button className="ql-underline" aria-label="Underline"></button>
                                                    <select className="ql-color" aria-label="Text Color"></select>
                                                    <select className="ql-background" aria-label="Background Color"></select>
                                                    <button className="ql-list" value="ordered" aria-label="Ordered List"></button>
                                                    <button className="ql-list" value="bullet" aria-label="Bullet List"></button>
                                                    <select className="ql-align" aria-label="Text Align"></select>
                                                </span>
                                            }
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-gray-500 text-xs">
                                            Deskripsi detail tentang properti ini. Maksimal 2000 karakter.
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            {(() => {
                                                // Strip HTML tags to count actual text characters
                                                const div = document.createElement('div');
                                                div.innerHTML = formData.promo_text;
                                                const textContent = div.textContent || div.innerText || '';
                                                return textContent.length;
                                            })()}/2000
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Separator */}
                            <hr className="border-[#DCDEDD] my-6" />

                            {/* Images Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Image className="w-5 h-5 text-[#C5A847]" />
                                    <h3 className="font-semibold text-[#0C1C3C]">Gambar Properti</h3>
                                </div>
                                <p className="text-gray-600 text-sm mb-4">
                                    Upload gambar properti untuk ditampilkan di halaman listing.
                                </p>

                                <div className="space-y-6">
                                    <FileUpload
                                        label="Gambar Utama"
                                        onFilesChange={(files) => setFormData(prev => ({ ...prev, main_image: files[0] || null }))}
                                        files={formData.main_image ? [formData.main_image] : []}
                                        multiple={false}
                                        helpText="Upload 1 gambar utama untuk ditampilkan di halaman listing"
                                    />

                                    <FileUpload
                                        label="Galeri Gambar"
                                        onFilesChange={(files) => setFormData(prev => ({ ...prev, images: files }))}
                                        files={formData.images}
                                        multiple
                                        maxFiles={10}
                                        helpText="Upload hingga 10 gambar untuk galeri properti"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <DashboardAgentLayout agent={agent} title="Upload Listing" activeMenu="upload-listing">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-[#0C1C3C] text-2xl md:text-3xl font-bold mb-1">
                        Upload Listing Properti
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">
                        Tambahkan properti baru untuk dipasarkan
                    </p>
                </div>
                <div className="text-sm text-gray-500">
                    <span className="font-medium text-[#C5A847]">{completedSteps.size}</span> dari {STEPS.length} step selesai
                </div>
            </div>

            {/* Success/Error Alert */}
            {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-[16px] flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">Properti berhasil ditambahkan!</p>
                </div>
            )}

            {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[16px] flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-red-800 font-medium">Terjadi kesalahan. Silakan periksa kembali formulir Anda.</p>
                        {Object.keys(errors).length > 0 && (
                            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                {Object.entries(errors).map(([field, message]) => (
                                    <li key={field}>{message}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Save Message Toast */}
            {saveMessage && (
                <div className={`mb-6 p-4 rounded-[16px] flex items-center gap-3 transition-all duration-300 ${saveMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                    }`}>
                    {saveMessage.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <p className={saveMessage.type === 'success' ? 'text-green-800 font-medium' : 'text-red-800 font-medium'}>
                        {saveMessage.text}
                    </p>
                </div>
            )}

            {/* Form Container */}
            <div className="bg-white rounded-[20px] border border-[#DCDEDD] p-6 md:p-8">
                {/* Step Indicator - Clickable */}
                <StepIndicator
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    onStepClick={handleStepClick}
                />

                <form onSubmit={handleShowConfirmation}>
                    {/* Step Content */}
                    {renderStepContent()}

                    {/* Navigation Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                onClick={handleBack}
                                variant="outline"
                                className="flex-1 sm:flex-none h-12 rounded-[16px] border-[#DCDEDD] bg-white text-[#0C1C3C] hover:bg-gray-100 hover:text-[#0C1C3C] hover:border-[#DCDEDD] flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Kembali
                            </Button>
                        )}

                        <div className="flex-1 flex justify-end gap-3">
                            <Button
                                type="button"
                                onClick={() => router.visit('/agent/dashboard')}
                                variant="outline"
                                className="h-12 rounded-[16px] px-6 border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-400"
                            >
                                Batal
                            </Button>

                            {/* Next Step / Submit Button */}
                            {currentStep < STEPS.length ? (
                                <Button
                                    type="button"
                                    onClick={handleSaveStep}
                                    disabled={isSavingStep}
                                    className="h-12 rounded-[16px] px-6 bg-[#0C1C3C] text-white hover:bg-[#0a1730] flex items-center gap-2"
                                >
                                    {isSavingStep ? 'Menyimpan...' : 'Next Step'}
                                    <ArrowRight className="w-5 h-5 text-white" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-12 rounded-[16px] px-6 bg-[#C5A847] text-white hover:bg-[#B09530] flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Upload Listing'}
                                    {!isSubmitting && <CheckCircle className="w-5 h-5 text-white" />}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#0C1C3C] to-[#1a3a5c] px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Konfirmasi Listing</h2>
                                <p className="text-gray-300 text-sm">Periksa kembali detail listing sebelum mengajukan</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                            {/* Step 1: Basic Information */}
                            {(formData.name || formData.provinsi || formData.city || formData.location) && (
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Info className="w-5 h-5 text-[#C5A847]" />
                                        <h3 className="font-semibold text-[#0C1C3C]">Informasi Dasar</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        {formData.name && (
                                            <div>
                                                <span className="text-gray-500">Nama Properti:</span>
                                                <p className="font-medium text-[#0C1C3C]">{formData.name}</p>
                                            </div>
                                        )}
                                        {formData.provinsi && (
                                            <div>
                                                <span className="text-gray-500">Provinsi:</span>
                                                <p className="font-medium text-[#0C1C3C]">{provinceOptions.find(p => p.value === formData.provinsi)?.label || formData.provinsi}</p>
                                            </div>
                                        )}
                                        {formData.city && (
                                            <div>
                                                <span className="text-gray-500">Kota/Kabupaten:</span>
                                                <p className="font-medium text-[#0C1C3C]">{cities.find(c => c.value === formData.city)?.label || formData.city}</p>
                                            </div>
                                        )}
                                        {formData.location && (
                                            <div>
                                                <span className="text-gray-500">Lokasi Detail:</span>
                                                <p className="font-medium text-[#0C1C3C]">{formData.location}</p>
                                            </div>
                                        )}
                                        {formData.units_remaining && (
                                            <div>
                                                <span className="text-gray-500">Sisa Unit:</span>
                                                <p className="font-medium text-[#0C1C3C]">{formData.units_remaining}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Pricing */}
                            {formData.price_min && (
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <DollarSign className="w-5 h-5 text-[#C5A847]" />
                                        <h3 className="font-semibold text-[#0C1C3C]">Harga</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 text-sm">
                                        {formData.price_min && (
                                            <div>
                                                <span className="text-gray-500">Harga:</span>
                                                <p className="font-medium text-[#0C1C3C]">Rp {Number(formData.price_min).toLocaleString('id-ID')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Property Specifications */}
                            {(formData.bedrooms || formData.bathrooms || formData.land_size_min || formData.building_size_min) && (
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Home className="w-5 h-5 text-[#C5A847]" />
                                        <h3 className="font-semibold text-[#0C1C3C]">Spesifikasi Properti</h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        {formData.bedrooms && (
                                            <div>
                                                <span className="text-gray-500">Kamar Tidur:</span>
                                                <p className="font-medium text-[#0C1C3C]">{formData.bedrooms}</p>
                                            </div>
                                        )}
                                        {formData.bathrooms && (
                                            <div>
                                                <span className="text-gray-500">Kamar Mandi:</span>
                                                <p className="font-medium text-[#0C1C3C]">{formData.bathrooms}</p>
                                            </div>
                                        )}
                                        {formData.carport && (
                                            <div>
                                                <span className="text-gray-500">Carport:</span>
                                                <p className="font-medium text-[#0C1C3C]">{formData.carport}</p>
                                            </div>
                                        )}
                                        {formData.certificate_type && (
                                            <div>
                                                <span className="text-gray-500">Sertifikat:</span>
                                                <p className="font-medium text-[#0C1C3C]">{formData.certificate_type}</p>
                                            </div>
                                        )}
                                        {formData.land_size_min && (
                                            <div>
                                                <span className="text-gray-500">Luas Tanah:</span>
                                                <p className="font-medium text-[#0C1C3C]">{formData.land_size_min}{formData.land_size_max ? ` - ${formData.land_size_max}` : ''} m²</p>
                                            </div>
                                        )}
                                        {formData.building_size_min && (
                                            <div>
                                                <span className="text-gray-500">Luas Bangunan:</span>
                                                <p className="font-medium text-[#0C1C3C]">{formData.building_size_min}{formData.building_size_max ? ` - ${formData.building_size_max}` : ''} m²</p>
                                            </div>
                                        )}
                                        {formData.listrik && (
                                            <div>
                                                <span className="text-gray-500">Daya Listrik:</span>
                                                <p className="font-medium text-[#0C1C3C]">{formData.listrik} VA</p>
                                            </div>
                                        )}
                                        {formData.condition && (
                                            <div>
                                                <span className="text-gray-500">Kondisi:</span>
                                                <p className="font-medium text-[#0C1C3C]">{formData.condition}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Keunggulan & Fasilitas */}
                            {(formData.keunggulan.length > 0 || formData.fasilitas.length > 0 || formData.nearby_places.length > 0) && (
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Star className="w-5 h-5 text-[#C5A847]" />
                                        <h3 className="font-semibold text-[#0C1C3C]">Keunggulan & Fasilitas</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        {formData.keunggulan.length > 0 && (
                                            <div>
                                                <span className="text-gray-500">Keunggulan:</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {formData.keunggulan.map(id => {
                                                        const item = keunggulanList.find(k => k.id === id)
                                                        return item ? (
                                                            <span key={id} className="px-2 py-1 bg-[#C5A847]/10 text-[#C5A847] rounded-full text-xs font-medium">
                                                                {item.nama}
                                                            </span>
                                                        ) : null
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {formData.fasilitas.length > 0 && (
                                            <div>
                                                <span className="text-gray-500">Fasilitas:</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {formData.fasilitas.map(id => {
                                                        const item = fasilitasList.find(f => f.id === id)
                                                        return item ? (
                                                            <span key={id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                                {item.nama}
                                                            </span>
                                                        ) : null
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {formData.nearby_places.length > 0 && (
                                            <div>
                                                <span className="text-gray-500">Lokasi Terdekat:</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {formData.nearby_places.map((place, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                            {place.nama} ({place.kategori})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Marketing & Images */}
                            {(formData.promo_text || formData.main_image || formData.images.length > 0) && (
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Megaphone className="w-5 h-5 text-[#C5A847]" />
                                        <h3 className="font-semibold text-[#0C1C3C]">Marketing & Gambar</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        {formData.has_promo_active && formData.promos.length > 0 && (
                                            <div>
                                                <span className="text-gray-500">Promo Aktif:</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {formData.promos.map(id => {
                                                        const promo = promosList.find(p => p.id === id)
                                                        return promo ? (
                                                            <span key={id} className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">
                                                                {promo.nama}
                                                            </span>
                                                        ) : null
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {formData.promo_text && (
                                            <div>
                                                <span className="text-gray-500">Tentang Property:</span>
                                                <div
                                                    className="mt-1 p-2 bg-gray-50 rounded-lg text-[#0C1C3C] text-xs max-h-24 overflow-y-auto prose prose-sm"
                                                    dangerouslySetInnerHTML={{ __html: formData.promo_text }}
                                                />
                                            </div>
                                        )}
                                        {(formData.main_image || formData.images.length > 0) && (
                                            <div>
                                                <span className="text-gray-500">Gambar: </span>
                                                <span className="font-medium text-[#0C1C3C]">
                                                    {formData.main_image ? '1 gambar utama' : ''}{formData.images.length > 0 ? `, ${formData.images.length} gambar galeri` : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Notice */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-amber-800">Perhatian</p>
                                    <p className="text-amber-700 mt-1">
                                        Listing Anda akan diajukan ke admin untuk direview. Setelah disetujui, listing akan tampil di halaman publik.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                            <Button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                variant="outline"
                                className="h-11 rounded-xl px-6 border-gray-300"
                            >
                                Kembali Edit
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="h-11 rounded-xl px-6 bg-[#C5A847] text-white hover:bg-[#B09530] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Mengajukan...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Ajukan Listing
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardAgentLayout>
    )
}
