"use client"

import { useEffect, useRef, useState } from "react"
import {
    FileText,
    Download,
    TrendingUp,
    TrendingDown,
    Users,
    Eye,
    Phone,
    Building2,
    Calendar,
    BarChart3,
    PieChart,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
} from "lucide-react"
import Chart from "chart.js/auto"
import { DashboardAgentLayout } from "../components/DashboardAgentLayout"

interface ReportProps {
    agent: {
        id: number
        name: string
        email: string
        phone: string
        photo?: string
    }
    reportData?: {
        // Performance Summary
        totalListings: number
        activeListings: number
        pendingListings: number
        draftListings: number
        totalViews: number
        totalLeads: number
        conversionRate: number
        avgResponseTime: string

        // Lead Stats
        coldLeads: number
        warmLeads: number
        hotLeads: number
        followedLeads: number
        unfollowedLeads: number

        // Trends
        viewsTrend: number
        leadsTrend: number
        listingsTrend: number

        // Monthly Data
        monthlyViews: number[]
        monthlyLeads: number[]
        monthlyLabels: string[]

        // Top Properties
        topProperties: Array<{
            id: number
            name: string
            views: number
            leads: number
            location: string
        }>

        // Lead Sources
        leadSources: Array<{
            name: string
            count: number
            percentage: number
        }>

        // Weekly Activity
        weeklyActivity: number[]
    }
}

