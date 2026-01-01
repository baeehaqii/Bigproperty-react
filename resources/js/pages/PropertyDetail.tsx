"use client"

import { Head } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'
import {
    Users, Waves, Baby, Clock, Shield, Camera, Trees, Droplet, FileCheck,
    Home, Building, Car, Dumbbell, ShoppingCart, Wifi, Zap, Wind,
    Sun, Moon, Lock, Bell, Phone, Mail, MapPin, Navigation,
    Award, Star, Heart, Gift, Sparkles, CheckCircle, XCircle,
    Circle, Square, Triangle, Hexagon, Octagon
} from "lucide-react"

interface PropertyDetailProps {
    property: any  // Using any for now due to component type mismatches
}

// Map heroicon names to lucide icons
const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
        // Common facilities
        'heroicon-o-home': Home,
        'heroicon-o-building-office': Building,
        'heroicon-o-building-storefront': ShoppingCart,
        'heroicon-o-squares-2x2': Square,
        'heroicon-o-users': Users,
        'heroicon-o-camera': Camera,
        'heroicon-o-shield-check': Shield,
        'heroicon-o-clock': Clock,
        'heroicon-o-wifi': Wifi,
        'heroicon-o-bolt': Zap,
        'heroicon-o-star': Star,
        'heroicon-o-heart': Heart,
        'heroicon-o-gift': Gift,
        'heroicon-o-sparkles': Sparkles,
        'heroicon-o-check-circle': CheckCircle,
        'heroicon-o-x-circle': XCircle,
        'heroicon-o-map-pin': MapPin,
        'heroicon-o-phone': Phone,
        'heroicon-o-envelope': Mail,
        'heroicon-o-lock-closed': Lock,
        'heroicon-o-bell': Bell,
        'heroicon-o-sun': Sun,
        'heroicon-o-moon': Moon,
        'heroicon-o-trophy': Award,

        // Specific facilities
        'kolam renang': Waves,
        'playground': Baby,
        'taman': Trees,
        'gym': Dumbbell,
        'parkir': Car,
        'air': Droplet,
        'keamanan': Shield,
        'security': Shield,
        'cctv': Camera,
    }

    // Cari exact match dulu
    if (iconMap[iconName.toLowerCase()]) {
        return iconMap[iconName.toLowerCase()]
    }

    // Cari partial match dari nama fasilitas
    const lowerName = iconName.toLowerCase()
    for (const [key, icon] of Object.entries(iconMap)) {
        if (lowerName.includes(key) || key.includes(lowerName)) {
            return icon
        }
    }

    // Default icon
    return CheckCircle
}

