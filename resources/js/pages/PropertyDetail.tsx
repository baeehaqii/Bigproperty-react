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

    // Transform the property data to match component expectations
    const transformedProperty = {
        id: property.id,
        slug: property.slug || 'park-serpong',
        name: property.name || 'Park Serpong',
        type: property.type || 'Rumah',
        status: property.status || 'Available',
        marketType: 'new-development',
        price: {
            min: property.price?.min || 977900000,
            max: property.price?.max || 1400000000,
            currency: property.price?.currency || 'IDR'
        },
        images: [
            { url: 'https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761825386/2_1_-_Photo.jpeg_sitx25.avif', alt: 'Park Serpong Main', priority: 1 },
            { url: 'https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761825387/2_6_-_Photo.jpeg_sbnhu8.avif', alt: 'Park Serpong 2', priority: 2 },
            { url: 'https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761464611/Salinan_0509_th_5_ngt3k7.avif', alt: 'Park Serpong 3', priority: 3 },
            { url: 'https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761458310/01_3_-_Photo_C_fx2gkg.avif', alt: 'Park Serpong 4', priority: 4 },
            { url: 'https://res.cloudinary.com/dx8w9qwl6/image/upload/v1761458310/01_2_-_Photo_B_mumjol.avif', alt: 'Park Serpong 5', priority: 5 }
        ],
        specifications: {
            bedrooms: property.specifications?.bedrooms || '2-3 BR',
            bathrooms: property.specifications?.bathrooms || '1-2',
            landArea: property.specifications?.landArea || '60-90m²',
            buildingArea: property.specifications?.buildingArea || '45-70m²',
            certificateType: property.specifications?.certificateType || 'SHM'
        },
        installment: {
            monthly: property.installment?.monthly || 'Rp6,7 Juta',
            downPayment: 'Rp48,9 Juta',
            tenure: 15
        },
        developer: {
            slug: 'lippo-homes-indonesia',
            name: property.developer?.name || 'Lippo Homes Indonesia',
            logo: property.developer?.logo || 'https://via.placeholder.com/60x60'
        },
        location: {
            address: 'Kel. Legok, Kec. Legok',
            district: property.location?.district || 'Legok',
            subDistrict: property.location?.subDistrict || 'Legok',
            city: property.location?.city || 'Tangerang',
            province: property.location?.province || 'Banten',
            coordinates: { lat: -6.2897, lng: 106.6197 }
        },
        description: property.description || `Berlokasi di Legok, Tangerang Regency, Banten 15820, menjadikan Park Serpong primadona di kemudian hari karena letaknya yang strategis tepat menempel dengan Gading Serpong.

Mengusung konsep modern yaitu menciptakan kehidupan yang ramah selaras dengan alam secara totalitas sehingga tercipta hunian yang nyaman, aman dan menenangkan.`,
        remainingUnits: property.remainingUnits || 10,
        advantages: [
            { title: 'GT Karawaci', description: '10 menit ke GT Karawaci', icon: 'building' },
            { title: 'Lippo Village Karawaci', description: '13 menit ke Lippo Village Karawaci', icon: 'location' },
            { title: 'Summarecon Mall Serpong', description: '17 menit ke Summarecon Mall Serpong', icon: 'building' },
            { title: 'Universitas Pelita Harapan Karawaci', description: '10 menit ke Universitas Pelita Harapan Karawaci', icon: 'school' }
        ],
        unitTypes: [
            {
                slug: 'cendana-type-2',
                name: 'Cendana Type 2',
                clusterName: 'Cendana Livan',
                price: 'Rp977,9 Jt - Rp1,4 M',
                bedrooms: '3',
                bathrooms: '3',
                landArea: '82m²',
                buildingArea: '68m²',
                floors: '1',
                stock: 10,
                photos: [{ url: 'https://via.placeholder.com/400x200', alt: 'Cendana Type 2', priority: 1 }]
            }
        ],
        facilities: [
            { name: 'Area Umum', icon: 'users' },
            { name: 'Kolam Renang', icon: 'waves' },
            { name: 'Arena Bermain', icon: 'baby' },
            { name: 'Akses 24/7', icon: 'clock' },
            { name: 'Keamanan 24 Jam', icon: 'shield' },
            { name: 'CCTV', icon: 'camera' },
            { name: 'Taman', icon: 'trees' },
            { name: 'Sumber Air PAM', icon: 'droplet' },
            { name: 'Sertifikat', icon: 'fileCheck' }
        ]
    }
    return (
        <>
            <Head title={`${transformedProperty.name} - Big Property`} />
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
                            <a href="/banten" className="hover:text-blue-600">Banten</a>
                            <span>›</span>
                            <a href="/banten/kab-tangerang" className="hover:text-blue-600">Kab. Tangerang</a>
                            <span>›</span>
                            <a href="/banten/kab-tangerang/legok" className="hover:text-blue-600">Legok</a>
                            <span>›</span>
                            <span className="text-gray-900">{transformedProperty.name}</span>
                        </div>
                    </div>
                </div>

                {/* Gallery */}
                <PropertyGallery
                    images={transformedProperty.images}
                    title={transformedProperty.name}
                    developer={transformedProperty.developer.name}
                />

                {/* Main Content */}
                <div className="bg-gray-50">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
                            {/* Main Content - Left Side */}
                            <div className="space-y-6 min-w-0">
                                {/* Property Summary */}
                                <PropertySummary property={transformedProperty as any} />

                                {/* Mortgage Calculator */}
                                <PropertyMortgage property={transformedProperty as any} />

                                {/* Advantages */}
                                <PropertyAdvantages
                                    advantages={transformedProperty.advantages}
                                    propertyName={transformedProperty.name}
                                />

                                {/* Location */}
                                <PropertyLocation
                                    location={transformedProperty.location as any}
                                    propertyName={transformedProperty.name}
                                />

                                {/* Unit Types */}
                                <PropertyUnitTypes unitTypes={transformedProperty.unitTypes as any} />

                                {/* Facilities */}
                                <PropertyFacilities facilities={transformedProperty.facilities as any} />

                                {/* Developer */}
                                <PropertyDeveloper developer={transformedProperty.developer} />

                                {/* Description */}
                                <PropertyDescription
                                    description={transformedProperty.description}
                                    name={transformedProperty.name}
                                />

                                {/* Price Reference */}
                                <PropertyPriceReference property={transformedProperty as any} />

                                {/* FAQ */}
                                <PropertyFAQ property={transformedProperty as any} />
                            </div>

                            {/* Sidebar - Right Side */}
                            <aside className="order-first lg:order-last lg:sticky lg:top-4 h-fit">
                                <PropertyContact property={transformedProperty as any} />
                            </aside>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
