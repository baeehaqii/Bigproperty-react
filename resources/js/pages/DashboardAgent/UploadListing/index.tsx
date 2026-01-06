"use client"

import { useState, useCallback, useEffect } from "react"
import { router } from "@inertiajs/react"
import {
    Info,
    DollarSign,
    Home,
    Star,
    Building2,
    MapPin,
    Megaphone,
    Image,
    Settings,
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
    GripVertical,
    Upload as UploadIcon,
    X,
    AlertCircle,
    CheckCircle,
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
}

interface Keunggulan {
    icon: string
    nama: string
    keterangan: string
}

interface Fasilitas {
    icon: string
    nama: string
}

interface NearestPlace {
    kategori: string
    nama: string
    jarak: string
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

    // Price & Financing
    price_min: string
    price_max: string
    installment_start: string

    // Property Specifications
    bedrooms: string
    bathrooms: string
    carport: string
    listrik: string
    certificate_type: string
    land_size_min: string
    land_size_max: string
    building_size_min: string
    building_size_max: string
    market_type: string
    construction_status: string

    // Keunggulan
    keunggulan: Keunggulan[]

    // Fasilitas
    fasilitas: Fasilitas[]

    // Nearest Places
    nearest_place: NearestPlace[]

    // Marketing & Promotion
    promo_text: string

    // Images
    main_image: File | null
    images: File[]

    // Status & Settings
    button_type: string
    is_available: boolean
    is_popular: boolean
}

// Icon options for facilities and keunggulan
const iconOptions = [
    'Home', 'Building2', 'Car', 'Wifi', 'Dumbbell', 'Trees', 'Shield',
    'Camera', 'SwimmingPool', 'UtensilsCrossed', 'ShoppingBag', 'GraduationCap',
    'Stethoscope', 'Bus', 'Plane', 'Train', 'Church', 'Landmark', 'MapPin'
]

// Certificate type options
const certificateOptions = [
    { value: 'SHM', label: 'SHM (Sertifikat Hak Milik)' },
    { value: 'SHGB', label: 'SHGB (Sertifikat Hak Guna Bangunan)' },
    { value: 'HGB', label: 'HGB (Hak Guna Bangunan)' },
    { value: 'Girik', label: 'Girik' },
    { value: 'AJB', label: 'AJB (Akta Jual Beli)' },
    { value: 'PPJB', label: 'PPJB (Perjanjian Pengikatan Jual Beli)' },
    { value: 'Strata Title', label: 'Strata Title' },
]

