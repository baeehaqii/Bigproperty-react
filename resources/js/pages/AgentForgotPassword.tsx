"use client"

import { Head, Link, useForm, usePage } from "@inertiajs/react"
import { useState } from "react"
import { Mail, Lock, KeyRound } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface PageProps {
    flash?: {
        success?: string
        error?: string
        dummy_otp?: string
        otp_verified?: boolean
    }
    [key: string]: unknown
}

export default function AgentForgotPassword() {
    const { flash } = usePage<PageProps>().props
    const [step, setStep] = useState<1 | 2 | 3>(1) // 1: Email, 2: OTP, 3: Reset

    // For when OTP is verified from server
    if (step === 2 && flash?.otp_verified) {
        setStep(3)
    }

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        email: "",
        otp: "",
        password: "",
        password_confirmation: ""
    })

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault()
        clearErrors()

        if (!data.email) {
            setError("email", "Email wajib diisi")
            return
        }

        post("/agent/forgot-password/send-otp", {
            preserveScroll: true,
            onSuccess: (page) => {
                const props = page.props as unknown as PageProps
                if (props.flash?.success) {
                    setStep(2)
                }
            }
        })
    }

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault()
        clearErrors()

        if (!data.otp) {
            setError("otp", "Kode OTP wajib diisi")
            return
        }

        post("/agent/forgot-password/verify-otp", {
            preserveScroll: true,
            onSuccess: (page) => {
                const props = page.props as unknown as PageProps
                if (props.flash?.otp_verified) {
                    setStep(3)
                }
            }
        })
    }

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault()
        clearErrors()
        let hasError = false

        if (!data.password) {
            setError("password", "Password baru wajib diisi")
            hasError = true
        }
        if (data.password !== data.password_confirmation) {
            setError("password_confirmation", "Konfirmasi password tidak cocok")
            hasError = true
        }

        if (hasError) return

        post("/agent/forgot-password/reset")
    }

    return (
        <>
            <Head title="Forgot Password - CariHunian" />

            <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-[500px] rounded-[20px] border border-gray-200 bg-white p-8 shadow-sm relative overflow-hidden">

                    {/* Logo */}
                    <Link href="/" className="inline-block mb-8 flex justify-center">
                        <img
                            src="/logo-carihunian-warna.svg"
                            alt="CariHunian"
                            style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
                            onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg'
                            }}
                        />
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="font-bold text-2xl text-gray-900 mb-2">
                            {step === 1 && "Lupa Password"}
                            {step === 2 && "Verifikasi OTP"}
                            {step === 3 && "Buat Password Baru"}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {step === 1 && "Masukkan email agent Anda untuk menerima kode OTP."}
                            {step === 2 && "Masukkan kode OTP 6 digit yang dikirimkan ke email Anda."}
                            {step === 3 && "Pilih kata sandi yang kuat dan belum pernah digunakan."}
                        </p>
                    </div>

                    {/* Messages */}
                    {flash?.success && step !== 1 && (
                        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                            <p className="text-sm font-medium text-green-700">{flash.success}</p>
                            {flash?.dummy_otp && step === 2 && (
                                <p className="text-sm font-bold text-green-800 mt-2">DUMMY OTP: {flash.dummy_otp}</p>
                            )}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                            <p className="text-sm font-medium text-red-700">{flash.error}</p>
                        </div>
                    )}

                    {/* Step 1: Request OTP */}
                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-semibold text-gray-900">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        className="h-[52px] rounded-full border-gray-200 pl-[54px] pr-5 text-gray-900 font-semibold placeholder:font-normal"
                                        placeholder="contoh@email.com"
                                    />
                                </div>
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>

                            <Button type="submit" disabled={processing} className="h-[52px] w-full rounded-full bg-[#C5E62A] text-gray-900 font-semibold hover:bg-[#d9d94f]">
                                {processing ? "Mengirim OTP..." : "Kirim Kode OTP"}
                            </Button>
                        </form>
                    )}

                    {/* Step 2: Verify OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="otp" className="font-semibold text-gray-900">Kode OTP</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="otp"
                                        type="text"
                                        maxLength={6}
                                        value={data.otp}
                                        onChange={(e) => setData("otp", e.target.value.replace(/[^0-9]/g, ''))}
                                        className="h-[52px] rounded-full border-gray-200 pl-[54px] pr-5 text-gray-900 font-semibold tracking-widest text-center"
                                        placeholder="******"
                                    />
                                </div>
                                {errors.otp && <p className="text-sm text-red-500">{errors.otp}</p>}
                            </div>

                            <Button type="submit" disabled={processing} className="h-[52px] w-full rounded-full bg-[#C5E62A] text-gray-900 font-semibold hover:bg-[#d9d94f]">
                                {processing ? "Memverifikasi..." : "Verifikasi OTP"}
                            </Button>

                            <div className="text-center pt-2">
                                <button type="button" onClick={handleSendOtp} disabled={processing} className="text-sm text-blue-600 hover:underline">
                                    Kirim ulang kode
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Reset Password */}
                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-semibold text-gray-900">Password Baru</Label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        className="h-[52px] rounded-full border-gray-200 pl-[54px] pr-5 text-gray-900 font-semibold"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                <ul className="text-xs text-gray-500 mt-2 list-disc pl-5 space-y-1">
                                    <li>Minimal 8 Karakter</li>
                                    <li>Mengandung Huruf Besar</li>
                                    <li>Mengandung Karakter Spesial (!@#$ dll)</li>
                                    <li>Bukan format angka tanggal atau angka berulang (111)</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="font-semibold text-gray-900">Konfirmasi Password Baru</Label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                        className="h-[52px] rounded-full border-gray-200 pl-[54px] pr-5 text-gray-900 font-semibold"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                            </div>

                            <Button type="submit" disabled={processing} className="h-[52px] w-full rounded-full bg-[#C5E62A] text-gray-900 font-semibold hover:bg-[#d9d94f]">
                                {processing ? "Menyimpan..." : "Simpan Password Baru"}
                            </Button>
                        </form>
                    )}

                    {/* Back to Login Link */}
                    <div className="mt-8 text-center">
                        <Link href="/agent/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 hover:underline">
                            Kembali ke Login
                        </Link>
                    </div>

                </div>
            </main>
        </>
    )
}
