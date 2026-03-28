"use client"

import { useEffect, useRef, useState } from "react"
import {
    Building2,
    Eye,
    Phone,
    TrendingUp,
    Download,
    FileText,
    MessageSquare,
    Users,
    Settings,
    Calendar,
    Plus,
    AlertTriangle,
} from "lucide-react"
import Chart from "chart.js/auto"
import { DashboardAgentLayout } from "../components/DashboardAgentLayout"

interface OverviewProps {
    agent: {
        id: number
        name: string
        email: string
        phone: string
        photo?: string
    }
    stats?: {
        totalListings: number
        totalViews: number
        totalInquiries: number
        totalLeads: number
    }
}

export default function Overview({ agent, stats }: OverviewProps) {
    const [exportModalOpen, setExportModalOpen] = useState(false)
    const [notFoundModalOpen, setNotFoundModalOpen] = useState(false)
    const [exportProgress, setExportProgress] = useState(0)
    const [startDate, setStartDate] = useState("2024-01-01")
    const [endDate, setEndDate] = useState("2024-12-31")
    const [quickRange, setQuickRange] = useState("custom")
    const [metricFilter, setMetricFilter] = useState("all")

    // Chart refs
    const revenueChartRef = useRef<HTMLCanvasElement>(null)
    const activityChartRef = useRef<HTMLCanvasElement>(null)
    const trafficChartRef = useRef<HTMLCanvasElement>(null)
    const deviceChartRef = useRef<HTMLCanvasElement>(null)
    const chartInstances = useRef<Chart[]>([])

    const defaultStats = {
        totalListings: stats?.totalListings ?? 0,
        totalViews: stats?.totalViews ?? 0,
        totalInquiries: stats?.totalInquiries ?? 0,
        totalLeads: stats?.totalLeads ?? 0,
    }

    const applyQuickRange = (range: string) => {
        setQuickRange(range)
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

    const showExportModal = () => {
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

    // Initialize charts
    useEffect(() => {
        // Destroy existing charts
        chartInstances.current.forEach(chart => chart.destroy())
        chartInstances.current = []

        // Revenue Trend Chart (Line)
        if (revenueChartRef.current) {
            const chart = new Chart(revenueChartRef.current, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Views',
                        data: [42, 55, 48, 67, 58, 72],
                        borderColor: '#D6D667',
                        backgroundColor: 'rgba(214, 214, 103, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#D6D667',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
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
                                padding: 20
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            })
            chartInstances.current.push(chart)
        }

        // User Activity Chart (Bar)
        if (activityChartRef.current) {
            const chart = new Chart(activityChartRef.current, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Visitors',
                        data: [28, 34, 45, 52, 48, 35, 29],
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
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            })
            chartInstances.current.push(chart)
        }

        // Traffic Sources Chart (Pie)
        if (trafficChartRef.current) {
            const chart = new Chart(trafficChartRef.current, {
                type: 'pie',
                data: {
                    labels: ['Organic Search', 'Direct', 'Social Media', 'Email', 'Referral'],
                    datasets: [{
                        data: [35, 25, 20, 12, 8],
                        backgroundColor: [
                            '#D6D667',
                            '#82D9D7',
                            '#FAAC7B',
                            '#D6D667',
                            '#A855F7'
                        ],
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
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            })
            chartInstances.current.push(chart)
        }

        // Device Types Chart (Doughnut)
        if (deviceChartRef.current) {
            const chart = new Chart(deviceChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: ['Desktop', 'Mobile', 'Tablet'],
                    datasets: [{
                        data: [45, 40, 15],
                        backgroundColor: [
                            '#D6D667',
                            '#82D9D7',
                            '#FAAC7B'
                        ],
                        borderWidth: 3,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '60%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            })
            chartInstances.current.push(chart)
        }

        return () => {
            chartInstances.current.forEach(chart => chart.destroy())
        }
    }, [])

    return (
        <DashboardAgentLayout agent={agent} title="Overview" activeMenu="overview">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-[#0C1C3C] text-2xl md:text-3xl font-bold mb-1">
                        Welcome, {agent?.name || 'Agent'}!
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">
                        Manage your properties and track your performance here
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex md:items-center md:gap-3">
                    <button
                        onClick={showExportModal}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] font-medium hover:border-[#D6D667] transition-all duration-200 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={showExportModal}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D6D667] text-[#0C1C3C] rounded-[16px] font-medium hover:bg-[#c5c55f] transition-all duration-200 cursor-pointer"
                    >
                        <FileText className="w-4 h-4" />
                        <span>Generate Report</span>
                    </button>
                </div>
            </div>

            {/* Date Range Picker */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3 mb-6 md:mb-8">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Date Range & Filters</h3>
                <div className="bg-white rounded-[20px] p-4 md:p-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="block text-[#0C1C3C] text-sm font-medium">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[#0C1C3C] text-sm font-medium">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[#0C1C3C] text-sm font-medium">Quick Range</label>
                            <select
                                value={quickRange}
                                onChange={(e) => applyQuickRange(e.target.value)}
                                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200 appearance-none bg-no-repeat cursor-pointer pr-10"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                    backgroundPosition: 'right 10px center'
                                }}
                            >
                                <option value="custom">Custom Range</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                                <option value="1y">Last Year</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[#0C1C3C] text-sm font-medium">Metric</label>
                            <select
                                value={metricFilter}
                                onChange={(e) => setMetricFilter(e.target.value)}
                                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200 appearance-none bg-no-repeat cursor-pointer pr-10"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                                    backgroundPosition: 'right 10px center'
                                }}
                            >
                                <option value="all">All Metrics</option>
                                <option value="views">Views</option>
                                <option value="inquiries">Inquiries</option>
                                <option value="leads">Leads</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Total Properties</h3>
                    <div className="bg-white rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{defaultStats.totalListings}</p>
                                <p className="text-green-600 text-sm font-medium">active properties</p>
                            </div>
                            <div className="w-16 h-16 bg-[#D6D667] rounded-[22px] flex items-center justify-center">
                                <Building2 className="w-7 h-7 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Total Views</h3>
                    <div className="bg-white rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{defaultStats.totalViews.toLocaleString()}</p>
                                <p className="text-green-600 text-sm font-medium">+12% this month</p>
                            </div>
                            <div className="w-16 h-16 bg-[#82D9D7] rounded-[22px] flex items-center justify-center">
                                <Eye className="w-7 h-7 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Total Inquiry</h3>
                    <div className="bg-white rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{defaultStats.totalInquiries}</p>
                                <p className="text-blue-600 text-sm font-medium">info requests</p>
                            </div>
                            <div className="w-16 h-16 bg-[#FAAC7B] rounded-[22px] flex items-center justify-center">
                                <Phone className="w-7 h-7 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Total Leads</h3>
                    <div className="bg-white rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#0C1C3C] text-4xl font-extrabold mb-1">{defaultStats.totalLeads}</p>
                                <p className="text-green-600 text-sm font-medium">potential buyers</p>
                            </div>
                            <div className="w-16 h-16 bg-[#D6D667] rounded-[22px] flex items-center justify-center">
                                <TrendingUp className="w-7 h-7 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 md:mb-8">
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Views Trend</h3>
                    <div className="bg-white rounded-[20px] p-4 md:p-5">
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-96 h-80">
                                <canvas ref={revenueChartRef}></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Visitor Activity</h3>
                    <div className="bg-white rounded-[20px] p-4 md:p-5">
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-96 h-80">
                                <canvas ref={activityChartRef}></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Traffic Sources</h3>
                    <div className="bg-white rounded-[20px] p-4 md:p-5">
                        <div className="w-full">
                            <div className="h-64">
                                <canvas ref={trafficChartRef}></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Device Types</h3>
                    <div className="bg-white rounded-[20px] p-4 md:p-5">
                        <div className="w-full">
                            <div className="h-64">
                                <canvas ref={deviceChartRef}></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Top Properties</h3>
                    <div className="bg-white rounded-[20px] p-4 md:p-5">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#0C1C3C] font-semibold text-sm truncate">Rumah Mewah BSD</p>
                                    <p className="text-gray-500 text-xs">Tangerang Selatan</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#0C1C3C] font-bold text-sm">1.2K</p>
                                    <p className="text-green-600 text-xs">+8%</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#0C1C3C] font-semibold text-sm truncate">Apartemen Sudirman</p>
                                    <p className="text-gray-500 text-xs">Jakarta Pusat</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#0C1C3C] font-bold text-sm">920</p>
                                    <p className="text-green-600 text-xs">+15%</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#0C1C3C] font-semibold text-sm truncate">Ruko PIK</p>
                                    <p className="text-gray-500 text-xs">Jakarta Utara</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#0C1C3C] font-bold text-sm">680</p>
                                    <p className="text-blue-600 text-xs">+3%</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#0C1C3C] font-semibold text-sm truncate">Tanah Bogor</p>
                                    <p className="text-gray-500 text-xs">Bogor</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[#0C1C3C] font-bold text-sm">410</p>
                                    <p className="text-red-600 text-xs">-2%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 px-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold">Quick Actions</h3>
                    <button
                        onClick={() => setNotFoundModalOpen(true)}
                        className="cursor-pointer text-sm text-[#D6D667] hover:underline"
                    >
                        See All
                    </button>
                </div>
                <div className="bg-white rounded-[20px] p-4 md:p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="border border-[#DCDEDD] rounded-[16px] p-4 hover:border-[#D6D667] transition-all duration-200">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-[#DCFCE7] rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Plus className="w-6 h-6 text-[#166534]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[#0C1C3C] font-bold text-sm mb-1">Add Property</h4>
                                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">Add new property to the market</p>
                                    <a href="/agent/dashboard/upload-listing" className="text-[#D6D667] text-xs font-medium hover:underline cursor-pointer">
                                        Start Now
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="border border-[#DCDEDD] rounded-[16px] p-4 hover:border-[#D6D667] transition-all duration-200">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-[#DBEAFE] rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Users className="w-6 h-6 text-[#1E40AF]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[#0C1C3C] font-bold text-sm mb-1">View Leads</h4>
                                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">Manage interested buyers</p>
                                    <a
                                        href="/agent/dashboard/leads"
                                        className="text-[#D6D667] text-xs font-medium hover:underline cursor-pointer"
                                    >
                                        View Details
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="border border-[#DCDEDD] rounded-[16px] p-4 hover:border-[#EF3F09] transition-all duration-200">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-[#FEF9C3] rounded-lg flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="w-6 h-6 text-[#854D0E]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[#0C1C3C] font-bold text-sm mb-1">Reply Messages</h4>
                                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">Quick response to buyer questions</p>
                                    <button
                                        onClick={() => setNotFoundModalOpen(true)}
                                        className="text-[#D6D667] text-xs font-medium hover:underline cursor-pointer"
                                    >
                                        Open Messages
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border border-[#DCDEDD] rounded-[16px] p-4 hover:border-[#D6D667] transition-all duration-200">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-[#FFEDD5] rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Settings className="w-6 h-6 text-[#9A3412]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[#0C1C3C] font-bold text-sm mb-1">Update Profile</h4>
                                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">Complete profile to increase trust</p>
                                    <button
                                        onClick={() => setNotFoundModalOpen(true)}
                                        className="text-[#D6D667] text-xs font-medium hover:underline cursor-pointer"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border border-[#DCDEDD] rounded-[16px] p-4 hover:border-[#D6D667] transition-all duration-200">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-[#FEE2E2] rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-[#991B1B]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[#0C1C3C] font-bold text-sm mb-1">Custom Report</h4>
                                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">Create performance reports with custom metrics</p>
                                    <button
                                        onClick={showExportModal}
                                        className="text-[#D6D667] text-xs font-medium hover:underline cursor-pointer"
                                    >
                                        Create Report
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="border border-[#DCDEDD] rounded-[16px] p-4 hover:border-[#D6D667] transition-all duration-200">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-[#82D9D7]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-6 h-6 text-[#0C1C3C]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[#0C1C3C] font-bold text-sm mb-1">Scheduled Reports</h4>
                                    <p className="text-gray-500 text-xs mb-3 line-clamp-2">Automatic reports sent to your email</p>
                                    <button
                                        onClick={() => setNotFoundModalOpen(true)}
                                        className="text-[#D6D667] text-xs font-medium hover:underline cursor-pointer"
                                    >
                                        Set Schedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Progress Modal */}
            {exportModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[20px] p-6 max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-[#DBEAFE] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Download className="w-8 h-8 text-[#1E40AF]" />
                        </div>
                        <h3 className="text-[#0C1C3C] text-xl font-bold mb-2">Exporting Report</h3>
                        <p className="text-gray-500 text-sm mb-6">Please wait while we prepare your report...</p>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                            <div
                                className="bg-[#D6D667] h-3 rounded-full transition-all duration-300"
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
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Page Not Found Modal */}
            {notFoundModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[20px] p-6 max-w-sm w-full text-center">
                        <div className="w-16 h-16 bg-[#FEF9C3] rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-[#854D0E]" />
                        </div>
                        <h3 className="text-[#0C1C3C] text-xl font-bold mb-2">Feature Not Available</h3>
                        <p className="text-gray-500 text-sm mb-6">This feature is currently in development.</p>
                        <button
                            onClick={() => setNotFoundModalOpen(false)}
                            className="w-full px-4 py-2.5 bg-[#D6D667] text-[#0C1C3C] rounded-[16px] font-medium hover:bg-[#c5c55f] transition-all duration-200 cursor-pointer"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}
        </DashboardAgentLayout>
    )
}
