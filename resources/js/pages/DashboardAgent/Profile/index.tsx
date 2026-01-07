"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "@inertiajs/react"
import {
    User,
    Mail,
    Phone,
    IdCard,
    Camera,
    Upload,
    Save,
    AlertCircle,
    CheckCircle2,
    X,
    Building2,
    Users,
    Briefcase,
    Globe,
    ArrowRight,
    ArrowLeft,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DashboardAgentLayout } from "../components/DashboardAgentLayout"

interface Agent {
    id: number
    name: string
    email: string
    phone: string
    photo?: string
    ktp?: string
    license_number?: string
    is_active: boolean
    is_profile_complete: boolean
    jenis_akun: 'agensi_broker' | 'agent_perorangan' | 'agent_developer'
    jenis_akun_label: string
    is_agensi_broker: boolean
    // Agensi fields
    nama_agensi?: string
    logo_agensi?: string
    email_agensi?: string
    website_agensi?: string
    // PIC fields
    nama_pic?: string
    foto_pic?: string
    ktp_pic?: string
    email_pic?: string
    wa_pic?: string
}

interface ProfilePageProps {
    agent: Agent
    flash?: {
        success?: string
        error?: string
        warning?: string
    }
}

const jenisAkunOptions = [
    {
        value: 'agensi_broker',
        label: 'Agensi / Broker',
        description: 'Untuk perusahaan atau kantor broker properti',
        icon: Building2,
    },
    {
        value: 'agent_perorangan',
        label: 'Agent Perorangan',
        description: 'Untuk agen properti independen',
        icon: User,
    },
]

