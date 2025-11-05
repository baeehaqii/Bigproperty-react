"use client"

import { Bed, Maximize, Home, FileText, Zap, Gift } from "lucide-react"

interface PropertySummaryProps {
  property: any
}

export function PropertySummary({ property }: PropertySummaryProps) {
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (numPrice >= 1000000000) {
      return `Rp${(numPrice / 1000000000).toFixed(1).replace(".", ",")} M`
    }
    return `Rp${(numPrice / 1000000).toFixed(1)} Jt`
  }

  return (
    <section className="bg-white border rounded-lg p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{property.type}</span>
          <span className="text-sm">
            <a href="#" className="text-[#0095FF] hover:underline flex items-center gap-1">
              {property.installment}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {property.available && (
            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded">
              SIAP HUNI
            </span>
          )}
          {property.units && (
            <span className="px-3 py-1 border border-gray-300 text-gray-700 text-xs font-semibold rounded">
              SISA {property.units}
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          {property.priceRange}
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Pinvalue:{" "}
          <a href="#" className="text-[#0095FF] hover:underline inline-flex items-center gap-1">
            Login untuk Lihat
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </p>
      </div>

      {/* Developer and Location */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <img
            src={property.developer?.logo || "/placeholder.svg"}
            alt={property.developer?.name || 'Developer'}
            className="w-10 h-10 object-contain flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{property.name}</h1>
            <p className="text-sm text-gray-600">
              by{" "}
              <a href={`/developer/${property.developer?.id}`} className="text-[#0095FF] hover:underline">
                {property.developer?.name || 'Unknown Developer'}
              </a>
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          {property.location?.district && `Kel. ${property.location.district}, `}
          {property.location?.city && `Kab. ${property.location.city}, `}
          {property.location?.province || ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Bed className="w-4 h-4 text-gray-500" />
          <span>{property.bedrooms} Kamar Tidur</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Maximize className="w-4 h-4 text-gray-500" />
          <span>Luas Tanah {property.landSize}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Home className="w-4 h-4 text-gray-500" />
          <span>Luas Bangunan {property.buildingSize}</span>
        </div>
        {property.certificateType && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <FileText className="w-4 h-4 text-gray-500" />
            <span>{property.certificateType}</span>
          </div>
        )}
      </div>

      <div className="border-t pt-4 space-y-3">
        {property.promoText && (
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">PROMO & BONUS SPESIAL</p>
              <p className="text-sm text-gray-700 mt-0.5">{property.promoText}</p>
              <a href="#" className="text-[#0095FF] text-sm hover:underline inline-flex items-center gap-1 mt-0.5">
                Tanya Promo
              </a>
            </div>
          </div>
        )}

        {property.event && (
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Gift className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">EVENT: {property.event.name}</p>
              <p className="text-sm text-gray-700 flex items-center gap-1 mt-0.5">
                Berlaku hingga {new Date(property.event.endDate).toLocaleDateString('id-ID')}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}