import { Head, Link } from '@inertiajs/react';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function NotFound() {
    return (
        <>
            <Head title="404 - Halaman Tidak Ditemukan" />

            <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Navbar */}
                <Navbar />

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="text-center max-w-lg mx-auto">
                        {/* 404 Illustration */}
                        <div className="relative mb-8">
                            {/* Large 404 Text */}
                            <h1
                                className="text-[150px] sm:text-[200px] font-black leading-none select-none"
                                style={{
                                    background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #D6D667 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                }}
                            >
                                404
                            </h1>

                            {/* Decorative elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#D6D667]/20 rounded-full blur-3xl" />
                        </div>

                        {/* Message */}
                        <div className="space-y-4 mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Oops! Halaman Tidak Ditemukan
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/">
                                <Button
                                    className="font-semibold px-6 py-3 h-auto"
                                    style={{
                                        background: 'linear-gradient(to right, #D6D667, #c4c45a)',
                                        color: '#1f2937',
                                        boxShadow: '0 8px 24px rgba(214, 214, 103, 0.25)',
                                    }}
                                >
                                    <Home className="w-5 h-5 mr-2" />
                                    Kembali ke Beranda
                                </Button>
                            </Link>

                            <Button
                                variant="outline"
                                className="font-semibold px-6 py-3 h-auto border-gray-300 text-gray-700 hover:bg-gray-100"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Halaman Sebelumnya
                            </Button>
                        </div>

                        {/* Search Suggestion */}
                        <div className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
                            <div className="flex items-center justify-center gap-2 text-gray-600 mb-3">
                                <Search className="w-5 h-5" />
                                <span className="font-medium">Mungkin Anda mencari:</span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2">
                                <Link href="/" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">
                                    Beranda
                                </Link>
                                <Link href="/#beli" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">
                                    Beli Properti
                                </Link>
                                <Link href="/#sewa" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">
                                    Sewa Properti
                                </Link>
                                <Link href="/#populer" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors">
                                    Hunian Populer
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </>
    );
}
