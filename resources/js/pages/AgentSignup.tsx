"use client"

import { useState } from "react"
import { Head, Link, useForm } from "@inertiajs/react"
import { User, Mail, Phone, Lock, Shield, Info, ArrowRight, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AgentSignup() {
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
        sumber: "",
    })

    const [showPassword, setShowPassword] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)

    const sumberOptions = [
        { value: "instagram", label: "Instagram" },
        { value: "facebook", label: "Facebook" },
        { value: "whatsapp", label: "WhatsApp" },
        { value: "email", label: "Email" },
        { value: "google", label: "Google" },
        { value: "lainnya", label: "Lainnya" },
    ]

    const validateStep1 = () => {
        let isValid = true
        clearErrors()

        if (!data.name) {
            setError('name', 'Nama lengkap wajib diisi')
            isValid = false
        }
        if (!data.email) {
            setError('email', 'Email wajib diisi')
            isValid = false
        }
        if (!data.phone) {
            setError('phone', 'No. WhatsApp wajib diisi')
            isValid = false
        }

        return isValid
    }

    const handleNext = () => {
        if (validateStep1()) {
            setCurrentStep(2)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/agent/register", {
            onSuccess: () => {
                // Will redirect to login page
            },
        })
    }

    return (
        <>
            <Head title="Daftar Agent - BigProperty">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <main className="flex min-h-screen bg-gray-50">
                {/* Form Section */}
                <div className="flex flex-1 items-center justify-center px-4 py-12 lg:px-8 lg:py-0 lg:justify-start lg:pl-[calc(((100%-1280px)/2)+75px)]">
                    <div className="w-full max-w-[500px] rounded-[20px] border border-gray-200 bg-white p-8 shadow-sm">
                        {/* Header */}
                        <div className="mb-8">
                            <Link href="/" className="inline-block mb-6">
                                <img
                                    src="https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761232717/Logo_Big_t3qpb3.png"
                                    alt="BigProperty"
                                    className="h-10"
                                />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 lg:text-[28px] lg:leading-[42px]">
                                {currentStep === 1 ? "Daftar Sebagai Agent" : "Lengkapi Keamanan"}
                            </h1>
                            <p className="mt-2 text-gray-600">
                                {currentStep === 1
                                    ? "Lengkapi data diri Anda untuk bergabung"
                                    : "Buat password aman untuk akun Anda"
                                }
                            </p>

                            {/* Step Indicator */}
                            <div className="flex bg-gray-100 h-2 mt-6 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-[#ECEC5C] transition-all duration-300 ease-in-out ${currentStep === 1 ? 'w-1/2' : 'w-full'
                                        }`}
                                />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Step 1 Fields */}
                            {currentStep === 1 && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {/* Nama Lengkap */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-semibold text-gray-900">
                                            Nama Lengkap
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData("name", e.target.value)}
                                                className="h-12 rounded-full border-gray-200 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Masukkan nama lengkap Anda"
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="text-sm text-red-500">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-semibold text-gray-900">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData("email", e.target.value)}
                                                className="h-12 rounded-full border-gray-200 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Masukkan alamat email Anda"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-sm text-red-500">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* No WhatsApp */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="font-semibold text-gray-900">
                                            No. WhatsApp
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData("phone", e.target.value)}
                                                className="h-12 rounded-full border-gray-200 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Contoh: 08123456789"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-sm text-red-500">{errors.phone}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        className="h-12 w-full rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Lanjut Step 2
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>

                                    {/* Login Link */}
                                    <p className="text-center text-gray-600">
                                        Sudah punya akun agent?{" "}
                                        <Link
                                            href="/agent/login"
                                            className="font-semibold text-blue-600 hover:underline"
                                        >
                                            Masuk di sini
                                        </Link>
                                    </p>
                                </div>
                            )}

                            {/* Step 2 Fields */}
                            {currentStep === 2 && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {/* Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="font-semibold text-gray-900">
                                            Buat Password Baru
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={data.password}
                                                onChange={(e) => setData("password", e.target.value)}
                                                className="h-12 rounded-full border-gray-200 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Minimal 8 karakter"
                                            />
                                        </div>
                                        {errors.password && (
                                            <p className="text-sm text-red-500">{errors.password}</p>
                                        )}
                                    </div>

                                    {/* Konfirmasi Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="font-semibold text-gray-900">
                                            Konfirmasi Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                            <Input
                                                id="password_confirmation"
                                                type={showPassword ? "text" : "password"}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                                className="h-12 rounded-full border-gray-200 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                                                placeholder="Ulangi password Anda"
                                            />
                                        </div>
                                    </div>

                                    {/* Sumber Informasi */}
                                    <div className="space-y-2">
                                        <Label htmlFor="sumber" className="font-semibold text-gray-900">
                                            Dapat informasi Agent Big dari mana?
                                        </Label>
                                        <div className="relative">
                                            <Info className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                                            <Select
                                                value={data.sumber}
                                                onValueChange={(value) => setData("sumber", value)}
                                            >
                                                <SelectTrigger className="h-12 rounded-full border-gray-200 pl-12 pr-4 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                                                    <SelectValue placeholder="Pilih sumber informasi" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sumberOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {errors.sumber && (
                                            <p className="text-sm text-red-500">{errors.sumber}</p>
                                        )}
                                    </div>

                                    {/* Security Note */}
                                    <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 p-3">
                                        <Shield className="h-5 w-5 flex-shrink-0 text-blue-600" />
                                        <p className="text-sm font-medium text-blue-900">
                                            Data privasi Anda aman dalam sistem kami
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setCurrentStep(1)}
                                            disabled={processing}
                                            className="h-12 flex-1 rounded-full bg-white border border-gray-200 font-semibold text-gray-900 hover:bg-gray-50 flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                            Kembali
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 flex-[2] rounded-full bg-[#ECEC5C] text-gray-900 font-semibold hover:bg-[#d9d94f] transition-colors"
                                        >
                                            {processing ? "Mendaftar..." : "Daftar Sekarang"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Banner Section - Hidden on mobile */}
                <div className="relative hidden w-full max-w-[640px] lg:flex">
                    <div className="fixed top-0 h-screen w-full max-w-[640px] overflow-hidden">
                        {/* Background Image */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-blue-200">
                            <img
                                src="https://res.cloudinary.com/dtlhdbzcf/image/upload/v1767371627/freepik__candid-photography-with-natural-textures-and-highl__79326_lzaalq.avif"
                                alt="Agent Banner"
                                className="h-full w-full object-cover opacity-50"
                                onError={(e) => {
                                    // Fallback if image doesn't exist
                                    e.currentTarget.style.display = 'none'
                                }}
                            />
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 flex flex-col justify-center p-12">
                            <div className="mb-8">
                                <h2 className="text-4xl font-bold text-white mb-4">
                                    Bergabunglah sebagai Agent BigProperty
                                </h2>
                                <p className="text-lg text-white/90">
                                    Dapatkan akses ke ribuan listing properti dan raih komisi terbaik bersama kami.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium">Akses ke ribuan listing properti</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium">Komisi kompetitif</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium">Dashboard agent eksklusif</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-white font-medium">Pelatihan dan dukungan penuh</span>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial Card */}
                        <div className="absolute bottom-0 w-full px-8 pb-8">
                            <div className="rounded-[30px] border border-white/20 bg-white/10 backdrop-blur-md p-6">
                                <div className="flex mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className="h-5 w-5 text-yellow-400"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="font-medium text-white leading-relaxed mb-4">
                                    "Bergabung dengan BigProperty adalah keputusan terbaik untuk karir saya. Sistemnya mudah dan komisi sangat kompetitif!"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-full bg-white/20 overflow-hidden">
                                        <img
                                            src="/images/testimonial-agent.jpg"
                                            alt="Agent"
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">Budi Santoso</p>
                                        <p className="text-sm text-white/70">Agent sejak 2022</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
