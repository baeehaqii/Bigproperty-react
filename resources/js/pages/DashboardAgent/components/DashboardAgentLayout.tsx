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
    BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Agent {
    id: number
    name: string
    email: string
    phone: string
    photo?: string
}

interface DashboardAgentLayoutProps {
    agent: Agent
    children: ReactNode
    title?: string
    activeMenu?: 'overview' | 'upload-listing' | 'leads' | 'report' | 'beli-credit' | 'history-credit'
}

interface NavItem {
    id: string
    label: string
    icon: typeof TrendingUp
    href: string
    section: string
}

const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp, href: '/agent/dashboard', section: 'AGENT AREA' },
    { id: 'upload-listing', label: 'Upload Listing', icon: Upload, href: '/agent/dashboard/upload-listing', section: 'AGENT AREA' },
    { id: 'leads', label: 'Leads', icon: Users, href: '/agent/dashboard/leads', section: 'AGENT AREA' },
    { id: 'report', label: 'Report', icon: Globe, href: '/agent/dashboard/report', section: 'AGENT AREA' },
    { id: 'beli-credit', label: 'Beli Credit', icon: CreditCard, href: '/agent/dashboard/beli-credit', section: 'CREDIT' },
    { id: 'history-credit', label: 'History Credit', icon: History, href: '/agent/dashboard/history-credit', section: 'CREDIT' },
]

export function DashboardAgentLayout({ agent, children, title = 'Dashboard Agent', activeMenu = 'overview' }: DashboardAgentLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

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

                    {/* Navigation Menu */}
                    <nav className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
                        {Object.entries(groupedNavItems).map(([section, items]) => (
                            <div key={section}>
                                <h3 className="text-[#0C1C3C] text-xs font-semibold uppercase tracking-wider mb-3">{section}</h3>
                                <div className="space-y-1">
                                    {items.map((item) => {
                                        const Icon = item.icon
                                        const isActive = activeMenu === item.id

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
                        <div className="flex items-center gap-3 mb-4">
                            {agent?.photo ? (
                                <img
                                    src={agent.photo}
                                    alt={`${agent?.name || 'Agent'} profile photo`}
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-[#D6D667] flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-semibold text-lg">
                                        {agent?.name?.charAt(0) || 'A'}
                                    </span>
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-[#0C1C3C] text-base font-semibold truncate">{agent?.name || 'Agent'}</p>
                                <p className="text-[#0C1C3C] text-sm font-normal truncate">{agent?.email || 'agent@email.com'}</p>
                            </div>
                        </div>
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
