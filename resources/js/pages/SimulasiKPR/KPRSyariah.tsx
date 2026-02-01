"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Head, Link } from "@inertiajs/react"
import { Calculator, MessageCircle, ChevronRight, Minus, Plus, ChevronLeft } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

// Helper functions
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value)
}

const parseCurrency = (value: string): number => {
    return Number(String(value).replace(/[^0-9]/g, ''))
}

const parseFloatInput = (value: string | number): number => {
    return parseFloat(String(value).replace(',', '.')) || 0
}

// Syariah calculation - Murabahah method (flat margin, no compound interest)
const calculateMurabahahInstallment = (
    principal: number,
    marginPercentage: number,
    years: number
): { monthlyInstallment: number; totalMargin: number; totalPayment: number } => {
    const totalMargin = principal * (marginPercentage / 100) * years
    const totalPayment = principal + totalMargin
    const monthlyInstallment = totalPayment / (years * 12)
    return { monthlyInstallment, totalMargin, totalPayment }
}

// Types
interface SimulationResult {
    angsuranBulanan: number
    totalMargin: number
    totalPembayaran: number
    pinjamanPokok: number
    marginPerTahun: number
    jangkaWaktu: number
    masaFixTahun: number
    installmentsList: { year: number; rate: number; installment: number }[]
}

interface BerjenjangRate {
    year: number
    rate: number
}

interface MonthlyInstallment {
    bulan: number
    angsuranPokok: number
    angsuranMargin: number
    totalAngsuran: number
    sisaPinjaman: number
}

// Input Group Component
function InputGroup({
    prefix,
    suffix,
    value,
    onChange,
    className = "",
    readOnly = false,
    textAlign = "right"
}: {
    prefix?: string
    suffix?: string
    value: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    className?: string
    readOnly?: boolean
    textAlign?: "left" | "center" | "right"
}) {
    return (
        <div className={`flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden focus-within:border-[#D6D667] focus-within:ring-1 focus-within:ring-[#D6D667] transition-all ${className}`}>
            {prefix && (
                <span className="px-3 py-2.5 bg-gray-50 text-gray-600 border-r border-gray-300 text-sm font-medium">
                    {prefix}
                </span>
            )}
            <input
                type="text"
                value={value}
                onChange={onChange}
                readOnly={readOnly}
                className={`flex-1 px-3 py-2.5 outline-none bg-transparent text-gray-900 ${textAlign === "right" ? "text-right" : textAlign === "center" ? "text-center" : "text-left"}`}
            />
            {suffix && (
                <span className="px-3 py-2.5 bg-gray-50 text-gray-600 border-l border-gray-300 text-sm font-medium">
                    {suffix}
                </span>
            )}
        </div>
    )
}

