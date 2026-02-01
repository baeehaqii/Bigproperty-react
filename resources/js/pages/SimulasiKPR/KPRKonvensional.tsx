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

const calculateInstallment = (principal: number, annualRate: number, totalMonths: number): number => {
    const monthlyRate = annualRate / 100 / 12
    if (monthlyRate === 0) return principal / totalMonths
    const factor = Math.pow(1 + monthlyRate, totalMonths)
    return principal * (monthlyRate * factor) / (factor - 1)
}

// Types
interface SimulationResult {
    angsuranFixBulanan: number
    totalBunga: number
    totalPinjamanDenganBunga: number
    masaFixTahun: number
    angsuranFloatingBulanan: number
    totalPembayaranPertama: number
    pinjamanPokok: number
    installmentsList: { year: number; rate: number; installment: number }[]
}

interface BerjenjangRate {
    year: number
    rate: number
}

interface MonthlyInstallment {
    bulan: number
    angsuranPokok: number
    angsuranBunga: number
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

export default function KPRKonvensional() {
    // Form state - default all to 0 or from URL
    const [hargaProperti, setHargaProperti] = useState(0)
    const [uangMukaPersen, setUangMukaPersen] = useState(0)
    const [uangMukaRp, setUangMukaRp] = useState(0)
    const [activeProgram, setActiveProgram] = useState<'fix-floating' | 'berjenjang'>('fix-floating')
    const [sukuBunga, setSukuBunga] = useState(0)
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
        const persen = (rp / hargaProperti) * 100
        setUangMukaRp(rp)
        setUangMukaPersen(parseFloat(persen.toFixed(2)))
    }, [hargaProperti])

    // Handle harga properti change
    const handleHargaChange = (value: string) => {
        const parsed = parseCurrency(value)
        setHargaProperti(parsed)
        // Update uang muka based on current percentage
        const rp = parsed * (uangMukaPersen / 100)
        setUangMukaRp(Math.round(rp))
    }

    // Handle berjenjang rate change
    const handleBerjenjangRateChange = (year: number, rate: number) => {
        setBerjenjangRates(prev =>
            prev.map(r => r.year === year ? { ...r, rate } : r)
        )
    }

    // Calculate simulation
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const pinjamanPokok = hargaProperti - uangMukaRp
        const jumlahAngsuranBulan = jangkaWaktu * 12

        let angsuranFixBulanan = 0
        let totalBunga = 0
        let totalPinjamanDenganBunga = 0
        let masaFixTahun = 0
        const installmentsList: { year: number; rate: number; installment: number }[] = []

        if (activeProgram === 'fix-floating') {
            masaFixTahun = masaKreditFix
            angsuranFixBulanan = calculateInstallment(pinjamanPokok, sukuBunga, jumlahAngsuranBulan)
            totalPinjamanDenganBunga = angsuranFixBulanan * jumlahAngsuranBulan
            totalBunga = totalPinjamanDenganBunga - pinjamanPokok

            installmentsList.push({
                year: masaFixTahun,
                rate: sukuBunga,
                installment: angsuranFixBulanan
            })
        } else {
            masaFixTahun = masaKreditBerjenjang
            let sisaPokok = pinjamanPokok
            let totalPembayaran = 0

            for (let year = 0; year < masaFixTahun; year++) {
                const sisaBulanKalkulasi = jumlahAngsuranBulan - (year * 12)
                const rate = berjenjangRates[year]?.rate || 7.5
                const angsuranBulananTahunIni = calculateInstallment(sisaPokok, rate, sisaBulanKalkulasi)

                installmentsList.push({
                    year: year + 1,
                    rate: rate,
                    installment: angsuranBulananTahunIni
                })

                if (year === 0) {
                    angsuranFixBulanan = angsuranBulananTahunIni
                }

                for (let month = 0; month < 12; month++) {
                    const bungaBulanIni = sisaPokok * (rate / 100 / 12)
                    const pokokBulanIni = angsuranBulananTahunIni - bungaBulanIni
                    sisaPokok -= pokokBulanIni
                    totalPembayaran += angsuranBulananTahunIni
                }
            }

            const sisaBulanFloating = jumlahAngsuranBulan - (masaFixTahun * 12)
            if (sisaBulanFloating > 0) {
                const angsuranFloating = calculateInstallment(sisaPokok, 12, sisaBulanFloating)
                totalPembayaran += angsuranFloating * sisaBulanFloating
            }

            totalPinjamanDenganBunga = totalPembayaran
            totalBunga = totalPinjamanDenganBunga - pinjamanPokok
        }

        const angsuranFloatingBulanan = calculateInstallment(pinjamanPokok, 12, jumlahAngsuranBulan)
        const estimasiBiayaLainnya = 36000000
        const totalPembayaranPertama = uangMukaRp + angsuranFixBulanan + estimasiBiayaLainnya

        setResult({
            angsuranFixBulanan,
            totalBunga,
            totalPinjamanDenganBunga,
            masaFixTahun,
            angsuranFloatingBulanan,
            totalPembayaranPertama,
            pinjamanPokok,
            installmentsList
        })
        setShowResult(true)
        setActiveTab('ringkasan')
        setCurrentPage(1)
    }

    // Generate monthly installment table using useMemo for performance
    const monthlyInstallments = useMemo((): MonthlyInstallment[] => {
        if (!result || jangkaWaktu <= 0 || result.pinjamanPokok <= 0) return []

        const installments: MonthlyInstallment[] = []
        const totalMonths = jangkaWaktu * 12
        let sisaPinjaman = result.pinjamanPokok
        const rate = sukuBunga > 0 ? sukuBunga : 7.5
        const monthlyRate = rate / 100 / 12

        // Calculate fixed monthly payment (annuity method)
        const monthlyPayment = result.angsuranFixBulanan > 0
            ? result.angsuranFixBulanan
            : calculateInstallment(result.pinjamanPokok, rate, totalMonths)

        for (let i = 1; i <= totalMonths; i++) {
            const angsuranBunga = sisaPinjaman * monthlyRate
            const angsuranPokok = monthlyPayment - angsuranBunga
            sisaPinjaman = Math.max(0, sisaPinjaman - angsuranPokok)

            installments.push({
                bulan: i,
                angsuranPokok,
                angsuranBunga,
                totalAngsuran: monthlyPayment,
                sisaPinjaman
            })
        }

        return installments
    }, [result, jangkaWaktu, sukuBunga])

    // Pagination calculations
    const totalPages = Math.ceil(monthlyInstallments.length / rowsPerPage)
    const paginatedInstallments = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage
        return monthlyInstallments.slice(startIndex, startIndex + rowsPerPage)
    }, [monthlyInstallments, currentPage])

    return (
        <>
            <Head title="Simulasi KPR Konvensional - Big Property" />

            {/* Navbar */}
            <div className="w-full">
                <Navbar />
            </div>

            <div className="min-h-screen bg-gray-100">
                {/* Hero Banner */}
                <div className="relative overflow-hidden">
                    <div className="bg-gradient-to-r from-[#D6D667] to-[#ffd698] pt-10 pb-24">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
                                {/* Text Left */}
                                <div className="lg:col-span-1 text-black">
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                        Simulasi KPR Konvensional Big Property
                                    </h1>
                                    <p className="mt-4 text-lg text-black/80">
                                        Solusi beli rumah dengan proses yang mudah, cepat, dan terpercaya.
                                    </p>
                                </div>

                                {/* Image Center */}
                                <div className="hidden lg:flex justify-center items-end">
                                    <img
                                        src="https://res.cloudinary.com/dx8w9qwl6/image/upload/v1757670717/design-3_pk5pde.png"
                                        alt="Ilustrasi KPR"
                                        className="max-h-64 object-contain"
                                    />
                                </div>

                                {/* Cards Right */}
                                <div className="lg:col-span-1 space-y-4">
                                    <Link
                                        href="/simulasi-kpr/syariah"
                                        className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg flex items-center justify-between hover:bg-white transition-all transform hover:scale-[1.02] group"
                                    >
                                        <div className="flex items-center">
                                            <div className="bg-[#D6D667] p-2.5 rounded-xl mr-4">
                                                <Calculator className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Simulasi KPR Syariah</p>
                                                <p className="text-sm text-gray-500">Cek simulasi KPR Syariah dengan mudah</p>
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
                                                <p className="font-semibold text-gray-800">Take Over</p>
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
                            <h2 className="text-2xl font-bold text-gray-800">Simulasi KPR Bank Konvensional</h2>
                            <p className="mt-2 text-gray-500">
                                Cek estimasi pembiayaan kredit rumah dengan kalkulator KPR Bank Konvensional dari Big Property.
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
                                                Suku Bunga Fix
                                            </label>
                                            <InputGroup
                                                suffix="%"
                                                value={sukuBunga.toString()}
                                                onChange={(e) => setSukuBunga(parseFloatInput(e.target.value))}
                                            />
                                            <RangeSlider
                                                min={0}
                                                max={15}
                                                step={0.1}
                                                value={sukuBunga}
                                                onChange={setSukuBunga}
                                                minLabel="0%"
                                                maxLabel="15%"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Masa Kredit Fix
                                            </label>
                                            <InputGroup
                                                suffix="Tahun"
                                                value={masaKreditFix.toString()}
                                                onChange={(e) => setMasaKreditFix(parseInt(e.target.value) || 1)}
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
                                                        Bunga tahun ke-{item.year}
                                                    </label>
                                                    <InputGroup
                                                        suffix="%"
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
                                        onChange={(e) => setJangkaWaktu(parseInt(e.target.value) || 3)}
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
                                    <p className="text-gray-500 text-center">
                                        Hasil simulasi akan ditampilkan di sini setelah Anda menekan tombol "Simulasikan".
                                    </p>
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
                                            <div className="bg-[#f9f8cc] p-6 rounded-2xl border border-yellow-200">
                                                <h3 className="text-center font-semibold text-gray-700">Angsuran/bulan Fix</h3>
                                                <div className="mt-4 pt-4 border-t border-yellow-300 space-y-4">
                                                    {result.installmentsList.map((item, index) => (
                                                        <div key={index} className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-gray-600 text-sm">
                                                                    {activeProgram === 'fix-floating'
                                                                        ? `Tahun ke 1-${item.year}`
                                                                        : `Tahun ke-${item.year}`}
                                                                </p>
                                                                <p className="font-bold text-gray-800">Bunga {item.rate}%</p>
                                                            </div>
                                                            <p className={`font-bold text-[#29291b] ${activeProgram === 'fix-floating' ? 'text-2xl' : 'text-xl'}`}>
                                                                Rp{formatCurrency(item.installment)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button className="mt-6 w-full sm:w-auto bg-[#D6D667] text-white font-semibold py-2.5 px-8 rounded-xl hover:bg-[#c9c85a] transition-colors mx-auto block cursor-pointer">
                                                    Tanya KPR
                                                </button>
                                            </div>

                                            {/* Detail Pembayaran */}
                                            <div className="bg-white p-6 rounded-2xl shadow-xl">
                                                <h3 className="font-bold text-lg text-gray-800">Detail Pembayaran</h3>
                                                <div className="mt-4 space-y-5">
                                                    {/* Floating Rate */}
                                                    <div className="flex justify-between items-center text-sm p-4 rounded-xl border border-gray-200 bg-gray-50">
                                                        <div>
                                                            <p className="font-semibold text-gray-700">Estimasi Bunga Floating 12%</p>
                                                            <p className="text-xs text-gray-500">
                                                                Tahun ke-{result.masaFixTahun + 1} hingga ke-{jangkaWaktu}
                                                            </p>
                                                        </div>
                                                        <p className="font-medium text-[#a8a63e]">
                                                            Rp{formatCurrency(result.angsuranFloatingBulanan)}
                                                        </p>
                                                    </div>

                                                    {/* Estimasi Pembayaran Pertama */}
                                                    <div className="space-y-2 pt-4 border-t">
                                                        <div className="flex justify-between items-center font-semibold">
                                                            <h4 className="text-gray-800">Estimasi Pembayaran Pertama</h4>
                                                            <p className="text-[#a8a63e]">
                                                                Rp{formatCurrency(result.totalPembayaranPertama)}
                                                            </p>
                                                        </div>
                                                        <ul className="text-gray-600 text-sm space-y-1.5">
                                                            <li className="flex justify-between pt-1">
                                                                <span>• Uang Muka</span>
                                                                <span>Rp {formatCurrency(uangMukaRp)}</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span>• Angsuran Pertama</span>
                                                                <span>Rp {formatCurrency(result.angsuranFixBulanan)}</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span>• Estimasi Biaya Lainnya</span>
                                                                <span>Rp36.000.000</span>
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    {/* Detail Pinjaman */}
                                                    <div className="space-y-2 pt-4 border-t">
                                                        <div className="flex justify-between items-center font-semibold">
                                                            <h4 className="text-gray-800">Detail Pinjaman</h4>
                                                            <p className="text-[#a8a63e]">
                                                                Rp{formatCurrency(result.totalPinjamanDenganBunga)}
                                                            </p>
                                                        </div>
                                                        <ul className="text-gray-600 text-sm space-y-1.5">
                                                            <li className="flex justify-between pt-1">
                                                                <span>• Pinjaman Pokok</span>
                                                                <span>Rp {formatCurrency(result.pinjamanPokok)}</span>
                                                            </li>
                                                            <li className="flex justify-between">
                                                                <span>• Estimasi Bunga Pinjaman</span>
                                                                <span>Rp {formatCurrency(result.totalBunga)}</span>
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
                                                        <tr className="bg-[#f9f8cc] text-gray-700">
                                                            <th className="px-3 py-3 text-left font-semibold rounded-tl-lg">Bulan</th>
                                                            <th className="px-3 py-3 text-right font-semibold">Pokok</th>
                                                            <th className="px-3 py-3 text-right font-semibold">Bunga</th>
                                                            <th className="px-3 py-3 text-right font-semibold">Total</th>
                                                            <th className="px-3 py-3 text-right font-semibold rounded-tr-lg">Sisa Pinjaman</th>
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
                                                                <td className="px-3 py-3 text-right text-gray-700">
                                                                    Rp{formatCurrency(item.angsuranBunga)}
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
                                            <div className="mt-4 p-4 bg-[#f9f8cc] rounded-xl border border-yellow-200">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600">Total Angsuran Pokok</p>
                                                        <p className="font-bold text-gray-800">Rp{formatCurrency(result.pinjamanPokok)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-600">Total Bunga</p>
                                                        <p className="font-bold text-gray-800">Rp{formatCurrency(result.totalBunga)}</p>
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
