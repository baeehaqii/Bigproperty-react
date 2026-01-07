"use client"

import { Head, Link, router } from "@inertiajs/react"
import { useState, ReactNode } from "react"
import {
    TrendingUp,
    Upload,
    Users,
    Globe,
    CreditCard,
    History,
    LogOut,
    Menu,
    X,
    Building2,
    UserCircle,
    Lock,
    AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Agent {
    id: number
    name: string
    email: string
    phone: string
    photo?: string
    display_name?: string
    display_photo?: string
    is_profile_complete?: boolean
    jenis_akun?: string
    jenis_akun_label?: string
}

interface DashboardAgentLayoutProps {
    agent: Agent
    children: ReactNode
    title?: string
    activeMenu?: 'overview' | 'listing-saya' | 'upload-listing' | 'leads' | 'report' | 'beli-credit' | 'history-credit' | 'profile'
}

interface NavItem {
    id: string
    label: string
    icon: typeof TrendingUp
    href: string
    section: string
    requiresProfile?: boolean // Menu requires complete profile
}

const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp, href: '/agent/dashboard', section: 'AGENT AREA', requiresProfile: true },
    { id: 'listing-saya', label: 'Listing Saya', icon: Building2, href: '/agent/dashboard/listing-saya', section: 'AGENT AREA', requiresProfile: true },
    { id: 'upload-listing', label: 'Upload Listing', icon: Upload, href: '/agent/dashboard/upload-listing', section: 'AGENT AREA', requiresProfile: true },
    { id: 'leads', label: 'Leads', icon: Users, href: '/agent/dashboard/leads', section: 'AGENT AREA', requiresProfile: true },
    { id: 'report', label: 'Report', icon: Globe, href: '/agent/dashboard/report', section: 'AGENT AREA', requiresProfile: true },
    { id: 'beli-credit', label: 'Beli Credit', icon: CreditCard, href: '/agent/dashboard/beli-credit', section: 'CREDIT', requiresProfile: true },
    { id: 'history-credit', label: 'History Credit', icon: History, href: '/agent/dashboard/history-credit', section: 'CREDIT', requiresProfile: true },
    { id: 'profile', label: 'Profile', icon: UserCircle, href: '/agent/dashboard/profile', section: 'AKUN', requiresProfile: false },
]

export function DashboardAgentLayout({ agent, children, title = 'Dashboard Agent', activeMenu = 'overview' }: DashboardAgentLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const isProfileComplete = agent?.is_profile_complete ?? false

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault()
        router.post('/agent/logout')
    }

    // Group nav items by section
    const groupedNavItems = navItems.reduce((acc, item) => {
        if (!acc[item.section]) {
            acc[item.section] = []
        }
        acc[item.section].push(item)
        return acc
    }, {} as Record<string, NavItem[]>)

    // Display name and photo
    const displayName = agent?.display_name || agent?.name || 'Agent'
    const displayPhoto = agent?.display_photo || agent?.photo

    return (
        <>
            <Head title={`${title} - BigProperty`} />

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <div className="flex min-h-screen font-sans">
                {/* SIDEBAR */}
                <aside
                    className={`w-64 bg-[#F7F7F7] fixed inset-y-0 left-0 flex flex-col z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        } lg:translate-x-0`}
                >
                    {/* Logo Section */}
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img
                                    src="https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761232717/Logo_Big_t3qpb3.png"
                                    alt="BigProperty Logo"
                                    className="w-14 h-14 object-contain"
                                />
                                <div>
                                    <h1 className="text-[#0C1C3C] text-lg font-bold">Agent Hub</h1>
                                    <p className="text-[#0C1C3C] text-xs font-normal">Dashboard</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleSidebar}
                                aria-label="Close sidebar"
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-200 cursor-pointer transition-all duration-200"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Profile Incomplete Warning */}
                    {!isProfileComplete && (
                        <div className="mx-6 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-amber-800">Profil Belum Lengkap</p>
                                    <p className="text-xs text-amber-700 mt-0.5">Lengkapi profil untuk mengakses semua fitur</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Menu */}
                    <nav className="flex-1 px-6 py-4 space-y-6 overflow-y-auto overflow-x-visible">
                        {Object.entries(groupedNavItems).map(([section, items]) => (
                            <div key={section}>
                                <h3 className="text-[#0C1C3C] text-xs font-semibold uppercase tracking-wider mb-3">{section}</h3>
                                <div className="space-y-1">
                                    {items.map((item) => {
                                        const Icon = item.icon
                                        const isActive = activeMenu === item.id
                                        const isDisabled = item.requiresProfile && !isProfileComplete

                                        // If disabled, show non-clickable version
                                        if (isDisabled) {
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="relative group"
                                                >
                                                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-[20px] text-gray-400 cursor-not-allowed opacity-60">
                                                        <Icon className="w-5 h-5" />
                                                        <span>{item.label}</span>
                                                        <Lock className="w-3.5 h-3.5 ml-auto" />
                                                    </div>
                                                    {/* Tooltip - appears below the item */}
                                                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block z-[100] pointer-events-none">
                                                        <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                                                            Lengkapi profil terlebih dahulu
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        return (
                                            <Link
                                                key={item.id}
                                                href={item.href}
                                                className="block cursor-pointer"
                                            >
                                                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-[20px] transition-all duration-200 ${isActive
                                                    ? 'bg-[#D6D667] text-[#0C1C3C]'
                                                    : 'hover:bg-gray-100 text-[#0C1C3C] hover:text-[#D6D667]'
                                                    }`}>
                                                    <Icon className={`w-5 h-5 ${isActive ? '' : 'text-gray-600 group-hover:text-[#D6D667]'}`} />
                                                    <span>{item.label}</span>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* User Profile at Bottom */}
                    <div className="px-6 pb-6 mt-auto">
                        <Link
                            href="/agent/dashboard/profile"
                            className="flex items-center gap-3 mb-4 p-2 -mx-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            {displayPhoto ? (
                                <img
                                    src={displayPhoto}
                                    alt={`${displayName} profile photo`}
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-[#D6D667] flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold text-lg">
                                        {displayName.charAt(0)}
                                    </span>
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-[#0C1C3C] text-base font-semibold truncate">{displayName}</p>
                                <p className="text-gray-500 text-xs truncate">
                                    {agent?.jenis_akun_label || agent?.email || 'agent@email.com'}
                                </p>
                            </div>
                        </Link>
                        <form onSubmit={handleLogout}>
                            <Button
                                type="submit"
                                variant="outline"
                                className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50 rounded-[16px]"
                            >
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </Button>
                        </form>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="flex-1 lg:ml-64 p-4 md:p-5 bg-white min-h-screen overflow-x-hidden">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between mb-6 bg-[#F7F7F7] rounded-[20px] p-4">
                        <button
                            onClick={toggleSidebar}
                            aria-label="Open menu"
                            className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer transition-all duration-200"
                        >
                            <Menu className="w-6 h-6 text-[#0C1C3C]" />
                        </button>
                        <h1 className="text-[#0C1C3C] text-lg font-bold">Agent Hub</h1>
                        <div className="w-10"></div>
                    </div>

                    {/* Page Content */}
                    {children}
                </main>
            </div>
        </>
    )
}

export default DashboardAgentLayout

