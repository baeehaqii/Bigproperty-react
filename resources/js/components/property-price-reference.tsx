"use client"

import type { PropertyDetail } from "@/types/property"
import { Info } from "lucide-react"

interface PropertyPriceReferenceProps {
  property: PropertyDetail
}

export function PropertyPriceReference({ property }: PropertyPriceReferenceProps) {
  return (
    <section className="bg-white border rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Referensi Harga {property.name}</h2>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600">Harga Listing</span>
          <span className="text-sm font-medium text-gray-900">Rp977,9 Jt - Rp1,4 M</span>
        </div>

        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Estimasi Pinvalue</span>
            <Info className="w-4 h-4 text-gray-400" />
          </div>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Login untuk Lihat
          </a>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600">Harga per m²</span>
          <span className="text-sm font-medium text-gray-900">Rp10,1 Jt/m² - Rp23,7 Jt/m²</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700">
          Cari tahu estimasi harga yang lebih akurat untuk properti ini dengan Pinvalue
        </p>
      </div>
    </section>
  )
}