// Range Slider Component
function RangeSlider({
    min,
    max,
    step = 1,
    value,
    onChange,
    minLabel,
    maxLabel
}: {
    min: number
    max: number
    step?: number
    value: number
    onChange: (value: number) => void
    minLabel: string
    maxLabel: string
}) {
    return (
        <div className="mt-3">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:border-[3px]
                    [&::-webkit-slider-thumb]:border-[#D6D667]
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:transition-transform
                    [&::-webkit-slider-thumb]:hover:scale-110"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                <span>{minLabel}</span>
                <span>{maxLabel}</span>
            </div>
        </div>
    )
}

export default function KPRSyariah() {
    // Form state - default all to 0 or from URL
    const [hargaProperti, setHargaProperti] = useState(0)
    const [uangMukaPersen, setUangMukaPersen] = useState(0)
    const [uangMukaRp, setUangMukaRp] = useState(0)
    const [activeProgram, setActiveProgram] = useState<'fix-floating' | 'berjenjang'>('fix-floating')
    const [marginKeuntungan, setMarginKeuntungan] = useState(0) // Margin instead of interest
    const [masaKreditFix, setMasaKreditFix] = useState(0)
    const [masaKreditBerjenjang, setMasaKreditBerjenjang] = useState(1)
    const [jangkaWaktu, setJangkaWaktu] = useState(0)
    const [berjenjangRates, setBerjenjangRates] = useState<BerjenjangRate[]>([])

    // Result state
    const [showResult, setShowResult] = useState(false)
    const [result, setResult] = useState<SimulationResult | null>(null)
    const [activeTab, setActiveTab] = useState<'ringkasan' | 'tabel'>('ringkasan')
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 5

    // Get price from URL query parameter on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const priceParam = urlParams.get('harga')
        if (priceParam) {
            const price = parseInt(priceParam, 10) || 0
            setHargaProperti(price)
        }
    }, [])

    // Initialize berjenjang rates
    useEffect(() => {
        const rates: BerjenjangRate[] = []
        for (let i = 1; i <= masaKreditBerjenjang; i++) {
            rates.push({
                year: i,
                rate: 0
            })
        }
        setBerjenjangRates(rates)
    }, [masaKreditBerjenjang])

    // Update uang muka when percentage changes
    const updateUangMukaFromPersen = useCallback((persen: number) => {
        const rp = hargaProperti * (persen / 100)
        setUangMukaPersen(persen)
        setUangMukaRp(Math.round(rp))
    }, [hargaProperti])

    // Update uang muka when Rp changes
    const updateUangMukaFromRp = useCallback((rp: number) => {
        const persen = hargaProperti > 0 ? (rp / hargaProperti) * 100 : 0
        setUangMukaRp(rp)
        setUangMukaPersen(parseFloat(persen.toFixed(2)))
    }, [hargaProperti])

    // Handle harga properti change
    const handleHargaChange = (value: string) => {
        const parsed = parseCurrency(value)
        setHargaProperti(parsed)
        const rp = parsed * (uangMukaPersen / 100)
        setUangMukaRp(Math.round(rp))
    }

    // Handle berjenjang rate change
    const handleBerjenjangRateChange = (year: number, rate: number) => {
        setBerjenjangRates(prev =>
            prev.map(r => r.year === year ? { ...r, rate } : r)
        )
    }

    // Calculate Syariah simulation (Murabahah method)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const pinjamanPokok = hargaProperti - uangMukaRp
        const jumlahBulan = jangkaWaktu * 12

        let angsuranBulanan = 0
        let totalMargin = 0
        let totalPembayaran = 0
        let masaFixTahun = 0
        const installmentsList: { year: number; rate: number; installment: number }[] = []

        if (activeProgram === 'fix-floating') {
            masaFixTahun = masaKreditFix
            // Syariah Murabahah: flat margin calculation
            const calculation = calculateMurabahahInstallment(pinjamanPokok, marginKeuntungan, jangkaWaktu)
            angsuranBulanan = calculation.monthlyInstallment
            totalMargin = calculation.totalMargin
            totalPembayaran = calculation.totalPayment

            installmentsList.push({
                year: masaFixTahun,
                rate: marginKeuntungan,
                installment: angsuranBulanan
            })
        } else {
            // Berjenjang mode for Syariah
            masaFixTahun = masaKreditBerjenjang
            let totalPaymentBerjenjang = 0

            for (let year = 0; year < masaFixTahun; year++) {
                const rate = berjenjangRates[year]?.rate || 0
                const sisaTahun = jangkaWaktu - year
                const calculation = calculateMurabahahInstallment(
                    pinjamanPokok / masaFixTahun, // Split principal evenly
                    rate,
                    sisaTahun
                )

                installmentsList.push({
                    year: year + 1,
                    rate: rate,
                    installment: calculation.monthlyInstallment * masaFixTahun
                })

                if (year === 0) {
                    angsuranBulanan = calculation.monthlyInstallment * masaFixTahun
                }

                totalPaymentBerjenjang += calculation.totalPayment
            }

            // Simplified: use average for remaining years
            const avgRate = berjenjangRates.reduce((sum, r) => sum + r.rate, 0) / masaFixTahun
            const mainCalc = calculateMurabahahInstallment(pinjamanPokok, avgRate, jangkaWaktu)
            totalMargin = mainCalc.totalMargin
            totalPembayaran = mainCalc.totalPayment
            angsuranBulanan = mainCalc.monthlyInstallment
        }

        setResult({
            angsuranBulanan,
            totalMargin,
            totalPembayaran,
            pinjamanPokok,
            marginPerTahun: marginKeuntungan,
            jangkaWaktu,
            masaFixTahun,
            installmentsList
        })
        setShowResult(true)
        setActiveTab('ringkasan')
        setCurrentPage(1)
    }

    // Generate monthly installment table using useMemo for performance
    // Syariah uses flat installments (same every month)
    const monthlyInstallments = useMemo((): MonthlyInstallment[] => {
        if (!result || jangkaWaktu <= 0 || result.pinjamanPokok <= 0) return []

        const installments: MonthlyInstallment[] = []
        const totalMonths = jangkaWaktu * 12
        const monthlyPayment = result.angsuranBulanan

        // In Syariah (Murabahah), principal and margin portions are fixed each month
        const monthlyPokok = result.pinjamanPokok / totalMonths
        const monthlyMargin = result.totalMargin / totalMonths
        let sisaPinjaman = result.pinjamanPokok

        for (let i = 1; i <= totalMonths; i++) {
            sisaPinjaman = Math.max(0, sisaPinjaman - monthlyPokok)

            installments.push({
                bulan: i,
                angsuranPokok: monthlyPokok,
                angsuranMargin: monthlyMargin,
                totalAngsuran: monthlyPayment,
                sisaPinjaman
            })
        }

        return installments
    }, [result, jangkaWaktu])

    // Pagination calculations
    const totalPages = Math.ceil(monthlyInstallments.length / rowsPerPage)
    const paginatedInstallments = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage
        return monthlyInstallments.slice(startIndex, startIndex + rowsPerPage)
    }, [monthlyInstallments, currentPage])

    return (
        <>
            <Head title="Simulasi KPR Syariah - Big Property" />

            {/* Navbar */}
            <div className="w-full">
                <Navbar />
            </div>

            <div className="min-h-screen bg-gray-100">
                {/* Hero Banner - Syariah Green Theme */}
                <div className="relative overflow-hidden">
                    <div className="bg-gradient-to-r from-[#D6D667] to-[#a3cd49] pt-10 pb-24">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
                                {/* Text Left */}
                                <div className="lg:col-span-1 text-black">
                                    <div className="flex gap-2 mb-3">
                                        <span className="bg-white/30 backdrop-blur text-black text-xs font-semibold px-3 py-1 rounded-full">
                                            Syariah
                                        </span>
                                        <span className="bg-white/30 backdrop-blur text-black text-xs font-semibold px-3 py-1 rounded-full">
                                            Tanpa Riba
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                        Simulasi KPR Syariah Big Property
                                    </h1>
                                    <p className="mt-4 text-lg text-black/80">
                                        Solusi beli rumah dengan proses yang mudah, cepat, dan sesuai prinsip syariah.
                                    </p>
                                </div>

                                {/* Image Center */}
                                <div className="hidden lg:flex justify-center items-end">
                                    <img
                                        src="https://res.cloudinary.com/dx8w9qwl6/image/upload/v1757667735/design_sdk9yx.png"
                                        alt="Ilustrasi KPR Syariah"
                                        className="rounded-t-full object-cover h-[280px] border-4 border-white"
                                    />
                                </div>

                                {/* Cards Right */}
                                <div className="lg:col-span-1 space-y-4">
                                    <Link
                                        href="/simulasi-kpr/konvensional"
                                        className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg flex items-center justify-between hover:bg-white transition-all transform hover:scale-[1.02] group"
                                    >
                                        <div className="flex items-center">
                                            <div className="bg-[#D6D667] p-2.5 rounded-xl mr-4">
                                                <Calculator className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Simulasi KPR Konvensional</p>
                                                <p className="text-sm text-gray-500">Simulasi KPR dengan mudah</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#D6D667] transition-colors" />
                                    </Link>

                                    <a
                                        href="#"
                                        className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg flex items-center justify-between hover:bg-white transition-all transform hover:scale-[1.02] group"
                                    >
                                        <div className="flex items-center">
                                            <div className="bg-[#D6D667] p-2.5 rounded-xl mr-4">
                                                <MessageCircle className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Take Over KPR</p>
                                                <p className="text-sm text-gray-500">Take Over KPR Anda dengan mudah</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#D6D667] transition-colors" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 -mt-16">
                        {/* Left Column: Form */}
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                    Akad Murabahah
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Simulasi KPR Bank Syariah</h2>
                            <p className="mt-2 text-gray-500">
                                Cek estimasi pembiayaan kredit rumah dengan kalkulator KPR Bank Syariah dari Big Property.
                            </p>

                            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                                {/* Harga Properti */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Harga Properti <span className="text-red-500">*</span>
                                    </label>
                                    <InputGroup
                                        prefix="Rp"
                                        value={formatCurrency(hargaProperti)}
                                        onChange={(e) => handleHargaChange(e.target.value)}
                                    />
                                </div>

                                {/* Uang Muka */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Uang Muka
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputGroup
                                            suffix="%"
                                            value={uangMukaPersen.toString()}
                                            onChange={(e) => updateUangMukaFromPersen(parseFloatInput(e.target.value))}
                                        />
                                        <InputGroup
                                            prefix="Rp"
                                            value={formatCurrency(uangMukaRp)}
                                            onChange={(e) => updateUangMukaFromRp(parseCurrency(e.target.value))}
                                        />
                                    </div>
                                    <RangeSlider
                                        min={0}
                                        max={50}
                                        value={uangMukaPersen}
                                        onChange={updateUangMukaFromPersen}
                                        minLabel="0%"
                                        maxLabel="50%"
                                    />
                                </div>

                                {/* Jenis Program */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jenis Program
                                    </label>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveProgram('fix-floating')}
                                            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeProgram === 'fix-floating'
                                                ? 'bg-[#D6D667] text-white'
                                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            Fix & Floating
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setActiveProgram('berjenjang')}
                                            className={`flex-1 py-2.5 rounded-lg font-medium transition-colors cursor-pointer ${activeProgram === 'berjenjang'
                                                ? 'bg-[#D6D667] text-white'
                                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            Berjenjang
                                        </button>
                                    </div>
                                </div>

                                {/* Fix & Floating Fields */}
                                {activeProgram === 'fix-floating' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Margin Keuntungan Fix <span className="text-xs text-gray-500">(per tahun)</span>
                                            </label>
                                            <InputGroup
                                                suffix="% / tahun"
                                                value={marginKeuntungan.toString()}
                                                onChange={(e) => setMarginKeuntungan(parseFloatInput(e.target.value))}
                                            />
                                            <RangeSlider
                                                min={0}
                                                max={15}
                                                step={0.1}
                                                value={marginKeuntungan}
                                                onChange={setMarginKeuntungan}
                                                minLabel="0%"
                                                maxLabel="15%"
                                            />
                                            <p className="text-xs text-green-600 mt-2">
                                                * Margin bersifat tetap selama masa pembiayaan (bukan bunga berbunga)
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Masa Kredit Fix
                                            </label>
                                            <InputGroup
                                                suffix="Tahun"
                                                value={masaKreditFix.toString()}
                                                onChange={(e) => setMasaKreditFix(parseInt(e.target.value) || 0)}
                                            />
                                            <RangeSlider
                                                min={0}
                                                max={10}
                                                value={masaKreditFix}
                                                onChange={setMasaKreditFix}
                                                minLabel="0 Tahun"
                                                maxLabel="10 Tahun"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Berjenjang Fields */}
                                {activeProgram === 'berjenjang' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Masa Kredit Fix Berjenjang
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <InputGroup
                                                    suffix="Tahun"
                                                    value={masaKreditBerjenjang.toString()}
                                                    readOnly
                                                    textAlign="center"
                                                    className="flex-1"
                                                />
                                                <div className="flex">
                                                    <button
                                                        type="button"
                                                        onClick={() => setMasaKreditBerjenjang(prev => Math.max(1, prev - 1))}
                                                        className="p-2.5 border rounded-l-lg bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
                                                    >
                                                        <Minus className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setMasaKreditBerjenjang(prev => Math.min(10, prev + 1))}
                                                        className="p-2.5 border-t border-r border-b rounded-r-lg bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {berjenjangRates.map((item) => (
                                                <div key={item.year}>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Margin tahun ke-{item.year}
                                                    </label>
                                                    <InputGroup
                                                        suffix="% / tahun"
                                                        value={item.rate.toString()}
                                                        onChange={(e) =>
                                                            handleBerjenjangRateChange(item.year, parseFloatInput(e.target.value))
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Jangka Waktu */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Jangka Waktu KPR (Tenor)
                                    </label>
                                    <InputGroup
                                        suffix="Tahun"
                                        value={jangkaWaktu.toString()}
                                        onChange={(e) => setJangkaWaktu(parseInt(e.target.value) || 0)}
                                    />
                                    <RangeSlider
                                        min={0}
                                        max={30}
                                        value={jangkaWaktu}
                                        onChange={setJangkaWaktu}
                                        minLabel="0 Tahun"
                                        maxLabel="30 Tahun"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-[#D6D667] text-white font-semibold py-3.5 rounded-xl hover:bg-[#c9c85a] transition-colors cursor-pointer shadow-lg shadow-[#D6D667]/30"
                                >
                                    Simulasikan
                                </button>
                            </form>
                        </div>

                        {/* Right Column: Results */}
                        <div className="pt-8 lg:pt-16 mt-4 lg:mt-0">
                            {!showResult ? (
                                <div className="h-full min-h-[300px] flex items-center justify-center bg-white p-8 rounded-2xl shadow-xl z-10">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Calculator className="w-8 h-8 text-green-600" />
                                        </div>
                                        <p className="text-gray-500">
                                            Hasil simulasi akan ditampilkan di sini setelah Anda menekan tombol "Simulasikan".
                                        </p>
                                    </div>
                                </div>
                            ) : result && (
                                <div className="space-y-6 z-10 relative">
                                    {/* Tab Buttons - with extra margin top */}
                                    <div className="flex space-x-2 mt-4">
                                        <button
                                            onClick={() => setActiveTab('ringkasan')}
                                            className={`font-semibold py-2.5 px-6 rounded-xl shadow-sm cursor-pointer transition-colors ${activeTab === 'ringkasan'
                                                ? 'bg-[#D6D667] text-white'
                                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            Ringkasan Simulasi
                                        </button>
                                        <button
                                            onClick={() => { setActiveTab('tabel'); setCurrentPage(1); }}
                                            className={`font-semibold py-2.5 px-6 rounded-xl shadow-sm cursor-pointer transition-colors ${activeTab === 'tabel'
                                                ? 'bg-[#D6D667] text-white'
                                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            Tabel Angsuran
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    {activeTab === 'ringkasan' ? (
                                        <>
                                            {/* Angsuran Fix Card */}
                                            <div className="bg-[#f0f9e8] p-6 rounded-2xl border border-green-200">
                                                <div className="flex justify-center gap-2 mb-2">
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                                        Syariah
                                                    </span>
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                                        Murabahah
                                                    </span>
                                                </div>
                                                <h3 className="text-center font-semibold text-gray-700">Angsuran/bulan Fix</h3>
                                                <div className="mt-4 pt-4 border-t border-green-300 space-y-4">
                                                    {result.installmentsList.map((item, index) => (
                                                        <div key={index} className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-gray-600 text-sm">
                                                                    {activeProgram === 'fix-floating'
                                                                        ? `Tahun ke 1-${item.year}`
                                                                        : `Tahun ke-${item.year}`}
                                                                </p>
                                                                <p className="font-bold text-gray-800">Margin {item.rate}%</p>
                                                            </div>
                                                            <p className={`font-bold text-[#29291b] ${activeProgram === 'fix-floating' ? 'text-2xl' : 'text-xl'}`}>
                                                                Rp{formatCurrency(item.installment)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-center text-xs text-green-700 mt-4">
                                                    * Angsuran tetap selama masa pembiayaan
                                                </p>
                                                <button className="mt-4 w-full sm:w-auto bg-[#D6D667] text-white font-semibold py-2.5 px-8 rounded-xl hover:bg-[#c9c85a] transition-colors mx-auto block cursor-pointer">
                                                    Tanya KPR Syariah
                                                </button>
                                            </div>

                                            {/* Detail Pembayaran */}
                                            <div className="bg-white p-6 rounded-2xl shadow-xl">
                                                <h3 className="font-bold text-lg text-gray-800">Detail Pembiayaan Syariah</h3>
                                                <div className="mt-4 space-y-5">
                                                    {/* Info Akad */}
                                                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                                                        <h4 className="font-semibold text-green-800 flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                                            Akad Murabahah
                                                        </h4>
                                                        <p className="text-sm text-green-700 mt-1">
                                                            Bank membeli properti dan menjualnya kepada Anda dengan margin keuntungan yang disepakati di awal. Tidak ada bunga, hanya margin transparan.
                                                        </p>
                                                    </div>

                                                    {/* Estimasi Pembayaran Pertama */}
                                                    <div className="space-y-2 pt-4 border-t">
                                                        <div className="flex justify-between items-center font-semibold">
                                                            <h4 className="text-gray-800">Estimasi Pembayaran Pertama</h4>
                                                            <p className="text-[#a8a63e]">
                                                                Rp{formatCurrency(uangMukaRp + result.angsuranBulanan + 36000000)}
                                                            </p>
                                                        </div>
                                                        <ul className="text-gray-600 text-sm space-y-1.5">
                                                            <li className="flex justify-between pt-1">
                                                                <span>• Uang Muka</span>
                                                                <span>Rp {formatCurrency(uangMukaRp)}</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span>• Angsuran Pertama</span>
                                                                <span>Rp {formatCurrency(result.angsuranBulanan)}</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span>• Estimasi Biaya Lainnya</span>
                                                                <span>Rp36.000.000</span>
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    {/* Detail Pembiayaan */}
                                                    <div className="space-y-2 pt-4 border-t">
                                                        <div className="flex justify-between items-center font-semibold">
                                                            <h4 className="text-gray-800">Detail Pembiayaan</h4>
                                                            <p className="text-[#a8a63e]">
                                                                Rp{formatCurrency(result.totalPembayaran)}
                                                            </p>
                                                        </div>
                                                        <ul className="text-gray-600 text-sm space-y-1.5">
                                                            <li className="flex justify-between pt-1">
                                                                <span>• Harga Pokok (Pembiayaan Bank)</span>
                                                                <span>Rp {formatCurrency(result.pinjamanPokok)}</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span>• Total Margin Keuntungan</span>
                                                                <span className="text-green-600">Rp {formatCurrency(result.totalMargin)}</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        /* Tabel Angsuran */
                                        <div className="bg-white p-6 rounded-2xl shadow-xl">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-lg text-gray-800">Tabel Angsuran Bulanan</h3>
                                                <span className="text-sm text-gray-500">
                                                    Total {monthlyInstallments.length} bulan ({jangkaWaktu} tahun)
                                                </span>
                                            </div>

                                            {/* Table */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-[#f0f9e8] text-gray-700">
                                                            <th className="px-3 py-3 text-left font-semibold rounded-tl-lg">Bulan</th>
                                                            <th className="px-3 py-3 text-right font-semibold">Pokok</th>
                                                            <th className="px-3 py-3 text-right font-semibold">Margin</th>
                                                            <th className="px-3 py-3 text-right font-semibold">Total</th>
                                                            <th className="px-3 py-3 text-right font-semibold rounded-tr-lg">Sisa Pembiayaan</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedInstallments.map((item, index) => (
                                                            <tr
                                                                key={item.bulan}
                                                                className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                                            >
                                                                <td className="px-3 py-3 text-gray-900 font-medium">
                                                                    Ke-{item.bulan}
                                                                </td>
                                                                <td className="px-3 py-3 text-right text-gray-700">
                                                                    Rp{formatCurrency(item.angsuranPokok)}
                                                                </td>
                                                                <td className="px-3 py-3 text-right text-green-600">
                                                                    Rp{formatCurrency(item.angsuranMargin)}
                                                                </td>
                                                                <td className="px-3 py-3 text-right text-gray-900 font-semibold">
                                                                    Rp{formatCurrency(item.totalAngsuran)}
                                                                </td>
                                                                <td className="px-3 py-3 text-right text-[#a8a63e] font-medium">
                                                                    Rp{formatCurrency(item.sisaPinjaman)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination */}
                                            {totalPages > 1 && (
                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                                    <p className="text-sm text-gray-500">
                                                        Halaman {currentPage} dari {totalPages}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                            disabled={currentPage === 1}
                                                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${currentPage === 1
                                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <ChevronLeft className="w-4 h-4" />
                                                        </button>

                                                        {/* Page numbers */}
                                                        <div className="flex gap-1">
                                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                                let pageNum: number
                                                                if (totalPages <= 5) {
                                                                    pageNum = i + 1
                                                                } else if (currentPage <= 3) {
                                                                    pageNum = i + 1
                                                                } else if (currentPage >= totalPages - 2) {
                                                                    pageNum = totalPages - 4 + i
                                                                } else {
                                                                    pageNum = currentPage - 2 + i
                                                                }
                                                                return (
                                                                    <button
                                                                        key={pageNum}
                                                                        onClick={() => setCurrentPage(pageNum)}
                                                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${currentPage === pageNum
                                                                            ? 'bg-[#D6D667] text-white'
                                                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                                            }`}
                                                                    >
                                                                        {pageNum}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>

                                                        <button
                                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                            disabled={currentPage === totalPages}
                                                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${currentPage === totalPages
                                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Summary at bottom */}
                                            <div className="mt-4 p-4 bg-[#f0f9e8] rounded-xl border border-green-200">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Total Angsuran Pokok</p>
                                                        <p className="font-bold text-gray-800">Rp{formatCurrency(result.pinjamanPokok)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Total Margin Keuntungan</p>
                                                        <p className="font-bold text-green-600">Rp{formatCurrency(result.totalMargin)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <Footer />
        </>
    )
}
