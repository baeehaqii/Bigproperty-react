import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import Hero from '@/components/hero';
import { GoldenDeals } from '@/components/golden-deals';
import { LatestProperties } from '@/components/latest-properties';
import { PropertyCategories } from '@/components/property-categories';
import { PopularProperties } from '@/components/popular-properties';
import { PartnershipSection } from '@/components/partnership-section';
import { VerifiedProjects } from '@/components/verified-projects';
import { Testimonials } from '@/components/testimonials';
import Footer from '@/components/footer';
import { SEOHead, getOrganizationSchema, getWebsiteSchema } from '@/components/seo-head';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    // Combined structured data for homepage
    const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            getOrganizationSchema(),
            getWebsiteSchema(),
        ],
    };

    return (
        <>
            <SEOHead
                title="Situs Jual Beli Properti Terpercaya"
                description="Big Property - Temukan rumah, apartemen, tanah, dan properti impian Anda. Platform jual beli properti terpercaya dengan ribuan listing terverifikasi di seluruh Indonesia."
                keywords={[
                    'jual beli properti',
                    'rumah dijual',
                    'apartemen dijual',
                    'tanah dijual',
                    'properti indonesia',
                    'rumah murah',
                    'KPR',
                    'investasi properti',
                    'big property'
                ]}
                ogType="website"
                structuredData={structuredData}
                preload={[
                    {
                        href: 'https://storage.googleapis.com/bigproperty_image/website_assets/banner-bigpro-5.png',
                        as: 'image',
                    },
                ]}
            />

            {/* Navbar placed outside padded container so background can span the full viewport edges */}
            <div className="w-full">
                <Navbar />
            </div>

            <div className="flex min-h-screen flex-col items-center bg-white text-gray-900 w-full">
                <main className="w-full flex-1 mt-8">
                    <div className="max-w-[1420px] mx-auto px-6 lg:px-0">
                        <Hero />
                        <div className="mt-4 w-full">
                            <PropertyCategories />
                        </div>
                        <div className="mt-8 w-full">
                            <GoldenDeals />
                        </div>
                        <div className="mt-8 w-full">
                            <LatestProperties />
                        </div>
                        <div className="mt-2 w-full">
                            <PopularProperties />
                        </div>
                        {/* Temporarily hidden - Proyek Terverifikasi
                        <div className="mt-8 w-full">
                            <VerifiedProjects />
                        </div>
                        */}
                    </div>
                    {/* Partnership & Property Links Section */}
                    <div className="mt-8 w-full">
                        <PartnershipSection />
                    </div>
                    <div className="mt-8 w-full">
                        <Testimonials />
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}