export default function ProfilePage({ agent, flash }: ProfilePageProps) {
    // Refs for file inputs
    const photoInputRef = useRef<HTMLInputElement>(null)
    const ktpInputRef = useRef<HTMLInputElement>(null)
    const logoInputRef = useRef<HTMLInputElement>(null)
    const fotoPicInputRef = useRef<HTMLInputElement>(null)
    const ktpPicInputRef = useRef<HTMLInputElement>(null)

    // Step state
    const [currentStep, setCurrentStep] = useState(1)

    // Preview states
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [ktpPreview, setKtpPreview] = useState<string | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [fotoPicPreview, setFotoPicPreview] = useState<string | null>(null)
    const [ktpPicPreview, setKtpPicPreview] = useState<string | null>(null)

    // Error states
    const [fileErrors, setFileErrors] = useState<Record<string, string>>({})

    const { data, setData, post, processing, errors } = useForm({
        // Jenis akun
        jenis_akun: agent.jenis_akun || 'agent_perorangan',

        // Basic info (all types)
        name: agent.name || "",
        phone: agent.phone || "",
        license_number: agent.license_number || "",

        // For agent perorangan / developer
        photo: null as File | null,
        ktp: null as File | null,

        // Agensi/Broker specific
        nama_agensi: agent.nama_agensi || "",
        logo_agensi: null as File | null,
        email_agensi: agent.email_agensi || "",
        website_agensi: agent.website_agensi || "",

        // PIC fields (for agensi/broker)
        nama_pic: agent.nama_pic || "",
        foto_pic: null as File | null,
        ktp_pic: null as File | null,
        email_pic: agent.email_pic || "",
        wa_pic: agent.wa_pic || "",
    })

    // Calculate based on selected jenis_akun (for real-time update when user selects)
    const isAgensiBroker = data.jenis_akun === 'agensi_broker'
    const isAgensiBrokerSelected = isAgensiBroker // alias for step indicator
    const totalSteps = isAgensiBrokerSelected ? 3 : 2
    const isProfileIncomplete = !agent.is_profile_complete

    // Validate file (max 1MB)
    const validateFile = (file: File): string | null => {
        const maxSize = 1 * 1024 * 1024
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

        if (!allowedTypes.includes(file.type)) {
            return 'Format file harus JPG, PNG, atau WebP'
        }
        if (file.size > maxSize) {
            return `Ukuran file maksimal 1MB. File Anda: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        }
        return null
    }

    // Generic file handler
    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: string,
        setPreview: (url: string | null) => void
    ) => {
        const file = e.target.files?.[0]
        if (file) {
            const error = validateFile(file)
            if (error) {
                setFileErrors(prev => ({ ...prev, [field]: error }))
                setPreview(null)
                setData(field as any, null)
                return
            }

            setFileErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
            setData(field as any, file)

            const reader = new FileReader()
            reader.onloadend = () => setPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    // Remove file
    const removeFile = (
        field: string,
        setPreview: (url: string | null) => void,
        inputRef: React.RefObject<HTMLInputElement | null>
    ) => {
        setPreview(null)
        setData(field as any, null)
        setFileErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[field]
            return newErrors
        })
        if (inputRef.current) inputRef.current.value = ''
    }

    // Step validation
    const validateStep1 = () => {
        return !!data.jenis_akun
    }

    const validateStep2 = () => {
        if (isAgensiBroker) {
            return !!data.nama_agensi &&
                (!!agent.logo_agensi || !!data.logo_agensi) &&
                !!data.email_agensi
        }
        return !!data.name &&
            (!!agent.photo || !!data.photo) &&
            (!!agent.ktp || !!data.ktp)
    }

    const validateStep3 = () => {
        if (!isAgensiBroker) return true
        return !!data.nama_pic &&
            (!!agent.foto_pic || !!data.foto_pic) &&
            (!!agent.ktp_pic || !!data.ktp_pic) &&
            !!data.email_pic &&
            !!data.wa_pic
    }

    const handleNext = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2)
        } else if (currentStep === 2 && validateStep2()) {
            if (isAgensiBroker) {
                setCurrentStep(3)
            } else {
                handleSubmit()
            }
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault()
        post('/agent/dashboard/profile', {
            forceFormData: true,
            onSuccess: () => {
                setPhotoPreview(null)
                setKtpPreview(null)
                setLogoPreview(null)
                setFotoPicPreview(null)
                setKtpPicPreview(null)
            },
        })
    }

    // Photo upload component
    const PhotoUpload = ({
        label,
        required = false,
        field,
        currentImage,
        preview,
        setPreview,
        inputRef,
        isCircular = true,
        placeholder = 'A',
    }: {
        label: string
        required?: boolean
        field: string
        currentImage?: string
        preview: string | null
        setPreview: (url: string | null) => void
        inputRef: React.RefObject<HTMLInputElement | null>
        isCircular?: boolean
        placeholder?: string
    }) => (
        <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <p className="text-xs text-gray-500 mb-3">Format: JPG, PNG, WebP. Maksimal 1MB</p>

            <div className="flex flex-col items-center">
                <div className="relative mb-3">
                    {preview || currentImage ? (
                        <div className="relative">
                            <img
                                src={preview || currentImage}
                                alt={label}
                                className={`${isCircular ? 'w-28 h-28 rounded-full' : 'w-40 h-28 rounded-xl'} object-cover border-4 border-white shadow-lg`}
                            />
                            {preview && (
                                <button
                                    type="button"
                                    onClick={() => removeFile(field, setPreview, inputRef)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={`${isCircular ? 'w-28 h-28 rounded-full' : 'w-40 h-28 rounded-xl'} bg-[#D6D667] flex items-center justify-center border-4 border-white shadow-lg`}>
                            <span className="text-white font-bold text-3xl">{placeholder}</span>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-[#0C1C3C] text-white rounded-full p-2 hover:bg-[#1a2d4d] transition-colors shadow-lg"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e, field, setPreview)}
                    className="hidden"
                />

                {fileErrors[field] && (
                    <p className="text-sm text-red-500 text-center">{fileErrors[field]}</p>
                )}
                {(errors as any)[field] && (
                    <p className="text-sm text-red-500 text-center">{(errors as any)[field]}</p>
                )}

                {required && !currentImage && !preview && (
                    <p className="text-xs text-amber-600 text-center mt-1">⚠️ Wajib diisi</p>
                )}
            </div>
        </div>
    )

    return (
        <DashboardAgentLayout agent={agent} title="Profile" activeMenu="profile">
            <div className={`max-w-4xl mx-auto ${isProfileIncomplete && currentStep === 1 ? 'min-h-[calc(100vh-200px)] flex flex-col justify-center' : ''}`}>
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-[#0C1C3C]">
                        {isProfileIncomplete ? 'Lengkapi Profile Anda' : 'Profile Saya'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isProfileIncomplete
                            ? 'Lengkapi data diri Anda untuk mulai menggunakan semua fitur'
                            : 'Kelola informasi akun Anda'
                        }
                    </p>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <p className="text-green-800">{flash.success}</p>
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-800">{flash.error}</p>
                    </div>
                )}

                {flash?.warning && (
                    <div className="mb-6 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <p className="text-amber-800">{flash.warning}</p>
                    </div>
                )}

                {/* Step Indicator */}
                {isProfileIncomplete && (
                    <div className="mb-8">
                        <div className="flex items-start">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                                    ${currentStep > 1 ? 'bg-green-500 text-white' : currentStep === 1 ? 'bg-[#D6D667] text-[#0C1C3C]' : 'bg-gray-200 text-gray-500'}
                                `}>
                                    {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                                </div>
                                <span className="text-xs text-gray-500 mt-2 text-center whitespace-nowrap">Jenis Akun</span>
                            </div>

                            {/* Line 1-2 */}
                            <div className={`flex-1 h-1 mt-5 mx-2 ${currentStep > 1 ? 'bg-green-500' : 'bg-gray-200'}`} />

                            {/* Step 2 */}
                            <div className="flex flex-col items-center">
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                                    ${currentStep > 2 ? 'bg-green-500 text-white' : currentStep === 2 ? 'bg-[#D6D667] text-[#0C1C3C]' : 'bg-gray-200 text-gray-500'}
                                `}>
                                    {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                                </div>
                                <span className="text-xs text-gray-500 mt-2 text-center whitespace-nowrap">
                                    {isAgensiBrokerSelected ? 'Info Agensi' : 'Data Diri'}
                                </span>
                            </div>

                            {/* Step 3 (only for agensi/broker) */}
                            {isAgensiBrokerSelected && (
                                <>
                                    {/* Line 2-3 */}
                                    <div className={`flex-1 h-1 mt-5 mx-2 ${currentStep > 2 ? 'bg-green-500' : 'bg-gray-200'}`} />

                                    {/* Step 3 */}
                                    <div className="flex flex-col items-center">
                                        <div className={`
                                            w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                                            ${currentStep > 3 ? 'bg-green-500 text-white' : currentStep === 3 ? 'bg-[#D6D667] text-[#0C1C3C]' : 'bg-gray-200 text-gray-500'}
                                        `}>
                                            {currentStep > 3 ? <CheckCircle2 className="w-5 h-5" /> : '3'}
                                        </div>
                                        <span className="text-xs text-gray-500 mt-2 text-center whitespace-nowrap">Data PIC</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); if (currentStep === totalSteps || !isProfileIncomplete) handleSubmit(e); }}>

                    {/* =============== STEP 1: Jenis Akun =============== */}
                    {(currentStep === 1 && isProfileIncomplete) && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-[#F7F7F7] rounded-[20px] p-6">
                                <h2 className="text-lg font-semibold text-[#0C1C3C] mb-2">Pilih Jenis Akun</h2>
                                <p className="text-gray-600 text-sm mb-6">Pilih tipe akun yang sesuai dengan Anda</p>

                                <div className="grid gap-4">
                                    {jenisAkunOptions.map((option) => {
                                        const Icon = option.icon
                                        const isSelected = data.jenis_akun === option.value

                                        return (
                                            <div
                                                key={option.value}
                                                onClick={() => setData('jenis_akun', option.value as any)}
                                                className={`
                                                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                                    ${isSelected
                                                        ? 'border-[#D6D667] bg-yellow-50'
                                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`
                                                        w-12 h-12 rounded-xl flex items-center justify-center
                                                        ${isSelected ? 'bg-[#D6D667]' : 'bg-gray-100'}
                                                    `}>
                                                        <Icon className={`w-6 h-6 ${isSelected ? 'text-[#0C1C3C]' : 'text-gray-500'}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-[#0C1C3C]">{option.label}</h3>
                                                        <p className="text-sm text-gray-500">{option.description}</p>
                                                    </div>
                                                    <div className={`
                                                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                                                        ${isSelected ? 'border-[#D6D667] bg-[#D6D667]' : 'border-gray-300'}
                                                    `}>
                                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0C1C3C]" />}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!validateStep1()}
                                    className="h-12 px-8 rounded-xl bg-[#0C1C3C] text-white font-semibold hover:bg-[#1a2d4d] transition-colors flex items-center gap-2"
                                >
                                    Lanjut
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* =============== STEP 2: Data Diri / Info Agensi =============== */}
                    {(currentStep === 2 || !isProfileIncomplete) && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

                            {/* For Agent Perorangan / Developer */}
                            {!isAgensiBroker && (
                                <>
                                    <div className="bg-[#F7F7F7] rounded-[20px] p-6">
                                        <h2 className="text-lg font-semibold text-[#0C1C3C] mb-6">Foto & Identitas</h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <PhotoUpload
                                                label="Foto Profile"
                                                required
                                                field="photo"
                                                currentImage={agent.photo}
                                                preview={photoPreview}
                                                setPreview={setPhotoPreview}
                                                inputRef={photoInputRef}
                                                placeholder={agent.name?.charAt(0) || 'A'}
                                            />

                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                                    Foto KTP <span className="text-red-500">*</span>
                                                </Label>
                                                <p className="text-xs text-gray-500 mb-3">Format: JPG, PNG, WebP. Maksimal 1MB</p>

                                                <div
                                                    onClick={() => ktpInputRef.current?.click()}
                                                    className={`
                                                        relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
                                                        transition-all duration-200 min-h-[160px] flex flex-col items-center justify-center
                                                        ${ktpPreview || agent.ktp
                                                            ? 'border-green-300 bg-green-50'
                                                            : 'border-gray-300 bg-white hover:border-[#D6D667] hover:bg-yellow-50'
                                                        }
                                                    `}
                                                >
                                                    {ktpPreview || agent.ktp ? (
                                                        <div className="relative w-full">
                                                            <img
                                                                src={ktpPreview || agent.ktp}
                                                                alt="KTP preview"
                                                                className="w-full h-28 object-contain rounded-lg"
                                                            />
                                                            {ktpPreview && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        removeFile('ktp', setKtpPreview, ktpInputRef)
                                                                    }}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3" /> Berhasil diupload
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <IdCard className="w-10 h-10 text-gray-400 mb-2" />
                                                            <p className="text-sm font-medium text-gray-700">Upload Foto KTP</p>
                                                            <p className="text-xs text-gray-500 mt-1">Klik untuk upload</p>
                                                        </>
                                                    )}
                                                </div>

                                                <input
                                                    ref={ktpInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                                    onChange={(e) => handleFileChange(e, 'ktp', setKtpPreview)}
                                                    className="hidden"
                                                />

                                                {fileErrors.ktp && <p className="text-sm text-red-500 mt-2">{fileErrors.ktp}</p>}
                                                {errors.ktp && <p className="text-sm text-red-500 mt-2">{errors.ktp}</p>}
                                                {!agent.ktp && !ktpPreview && (
                                                    <p className="text-xs text-amber-600 mt-2">⚠️ Foto KTP wajib diisi</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#F7F7F7] rounded-[20px] p-6">
                                        <h2 className="text-lg font-semibold text-[#0C1C3C] mb-6">Informasi Pribadi</h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-sm font-medium text-[#0C1C3C]">Nama Lengkap <span className="text-red-500">*</span></Label>
                                                <div className="relative">
                                                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                    <Input
                                                        id="name"
                                                        value={data.name}
                                                        onChange={(e) => setData("name", e.target.value)}
                                                        className="h-12 rounded-xl pl-12 bg-white text-gray-900"
                                                        placeholder="Nama lengkap"
                                                    />
                                                </div>
                                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-[#0C1C3C]">Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                    <Input
                                                        value={agent.email}
                                                        disabled
                                                        className="h-12 rounded-xl pl-12 bg-gray-100 cursor-not-allowed text-gray-700"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">Email tidak dapat diubah</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone" className="text-sm font-medium text-[#0C1C3C]">No. WhatsApp</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                    <Input
                                                        id="phone"
                                                        value={data.phone}
                                                        onChange={(e) => setData("phone", e.target.value)}
                                                        className="h-12 rounded-xl pl-12 bg-white text-gray-900"
                                                        placeholder="08123456789"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="license_number" className="text-sm font-medium text-[#0C1C3C]">No. Lisensi (Opsional)</Label>
                                                <div className="relative">
                                                    <IdCard className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                    <Input
                                                        id="license_number"
                                                        value={data.license_number}
                                                        onChange={(e) => setData("license_number", e.target.value)}
                                                        className="h-12 rounded-xl pl-12 bg-white text-gray-900"
                                                        placeholder="Nomor lisensi agen"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* For Agensi/Broker */}
                            {isAgensiBroker && (
                                <div className="bg-[#F7F7F7] rounded-[20px] p-6">
                                    <h2 className="text-lg font-semibold text-[#0C1C3C] mb-6">Informasi Agensi / Broker</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <PhotoUpload
                                            label="Logo Agensi"
                                            required
                                            field="logo_agensi"
                                            currentImage={agent.logo_agensi}
                                            preview={logoPreview}
                                            setPreview={setLogoPreview}
                                            inputRef={logoInputRef}
                                            isCircular={false}
                                            placeholder="L"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="nama_agensi" className="text-sm font-medium text-[#0C1C3C]">Nama Agensi/Broker <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                <Input
                                                    id="nama_agensi"
                                                    value={data.nama_agensi}
                                                    onChange={(e) => setData("nama_agensi", e.target.value)}
                                                    className="h-12 rounded-xl pl-12 bg-white text-gray-900"
                                                    placeholder="Nama perusahaan"
                                                />
                                            </div>
                                            {errors.nama_agensi && <p className="text-sm text-red-500">{errors.nama_agensi}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email_agensi" className="text-sm font-medium text-[#0C1C3C]">Email Agensi <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                <Input
                                                    id="email_agensi"
                                                    type="email"
                                                    value={data.email_agensi}
                                                    onChange={(e) => setData("email_agensi", e.target.value)}
                                                    className="h-12 rounded-xl pl-12 bg-white text-gray-900"
                                                    placeholder="email@agensi.com"
                                                />
                                            </div>
                                            {errors.email_agensi && <p className="text-sm text-red-500">{errors.email_agensi}</p>}
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="website_agensi" className="text-sm font-medium text-[#0C1C3C]">Website (Opsional)</Label>
                                            <div className="relative">
                                                <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                                <Input
                                                    id="website_agensi"
                                                    value={data.website_agensi}
                                                    onChange={(e) => setData("website_agensi", e.target.value)}
                                                    className="h-12 rounded-xl pl-12 bg-white text-gray-900"
                                                    placeholder="https://www.agensi.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation buttons for step form */}
                            {isProfileIncomplete && (
                                <div className="flex justify-between gap-4">
                                    <Button
                                        type="button"
                                        onClick={handleBack}
                                        className="h-12 px-6 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Kembali
                                    </Button>

                                    {isAgensiBroker ? (
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={!validateStep2()}
                                            className="h-12 px-8 rounded-xl bg-[#0C1C3C] text-white font-semibold hover:bg-[#1a2d4d] flex items-center gap-2"
                                        >
                                            Lanjut
                                            <ArrowRight className="w-5 h-5" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={processing || !validateStep2()}
                                            className="h-12 px-8 rounded-xl bg-[#D6D667] text-[#0C1C3C] font-semibold hover:bg-[#c4c45a] flex items-center gap-2"
                                        >
                                            <Save className="w-5 h-5" />
                                            {processing ? 'Menyimpan...' : 'Simpan'}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Save button for edit mode (profile complete) */}
                            {!isProfileIncomplete && (
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="h-12 px-8 rounded-xl bg-[#D6D667] text-[#0C1C3C] font-semibold hover:bg-[#c4c45a] flex items-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* =============== STEP 3: Data PIC (Agensi only) =============== */}
                    {currentStep === 3 && isAgensiBroker && isProfileIncomplete && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-[#F7F7F7] rounded-[20px] p-6">
                                <h2 className="text-lg font-semibold text-[#0C1C3C] mb-2">Data PIC (Person In Charge)</h2>
                                <p className="text-gray-600 text-sm mb-6">Informasi penanggung jawab agensi</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                    <PhotoUpload
                                        label="Foto PIC"
                                        required
                                        field="foto_pic"
                                        currentImage={agent.foto_pic}
                                        preview={fotoPicPreview}
                                        setPreview={setFotoPicPreview}
                                        inputRef={fotoPicInputRef}
                                        placeholder={data.nama_pic?.charAt(0) || 'P'}
                                    />

                                    <div>
                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Foto KTP PIC <span className="text-red-500">*</span>
                                        </Label>
                                        <p className="text-xs text-gray-500 mb-3">Format: JPG, PNG, WebP. Maksimal 1MB</p>

                                        <div
                                            onClick={() => ktpPicInputRef.current?.click()}
                                            className={`
                                                relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
                                                transition-all duration-200 min-h-[160px] flex flex-col items-center justify-center
                                                ${ktpPicPreview || agent.ktp_pic
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-gray-300 bg-white hover:border-[#D6D667] hover:bg-yellow-50'
                                                }
                                            `}
                                        >
                                            {ktpPicPreview || agent.ktp_pic ? (
                                                <div className="relative w-full">
                                                    <img
                                                        src={ktpPicPreview || agent.ktp_pic}
                                                        alt="KTP PIC"
                                                        className="w-full h-28 object-contain rounded-lg"
                                                    />
                                                    {ktpPicPreview && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                removeFile('ktp_pic', setKtpPicPreview, ktpPicInputRef)
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Berhasil diupload
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <IdCard className="w-10 h-10 text-gray-400 mb-2" />
                                                    <p className="text-sm font-medium text-gray-700">Upload KTP PIC</p>
                                                    <p className="text-xs text-gray-500 mt-1">Klik untuk upload</p>
                                                </>
                                            )}
                                        </div>

                                        <input
                                            ref={ktpPicInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp"
                                            onChange={(e) => handleFileChange(e, 'ktp_pic', setKtpPicPreview)}
                                            className="hidden"
                                        />

                                        {fileErrors.ktp_pic && <p className="text-sm text-red-500 mt-2">{fileErrors.ktp_pic}</p>}
                                        {errors.ktp_pic && <p className="text-sm text-red-500 mt-2">{errors.ktp_pic}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nama_pic" className="text-sm font-medium text-[#0C1C3C]">Nama PIC <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="nama_pic"
                                                value={data.nama_pic}
                                                onChange={(e) => setData("nama_pic", e.target.value)}
                                                className="h-12 rounded-xl pl-12 bg-white text-gray-900"
                                                placeholder="Nama lengkap PIC"
                                            />
                                        </div>
                                        {errors.nama_pic && <p className="text-sm text-red-500">{errors.nama_pic}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email_pic" className="text-sm font-medium text-[#0C1C3C]">Email PIC <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="email_pic"
                                                type="email"
                                                value={data.email_pic}
                                                onChange={(e) => setData("email_pic", e.target.value)}
                                                className="h-12 rounded-xl pl-12 bg-white text-gray-900"
                                                placeholder="email@pic.com"
                                            />
                                        </div>
                                        {errors.email_pic && <p className="text-sm text-red-500">{errors.email_pic}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="wa_pic" className="text-sm font-medium text-[#0C1C3C]">No. WhatsApp PIC <span className="text-red-500">*</span></Label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="wa_pic"
                                                value={data.wa_pic}
                                                onChange={(e) => setData("wa_pic", e.target.value)}
                                                className="h-12 rounded-xl pl-12 bg-white text-gray-900"
                                                placeholder="08123456789"
                                            />
                                        </div>
                                        {errors.wa_pic && <p className="text-sm text-red-500">{errors.wa_pic}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between gap-4">
                                <Button
                                    type="button"
                                    onClick={handleBack}
                                    className="h-12 px-6 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Kembali
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing || !validateStep3()}
                                    className="h-12 px-8 rounded-xl bg-[#D6D667] text-[#0C1C3C] font-semibold hover:bg-[#c4c45a] flex items-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    {processing ? 'Menyimpan...' : 'Simpan & Selesai'}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>

                {/* Account Status (show when profile is complete) */}
                {!isProfileIncomplete && (
                    <div className="mt-8 bg-[#F7F7F7] rounded-[20px] p-6">
                        <h2 className="text-lg font-semibold text-[#0C1C3C] mb-4">Status Akun</h2>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className={`
                                px-4 py-2 rounded-full text-sm font-medium
                                ${agent.is_active ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                            `}>
                                {agent.is_active ? (
                                    <span className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Terverifikasi
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Menunggu Verifikasi
                                    </span>
                                )}
                            </div>

                            <div className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {agent.jenis_akun_label}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardAgentLayout>
    )
}