// Button type options
const buttonTypeOptions = [
    { value: 'view_details', label: 'View Details' },
    { value: 'contact_agent', label: 'Contact Agent' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'call', label: 'Telepon' },
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
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
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
                    className={`flex-1 px-4 py-3 border border-[#DCDEDD] text-[#0C1C3C] focus:border-[#EF3F09] focus:ring-1 focus:ring-[#EF3F09] focus:outline-none transition-all duration-200 ${prefix ? 'rounded-r-[16px]' : suffix ? 'rounded-l-[16px]' : 'rounded-[16px]'
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
                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#EF3F09] focus:ring-1 focus:ring-[#EF3F09] focus:outline-none transition-all duration-200 appearance-none bg-no-repeat cursor-pointer pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#EF3F09] focus:ring-1 focus:ring-[#EF3F09] focus:outline-none transition-all duration-200 resize-none"
            />
            {helpText && <p className="text-gray-500 text-xs">{helpText}</p>}
        </div>
    )
}

// Toggle Switch Component
function FormToggle({
    label,
    name,
    checked,
    onChange,
    helpText,
}: {
    label: string
    name: string
    checked: boolean
    onChange: (checked: boolean) => void
    helpText?: string
}) {
    return (
        <div className="space-y-2">
            <label className="block text-[#0C1C3C] text-sm font-medium">{label}</label>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[#276874]' : 'bg-gray-300'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
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
                    ? 'border-[#EF3F09] bg-orange-50'
                    : 'border-[#DCDEDD] hover:border-[#EF3F09]'
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
export default function UploadListing({ agent, developers = [], categories = [], provinces = [] }: UploadListingProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [cities, setCities] = useState<{ value: string, label: string }[]>([])
    const [loadingCities, setLoadingCities] = useState(false)
    const [provinceOptions, setProvinceOptions] = useState<{ value: string, label: string }[]>([])
    const [errors, setErrors] = useState<Record<string, string>>({})

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

        // Price & Financing
        price_min: '',
        price_max: '',
        installment_start: '',

        // Property Specifications
        bedrooms: '',
        bathrooms: '',
        carport: '',
        listrik: '',
        certificate_type: '',
        land_size_min: '',
        land_size_max: '',
        building_size_min: '',
        building_size_max: '',
        market_type: 'primary',
        construction_status: 'ready',

        // Keunggulan
        keunggulan: [],

        // Fasilitas
        fasilitas: [],

        // Nearest Places
        nearest_place: [],

        // Marketing & Promotion
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

    // Handle province change and load cities
    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provinceId = e.target.value
        const provinceName = provinceOptions.find(p => p.value === provinceId)?.label || ''

        setFormData(prev => ({
            ...prev,
            provinsi: provinceId, // Storing code/ID
            // You might want to store the name if the backend expects it, or just the ID. 
            // The prompt implies passing data to Laravel.
            city: ''
        }))

        if (provinceId) {
            setLoadingCities(true)
            try {
                const response = await fetch(`/api/wilayah/cities/${provinceId}`)
                const data = await response.json()
                if (data.data) {
                    const formatted = data.data.map((c: any) => ({
                        value: c.code,
                        label: c.name
                    }))
                    setCities(formatted)
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

    // Handle keunggulan (advantages)
    const addKeunggulan = () => {
        setFormData(prev => ({
            ...prev,
            keunggulan: [...prev.keunggulan, { icon: 'Home', nama: '', keterangan: '' }]
        }))
    }

    const updateKeunggulan = (index: number, field: keyof Keunggulan, value: string) => {
        setFormData(prev => {
            const updated = [...prev.keunggulan]
            updated[index] = { ...updated[index], [field]: value }
            return { ...prev, keunggulan: updated }
        })
    }

    const removeKeunggulan = (index: number) => {
        setFormData(prev => ({
            ...prev,
            keunggulan: prev.keunggulan.filter((_, i) => i !== index)
        }))
    }

    // Handle fasilitas (facilities)
    const addFasilitas = () => {
        setFormData(prev => ({
            ...prev,
            fasilitas: [...prev.fasilitas, { icon: 'Home', nama: '' }]
        }))
    }

    const updateFasilitas = (index: number, field: keyof Fasilitas, value: string) => {
        setFormData(prev => {
            const updated = [...prev.fasilitas]
            updated[index] = { ...updated[index], [field]: value }
            return { ...prev, fasilitas: updated }
        })
    }

    const removeFasilitas = (index: number) => {
        setFormData(prev => ({
            ...prev,
            fasilitas: prev.fasilitas.filter((_, i) => i !== index)
        }))
    }

    // Handle nearest places
    const addNearestPlace = () => {
        setFormData(prev => ({
            ...prev,
            nearest_place: [...prev.nearest_place, { kategori: '', nama: '', jarak: '' }]
        }))
    }

    const updateNearestPlace = (index: number, field: keyof NearestPlace, value: string) => {
        setFormData(prev => {
            const updated = [...prev.nearest_place]
            updated[index] = { ...updated[index], [field]: value }
            return { ...prev, nearest_place: updated }
        })
    }

    const removeNearestPlace = (index: number) => {
        setFormData(prev => ({
            ...prev,
            nearest_place: prev.nearest_place.filter((_, i) => i !== index)
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

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
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
                } else if (key === 'keunggulan' || key === 'fasilitas' || key === 'nearest_place' || key === 'kategori') {
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

    // Mock data for provinces (replace with actual API data)
    const mockProvinces = [
        { value: 'dki_jakarta', label: 'DKI Jakarta' },
        { value: 'jawa_barat', label: 'Jawa Barat' },
        { value: 'banten', label: 'Banten' },
        { value: 'jawa_tengah', label: 'Jawa Tengah' },
        { value: 'jawa_timur', label: 'Jawa Timur' },
        { value: 'yogyakarta', label: 'DI Yogyakarta' },
    ]

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

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Basic Information */}
                        <CollapsibleSection
                            title="Basic Information"
                            subtitle="Property basic details and identification"
                            icon={Info}
                        >
                            <div className="pt-6 space-y-4">
                                <FormInput
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Nuansa Bukit Bitung"
                                    required
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormSelect
                                        label="Province"
                                        name="provinsi"
                                        value={formData.provinsi}
                                        onChange={handleProvinceChange}
                                        options={provinceOptions}
                                        placeholder="Select Province"
                                        required
                                    />
                                    <FormSelect
                                        label="City / Regency"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        options={cities}
                                        placeholder={loadingCities ? "Loading cities..." : "Select City"}
                                        disabled={!formData.provinsi || loadingCities}
                                        required
                                        helpText={!formData.provinsi ? "Please select a province first" : ""}
                                    />
                                </div>

                                <FormInput
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Ciawi, Kab. Bogor"
                                    required
                                />

                                <FormInput
                                    label="Google Maps URL"
                                    name="url_maps"
                                    value={formData.url_maps}
                                    onChange={handleInputChange}
                                    placeholder="https://maps.google.com/..."
                                />
                                {agent.developer_id && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput
                                            label="Units Remaining"
                                            name="units_remaining"
                                            value={formData.units_remaining}
                                            onChange={handleInputChange}
                                            type="number"
                                            placeholder="Total units available"
                                        />

                                        <FormSelect
                                            label="Developer"
                                            name="developer_id"
                                            value={formData.developer_id}
                                            onChange={handleInputChange}
                                            options={developers.map(d => ({ value: d.id.toString(), label: d.name }))}
                                            placeholder="Select Developer"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-[#0C1C3C] text-sm font-medium">
                                        Property Categories
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
                                                <p className="text-gray-500 text-sm">No categories available</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-xs">Select one or more categories for this property</p>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Property Specifications */}
                        <CollapsibleSection
                            title="Property Specifications"
                            subtitle="Detailed property specifications"
                            icon={Home}
                        >
                            <div className="pt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput
                                        label="Bedrooms"
                                        name="bedrooms"
                                        value={formData.bedrooms}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="2"
                                        suffix="KT"
                                        required
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
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput
                                        label="Carport"
                                        name="carport"
                                        value={formData.carport}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="1"
                                    />
                                    <FormInput
                                        label="Listrik"
                                        name="listrik"
                                        value={formData.listrik}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="1300"
                                        suffix="watt"
                                    />
                                </div>

                                <FormSelect
                                    label="Certificate Type"
                                    name="certificate_type"
                                    value={formData.certificate_type}
                                    onChange={handleInputChange}
                                    options={certificateOptions}
                                    placeholder="Select certificate type"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput
                                        label="Land Size Min"
                                        name="land_size_min"
                                        value={formData.land_size_min}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="60"
                                        suffix="m²"
                                        required
                                    />
                                    <FormInput
                                        label="Land Size Max"
                                        name="land_size_max"
                                        value={formData.land_size_max}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="155"
                                        suffix="m²"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput
                                        label="Building Size Min"
                                        name="building_size_min"
                                        value={formData.building_size_min}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="38"
                                        suffix="m²"
                                        required
                                    />
                                    <FormInput
                                        label="Building Size Max"
                                        name="building_size_max"
                                        value={formData.building_size_max}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="70"
                                        suffix="m²"
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* Fasilitas */}
                        <CollapsibleSection
                            title="Fasilitas"
                            subtitle="Property facilities and amenities"
                            icon={Building2}
                            defaultOpen={false}
                        >
                            <div className="pt-6 space-y-4">
                                <label className="block text-[#0C1C3C] text-sm font-medium">Fasilitas</label>

                                {formData.fasilitas.map((item, index) => (
                                    <div key={index} className="border border-[#DCDEDD] rounded-[16px] p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFasilitas(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormSelect
                                                label="Icon"
                                                name={`fasilitas-icon-${index}`}
                                                value={item.icon}
                                                onChange={(e) => updateFasilitas(index, 'icon', e.target.value)}
                                                options={iconOptions.map(icon => ({ value: icon, label: icon }))}
                                                required
                                                helpText="Pilih icon dari Heroicons"
                                            />
                                            <FormInput
                                                label="Nama Fasilitas"
                                                name={`fasilitas-nama-${index}`}
                                                value={item.nama}
                                                onChange={(e) => updateFasilitas(index, 'nama', e.target.value)}
                                                placeholder="e.g., Kolam Renang"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addFasilitas}
                                    className="w-full py-3 border-2 border-dashed border-[#DCDEDD] rounded-[16px] text-gray-600 font-medium hover:border-[#EF3F09] hover:text-[#EF3F09] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Tambahkan ke fasilitas
                                </button>
                            </div>
                        </CollapsibleSection>

                        {/* Nearest Places */}
                        <CollapsibleSection
                            title="Nearest Places"
                            subtitle="Nearby locations and distances"
                            icon={MapPin}
                            defaultOpen={false}
                        >
                            <div className="pt-6 space-y-4">
                                <label className="block text-[#0C1C3C] text-sm font-medium">Nearest place</label>

                                {formData.nearest_place.map((item, index) => (
                                    <div key={index} className="border border-[#DCDEDD] rounded-[16px] p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeNearestPlace(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <FormSelect
                                                label="Kategori"
                                                name={`nearest-kategori-${index}`}
                                                value={item.kategori}
                                                onChange={(e) => updateNearestPlace(index, 'kategori', e.target.value)}
                                                options={nearestPlaceCategories.map(c => ({ value: c.value, label: c.label }))}
                                                placeholder="Pilih kategori tempat"
                                                required
                                            />
                                            <FormInput
                                                label="Nama Tempat"
                                                name={`nearest-nama-${index}`}
                                                value={item.nama}
                                                onChange={(e) => updateNearestPlace(index, 'nama', e.target.value)}
                                                placeholder="e.g., Transmart"
                                                required
                                            />
                                            <FormInput
                                                label="Jarak"
                                                name={`nearest-jarak-${index}`}
                                                value={item.jarak}
                                                onChange={(e) => updateNearestPlace(index, 'jarak', e.target.value)}
                                                placeholder="e.g., 2.5 km atau 15 menit"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addNearestPlace}
                                    className="w-full py-3 border-2 border-dashed border-[#DCDEDD] rounded-[16px] text-gray-600 font-medium hover:border-[#EF3F09] hover:text-[#EF3F09] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Tambahkan ke nearest place
                                </button>
                            </div>
                        </CollapsibleSection>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Price & Financing */}
                        <CollapsibleSection
                            title="Price & Financing"
                            subtitle="Pricing and installment information"
                            icon={DollarSign}
                        >
                            <div className="pt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput
                                        label="Minimum Price"
                                        name="price_min"
                                        value={formData.price_min}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="732200000"
                                        prefix="Rp"
                                        required
                                        helpText="Enter in Rupiah (e.g., 732200000 for 732.2 Jt)"
                                    />
                                    <FormInput
                                        label="Maximum Price"
                                        name="price_max"
                                        value={formData.price_max}
                                        onChange={handleInputChange}
                                        type="number"
                                        placeholder="1800000000"
                                        prefix="Rp"
                                        helpText="Leave empty if same as minimum"
                                    />
                                </div>

                                <FormInput
                                    label="Starting Installment"
                                    name="installment_start"
                                    value={formData.installment_start}
                                    onChange={handleInputChange}
                                    type="number"
                                    placeholder="5000000"
                                    prefix="Rp"
                                    suffix="/month"
                                    required
                                    helpText="Monthly payment amount"
                                />
                            </div>
                        </CollapsibleSection>

                        {/* Keunggulan */}
                        <CollapsibleSection
                            title="Keunggulan"
                            subtitle="Property advantages and unique selling points"
                            icon={Star}
                            defaultOpen={false}
                        >
                            <div className="pt-6 space-y-4">
                                <label className="block text-[#0C1C3C] text-sm font-medium">Keunggulan</label>

                                {formData.keunggulan.map((item, index) => (
                                    <div key={index} className="border border-[#DCDEDD] rounded-[16px] p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeKeunggulan(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <FormSelect
                                                label="Icon"
                                                name={`keunggulan-icon-${index}`}
                                                value={item.icon}
                                                onChange={(e) => updateKeunggulan(index, 'icon', e.target.value)}
                                                options={iconOptions.map(icon => ({ value: icon, label: icon }))}
                                                required
                                                helpText="Pilih icon dari Heroicons"
                                            />
                                            <FormInput
                                                label="Nama"
                                                name={`keunggulan-nama-${index}`}
                                                value={item.nama}
                                                onChange={(e) => updateKeunggulan(index, 'nama', e.target.value)}
                                                placeholder="e.g., Lokasi Strategis"
                                                required
                                            />
                                        </div>

                                        <FormTextarea
                                            label="Keterangan"
                                            name={`keunggulan-keterangan-${index}`}
                                            value={item.keterangan}
                                            onChange={(e) => updateKeunggulan(index, 'keterangan', e.target.value)}
                                            placeholder="Dekat dengan pusat kota dan akses tol"
                                            rows={2}
                                        />
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addKeunggulan}
                                    className="w-full py-3 border-2 border-dashed border-[#DCDEDD] rounded-[16px] text-gray-600 font-medium hover:border-[#EF3F09] hover:text-[#EF3F09] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Tambahkan ke keunggulan
                                </button>
                            </div>
                        </CollapsibleSection>

                        {/* Marketing & Promotion */}
                        <CollapsibleSection
                            title="Marketing & Promotion"
                            subtitle="Promotional content and features"
                            icon={Megaphone}
                            defaultOpen={false}
                        >
                            <div className="pt-6 space-y-4">
                                <FormTextarea
                                    label="Promo Text"
                                    name="promo_text"
                                    value={formData.promo_text}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Cuma di Pinhome: Emas Batangan hingga 12gr"
                                    rows={3}
                                />
                            </div>
                        </CollapsibleSection>

                        {/* Images */}
                        <CollapsibleSection
                            title="Images"
                            subtitle="Property images and gallery"
                            icon={Image}
                        >
                            <div className="pt-6 space-y-6">
                                <FileUpload
                                    label="Main Image"
                                    onFilesChange={(files) => setFormData(prev => ({ ...prev, main_image: files[0] || null }))}
                                    files={formData.main_image ? [formData.main_image] : []}
                                    multiple={false}
                                />

                                <FileUpload
                                    label="Gallery Images"
                                    onFilesChange={(files) => setFormData(prev => ({ ...prev, images: files }))}
                                    files={formData.images}
                                    multiple
                                    maxFiles={10}
                                    helpText="Upload up to 10 images"
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                </div>

                {/* Form Actions - Sticky Bottom */}
                <div className="sticky bottom-0 bg-white border-t border-[#DCDEDD] py-4 -mx-4 md:-mx-5 px-4 md:px-5">
                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#C5A847] text-white hover:bg-[#B09530] rounded-[16px] px-6"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Upload Listing'}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => router.visit('/agent/dashboard')}
                            disabled={isSubmitting}
                            variant="outline"
                            className="bg-[#0C1C3C] text-white hover:bg-[#0a1730] rounded-[16px] px-6"
                        >
                            Batal
                        </Button>
                    </div>
                </div>
            </form>
        </DashboardAgentLayout>
    )
}
