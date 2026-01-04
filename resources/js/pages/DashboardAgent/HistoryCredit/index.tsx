"use client"

import { useState, useEffect, useCallback } from "react"
import { router } from "@inertiajs/react"
import {
    History,
    CheckCircle,
    Clock,
    XCircle,
    CreditCard,
    Loader2,
    AlertCircle,
    RefreshCw,
    Wallet,
    TrendingUp,
    Calendar,
} from "lucide-react"
import { DashboardAgentLayout } from "../components/DashboardAgentLayout"

// Types
interface Transaction {
    id: number
    order_id: string
    membership_name: string
    membership_type: string
    gross_amount: number
    status: 'pending' | 'settlement' | 'expire' | 'cancel'
    payment_type: string | null
    created_at: string
    snap_token: string | null
}

interface Stats {
    total: number
    settlement: number
    pending: number
    totalSpent: number
}

interface HistoryCreditProps {
    agent: {
        id: number
        name: string
        email: string
        phone: string
        photo?: string
    }
    transactions: Transaction[]
    stats: Stats
    midtransConfig: {
        clientKey: string
        snapUrl: string
    }
}

// Status Badge Component
function StatusBadge({ status }: { status: Transaction['status'] }) {
    const config = {
        pending: {
            icon: Clock,
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-700',
            label: 'Menunggu Pembayaran',
        },
        settlement: {
            icon: CheckCircle,
            bgColor: 'bg-green-100',
            textColor: 'text-green-700',
            label: 'Berhasil',
        },
        expire: {
            icon: XCircle,
            bgColor: 'bg-red-100',
            textColor: 'text-red-700',
            label: 'Kedaluwarsa',
        },
        cancel: {
            icon: XCircle,
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-700',
            label: 'Dibatalkan',
        },
    }

    const { icon: Icon, bgColor, textColor, label } = config[status]

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
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
            </div>
        </div>
    )
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

// Transaction Card Component
interface TransactionCardProps {
    transaction: Transaction
    onRetryPayment: (transaction: Transaction) => void
    isRetrying: boolean
}

