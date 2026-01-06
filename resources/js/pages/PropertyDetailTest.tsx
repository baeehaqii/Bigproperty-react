import { Head } from '@inertiajs/react'

interface PropertyDetailProps {
    property: any
}

export default function PropertyDetailTest({ property }: PropertyDetailProps) {
    return (
        <div className="min-h-screen bg-white">
            <Head title="Test Property Detail" />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900">Test: {property?.name || 'Unknown'}</h1>
                <p className="text-gray-600 mt-4">Property ID: {property?.id}</p>
                <pre className="bg-gray-100 p-4 rounded mt-4 overflow-auto max-h-96">
                    {JSON.stringify(property, null, 2)}
                </pre>
            </div>
        </div>
    )
}
