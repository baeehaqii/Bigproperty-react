"use client"

import { useState, useEffect, useCallback } from "react"
import { router } from "@inertiajs/react"
import {
    CreditCard,
    Sparkles,
    Check,
    Loader2,
    Star,
    Clock,
    Shield,
    Zap,
    AlertCircle,
    CheckCircle,
    XCircle,
} from "lucide-react"
import { DashboardAgentLayout } from "../components/DashboardAgentLayout"

// Types
interface MembershipHarga {
    amount: number
    duration: number
    period: 'day' | 'month' | 'year'
}

interface MembershipHighlight {
    quantity: number
    duration: number
    period: 'day' | 'month' | 'year'
}

interface Membership {
    id: number
    nama: string
    jenis: string
    deskripsi: string | null
    harga: MembershipHarga
    jumlah_highlight: MembershipHighlight | null
    formatted_harga: string
    formatted_highlight: string
}

interface ActiveCredit {
    id: number
    remaining_listing: number
    remaining_highlight: number
    expired_at: string
    is_active: boolean
    membership: {
        id: number
        nama: string
        jenis: string
    }
}

interface BeliCreditProps {
    agent: {
        id: number
        name: string
        email: string
        phone: string
        photo?: string
    }
    memberships: Membership[]
    activeCredits: ActiveCredit[]
    totalRemainingHighlight: number
    midtransConfig: {
        clientKey: string
        snapUrl: string
    }
}

// Status Modal Component
interface StatusModalProps {
    isOpen: boolean
    status: 'success' | 'pending' | 'error' | null
    message: string
    onClose: () => void
}

function StatusModal({ isOpen, status, message, onClose }: StatusModalProps) {
    if (!isOpen) return null

    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
            title: 'Pembayaran Berhasil!',
            buttonColor: 'bg-green-600 hover:bg-green-700',
        },
        pending: {
            icon: Clock,
            bgColor: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            title: 'Menunggu Pembayaran',
            buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-100',
            iconColor: 'text-red-600',
            title: 'Pembayaran Gagal',
            buttonColor: 'bg-red-600 hover:bg-red-700',
        },
    }

    const currentConfig = status ? config[status] : config.error
    const Icon = currentConfig.icon

    return (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[20px] p-6 max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
                <div className={`w-16 h-16 ${currentConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${currentConfig.iconColor}`} />
                </div>
                <h3 className="text-[#0C1C3C] text-xl font-bold mb-2">{currentConfig.title}</h3>
                <p className="text-gray-500 text-sm mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className={`w-full px-4 py-2.5 ${currentConfig.buttonColor} text-white rounded-[16px] font-medium transition-all duration-200 cursor-pointer`}
                >
                    Mengerti
                </button>
            </div>
        </div>
    )
}

// Loading Overlay Component
interface LoadingOverlayProps {
    isVisible: boolean
    message: string
}

function LoadingOverlay({ isVisible, message }: LoadingOverlayProps) {
    if (!isVisible) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[20px] p-8 max-w-sm w-full text-center shadow-2xl">
                <div className="w-16 h-16 bg-[#D6D667]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-[#D6D667] animate-spin" />
                </div>
                <h3 className="text-[#0C1C3C] text-xl font-bold mb-2">Memproses...</h3>
                <p className="text-gray-500 text-sm">{message}</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#D6D667] h-1.5 rounded-full animate-pulse w-2/3"></div>
                </div>
            </div>
        </div>
    )
}

// Membership Card Component
interface MembershipCardProps {
    membership: Membership
    isPopular?: boolean
    isLoading: boolean
    onSelect: (membership: Membership) => void
}

