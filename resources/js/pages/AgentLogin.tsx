"use client"

import { Head, Link, useForm, usePage } from "@inertiajs/react"
import { useState, useEffect } from "react"
import { Mail, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface PageProps {
    flash?: {
        success?: string
        error?: string
    }
    [key: string]: unknown
}

export default function AgentLogin() {
    const { flash } = usePage<PageProps>().props

    const [currentSlide, setCurrentSlide] = useState(0)

    const testimonials = [
        {
            name: "Sarina Dwi",
            role: "Top Agent 2024",
            text: "BigProperty membantu kami mendapatkan rumah idaman dengan proses yang mudah dan cepat. Dashboard agent sangat memudahkan pekerjaan!",
            initial: "S"
        },
        {
            name: "Andi Pratama",
            role: "Senior Agent",
            text: "Sistem manajemen listing yang luar biasa. Sangat membantu meningkatkan efisiensi kerja tim marketing kami setiap harinya.",
            initial: "A"
        },
        {
            name: "Rina Wijaya",
            role: "Property Consultant",
            text: "Tampilan dashboard yang modern dan user friendly. Memudahkan saya memantau performa penjualan secara realtime.",
            initial: "R"
        }
    ]

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % testimonials.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post("/agent/login")
    }

    return (
        <>
            <Head title="Login Agent - BigProperty">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <main className="flex min-h-screen bg-gray-50">
                {/* Form Section */}
                <div className="flex flex-1 items-center justify-center px-4 py-12 lg:px-8 lg:py-0 lg:justify-start lg:pl-[calc(((100%-1280px)/2)+75px)] lg:pt-[114px]">
                    <div className="w-full max-w-[500px] h-fit rounded-[20px] border border-gray-200 bg-white p-8 shadow-sm">
                        {/* Logo */}
                        <Link href="/" className="inline-block mb-6">
                            <img
                                src="https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761232717/Logo_Big_t3qpb3.png"
                                alt="BigProperty"
                                className="h-10"
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg'
                                }}
                            />
                        </Link>

                        {/* Header */}
                        <h1 className="font-bold text-[28px] leading-[42px] text-gray-900 mb-6">
                            Sign In to Agent Hub
                        </h1>

                        {/* Success Message */}
                        {flash?.success && (
                            <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                                <p className="text-sm font-medium text-green-700">{flash.success}</p>
                            </div>
                        )}

                        {/* Error Message */}
                        {flash?.error && (
                            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                                <p className="text-sm font-medium text-red-700">{flash.error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-semibold text-gray-900">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        className="h-[52px] rounded-full border-gray-200 pl-[54px] pr-5 text-gray-900 font-semibold placeholder:font-normal placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                                        placeholder="Type your email address"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-semibold text-gray-900">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        className="h-[52px] rounded-full border-gray-200 pl-[54px] pr-5 text-gray-900 font-semibold placeholder:font-normal placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                                        placeholder="Type your password"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password}</p>
                                )}
                                <Link
                                    href="/agent/forgot-password"
                                    className="inline-block text-sm text-gray-600 hover:underline hover:text-blue-600"
                                >
                                    Forgot my password
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="h-[52px] w-full rounded-full bg-[#ECEC5C] text-gray-900 font-semibold hover:bg-[#d9d94f] transition-colors"
                            >
                                {processing ? "Signing In..." : "Sign In"}
                            </Button>

                            {/* Register Link */}
                            <p className="text-center text-gray-600 pt-2">
                                Belum punya akun agent?{" "}
                                <Link
                                    href="/agent/register"
                                    className="font-semibold text-blue-600 hover:underline"
                                >
                                    Daftar sekarang
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>

                {/* Banner Section - Hidden on mobile */}
                <div className="relative hidden w-full max-w-[640px] lg:flex">
                    <div className="fixed top-0 h-screen w-full max-w-[640px] overflow-hidden">
                        {/* Background Image */}
                        <div className="absolute inset-0 bg-gray-900">
                            <img
                                src="https://res.cloudinary.com/dtlhdbzcf/image/upload/v1767371627/freepik__young-indonesian-chinese-woman-a-real-estate-agent__79325_birfo7.avif"
                                alt="Login Banner"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Testimonial Card at Bottom */}
                        <div className="absolute bottom-0 w-full px-8 pb-8">
                            <div className="rounded-[30px] border border-gray-200 bg-white p-6">
                                <div className="overflow-hidden">
                                    <div
                                        className="flex transition-transform duration-500 ease-in-out"
                                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                                    >
                                        {testimonials.map((testimonial, index) => (
                                            <div key={index} className="min-w-full px-1">
                                                <div className="space-y-[14px]">
                                                    {/* Stars */}
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg
                                                                key={i}
                                                                className="h-6 w-6 text-yellow-400"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>

                                                    {/* Testimonial Text */}
                                                    <p className="font-semibold leading-7 text-gray-900 min-h-[84px]">
                                                        {testimonial.text}
                                                    </p>

                                                    {/* Profile */}
                                                    <div className="flex items-center gap-[14px]">
                                                        <div className="h-[60px] w-[60px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                                                            <span className="text-gray-500 text-xl font-bold">{testimonial.initial}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dots */}
                                <div className="flex justify-center gap-2 mt-6">
                                    {testimonials.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlide(index)}
                                            className={`h-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-[#ECEC5C] w-8" : "bg-gray-200 w-2.5"
                                                }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
