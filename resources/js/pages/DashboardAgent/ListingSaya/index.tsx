"use client"

import { useState } from "react"
import { Link, router } from "@inertiajs/react"
import {
    Eye,
    Edit,
    Trash2,
    MoreVertical,
    Search,
    Filter,
    Plus,
    MapPin,
    Bed,
    Bath,
    Maximize2,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Ban,
    DollarSign,
    RefreshCw,
} from "lucide-react"
import { DashboardAgentLayout } from "../components/DashboardAgentLayout"
import { Button } from "@/components/ui/button"

interface Property {
    id: number
    name: string
    city: string
    provinsi: string
    city_name?: string
    province_name?: string
    location: string
    price_min: number
    price_max: number | null
    bedrooms: number
    bathrooms: number | null
    land_size_min: number
    building_size_min: number | null
    main_image: string | null
    is_available: boolean
    is_verified: boolean
    status_listing: 'active' | 'sold' | 'cancelled'
    count_clicked: number
    created_at: string
    updated_at: string
}

interface ListingSayaProps {
    agent: {
        id: number
        name: string
        email: string
        phone: string
        photo?: string
    }
    listings: Property[]
    stats: {
        total: number
        active: number
        pending: number
        totalViews: number
    }
}

export default function ListingSaya({ agent, listings, stats }: ListingSayaProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "pending" | "sold" | "cancelled">("all")
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Status change modal states
    const [statusModalOpen, setStatusModalOpen] = useState(false)
    const [statusAction, setStatusAction] = useState<'sold' | 'cancelled' | 'active' | null>(null)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    const formatPrice = (price: number) => {
        if (price >= 1000000000) {
            const value = price / 1000000000
            return `Rp ${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} M`
        } else {
            const value = price / 1000000
            return `Rp ${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} Juta`
        }
    }

    // Format location - use city_name from backend if available
    const formatLocation = (listing: Property) => {
        // Use city_name and province_name from backend if available
        if (listing.city_name && listing.city_name !== listing.city) {
            return {
                primary: listing.city_name,
                secondary: listing.province_name || ''
            }
        }

        // Fallback: check if city looks like an API code
        const isApiCode = /^\d+(\.\d+)?$/.test(listing.city)

        if (isApiCode && listing.location) {
            // Use location field as fallback
            return {
                primary: listing.location.split(',')[0]?.trim() || listing.location,
                secondary: listing.location.split(',').slice(1).join(',').trim() || ''
            }
        }

        return {
            primary: listing.city,
            secondary: listing.provinsi
        }
    }

    const filteredListings = listings.filter((listing) => {
        const matchesSearch = listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.location.toLowerCase().includes(searchQuery.toLowerCase())

        if (filterStatus === "all") return matchesSearch
        if (filterStatus === "active") return matchesSearch && listing.is_available && listing.is_verified && listing.status_listing === 'active'
        if (filterStatus === "pending") return matchesSearch && (!listing.is_verified)
        if (filterStatus === "sold") return matchesSearch && listing.status_listing === 'sold'
        if (filterStatus === "cancelled") return matchesSearch && listing.status_listing === 'cancelled'
        return matchesSearch
    })

    const getStatusBadge = (listing: Property) => {
        if (!listing.is_verified) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    <Clock className="w-3 h-3" />
                    Pending Verification
                </span>
            )
        }
        if (listing.status_listing === 'sold') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    <DollarSign className="w-3 h-3" />
                    Sold
                </span>
            )
        }
        if (listing.status_listing === 'cancelled') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    <Ban className="w-3 h-3" />
                    Cancelled
                </span>
            )
        }
        if (listing.is_available) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Active
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                <XCircle className="w-3 h-3" />
                Inactive
            </span>
        )
    }

    const openDeleteModal = (listing: Property) => {
        setSelectedProperty(listing)
        setDeleteModalOpen(true)
    }

    const closeDeleteModal = () => {
        setDeleteModalOpen(false)
        setSelectedProperty(null)
    }

    const handleDelete = () => {
        if (!selectedProperty) return

        setIsDeleting(true)

        router.delete(`/agent/dashboard/listing-saya/${selectedProperty.id}`, {
            onSuccess: () => {
                setIsDeleting(false)
                closeDeleteModal()
            },
            onError: () => {
                setIsDeleting(false)
            }
        })
    }

    // Status modal handlers
    const openStatusModal = (listing: Property, action: 'sold' | 'cancelled' | 'active') => {
        setSelectedProperty(listing)
        setStatusAction(action)
        setStatusModalOpen(true)
    }

    const closeStatusModal = () => {
        setStatusModalOpen(false)
        setSelectedProperty(null)
        setStatusAction(null)
    }

    const handleStatusUpdate = () => {
        if (!selectedProperty || !statusAction) return

        setIsUpdatingStatus(true)

        router.patch(`/agent/dashboard/listing-saya/${selectedProperty.id}/status`, {
            status: statusAction
        }, {
            onSuccess: () => {
                setIsUpdatingStatus(false)
                closeStatusModal()
            },
            onError: () => {
                setIsUpdatingStatus(false)
            }
        })
    }

    return (
        <DashboardAgentLayout agent={agent} title="Listing Saya" activeMenu="listing-saya">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-[#0C1C3C] text-2xl md:text-3xl font-bold mb-1">
                        My Listings
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base">
                        Manage all properties you have published
                    </p>
                </div>
                <Link href="/agent/dashboard/upload-listing">
                    <Button
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#D6D667] text-[#0C1C3C] rounded-[16px] font-medium hover:bg-[#c5c55f] transition-all duration-200"
                    >
                        <Plus className="w-4 h-4" />
                        Add Listing
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#F7F7F7] rounded-[20px] p-4">
                    <p className="text-gray-500 text-sm mb-1">Total Listings</p>
                    <p className="text-[#0C1C3C] text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-[#F7F7F7] rounded-[20px] p-4">
                    <p className="text-gray-500 text-sm mb-1">Active Listings</p>
                    <p className="text-green-600 text-2xl font-bold">{stats.active}</p>
                </div>
                <div className="bg-[#F7F7F7] rounded-[20px] p-4">
                    <p className="text-gray-500 text-sm mb-1">Pending Verification</p>
                    <p className="text-yellow-600 text-2xl font-bold">{stats.pending}</p>
                </div>
                <div className="bg-[#F7F7F7] rounded-[20px] p-4">
                    <p className="text-gray-500 text-sm mb-1">Total Views</p>
                    <p className="text-[#82D9D7] text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3 mb-6">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">Filter & Search</h3>
                <div className="bg-white rounded-[20px] p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search property name or location..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] focus:border-[#D6D667] focus:ring-1 focus:ring-[#D6D667] focus:outline-none transition-all duration-200"
                            />
                        </div>
                        {/* Status Filter */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilterStatus("all")}
                                className={`px-4 py-2.5 rounded-[16px] font-medium transition-all duration-200 cursor-pointer ${filterStatus === "all"
                                    ? "bg-[#D6D667] text-[#0C1C3C]"
                                    : "border border-[#DCDEDD] text-gray-600 hover:border-[#D6D667]"
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterStatus("active")}
                                className={`px-4 py-2.5 rounded-[16px] font-medium transition-all duration-200 cursor-pointer ${filterStatus === "active"
                                    ? "bg-[#D6D667] text-[#0C1C3C]"
                                    : "border border-[#DCDEDD] text-gray-600 hover:border-[#D6D667]"
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setFilterStatus("pending")}
                                className={`px-4 py-2.5 rounded-[16px] font-medium transition-all duration-200 cursor-pointer ${filterStatus === "pending"
                                    ? "bg-[#D6D667] text-[#0C1C3C]"
                                    : "border border-[#DCDEDD] text-gray-600 hover:border-[#D6D667]"
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilterStatus("sold")}
                                className={`px-4 py-2.5 rounded-[16px] font-medium transition-all duration-200 cursor-pointer ${filterStatus === "sold"
                                    ? "bg-blue-500 text-white"
                                    : "border border-[#DCDEDD] text-gray-600 hover:border-blue-400"
                                    }`}
                            >
                                Sold
                            </button>
                            <button
                                onClick={() => setFilterStatus("cancelled")}
                                className={`px-4 py-2.5 rounded-[16px] font-medium transition-all duration-200 cursor-pointer ${filterStatus === "cancelled"
                                    ? "bg-gray-500 text-white"
                                    : "border border-[#DCDEDD] text-gray-600 hover:border-gray-400"
                                    }`}
                            >
                                Cancelled
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listings Table */}
            <div className="bg-[#F7F7F7] rounded-[20px] pt-5 px-3 pb-3">
                <h3 className="text-[#0C1C3C] text-lg font-bold ml-3 mb-4">
                    Property List ({filteredListings.length})
                </h3>
                <div className="bg-white rounded-[20px] overflow-hidden">
                    {filteredListings.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-[#0C1C3C] font-bold text-lg mb-2">No listings found</h4>
                            <p className="text-gray-500 text-sm mb-6">
                                {searchQuery
                                    ? "No properties found matching your search"
                                    : "You don't have any properties yet. Start adding your first listing!"}
                            </p>
                            {!searchQuery && (
                                <Link href="/agent/dashboard/upload-listing">
                                    <Button className="bg-[#D6D667] text-[#0C1C3C] hover:bg-[#c5c55f]">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Listing
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Property
                                        </th>
                                        <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center justify-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                Views
                                            </div>
                                        </th>
                                        <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="text-center px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredListings.map((listing) => {
                                        const location = formatLocation(listing)
                                        return (
                                            <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                                                {/* Property Info */}
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                            {listing.main_image ? (
                                                                <img
                                                                    src={listing.main_image}
                                                                    alt={listing.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                    <Maximize2 className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-[#0C1C3C] font-semibold text-sm truncate max-w-[200px]">
                                                                {listing.name}
                                                            </p>
                                                            <div className="flex items-center gap-3 text-gray-500 text-xs mt-1">
                                                                <span className="flex items-center gap-1">
                                                                    <Bed className="w-3 h-3" />
                                                                    {listing.bedrooms} KT
                                                                </span>
                                                                {listing.bathrooms && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Bath className="w-3 h-3" />
                                                                        {listing.bathrooms} KM
                                                                    </span>
                                                                )}
                                                                <span className="flex items-center gap-1">
                                                                    <Maximize2 className="w-3 h-3" />
                                                                    {listing.land_size_min} m²
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Location */}
                                                <td className="px-4 py-4">
                                                    <div className="flex items-start gap-1.5 text-gray-600 text-sm">
                                                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="font-medium">{location.primary}</p>
                                                            {location.secondary && (
                                                                <p className="text-xs text-gray-400">{location.secondary}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Price */}
                                                <td className="px-4 py-4">
                                                    <p className="text-[#0C1C3C] font-bold text-sm">
                                                        {formatPrice(listing.price_min)}
                                                        {listing.price_max && listing.price_max !== listing.price_min && (
                                                            <span className="font-normal text-gray-500">
                                                                {" "}- {formatPrice(listing.price_max)}
                                                            </span>
                                                        )}
                                                    </p>
                                                </td>
                                                {/* Views */}
                                                <td className="px-4 py-4 text-center">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#82D9D7]/20 text-[#0C1C3C] rounded-full">
                                                        <Eye className="w-4 h-4 text-[#5BCCCA]" />
                                                        <span className="font-bold text-sm">
                                                            {listing.count_clicked.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* Status */}
                                                <td className="px-4 py-4">
                                                    {getStatusBadge(listing)}
                                                </td>
                                                {/* Actions */}
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link href={`/property/${listing.id}`}>
                                                            <button
                                                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0C1C3C] transition-colors cursor-pointer"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </Link>
                                                        <Link href={`/agent/dashboard/edit-listing/${listing.id}`}>
                                                            <button
                                                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#D6D667] transition-colors cursor-pointer"
                                                                title="Edit Listing"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        </Link>

                                                        {/* Show status action buttons only for verified listings */}
                                                        {listing.is_verified && (
                                                            <>
                                                                {listing.status_listing === 'active' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => openStatusModal(listing, 'sold')}
                                                                            className="p-2 rounded-lg hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                                                                            title="Mark as Sold"
                                                                        >
                                                                            <DollarSign className="w-4 h-4" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => openStatusModal(listing, 'cancelled')}
                                                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                                                            title="Cancel Listing"
                                                                        >
                                                                            <Ban className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {(listing.status_listing === 'sold' || listing.status_listing === 'cancelled') && (
                                                                    <button
                                                                        onClick={() => openStatusModal(listing, 'active')}
                                                                        className="p-2 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors cursor-pointer"
                                                                        title="Reactivate"
                                                                    >
                                                                        <RefreshCw className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}

                                                        <button
                                                            onClick={() => openDeleteModal(listing)}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && selectedProperty && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[20px] p-6 max-w-md w-full">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-[#0C1C3C] text-xl font-bold mb-2 text-center">
                            Delete Listing?
                        </h3>
                        <p className="text-gray-500 text-sm mb-2 text-center">
                            You are about to delete listing:
                        </p>
                        <p className="text-[#0C1C3C] font-semibold text-center mb-4">
                            "{selectedProperty.name}"
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                            <p className="text-red-700 text-xs text-center">
                                ⚠️ This action cannot be undone. Listing data will be permanently deleted.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={closeDeleteModal}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] font-medium hover:border-[#D6D667] transition-all duration-200 cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-[16px] font-medium hover:bg-red-700 transition-all duration-200 cursor-pointer disabled:opacity-50"
                            >
                                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Change Confirmation Modal */}
            {statusModalOpen && selectedProperty && statusAction && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[20px] p-6 max-w-md w-full">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${statusAction === 'sold' ? 'bg-blue-100' :
                            statusAction === 'cancelled' ? 'bg-gray-100' : 'bg-green-100'
                            }`}>
                            {statusAction === 'sold' && <DollarSign className="w-8 h-8 text-blue-600" />}
                            {statusAction === 'cancelled' && <Ban className="w-8 h-8 text-gray-600" />}
                            {statusAction === 'active' && <RefreshCw className="w-8 h-8 text-green-600" />}
                        </div>
                        <h3 className="text-[#0C1C3C] text-xl font-bold mb-2 text-center">
                            {statusAction === 'sold' && 'Mark as Sold?'}
                            {statusAction === 'cancelled' && 'Cancel Listing?'}
                            {statusAction === 'active' && 'Reactivate Listing?'}
                        </h3>
                        <p className="text-gray-500 text-sm mb-2 text-center">
                            You are about to change listing status:
                        </p>
                        <p className="text-[#0C1C3C] font-semibold text-center mb-4">
                            "{selectedProperty.name}"
                        </p>
                        <div className={`border rounded-lg p-3 mb-6 ${statusAction === 'sold' ? 'bg-blue-50 border-blue-200' :
                            statusAction === 'cancelled' ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'
                            }`}>
                            <p className={`text-xs text-center ${statusAction === 'sold' ? 'text-blue-700' :
                                statusAction === 'cancelled' ? 'text-gray-700' : 'text-green-700'
                                }`}>
                                {statusAction === 'sold' && '✅ Listing will be marked as sold and hidden from search.'}
                                {statusAction === 'cancelled' && '⏸️ Listing will be cancelled and hidden from search.'}
                                {statusAction === 'active' && '🔄 Listing will be reactivated and shown in search.'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={closeStatusModal}
                                disabled={isUpdatingStatus}
                                className="flex-1 px-4 py-2.5 border border-[#DCDEDD] rounded-[16px] text-[#0C1C3C] font-medium hover:border-[#D6D667] transition-all duration-200 cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={isUpdatingStatus}
                                className={`flex-1 px-4 py-2.5 text-white rounded-[16px] font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 ${statusAction === 'sold' ? 'bg-blue-600 hover:bg-blue-700' :
                                    statusAction === 'cancelled' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {isUpdatingStatus ? 'Processing...' :
                                    statusAction === 'sold' ? 'Yes, Mark as Sold' :
                                        statusAction === 'cancelled' ? 'Yes, Cancel' : 'Yes, Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardAgentLayout>
    )
}
