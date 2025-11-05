import { Head } from '@inertiajs/react'
import { Navbar } from '@/components/navbar'
import { PropertyContact } from '@/components/property-contact'
import { PropertyGallery } from '@/components/property-gallery'
import { PropertySummary } from '@/components/property-summary'
import { PropertyMortgage } from '@/components/property-mortgage'
import { PropertyAdvantages } from '@/components/property-advantages'
import { PropertyLocation } from '@/components/property-location'
import { PropertyUnitTypes } from '@/components/property-unit-types'
import { PropertyFacilities } from '@/components/property-facilities'
import { PropertyDeveloper } from '@/components/property-developer'
import { PropertyDescription } from '@/components/property-description'
import { PropertyPriceReference } from '@/components/property-price-reference'
import { PropertyFAQ } from '@/components/property-faq'

interface PropertyDetailProps {
    property: any
}

export default function PropertyDetail({ property }: PropertyDetailProps) {
    console.log('Property data received:', property)
    console.log('Property images:', property?.images)
    console.log('Property advantages:', property?.advantages)
    console.log('Property facilities:', property?.facilities)
    console.log('Property data received:', property)
    console.log('Property images:', property?.images)

    if (!property) {
        return (
            <>
                <Head title="Property Not Found - Big Property" />
                <div className="min-h-screen bg-white">
                    <Navbar />
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-3xl font-bold text-gray-900">Property Not Found</h1>
                    </div>
                </div>
            </>
        )
    }

    // Data sudah dalam format yang benar dari backend, tinggal gunakan langsung
    // Tidak perlu transformasi lagi karena PropertyController sudah mengirim format yang sesuai
    
    return (
        <>
            <Head title={`${property.name} - Big Property`} />
            <div className="min-h-screen bg-white">
                {/* Navbar */}
                <Navbar />

                {/* Breadcrumb */}
                <div className="border-b bg-white">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto">
                            <a href="/" className="hover:text-blue-600">Home</a>
                            <span>›</span>
                            <a href="/dijual" className="hover:text-blue-600">Dijual</a>
                            <span>›</span>
                            <a href="/dijual/rumah-baru" className="hover:text-blue-600">Rumah Baru</a>
                            <span>›</span>
                            <a href={`/${property.location?.province?.toLowerCase()}`} className="hover:text-blue-600">
                                {property.location?.province || 'Banten'}
                            </a>
                            <span>›</span>
                            <a href={`/${property.location?.province?.toLowerCase()}/${property.location?.city?.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-blue-600">
                                {property.location?.city || 'Kab. Tangerang'}
                            </a>
                            <span>›</span>
                            <a href={`/${property.location?.province?.toLowerCase()}/${property.location?.city?.toLowerCase().replace(/\s+/g, '-')}/${property.location?.district?.toLowerCase()}`} className="hover:text-blue-600">
                                {property.location?.district || 'Legok'}
                            </a>
                            <span>›</span>
                            <span className="text-gray-900">{property.name}</span>
                        </div>
                    </div>
                </div>

                {/* Gallery */}
                {/* Gallery */}
                <PropertyGallery
                    images={[property.mainImage, ...(property.images || [])].filter(Boolean)}
                    title={property.name}
                    developer={property.developer?.name}
                />

                {/* Main Content */}
                <div className="bg-gray-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
                            {/* Main Content - Left Side */}
                            <div className="space-y-6 min-w-0">
                                {/* Property Summary */}
                                <PropertySummary property={property} />

                                {/* Mortgage Calculator */}
                                <PropertyMortgage property={property} />

                                {/* Advantages - Only show if data exists */}
                                {property.advantages && property.advantages.length > 0 && (
                                    <PropertyAdvantages
                                        advantages={property.advantages}
                                        propertyName={property.name}
                                    />
                                )}

                                {/* Location */}
                                <PropertyLocation
                                    location={property.location}
                                    propertyName={property.name}
                                />

                                {/* Unit Types - Only show if data exists */}
                                {property.unitTypes && property.unitTypes.length > 0 && (
                                    <PropertyUnitTypes unitTypes={property.unitTypes} />
                                )}

                                {/* Facilities - Only show if data exists */}
                                {property.facilities && property.facilities.length > 0 && (
                                    <PropertyFacilities facilities={property.facilities} />
                                )}

                                {/* Developer */}
                                <PropertyDeveloper developer={property.developer} />

                                {/* Description */}
                                {property.description && (
                                    <PropertyDescription
                                        description={property.description}
                                        name={property.name}
                                    />
                                )}

                                {/* Price Reference */}
                                <PropertyPriceReference property={property} />

                                {/* FAQ */}
                                <PropertyFAQ property={property} />
                            </div>

                            {/* Sidebar - Right Side */}
                            <aside className="order-first lg:order-last lg:sticky lg:top-4 h-fit">
                                <PropertyContact property={property} />
                            </aside>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}