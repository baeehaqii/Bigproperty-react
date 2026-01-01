"use client"

import { Head, Link, usePage } from "@inertiajs/react"
import {
    Home,
    Building2,
    Users,
    MessageSquare,
    BarChart3,
    Settings,
    LogOut,
    Plus,
    Eye,
    Phone,
    TrendingUp,
    Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AgentDashboardProps {
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

export default function AgentDashboard({ agent, stats }: AgentDashboardProps) {
    const defaultStats = {
        totalListings: stats?.totalListings ?? 0,
        totalViews: stats?.totalViews ?? 0,
        totalInquiries: stats?.totalInquiries ?? 0,
        totalLeads: stats?.totalLeads ?? 0,
    }

    return (
        <>
            <Head title="Dashboard Agent - BigProperty" />

            <div className="flex min-h-screen bg-gray-50">
                {/* Sidebar */}
                <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
                    {/* Logo */}
                    <div className="flex items-center h-16 px-6 border-b border-gray-200">
                        <Link href="/">
                            <img
                                src="/images/logo-big.png"
                                alt="BigProperty"
                                className="h-8"
                                onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg'
                                }}
                            />
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        <Link
                            href="/agent/dashboard"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg"
                        >
                            <Home className="w-5 h-5" />
                            Dashboard
                        </Link>
                        <Link
                            href="/agent/properties"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <Building2 className="w-5 h-5" />
                            Properti Saya
                        </Link>
                        <Link
                            href="/agent/leads"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <Users className="w-5 h-5" />
                            Leads
                        </Link>
                        <Link
                            href="/agent/messages"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Pesan
                        </Link>
                        <Link
                            href="/agent/analytics"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <BarChart3 className="w-5 h-5" />
                            Statistik
                        </Link>
                        <Link
                            href="/agent/settings"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <Settings className="w-5 h-5" />
                            Pengaturan
                        </Link>
                    </nav>

                    {/* User Profile */}
                    <div className="p-4 border-t border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                    {agent?.name?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {agent?.name || 'Agent'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {agent?.email || 'agent@email.com'}
                                </p>
                            </div>
                        </div>
                        <form action="/agent/logout" method="POST">
                            <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                            <Button
                                type="submit"
                                variant="outline"
                                className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </Button>
                        </form>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:pl-64">
                    {/* Top Header */}
                    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
                        <div className="flex items-center justify-between h-16 px-6">
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Selamat Datang, {agent?.name || 'Agent'}!
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Kelola properti dan leads Anda dari sini
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </Button>
                                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4" />
                                    Tambah Properti
                                </Button>
                            </div>
                        </div>
                    </header>

                    {/* Dashboard Content */}
                    <div className="p-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        Total Properti
                                    </CardTitle>
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {defaultStats.totalListings}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        properti aktif
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        Total Views
                                    </CardTitle>
                                    <Eye className="w-5 h-5 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {defaultStats.totalViews.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        bulan ini
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        Total Inquiry
                                    </CardTitle>
                                    <Phone className="w-5 h-5 text-orange-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {defaultStats.totalInquiries}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        permintaan info
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        Total Leads
                                    </CardTitle>
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {defaultStats.totalLeads}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        calon pembeli
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Aksi Cepat</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button variant="outline" className="w-full justify-start gap-3">
                                        <Plus className="w-5 h-5" />
                                        Tambah Properti Baru
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-3">
                                        <Users className="w-5 h-5" />
                                        Lihat Leads Terbaru
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-3">
                                        <MessageSquare className="w-5 h-5" />
                                        Balas Pesan
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-3">
                                        <Settings className="w-5 h-5" />
                                        Update Profil
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Properti Terbaru</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <Building2 className="w-12 h-12 text-gray-300 mb-4" />
                                        <p className="text-gray-500 mb-4">
                                            Anda belum memiliki properti
                                        </p>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            Tambah Properti Pertama
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}