export default function PropertyDetail({ property }: PropertyDetailProps) {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalImage, setModalImage] = useState('')

    console.log('Property data received:', property)

    if (!property) {
        return (
            <>
                <Head title="Property Not Found - Big Property" />
                <div className="w-full">
                    <Navbar />
                </div>
                <div className="flex min-h-screen flex-col items-center bg-white text-gray-900 w-full">
                    <main className="w-full flex-1 mt-8">
                        <div className="max-w-[1420px] mx-auto px-6 lg:px-0">
                            <h1 className="text-3xl font-bold text-gray-900">Property Not Found</h1>
                        </div>
                    </main>
                </div>
            </>
        )
    }

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numPrice).replace('IDR', 'Rp')
    }

    // Share dropdown state
    const [shareOpen, setShareOpen] = useState(false)

    // Get all images
    const allImages = [property.mainImage, ...(property.images || [])].filter(Boolean) as string[]

    const openModal = (imageSrc: string) => {
        setModalImage(imageSrc)
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setModalImage('')
    }

    // Default facilities (nearby) - using Heroicon names
    const nearbyFacilities = [
        { icon: 'heroicon-o-building-office', name: 'Public Hospital' },
        { icon: 'heroicon-o-building-storefront', name: 'All Best Restaurants' },
        { icon: 'heroicon-o-shield-check', name: 'Professional Securities' },
        { icon: 'heroicon-o-building-storefront', name: 'Shopping Mall' },
        { icon: 'heroicon-o-building-office', name: 'Financial Center' },
        { icon: 'heroicon-o-building-office', name: 'Central Business' },
        { icon: 'heroicon-o-home', name: 'International Schools' },
    ]

    // Close share dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            if (shareOpen && !target.closest('.share-dropdown-container')) {
                setShareOpen(false)
            }
        }

        if (shareOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [shareOpen])

    return (
        <>
            <Head title={`${property.name} - Big Property`}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            {/* Navbar dari komponen yang sudah ada */}
            <div className="w-full">
                <Navbar />
            </div>

            <div className="flex min-h-screen flex-col items-center bg-[#F5F5F0] text-gray-900 w-full">
                <main className="w-full flex-1 mt-8">
                    {/* Header Section */}
                    <div className="flex flex-col gap-5 text-center items-center px-4 mb-12">
                        <h1 className="font-bold text-3xl md:text-4xl leading-tight">{property.name}</h1>
                        <div className="flex flex-wrap items-center justify-center gap-5">
                            <div className="flex items-center gap-2">
                                <svg className="size-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                <p className="font-medium text-gray-700">{property.location?.city || 'Location'}, {property.location?.province || ''}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="size-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M9 12l2 2 4-4" />
                                </svg>
                                <p className="font-medium text-gray-700">Certified Developer</p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-[1280px] mx-auto px-6 lg:px-[75px]">
                        {/* Gallery Section */}
                        <section id="Gallery" className="flex flex-col md:flex-row gap-5 w-full h-auto md:h-[450px] mb-8">
                            {/* Main Image - Left Side */}
                            <button
                                onClick={() => openModal(allImages[0] || '/placeholder.svg')}
                                className="relative group flex-1 w-full h-[300px] md:h-full rounded-[30px] overflow-hidden bg-white"
                            >
                                <img
                                    src={allImages[0] || '/placeholder.svg'}
                                    className="w-full h-full object-cover"
                                    alt={property.name}
                                    onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20">
                                    <svg className="size-[50px] text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                    </svg>
                                </div>
                            </button>

                            {/* Thumbnail Grid - Right Side (2x2) */}
                            <div className="grid grid-cols-2 gap-4 md:gap-5 w-full md:w-[450px] shrink-0">
                                {allImages.slice(1, 5).map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => openModal(img)}
                                        className="relative group flex w-full h-[140px] md:h-[215px] rounded-[22px] overflow-hidden bg-white"
                                    >
                                        <img
                                            src={img || '/placeholder.svg'}
                                            className="w-full h-full object-cover"
                                            alt={`${property.name} - ${index + 2}`}
                                            onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/20">
                                            <svg className="size-[50px] text-white" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Specs Section */}
                        <section id="specs" className="w-full mb-8">
                            <div className="flex flex-wrap items-center justify-between rounded-2xl border border-border py-5 px-4 md:px-8 bg-white gap-4 md:gap-0">
                                {/* Bedroom */}
                                <div className="flex flex-col w-fit gap-3">
                                    <p className="text-sm text-muted-foreground">Bedroom</p>
                                    <div className="flex items-center gap-2">
                                        <svg className="size-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 7v10a1 1 0 001 1h16a1 1 0 001-1V7" />
                                            <path d="M21 10H3" />
                                            <path d="M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3" />
                                        </svg>
                                        <p className="font-semibold">{property.bedrooms || '0'} Bedroom</p>
                                    </div>
                                </div>
                                <div className="hidden md:block h-[60px] border-r border-border"></div>

                                {/* Bathroom */}
                                <div className="flex flex-col w-fit gap-3">
                                    <p className="text-sm text-muted-foreground">Bathroom</p>
                                    <div className="flex items-center gap-2">
                                        <svg className="size-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 12h16a1 1 0 011 1v5a3 3 0 01-3 3H6a3 3 0 01-3-3v-5a1 1 0 011-1z" />
                                            <path d="M6 12V5a2 2 0 012-2h1" />
                                        </svg>
                                        <p className="font-semibold">{property.bathrooms || '0'} Bathroom</p>
                                    </div>
                                </div>
                                <div className="hidden md:block h-[60px] border-r border-border"></div>

                                {/* Certificate */}
                                <div className="flex flex-col w-fit gap-3">
                                    <p className="text-sm text-muted-foreground">Certificate</p>
                                    <div className="flex items-center gap-2">
                                        <svg className="size-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                            <path d="M14 2v6h6" />
                                            <path d="M12 18l-2-2 2-2 2 2z" />
                                        </svg>
                                        <p className="font-semibold">{property.certificateType || 'SHM'}</p>
                                    </div>
                                </div>
                                <div className="hidden md:block h-[60px] border-r border-border"></div>

                                {/* Land Area */}
                                <div className="flex flex-col w-fit gap-3">
                                    <p className="text-sm text-muted-foreground">Land of Area</p>
                                    <div className="flex items-center gap-2">
                                        <svg className="size-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                        </svg>
                                        <p className="font-semibold">{property.landSize || '0'}</p>
                                    </div>
                                </div>
                                <div className="hidden md:block h-[60px] border-r border-border"></div>

                                {/* Building Area */}
                                <div className="flex flex-col w-fit gap-3">
                                    <p className="text-sm text-muted-foreground">Land of Building</p>
                                    <div className="flex items-center gap-2">
                                        <svg className="size-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 21h18" />
                                            <path d="M5 21V7l8-4 8 4v14" />
                                            <path d="M9 21v-8h6v8" />
                                        </svg>
                                        <p className="font-semibold">{property.buildingSize || '0'}</p>
                                    </div>
                                </div>
                                <div className="hidden md:block h-[60px] border-r border-border"></div>

                                {/* Electric Power */}
                                <div className="flex flex-col w-fit gap-3">
                                    <p className="text-sm text-muted-foreground">Electric Power</p>
                                    <div className="flex items-center gap-2">
                                        <svg className="size-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                        </svg>
                                        <p className="font-semibold">{property.electricPower || '2200'} Watt</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Details Section */}
                        <section id="Details" className="w-full flex flex-col lg:flex-row gap-8 lg:gap-16 mb-12">
                            {/* Left Content */}
                            <div className="flex flex-col gap-8 flex-1">
                                {/* About */}
                                <div id="About" className="flex flex-col gap-4">
                                    <h2 className="font-semibold text-xl">About Project</h2>
                                    <p className="leading-7 text-muted-foreground">
                                        {property.description || 'Discover the perfect blend of style, quality, and affordability with this modernize home, designed specifically for the new generation. This property offers contemporary aesthetic, featuring sleek lines, open-concept spaces, and natural lighting that creates warm and inviting atmosphere every corner is thoughtfully crafted to provide function. Built with high-quality materials and a focus onto energy efficiency, this home is designed to last while keeping maintenance utility costs low. Whether you\'re a young professional, a growing family together.'}
                                    </p>
                                </div>

                                {/* Nearby Facilities */}
                                <div id="Nearby-Facilities" className="flex flex-col gap-4">
                                    <h2 className="font-semibold text-xl">Nearby Facilities</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {(property.facilities && property.facilities.length > 0
                                            ? property.facilities.slice(0, 8)
                                            : nearbyFacilities
                                        ).map((facility: any, index: number) => {
                                            const IconComponent = getIconComponent(facility.icon || facility.name || 'default')
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex flex-col min-h-[120px] rounded-2xl border border-border p-4 gap-4 bg-white hover:shadow-md transition-shadow"
                                                >
                                                    <IconComponent className="size-8 text-gray-700" strokeWidth={1.5} />
                                                    <p className="font-medium text-sm">{facility.name}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Location Map */}
                                <div id="Location" className="flex flex-col gap-4">
                                    <h2 className="font-semibold text-xl">Strategic Location</h2>
                                    <div className="overflow-hidden w-full h-[320px] rounded-2xl border border-border">
                                        <iframe
                                            className="h-full w-full border-0"
                                            src={property.location?.mapUrl || `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(property.location?.full || property.location?.city || 'jakarta')}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`}
                                            allowFullScreen
                                            loading="lazy"
                                        ></iframe>
                                    </div>
                                </div>
                            </div>

                            {/* Right Sidebar - Price Card */}
                            <div className="flex flex-col w-full lg:w-[380px] shrink-0 h-fit rounded-3xl border border-border p-6 gap-5 bg-white lg:sticky lg:top-8">
                                <p className="font-bold text-2xl md:text-3xl text-center text-blue-600">
                                    {property.priceRange || formatPrice(property.price?.min || 0)}
                                </p>
                                <hr className="border-border" />

                                {/* Benefits */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <svg className="size-5 text-green-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                        <p className="font-medium text-sm">Dibangun developer handal</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="size-5 text-green-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                        <p className="font-medium text-sm">Jaminan uang kembali 100%</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="size-5 text-green-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                        <p className="font-medium text-sm">Gratis biaya balik nama</p>
                                    </div>
                                </div>
                                <hr className="border-border" />

                                {/* Agent Profile Card */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {/* Agent Photo */}
                                        <div className="relative size-14 shrink-0">
                                            <img
                                                src={property.agent?.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'}
                                                className="w-full h-full object-cover rounded-full ring-2 ring-blue-500"
                                                alt={property.agent?.name || 'Agent'}
                                                onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                                            />
                                        </div>
                                        {/* Agent Info */}
                                        <div>
                                            <p className="font-semibold text-base text-blue-600">{property.agent?.name || 'Agent Property'}</p>
                                            <p className="text-sm text-muted-foreground">{property.agent?.role || 'Agen Korporat'}</p>
                                            <p className="text-sm text-muted-foreground">NIB: {property.agent?.nib || '080623010****'}</p>
                                        </div>
                                    </div>
                                    {/* Company Logo */}
                                    <div className="flex items-center w-16 h-16 shrink-0 overflow-hidden">
                                        <img
                                            src={property.developer?.logo || 'https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761232717/Logo_Big_t3qpb3.png'}
                                            className="w-full h-full object-contain"
                                            alt={property.developer?.name || 'Developer'}
                                            onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                                        />
                                    </div>
                                </div>

                                {/* CTA Buttons */}
                                <div className="flex items-center gap-3 mt-2">
                                    {/* Phone Button */}
                                    <a
                                        href={`tel:${property.agent?.phone || '+6281388200000'}`}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors"
                                    >
                                        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        <span className="text-sm">{property.agent?.phone || '+6281388200000'}</span>
                                        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </a>

                                    {/* WhatsApp Button */}
                                    <a
                                        href={`https://wa.me/62${(property.agent?.whatsapp || property.agent?.phone || '81388200000').replace(/^(\+62|62|0)/, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#25D366] text-white font-semibold hover:bg-[#20BD5A] transition-colors"
                                    >
                                        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        <span className="text-sm">WhatsApp</span>
                                    </a>
                                </div>

                                {/* Wishlist Button */}
                                <button
                                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full border border-border text-foreground font-medium hover:bg-secondary transition-colors"
                                    onClick={() => alert('Ditambahkan ke wishlist!')}
                                >
                                    <svg className="size-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                    </svg>
                                    <span className="text-sm">Tambahkan ke Wishlist</span>
                                </button>

                                <hr className="border-border" />

                                {/* Security Badge */}
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="size-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                                    </svg>
                                    <p className="font-medium text-sm">All your privacy data secured</p>
                                </div>

                                <hr className="border-border" />

                                {/* Share Button */}
                                <div className="relative share-dropdown-container">
                                    <button
                                        onClick={() => setShareOpen(!shareOpen)}
                                        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full border border-border text-foreground font-medium hover:bg-secondary transition-colors"
                                    >
                                        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                                            <path d="M16 6l-4-4-4 4" />
                                            <path d="M12 2v13" />
                                        </svg>
                                        <span className="text-sm">Share Property</span>
                                    </button>

                                    {/* Share Dropdown */}
                                    {shareOpen && (
                                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl border border-border shadow-lg p-3 z-10">
                                            <p className="text-xs text-muted-foreground mb-3 px-2">Share via:</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {/* WhatsApp */}
                                                <a
                                                    href={`https://wa.me/?text=${encodeURIComponent(`Check out this property: ${property.name} - ${window.location.href}`)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
                                                >
                                                    <svg className="size-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">WhatsApp</span>
                                                </a>

                                                {/* LinkedIn */}
                                                <a
                                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
                                                >
                                                    <svg className="size-5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">LinkedIn</span>
                                                </a>

                                                {/* Facebook */}
                                                <a
                                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
                                                >
                                                    <svg className="size-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">Facebook</span>
                                                </a>

                                                {/* X (Twitter) */}
                                                <a
                                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this property: ${property.name}`)}&url=${encodeURIComponent(window.location.href)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
                                                >
                                                    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                    <span className="text-sm font-medium">X</span>
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                <div className="h-10" />
            </div>

            {/* Modal Gallery */}
            {modalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                    onClick={closeModal}
                >
                    <div
                        className="rounded-3xl flex flex-col gap-5 p-8 max-w-[90vw] bg-white/10 backdrop-blur-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex max-w-[900px] max-h-[600px] overflow-hidden rounded-2xl">
                            <img
                                src={modalImage}
                                className="object-contain"
                                alt="Gallery"
                                onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                            />
                        </div>
                        <button
                            onClick={closeModal}
                            className="px-6 mx-auto py-3 w-fit bg-destructive rounded-full font-semibold text-white hover:opacity-90 transition-opacity"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}