function TransactionCard({ transaction, onRetryPayment, isRetrying }: TransactionCardProps) {
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div className="bg-white rounded-[20px] border border-gray-100 p-5 transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left Side - Transaction Info */}
                <div className="flex-1">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 ${transaction.status === 'settlement' ? 'bg-green-100' :
                                transaction.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                            }`}>
                            <CreditCard className={`w-6 h-6 ${transaction.status === 'settlement' ? 'text-green-600' :
                                    transaction.status === 'pending' ? 'text-yellow-600' : 'text-gray-500'
                                }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[#0C1C3C] font-bold text-lg mb-1">{transaction.membership_name}</h4>
                            <p className="text-gray-500 text-xs mb-2 font-mono">{transaction.order_id}</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge status={transaction.status} />
                                {transaction.payment_type && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase">
                                        {transaction.payment_type}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Amount & Action */}
                <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                        <p className="text-[#0C1C3C] text-xl font-extrabold">{formatPrice(transaction.gross_amount)}</p>
                        <p className="text-gray-500 text-xs flex items-center justify-end gap-1">
                            <Calendar className="w-3 h-3" />
                            {transaction.created_at}
                        </p>
                    </div>

                    {/* Retry Payment Button for Pending Transactions */}
                    {transaction.status === 'pending' && transaction.snap_token && (
                        <button
                            onClick={() => onRetryPayment(transaction)}
                            disabled={isRetrying}
                            className="flex items-center gap-2 px-4 py-2 bg-[#D6D667] text-[#0C1C3C] rounded-[12px] font-semibold text-sm hover:bg-[#c5c55f] transition-all duration-200 cursor-pointer disabled:opacity-50"
                        >
                            {isRetrying ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Lanjutkan Bayar</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function HistoryCredit({
    agent,
    transactions,
    stats,
    midtransConfig
}: HistoryCreditProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null)
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

    const handleRetryPayment = useCallback(async (transaction: Transaction) => {
        if (!transaction.snap_token) return

        setRetryingOrderId(transaction.order_id)
        setIsLoading(true)
        setLoadingMessage('Membuka halaman pembayaran...')

        try {
            // Open Midtrans Snap with existing snap_token
            // @ts-ignore - Midtrans Snap is loaded via script
            if (window.snap) {
                // @ts-ignore
                window.snap.pay(transaction.snap_token, {
                    onSuccess: function (result: any) {
                        setIsLoading(false)
                        setRetryingOrderId(null)
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
                        setRetryingOrderId(null)
                        setModalStatus({
                            isOpen: true,
                            status: 'pending',
                            message: 'Segera selesaikan pembayaran Anda sebelum batas waktu.',
                        })
                    },
                    onError: function (result: any) {
                        setIsLoading(false)
                        setRetryingOrderId(null)
                        setModalStatus({
                            isOpen: true,
                            status: 'error',
                            message: 'Pembayaran gagal. Silakan coba lagi.',
                        })
                    },
                    onClose: function () {
                        setIsLoading(false)
                        setRetryingOrderId(null)
                    },
                })
            } else {
                throw new Error('Payment gateway tidak tersedia')
            }
        } catch (error: any) {
            setIsLoading(false)
            setRetryingOrderId(null)
            setModalStatus({
                isOpen: true,
                status: 'error',
                message: error.message || 'Terjadi kesalahan. Silakan refresh halaman.',
            })
        }
    }, [])

    const closeModal = () => {
        setModalStatus({ isOpen: false, status: null, message: '' })
    }

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <DashboardAgentLayout agent={agent} title="History Credit" activeMenu="history-credit">
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
                        History Credit
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">
                        Riwayat transaksi pembelian credit highlight
                    </p>
                </div>
                <a
                    href="/agent/dashboard/beli-credit"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D6D667] text-[#0C1C3C] rounded-[16px] font-medium hover:bg-[#c5c55f] transition-all duration-200 cursor-pointer w-full md:w-auto"
                >
                    <CreditCard className="w-4 h-4" />
                    <span>Beli Credit</span>
                </a>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-sm font-semibold ml-3 mb-3">Total Transaksi</h3>
                    <div className="bg-white rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-[#0C1C3C] text-3xl font-extrabold">{stats.total}</p>
                            <div className="w-12 h-12 bg-[#D6D667]/20 rounded-[14px] flex items-center justify-center">
                                <History className="w-6 h-6 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-sm font-semibold ml-3 mb-3">Berhasil</h3>
                    <div className="bg-white rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-green-600 text-3xl font-extrabold">{stats.settlement}</p>
                            <div className="w-12 h-12 bg-green-100 rounded-[14px] flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-sm font-semibold ml-3 mb-3">Pending</h3>
                    <div className="bg-white rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-yellow-600 text-3xl font-extrabold">{stats.pending}</p>
                            <div className="w-12 h-12 bg-yellow-100 rounded-[14px] flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                    <h3 className="text-[#0C1C3C] text-sm font-semibold ml-3 mb-3">Total Pembelian</h3>
                    <div className="bg-white rounded-[20px] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-[#0C1C3C] text-xl font-extrabold">{formatPrice(stats.totalSpent)}</p>
                            <div className="w-12 h-12 bg-[#82D9D7]/20 rounded-[14px] flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-[#0C1C3C]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Riwayat Transaksi</h3>
                <div className="bg-white rounded-[20px] p-4 md:p-6">
                    {transactions.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-10 h-10 text-gray-300" />
                            </div>
                            <h4 className="text-[#0C1C3C] font-bold text-lg mb-2">Belum Ada Transaksi</h4>
                            <p className="text-gray-500 text-sm mb-6">Anda belum pernah membeli credit highlight</p>
                            <a
                                href="/agent/dashboard/beli-credit"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D6D667] text-[#0C1C3C] rounded-[16px] font-semibold hover:bg-[#c5c55f] transition-all duration-200"
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span>Beli Credit Sekarang</span>
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <TransactionCard
                                    key={transaction.id}
                                    transaction={transaction}
                                    onRetryPayment={handleRetryPayment}
                                    isRetrying={retryingOrderId === transaction.order_id}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardAgentLayout>
    )
}
