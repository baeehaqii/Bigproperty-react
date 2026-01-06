"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Building2, Home, Navigation, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from "axios"

interface Suggestion {
    type: "city" | "developer" | "property"
    label: string
    value: string | number
    subtext: string
    icon: string
}

interface SearchWithSuggestionsProps {
    onSearch: (query: string, type?: "city" | "developer" | "property" | "location", id?: string | number) => void
    initialQuery?: string
    placeholder?: string
    className?: string
}

export function SearchWithSuggestions({
    onSearch,
    initialQuery = "",
    placeholder = "Cari lokasi, nama properti, atau nama proyek...",
    className = "",
}: SearchWithSuggestionsProps) {
    const [query, setQuery] = useState(initialQuery)
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLocating, setIsLocating] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                fetchSuggestions(query)
            } else {
                setSuggestions([])
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const fetchSuggestions = async (searchQuery: string) => {
        setIsLoading(true)
        try {
            const response = await axios.get("/api/property-search-suggestions", {
                params: { q: searchQuery },
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = response.data.suggestions.map((item: any) => ({
                ...item,
                // Map icon strings to components if needed, or keep string for rendering logic
            }))
            setSuggestions(data)
            setIsOpen(true)
        } catch (error) {
            console.error("Error fetching suggestions:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Fallback: Get location from IP address
    const getLocationFromIP = async (): Promise<string | null> => {
        try {
            // Using ip-api.com (free, no API key required)
            const response = await fetch('http://ip-api.com/json/?fields=status,city,regionName&lang=id')
            const data = await response.json()
            if (data.status === 'success') {
                return data.city || data.regionName || null
            }
            return null
        } catch (error) {
            console.error('IP geolocation failed:', error)
            return null
        }
    }

    const handleUseCurrentLocation = async () => {
        setIsLocating(true)

        // Helper function for reverse geocoding
        const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
            try {
                // Try Nominatim first
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
                )
                const data = await response.json()
                return data.address?.city || data.address?.town || data.address?.county || data.address?.state_district || null
            } catch {
                // Fallback to BigDataCloud
                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`
                    )
                    const data = await response.json()
                    return data.city || data.locality || data.principalSubdivision || null
                } catch {
                    return null
                }
            }
        }

        // Check if geolocation is supported
        if (!navigator.geolocation) {
            // Try IP-based fallback directly
            const city = await getLocationFromIP()
            setIsLocating(false)
            if (city) {
                setQuery(city)
                setIsOpen(false)
                onSearch(city, "city")
            } else {
                alert("Tidak dapat menentukan lokasi Anda.")
            }
            return
        }

        // Try browser geolocation first
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                const city = await reverseGeocode(latitude, longitude)
                setIsLocating(false)

                if (city) {
                    setQuery(city)
                    setIsOpen(false)
                    onSearch(city, "city")
                } else {
                    // If reverse geocoding fails, try IP fallback
                    const ipCity = await getLocationFromIP()
                    if (ipCity) {
                        setQuery(ipCity)
                        setIsOpen(false)
                        onSearch(ipCity, "city")
                    } else {
                        alert("Lokasi tidak ditemukan.")
                    }
                }
            },
            async (error) => {
                console.warn("Browser geolocation failed:", error.message)

                // Fallback to IP-based geolocation
                const city = await getLocationFromIP()
                setIsLocating(false)

                if (city) {
                    setQuery(city)
                    setIsOpen(false)
                    onSearch(city, "city")
                } else {
                    let msg = "Tidak dapat menentukan lokasi."
                    if (error.code === 1) msg = "Izin lokasi ditolak."
                    alert(msg)
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: Infinity
            }
        )
    }

    const handleSelectSuggestion = (suggestion: Suggestion) => {
        setQuery(suggestion.label)
        setIsOpen(false)
        onSearch(suggestion.label, suggestion.type, suggestion.value)
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsOpen(false)
        onSearch(query)
    }

    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case "map-pin": return <MapPin className="w-4 h-4 text-gray-400 mt-1" />
            case "building": return <Building2 className="w-4 h-4 text-gray-400 mt-1" />
            case "home": return <Home className="w-4 h-4 text-gray-400 mt-1" />
            default: return <Search className="w-4 h-4 text-gray-400 mt-1" />
        }
    }

    return (
        <div ref={wrapperRef} className={`relative w-full ${className}`}>
            <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 h-11 bg-white border-gray-200 focus-visible:ring-blue-500 rounded-lg text-base text-gray-900 placeholder:text-gray-400"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => {
                        setIsOpen(true)
                    }}
                />
            </form>

            {/* Suggestions Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                    {/* Groups */}
                    <div className="px-2">
                        <div className="text-xs font-semibold text-gray-500 px-3 py-2">
                            Cari berdasarkan nama lokasi, perumahan, apartemen, atau kriteria lainnya
                        </div>

                        {/* Current Location Option */}
                        <div className="px-2 mb-2">
                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                disabled={isLocating}
                                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors group"
                            >
                                <div className="bg-gray-100 p-2 rounded-full group-hover:bg-white transition-colors">
                                    {isLocating ? (
                                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                    ) : (
                                        <Navigation className="w-5 h-5 text-blue-600 fill-blue-600" />
                                    )}
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-gray-900">
                                        {isLocating ? "Mencari lokasi..." : "Gunakan lokasi saat ini"}
                                    </span>
                                </div>
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                            </div>
                        ) : suggestions.length > 0 ? (
                            <>
                                {suggestions.some(s => s.type === 'city') && (
                                    <div className="mb-2">
                                        <div className="text-xs font-semibold text-gray-500 px-3 py-1">Kota & Kabupaten</div>
                                        {suggestions.filter(s => s.type === 'city').map((suggestion, idx) => (
                                            <button
                                                key={`city-${idx}`}
                                                onClick={() => handleSelectSuggestion(suggestion)}
                                                className="w-full flex items-start gap-3 px-3 py-2 text-left hover:bg-blue-50 transition-colors"
                                            >
                                                {renderIcon(suggestion.icon)}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{suggestion.label}</div>
                                                    <div className="text-xs text-gray-500">{suggestion.subtext}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {suggestions.some(s => s.type === 'property') && (
                                    <div className="mb-2">
                                        <div className="text-xs font-semibold text-gray-500 px-3 py-1">Properti</div>
                                        {suggestions.filter(s => s.type === 'property').map((suggestion, idx) => (
                                            <button
                                                key={`prop-${idx}`}
                                                onClick={() => handleSelectSuggestion(suggestion)}
                                                className="w-full flex items-start gap-3 px-3 py-2 text-left hover:bg-blue-50 transition-colors"
                                            >
                                                {renderIcon(suggestion.icon)}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{suggestion.label}</div>
                                                    <div className="text-xs text-gray-500">{suggestion.subtext}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {suggestions.some(s => s.type === 'developer') && (
                                    <div className="mb-2">
                                        <div className="text-xs font-semibold text-gray-500 px-3 py-1">Developer</div>
                                        {suggestions.filter(s => s.type === 'developer').map((suggestion, idx) => (
                                            <button
                                                key={`dev-${idx}`}
                                                onClick={() => handleSelectSuggestion(suggestion)}
                                                className="w-full flex items-start gap-3 px-3 py-2 text-left hover:bg-blue-50 transition-colors"
                                            >
                                                {renderIcon(suggestion.icon)}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{suggestion.label}</div>
                                                    <div className="text-xs text-gray-500">{suggestion.subtext}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : query.length >= 2 ? (
                            <div className="px-3 py-4 text-center text-sm text-gray-500">
                                Tidak ada hasil ditemukan untuk "{query}"
                            </div>
                        ) : null}

                        {/* Fallback "Kriteria Lain" search */}
                        {query.length > 0 && (
                            <div className="mt-2 border-t border-gray-100 pt-2">
                                <div className="text-xs font-semibold text-gray-500 px-3 py-1">Kriteria Lain</div>
                                <button
                                    onClick={handleSearchSubmit}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 transition-colors"
                                >
                                    <Search className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">Telusuri "{query}"</span>
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    )
}