function MembershipCard({ membership, isPopular, isLoading, onSelect }: MembershipCardProps) {
    const formatPrice = (harga: MembershipHarga) => {
        const amount = new Intl.NumberFormat('id-ID').format(harga.amount)
        const periodLabel = {
            day: 'hari',
            month: 'bulan',
            year: 'tahun',
        }
        return `Rp ${amount}/${harga.duration} ${periodLabel[harga.period]}`
    }

    const getHighlightInfo = (highlight: MembershipHighlight | null) => {
        if (!highlight) return null
        const periodLabel = {
            day: 'hari',
            month: 'bulan',
            year: 'tahun',
        }
        return `${highlight.quantity} highlight / ${highlight.duration} ${periodLabel[highlight.period]}`
    }

    return (
        <div className={`relative bg-white rounded-[24px] border-2 ${isPopular ? 'border-[#D6D667]' : 'border-gray-100'} p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col h-full`}>
            {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#D6D667] to-[#c5c55f] text-[#0C1C3C] text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        BEST VALUE
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-6 pt-2">
                <div className={`w-14 h-14 ${isPopular ? 'bg-[#D6D667]' : 'bg-gray-100'} rounded-[18px] flex items-center justify-center mx-auto mb-4`}>
                    <Sparkles className={`w-7 h-7 ${isPopular ? 'text-[#0C1C3C]' : 'text-gray-500'}`} />
                </div>
                <h3 className="text-[#0C1C3C] text-xl font-bold mb-1">{membership.nama}</h3>
                <span className="inline-block bg-[#D6D667]/20 text-[#0C1C3C] text-xs font-semibold px-3 py-1 rounded-full">
                    Highlight
                </span>
            </div>

            {/* Price */}
            <div className="text-center mb-6">
                <p className="text-[#0C1C3C] text-3xl font-extrabold mb-1">
                    {formatPrice(membership.harga)}
                </p>
                {membership.jumlah_highlight && (
                    <p className="text-gray-500 text-sm">
                        {getHighlightInfo(membership.jumlah_highlight)}
                    </p>
                )}
            </div>

            {/* Features */}
            <div className="flex-1 space-y-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-600 text-sm">
                        {membership.jumlah_highlight?.quantity || 0} Highlight Credit
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-600 text-sm">
                        Berlaku {membership.jumlah_highlight?.duration || 0} {
                            membership.jumlah_highlight?.period === 'day' ? 'Hari' :
                                membership.jumlah_highlight?.period === 'month' ? 'Bulan' : 'Tahun'
                        }
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-600 text-sm">Tampil di halaman utama</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-600 text-sm">Badge Premium Listing</span>
                </div>
            </div>

            {/* CTA Button */}
            <button
                onClick={() => onSelect(membership)}
                disabled={isLoading}
                className={`w-full py-3.5 rounded-[16px] font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${isPopular
                    ? 'bg-[#D6D667] text-[#0C1C3C] hover:bg-[#c5c55f]'
                    : 'bg-[#0C1C3C] text-white hover:bg-[#1a2d50]'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses...</span>
                    </>
                ) : (
                    <>
                        <CreditCard className="w-4 h-4" />
                        <span>Pilih Paket</span>
                    </>
                )}
            </button>
        </div>
    )
}

// Active Credit Card Component
interface ActiveCreditCardProps {
    credit: ActiveCredit
}

function ActiveCreditCard({ credit }: ActiveCreditCardProps) {
    const expiredDate = new Date(credit.expired_at)
    const now = new Date()
    const daysLeft = Math.ceil((expiredDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isExpiringSoon = daysLeft <= 7 && daysLeft > 0
    const isExpired = daysLeft <= 0

    return (
        <div className={`bg-white rounded-[20px] border ${isExpired ? 'border-red-200' : isExpiringSoon ? 'border-yellow-200' : 'border-gray-100'} p-5 transition-all duration-300 hover:shadow-lg`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h4 className="text-[#0C1C3C] font-bold text-lg">{credit.membership.nama}</h4>
                    <span className="text-xs text-gray-500 uppercase">{credit.membership.jenis}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isExpired
                    ? 'bg-red-100 text-red-600'
                    : isExpiringSoon
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-600'
                    }`}>
                    {isExpired ? 'Expired' : isExpiringSoon ? `${daysLeft} hari lagi` : 'Active'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F7F7F7] rounded-[12px] p-3 text-center">
                    <p className="text-2xl font-extrabold text-[#D6D667]">{credit.remaining_highlight}</p>
                    <p className="text-xs text-gray-500">Highlight</p>
                </div>
                <div className="bg-[#F7F7F7] rounded-[12px] p-3 text-center">
                    <p className="text-2xl font-extrabold text-[#82D9D7]">{credit.remaining_listing}</p>
                    <p className="text-xs text-gray-500">Listing</p>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Berlaku sampai: {expiredDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
        </div>
    )
}

export default function BeliCredit({
    agent,
    memberships,
    activeCredits,
    totalRemainingHighlight,
    midtransConfig
}: BeliCreditProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [selectedMembershipId, setSelectedMembershipId] = useState<number | null>(null)
    const [modalStatus, setModalStatus] = useState<{
        isOpen: boolean
        status: 'success' | 'pending' | 'error' | null
        message: string
    }>({
        isOpen: false,
        status: null,
        message: '',
    })

    // Load Midtrans Snap script
    useEffect(() => {
        if (midtransConfig?.snapUrl) {
            const existingScript = document.querySelector(`script[src="${midtransConfig.snapUrl}"]`)
            if (!existingScript) {
                const script = document.createElement('script')
                script.src = midtransConfig.snapUrl
                script.setAttribute('data-client-key', midtransConfig.clientKey)
                script.async = true
                document.body.appendChild(script)
            }
        }
    }, [midtransConfig])

    const handleSelectPackage = useCallback(async (membership: Membership) => {
        setSelectedMembershipId(membership.id)
        setIsLoading(true)
        setLoadingMessage('Menyiapkan pembayaran...')

        try {
            // Call checkout API
            const response = await fetch('/api/agent/membership/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ membership_id: membership.id }),
            })

            const result = await response.json()

            if (!response.ok || result.status === 'error') {
                throw new Error(result.message || 'Terjadi kesalahan')
            }

            setLoadingMessage('Membuka halaman pembayaran...')

            // Open Midtrans Snap
            // @ts-ignore - Midtrans Snap is loaded via script
            if (window.snap) {
                // @ts-ignore
                window.snap.pay(result.data.snap_token, {
                    onSuccess: function (result: any) {
                        setIsLoading(false)
                        setModalStatus({
                            isOpen: true,
                            status: 'success',
                            message: 'Pembayaran berhasil! Credit highlight Anda akan segera ditambahkan.',
                        })
                        // Refresh page after success
                        setTimeout(() => {
                            router.reload()
                        }, 2000)
                    },
                    onPending: function (result: any) {
                        setIsLoading(false)
                        setModalStatus({
                            isOpen: true,
                            status: 'pending',
                            message: 'Segera selesaikan pembayaran Anda sebelum batas waktu.',
                        })
                    },
                    onError: function (result: any) {
                        setIsLoading(false)
                        setModalStatus({
                            isOpen: true,
                            status: 'error',
                            message: 'Pembayaran gagal. Silakan coba lagi.',
                        })
                    },
                    onClose: function () {
                        setIsLoading(false)
                        setSelectedMembershipId(null)
                    },
                })
            } else {
                throw new Error('Payment gateway tidak tersedia. Silakan refresh halaman.')
            }

        } catch (error: any) {
            setIsLoading(false)
            setSelectedMembershipId(null)
            setModalStatus({
                isOpen: true,
                status: 'error',
                message: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
            })
        }
    }, [])

    const closeModal = () => {
        setModalStatus({ isOpen: false, status: null, message: '' })
    }

    // Sort memberships by price (ascending) and mark the middle one as popular
    const sortedMemberships = [...memberships].sort((a, b) => a.harga.amount - b.harga.amount)
    const popularIndex = sortedMemberships.length > 2 ? Math.floor(sortedMemberships.length / 2) : 0

    return (
        <DashboardAgentLayout agent={agent} title="Beli Credit" activeMenu="beli-credit">
            {/* Loading Overlay */}
            <LoadingOverlay isVisible={isLoading} message={loadingMessage} />

            {/* Status Modal */}
            <StatusModal
                isOpen={modalStatus.isOpen}
                status={modalStatus.status}
                message={modalStatus.message}
                onClose={closeModal}
            />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-[#0C1C3C] text-2xl md:text-3xl font-bold mb-1">
                        Beli Credit Highlight
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">
                        Tingkatkan visibilitas properti Anda dengan highlight
                    </p>
                </div>
            </div>

            {/* Current Credit Summary */}
            <div className="bg-gradient-to-r from-[#D6D667] to-[#c5c55f] rounded-[24px] p-6 md:p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-[16px] flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-[#0C1C3C]" />
                        </div>
                        <div>
                            <p className="text-[#0C1C3C]/70 text-sm font-medium">Sisa Credit Highlight Anda</p>
                            <h2 className="text-[#0C1C3C] text-4xl font-extrabold">{totalRemainingHighlight}</h2>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                            <Shield className="w-4 h-4 text-[#0C1C3C]" />
                            <span className="text-[#0C1C3C] text-sm font-medium">Pembayaran Aman</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                            <Zap className="w-4 h-4 text-[#0C1C3C]" />
                            <span className="text-[#0C1C3C] text-sm font-medium">Aktivasi Instan</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Packages Section */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3 mb-8">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Pilih Paket Highlight</h3>
                <div className="bg-white rounded-[20px] p-4 md:p-6">
                    {memberships.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada paket yang tersedia</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedMemberships.map((membership, index) => (
                                <MembershipCard
                                    key={membership.id}
                                    membership={membership}
                                    isPopular={index === popularIndex && sortedMemberships.length > 1}
                                    isLoading={isLoading && selectedMembershipId === membership.id}
                                    onSelect={handleSelectPackage}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Active Credits Section */}
            {activeCredits.length > 0 && (
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Credit Aktif Anda</h3>
                    <div className="bg-white rounded-[20px] p-4 md:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeCredits.map((credit) => (
                                <ActiveCreditCard key={credit.id} credit={credit} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Methods Info */}
            <div className="mt-8 text-center text-gray-500 text-sm">
                <p className="mb-2">Metode pembayaran yang tersedia:</p>
                <div className="flex flex-wrap justify-center gap-3">
                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg">QRIS</span>
                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg">Bank Transfer</span>
                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg">GoPay</span>
                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg">OVO</span>
                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg">Dana</span>
                    <span className="bg-gray-100 px-3 py-1.5 rounded-lg">Kartu Kredit</span>
                </div>
            </div>
        </DashboardAgentLayout>
    )
}
