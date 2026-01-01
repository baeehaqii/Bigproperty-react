import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/components/navbar';
import Hero from '@/components/hero';
import { GoldenDeals } from '@/components/golden-deals';
import { PropertyCategories } from '@/components/property-categories';
import { PopularProperties } from '@/components/popular-properties';
import { VerifiedProjects } from '@/components/verified-projects';
import { Testimonials } from '@/components/testimonials';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            {/* Navbar placed outside padded container so background can span the full viewport edges */}
            <div className="w-full">
                <Navbar />
            </div>

            <div className="flex min-h-screen flex-col items-center bg-white text-gray-900 w-full">
                <main className="w-full flex-1 mt-8">
                    <div className="max-w-[1420px] mx-auto px-6 lg:px-0">
                        <Hero />
                        <div className="mt-12 w-full">
                            <PropertyCategories />
                        </div>
                        <div className="mt-8 w-full">
                            <GoldenDeals />
                        </div>
                        <div className="mt-8 w-full">
                            <PopularProperties />
                        </div>
                        <div className="mt-8 w-full">
                            <VerifiedProjects />
                        </div>
                    </div>
                    <div className="mt-8 w-full">
                        <Testimonials />
                    </div>
                </main>

                <div className="h-10" />
            </div>
        </>
    );
}
