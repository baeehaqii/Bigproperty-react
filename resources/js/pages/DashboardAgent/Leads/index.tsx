"use client"

import { useState } from "react"
import {
    Users,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    Clock,
    AlertTriangle,
} from "lucide-react"
import { DashboardAgentLayout } from "../components/DashboardAgentLayout"

interface Lead {
    id: number
    nama_lengkap: string
    no_whatsapp: string
    email: string | null
    listing_source: string
    status_lead: 'cold' | 'warm' | 'hot'
    status_followup: 'belum' | 'sudah'
    tanggal_leads: string
    contact_source?: 'phone' | 'whatsapp'
    property?: {
        id: number
        name: string
    }
}

interface LeadsPageProps {
    agent: {
        id: number
        name: string
        email: string
        phone: string
        photo?: string
    }
    leads?: Lead[]
    stats?: {
        total: number
        cold: number
        warm: number
        hot: number
        followed: number
        notFollowed: number
    }
}

export default function LeadsPage({ agent, leads = [], stats }: LeadsPageProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterFollowup, setFilterFollowup] = useState<string>('all')
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [detailModalOpen, setDetailModalOpen] = useState(false)

    const defaultStats = {
        total: stats?.total ?? leads.length,
        cold: stats?.cold ?? leads.filter(l => l.status_lead === 'cold').length,
        warm: stats?.warm ?? leads.filter(l => l.status_lead === 'warm').length,
        hot: stats?.hot ?? leads.filter(l => l.status_lead === 'hot').length,
        followed: stats?.followed ?? leads.filter(l => l.status_followup === 'sudah').length,
        notFollowed: stats?.notFollowed ?? leads.filter(l => l.status_followup === 'belum').length,
    }

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.no_whatsapp.includes(searchQuery) ||
            (lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

        const matchesStatus = filterStatus === 'all' || lead.status_lead === filterStatus
        const matchesFollowup = filterFollowup === 'all' || lead.status_followup === filterFollowup

        return matchesSearch && matchesStatus && matchesFollowup
    })

    const getStatusBadge = (status: string) => {
        const styles = {
            cold: 'bg-blue-100 text-blue-700',
            warm: 'bg-yellow-100 text-yellow-700',
            hot: 'bg-red-100 text-red-700',
        }
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'
    }

    const getFollowupBadge = (status: string) => {
        return status === 'sudah'
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700'
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const openLeadDetail = (lead: Lead) => {
        setSelectedLead(lead)
        setDetailModalOpen(true)
    }

    return (
        <DashboardAgentLayout agent={agent} title="Leads" activeMenu="leads">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-[#0C1C3C] text-2xl md:text-3xl font-bold mb-1">
                        Data Leads
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">
                        Kelola dan follow up calon pembeli dari properti Anda
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 md:mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#C5E151]/20 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-[#0C1C3C]" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#0C1C3C]">{defaultStats.total}</p>
                            <p className="text-xs text-gray-500">Total Leads</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-700 font-bold text-sm">C</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#0C1C3C]">{defaultStats.cold}</p>
                            <p className="text-xs text-gray-500">Cold</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span className="text-yellow-700 font-bold text-sm">W</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#0C1C3C]">{defaultStats.warm}</p>
                            <p className="text-xs text-gray-500">Warm</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-red-700 font-bold text-sm">H</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#0C1C3C]">{defaultStats.hot}</p>
                            <p className="text-xs text-gray-500">Hot</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-700" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#0C1C3C]">{defaultStats.followed}</p>
                            <p className="text-xs text-gray-500">Followed</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-orange-700" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[#0C1C3C]">{defaultStats.notFollowed}</p>
                            <p className="text-xs text-gray-500">Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3 mb-6">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Filter & Cari</h3>
                <div className="bg-white rounded-[20px] p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama, nomor WA, atau email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#EF3F09] focus:ring-1 focus:ring-[#EF3F09] focus:outline-none"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#EF3F09] focus:ring-1 focus:ring-[#EF3F09] focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="all">Semua Status</option>
                                <option value="cold">Cold</option>
                                <option value="warm">Warm</option>
                                <option value="hot">Hot</option>
                            </select>
                        </div>

                        {/* Followup Filter */}
                        <div>
                            <select
                                value={filterFollowup}
                                onChange={(e) => setFilterFollowup(e.target.value)}
                                className="w-full px-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#EF3F09] focus:ring-1 focus:ring-[#EF3F09] focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="all">Semua Followup</option>
                                <option value="sudah">Sudah Followup</option>
                                <option value="belum">Belum Followup</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">
                    Daftar Leads ({filteredLeads.length})
                </h3>
                <div className="bg-white rounded-[20px] overflow-hidden">
                    {filteredLeads.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-[#0C1C3C] font-bold text-lg mb-2">Belum Ada Leads</h3>
                            <p className="text-gray-500 text-sm">
                                Leads akan muncul di sini ketika ada calon pembeli yang menghubungi Anda melalui listing properti.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nama</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Kontak</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Dari Listing</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Followup</th>
                                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tanggal</th>
                                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredLeads.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-[#0C1C3C]">{lead.nama_lengkap}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{lead.no_whatsapp}</span>
                                                    </div>
                                                    {lead.email && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Mail className="w-4 h-4" />
                                                            <span>{lead.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 max-w-[200px] truncate">
                                                    {lead.listing_source}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(lead.status_lead)}`}>
                                                    {lead.status_lead}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${getFollowupBadge(lead.status_followup)}`}>
                                                    {lead.status_followup === 'sudah' ? 'Sudah' : 'Belum'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(lead.tanggal_leads)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <a
                                                        href={`https://wa.me/62${lead.no_whatsapp.replace(/^(\+62|62|0)/, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                        title="Chat WhatsApp"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => openLeadDetail(lead)}
                                                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                        title="Lihat Detail"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
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

            {/* Lead Detail Modal */}
            {detailModalOpen && selectedLead && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[20px] p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[#0C1C3C] text-xl font-bold">Detail Lead</h3>
                            <button
                                onClick={() => setDetailModalOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-500">Nama Lengkap</label>
                                <p className="font-semibold text-[#0C1C3C]">{selectedLead.nama_lengkap}</p>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500">No. WhatsApp</label>
                                <p className="font-semibold text-[#0C1C3C]">{selectedLead.no_whatsapp}</p>
                            </div>

                            {selectedLead.email && (
                                <div>
                                    <label className="text-sm text-gray-500">Email</label>
                                    <p className="font-semibold text-[#0C1C3C]">{selectedLead.email}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm text-gray-500">Dari Listing</label>
                                <p className="font-semibold text-[#0C1C3C]">{selectedLead.listing_source}</p>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-sm text-gray-500">Status Lead</label>
                                    <p>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(selectedLead.status_lead)}`}>
                                            {selectedLead.status_lead}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm text-gray-500">Status Followup</label>
                                    <p>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${getFollowupBadge(selectedLead.status_followup)}`}>
                                            {selectedLead.status_followup === 'sudah' ? 'Sudah' : 'Belum'}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-500">Tanggal Masuk</label>
                                <p className="font-semibold text-[#0C1C3C]">{formatDate(selectedLead.tanggal_leads)}</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <a
                                href={`https://wa.me/62${selectedLead.no_whatsapp.replace(/^(\+62|62|0)/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
                            >
                                <Phone className="w-5 h-5" />
                                <span>WhatsApp</span>
                            </a>
                            <button
                                onClick={() => setDetailModalOpen(false)}
                                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardAgentLayout>
    )
}