export default function Report({ agent, reportData }: ReportProps) {
    const [exportModalOpen, setExportModalOpen] = useState(false)
    const [exportProgress, setExportProgress] = useState(0)
    const [exportType, setExportType] = useState<'pdf' | 'excel' | 'csv'>('pdf')
    const [dateRange, setDateRange] = useState('30d')
    const [startDate, setStartDate] = useState(() => {
        const date = new Date()
        date.setDate(date.getDate() - 30)
        return date.toISOString().split('T')[0]
    })
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

    // Chart refs
    const performanceChartRef = useRef<HTMLCanvasElement>(null)
    const leadsChartRef = useRef<HTMLCanvasElement>(null)
    const conversionFunnelRef = useRef<HTMLCanvasElement>(null)
    const leadSourcesChartRef = useRef<HTMLCanvasElement>(null)
    const weeklyActivityRef = useRef<HTMLCanvasElement>(null)
    const chartInstances = useRef<Chart[]>([])

    // Default data jika tidak ada dari backend
    const defaultData = {
        totalListings: reportData?.totalListings ?? 0,
        activeListings: reportData?.activeListings ?? 0,
        pendingListings: reportData?.pendingListings ?? 0,
        draftListings: reportData?.draftListings ?? 0,
        totalViews: reportData?.totalViews ?? 0,
        totalLeads: reportData?.totalLeads ?? 0,
        conversionRate: reportData?.conversionRate ?? 0,
        avgResponseTime: reportData?.avgResponseTime ?? '-',
        coldLeads: reportData?.coldLeads ?? 0,
        warmLeads: reportData?.warmLeads ?? 0,
        hotLeads: reportData?.hotLeads ?? 0,
        followedLeads: reportData?.followedLeads ?? 0,
        unfollowedLeads: reportData?.unfollowedLeads ?? 0,
        viewsTrend: reportData?.viewsTrend ?? 0,
        leadsTrend: reportData?.leadsTrend ?? 0,
        listingsTrend: reportData?.listingsTrend ?? 0,
        monthlyViews: reportData?.monthlyViews ?? [0, 0, 0, 0, 0, 0],
        monthlyLeads: reportData?.monthlyLeads ?? [0, 0, 0, 0, 0, 0],
        monthlyLabels: reportData?.monthlyLabels ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        topProperties: reportData?.topProperties ?? [],
        leadSources: reportData?.leadSources ?? [],
        weeklyActivity: reportData?.weeklyActivity ?? [0, 0, 0, 0, 0, 0, 0],
    }

    const applyDateRange = (range: string) => {
        setDateRange(range)
        const end = new Date()
        const start = new Date()

        switch (range) {
            case '7d':
                start.setDate(end.getDate() - 7)
                break
            case '30d':
                start.setDate(end.getDate() - 30)
                break
            case '90d':
                start.setDate(end.getDate() - 90)
                break
            case '1y':
                start.setFullYear(end.getFullYear() - 1)
                break
            default:
                return
        }

        setStartDate(start.toISOString().split('T')[0])
        setEndDate(end.toISOString().split('T')[0])
    }

    const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
        setExportType(type)
        setExportModalOpen(true)
        simulateExport()
    }

    const simulateExport = () => {
        let progress = 0
        const interval = setInterval(() => {
            progress += Math.random() * 30
            if (progress >= 100) {
                progress = 100
                clearInterval(interval)
                setTimeout(() => {
                    setExportModalOpen(false)
                    setExportProgress(0)
                }, 500)
            }
            setExportProgress(progress)
        }, 200)
    }

    const getTrendIcon = (trend: number) => {
        if (trend > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />
        if (trend < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />
        return null
    }

    const getTrendColor = (trend: number) => {
        if (trend > 0) return 'text-green-600'
        if (trend < 0) return 'text-red-600'
        return 'text-gray-500'
    }

    // Initialize charts
    useEffect(() => {
        // Destroy existing charts
        chartInstances.current.forEach(chart => chart.destroy())
        chartInstances.current = []

        // Performance Trend Chart (Views & Leads)
        if (performanceChartRef.current) {
            const chart = new Chart(performanceChartRef.current, {
                type: 'line',
                data: {
                    labels: defaultData.monthlyLabels,
                    datasets: [
                        {
                            label: 'Views',
                            data: defaultData.monthlyViews,
                            borderColor: '#D6D667',
                            backgroundColor: 'rgba(214, 214, 103, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#D6D667',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                        },
                        {
                            label: 'Leads',
                            data: defaultData.monthlyLeads,
                            borderColor: '#82D9D7',
                            backgroundColor: 'rgba(130, 217, 215, 0.1)',
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#82D9D7',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            })
            chartInstances.current.push(chart)
        }

        // Lead Status Chart (Doughnut)
        if (leadsChartRef.current) {
            const chart = new Chart(leadsChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Cold', 'Warm', 'Hot'],
                    datasets: [{
                        data: [defaultData.coldLeads, defaultData.warmLeads, defaultData.hotLeads],
                        backgroundColor: ['#60A5FA', '#FBBF24', '#EF4444'],
                        borderWidth: 3,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: { size: 12 }
                            }
                        }
                    }
                }
            })
            chartInstances.current.push(chart)
        }

        // Conversion Funnel (Bar Horizontal)
        if (conversionFunnelRef.current) {
            const chart = new Chart(conversionFunnelRef.current, {
                type: 'bar',
                data: {
                    labels: ['Total Views', 'Total Leads', 'Followed Up', 'Hot Leads'],
                    datasets: [{
                        label: 'Count',
                        data: [
                            defaultData.totalViews,
                            defaultData.totalLeads,
                            defaultData.followedLeads,
                            defaultData.hotLeads
                        ],
                        backgroundColor: ['#D6D667', '#82D9D7', '#FAAC7B', '#EF4444'],
                        borderRadius: 8,
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        y: {
                            grid: { display: false }
                        }
                    }
                }
            })
            chartInstances.current.push(chart)
        }

        // Lead Sources Chart (Pie)
        if (leadSourcesChartRef.current && defaultData.leadSources.length > 0) {
            const chart = new Chart(leadSourcesChartRef.current, {
                type: 'pie',
                data: {
                    labels: defaultData.leadSources.map(s => s.name),
                    datasets: [{
                        data: defaultData.leadSources.map(s => s.count),
                        backgroundColor: ['#D6D667', '#82D9D7', '#FAAC7B', '#A855F7', '#60A5FA'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: { size: 12 }
                            }
                        }
                    }
                }
            })
            chartInstances.current.push(chart)
        }

        // Weekly Activity Chart (Bar)
        if (weeklyActivityRef.current) {
            const chart = new Chart(weeklyActivityRef.current, {
                type: 'bar',
                data: {
                    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                    datasets: [{
                        label: 'Leads',
                        data: defaultData.weeklyActivity,
                        backgroundColor: '#82D9D7',
                        borderColor: '#5BCCCA',
                        borderWidth: 1,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            })
            chartInstances.current.push(chart)
        }

        return () => {
            chartInstances.current.forEach(chart => chart.destroy())
        }
    }, [reportData])

    return (
        <DashboardAgentLayout agent={agent} title="Report" activeMenu="report">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-[#0C1C3C] text-2xl md:text-3xl font-bold mb-1">
                        Laporan Performa
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">
                        Analisis lengkap performa listing dan leads Anda
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full md:w-auto md:flex md:items-center md:gap-3">
                    <button
                        onClick={() => handleExport('pdf')}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-[16px] font-medium hover:bg-red-100 transition-all duration-200 cursor-pointer"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="hidden md:inline">PDF</span>
                    </button>
                    <button
                        onClick={() => handleExport('excel')}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-[16px] font-medium hover:bg-green-100 transition-all duration-200 cursor-pointer"
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span className="hidden md:inline">Excel</span>
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-[16px] font-medium hover:bg-blue-100 transition-all duration-200 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden md:inline">CSV</span>
                    </button>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3 mb-6 md:mb-8">
                <div className="flex items-center gap-2 ml-3 mb-4">
                    <Filter className="w-5 h-5 text-[#0C1C3C]" />
                    <h3 className="text-[#0C1C3C] text-lg font-bold">Filter Periode</h3>
                </div>
                <div className="bg-white rounded-[20px] p-4 md:p-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="block text-[#0C1C3C] text-sm font-medium">Tanggal Mulai</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[#0C1C3C] text-sm font-medium">Tanggal Akhir</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[#0C1C3C] text-sm font-medium">Periode Cepat</label>
                            <select
                                value={dateRange}
                                onChange={(e) => applyDateRange(e.target.value)}
                                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200 appearance-none bg-no-repeat cursor-pointer pr-10"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                    backgroundPosition: 'right 10px center'
                                }}
                            >
                                <option value="custom">Custom</option>
                                <option value="7d">7 Hari Terakhir</option>
                                <option value="30d">30 Hari Terakhir</option>
                                <option value="90d">90 Hari Terakhir</option>
                                <option value="1y">1 Tahun Terakhir</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button className="w-full px-4 py-3 bg-[#D6D667] text-[#0C1C3C] rounded-[16px] font-medium hover:bg-[#c5c55f] transition-all duration-200 cursor-pointer">
                                Terapkan Filter
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
                {/* Total Listings */}
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-sm font-bold ml-3 mb-3">Total Listing</h3>
                    <div className="bg-white rounded-[20px] p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{defaultData.totalListings}</p>
                                <div className="flex items-center gap-1">
                                    {getTrendIcon(defaultData.listingsTrend)}
                                    <span className={`text-xs font-medium ${getTrendColor(defaultData.listingsTrend)}`}>
                                        {defaultData.listingsTrend > 0 ? '+' : ''}{defaultData.listingsTrend}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-[#D6D667] rounded-[16px] flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Views */}
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-sm font-bold ml-3 mb-3">Total Views</h3>
                    <div className="bg-white rounded-[20px] p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{defaultData.totalViews.toLocaleString()}</p>
                                <div className="flex items-center gap-1">
                                    {getTrendIcon(defaultData.viewsTrend)}
                                    <span className={`text-xs font-medium ${getTrendColor(defaultData.viewsTrend)}`}>
                                        {defaultData.viewsTrend > 0 ? '+' : ''}{defaultData.viewsTrend}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-[#82D9D7] rounded-[16px] flex items-center justify-center">
                                <Eye className="w-6 h-6 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Leads */}
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-sm font-bold ml-3 mb-3">Total Leads</h3>
                    <div className="bg-white rounded-[20px] p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{defaultData.totalLeads}</p>
                                <div className="flex items-center gap-1">
                                    {getTrendIcon(defaultData.leadsTrend)}
                                    <span className={`text-xs font-medium ${getTrendColor(defaultData.leadsTrend)}`}>
                                        {defaultData.leadsTrend > 0 ? '+' : ''}{defaultData.leadsTrend}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-[#FAAC7B] rounded-[16px] flex items-center justify-center">
                                <Users className="w-6 h-6 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conversion Rate */}
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-sm font-bold ml-3 mb-3">Konversi</h3>
                    <div className="bg-white rounded-[20px] p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">{defaultData.conversionRate}%</p>
                                <span className="text-xs font-medium text-gray-500">views to leads</span>
                            </div>
                            <div className="w-12 h-12 bg-[#A855F7]/20 rounded-[16px] flex items-center justify-center">
                                <Target className="w-6 h-6 text-[#A855F7]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listing Status Breakdown */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3 mb-6 md:mb-8">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Status Listing</h3>
                <div className="bg-white rounded-[20px] p-4 md:p-5">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-[16px]">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-green-600">{defaultData.activeListings}</p>
                            <p className="text-sm text-gray-600">Aktif</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-[16px]">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Clock className="w-5 h-5 text-yellow-600" />
                            </div>
                            <p className="text-2xl font-bold text-yellow-600">{defaultData.pendingListings}</p>
                            <p className="text-sm text-gray-600">Pending</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-[16px]">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <XCircle className="w-5 h-5 text-gray-600" />
                            </div>
                            <p className="text-2xl font-bold text-gray-600">{defaultData.draftListings}</p>
                            <p className="text-sm text-gray-600">Draft</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 - Performance Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
                {/* Performance Trend */}
                <div className="lg:col-span-2 bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Trend Performa</h3>
                    <div className="bg-white rounded-[20px] p-4 md:p-5">
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-96 h-80">
                                <canvas ref={performanceChartRef}></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lead Status Distribution */}
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Status Leads</h3>
                    <div className="bg-white rounded-[20px] p-4 md:p-5">
                        <div className="w-full">
                            <div className="h-64">
                                <canvas ref={leadsChartRef}></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 - Funnel & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 md:mb-8">
                {/* Conversion Funnel */}
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Conversion Funnel</h3>
                    <div className="bg-white rounded-[20px] p-4 md:p-5">
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-72 h-64">
                                <canvas ref={conversionFunnelRef}></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weekly Activity */}
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Aktivitas Mingguan</h3>
                    <div className="bg-white rounded-[20px] p-4 md:p-5">
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-72 h-64">
                                <canvas ref={weeklyActivityRef}></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lead Followup Status */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3 mb-6 md:mb-8">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Status Follow-up</h3>
                <div className="bg-white rounded-[20px] p-4 md:p-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-green-200 bg-green-50 rounded-[16px]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-700 font-medium">Sudah Follow-up</p>
                                    <p className="text-2xl font-bold text-green-600">{defaultData.followedLeads}</p>
                                </div>
                            </div>
                            <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${defaultData.totalLeads > 0 ? (defaultData.followedLeads / defaultData.totalLeads) * 100 : 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                        <div className="p-4 border border-orange-200 bg-orange-50 rounded-[16px]">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-orange-700 font-medium">Belum Follow-up</p>
                                    <p className="text-2xl font-bold text-orange-600">{defaultData.unfollowedLeads}</p>
                                </div>
                            </div>
                            <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${defaultData.totalLeads > 0 ? (defaultData.unfollowedLeads / defaultData.totalLeads) * 100 : 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Properties Table */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3 mb-6 md:mb-8">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Top Properti</h3>
                <div className="bg-white rounded-[20px] overflow-hidden">
                    {defaultData.topProperties.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-[#0C1C3C] font-bold text-lg mb-2">Belum Ada Data</h3>
                            <p className="text-gray-500 text-sm">
                                Data properti akan muncul setelah Anda menambahkan listing.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">#</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nama Properti</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Lokasi</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Views</th>
                                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Leads</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {defaultData.topProperties.map((property, index) => (
                                        <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-200 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-50 text-gray-600'
                                                    }`}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-[#0C1C3C]">{property.name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">{property.location}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium text-[#0C1C3C]">{property.views.toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium text-[#0C1C3C]">{property.leads}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Response Time Insight */}
            <div className="bg-gradient-to-r from-[#0C1C3C] to-[#1a3a6b] rounded-[20px] p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold mb-2">💡 Tips Meningkatkan Performa</h3>
                        <p className="text-white/80 text-sm">
                            Respon leads dalam 5 menit pertama dapat meningkatkan konversi hingga 9x lipat!
                            Rata-rata waktu respon Anda: <span className="font-bold text-[#D6D667]">{defaultData.avgResponseTime}</span>
                        </p>
                    </div>
                    <a
                        href="/agent/dashboard/leads"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#D6D667] text-[#0C1C3C] rounded-[16px] font-medium hover:bg-[#c5c55f] transition-all duration-200"
                    >
                        <Phone className="w-5 h-5" />
                        Follow-up Leads
                    </a>
                </div>
            </div>

            {/* Export Progress Modal */}
            {exportModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[20px] p-6 max-w-sm w-full text-center">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${exportType === 'pdf' ? 'bg-red-100' :
                            exportType === 'excel' ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                            {exportType === 'pdf' && <FileText className="w-8 h-8 text-red-600" />}
                            {exportType === 'excel' && <BarChart3 className="w-8 h-8 text-green-600" />}
                            {exportType === 'csv' && <Download className="w-8 h-8 text-blue-600" />}
                        </div>
                        <h3 className="text-[#0C1C3C] text-xl font-bold mb-2">
                            Mengekspor {exportType.toUpperCase()}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">Mohon tunggu, laporan sedang disiapkan...</p>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                            <div
                                className={`h-3 rounded-full transition-all duration-300 ${exportType === 'pdf' ? 'bg-red-500' :
                                    exportType === 'excel' ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                style={{ width: `${exportProgress}%` }}
                            ></div>
                        </div>
                        <button
                            onClick={() => {
                                setExportModalOpen(false)
                                setExportProgress(0)
                            }}
                            className="w-full px-4 py-2.5 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] font-medium hover:border-[#D6D667] transition-all duration-200 cursor-pointer"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </DashboardAgentLayout>
    )
}
