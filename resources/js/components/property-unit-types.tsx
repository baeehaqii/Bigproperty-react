"use client"
import { Bed, Bath, Maximize, Home } from "lucide-react"
import { Button } from "./ui/button"

interface PropertyUnitTypesProps {
  unitTypes: any[]
}

export function PropertyUnitTypes({ unitTypes }: PropertyUnitTypesProps) {
  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (numPrice >= 1000000000) {
      return `Rp ${(numPrice / 1000000000).toFixed(1).replace(".", ",")} M`
    }
    return `Rp ${(numPrice / 1000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} Jt`
  }

  return (
    <section id="pilihan-tipe-unit" className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Pilihan Tipe Unit</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {unitTypes.map((unit, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={unit.image || "/placeholder.svg"}
                alt={unit.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{unit.name} - {unit.name2}</h3>
              </div>

              <p className="text-xl font-bold text-[#ECEC5C]">
                {unit.priceFormatted || formatPrice(unit.price)}
              </p>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-900">
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-gray-600" />
                  <span>{unit.bedrooms} KT</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-gray-600" />
                  <span>{unit.bathrooms} KM</span>
                </div>
                <div className="flex items-center gap-1">
                  <Maximize className="w-4 h-4 text-gray-600" />
                  <span>LT {unit.landSize}m²</span>
                  <span> - </span>
                  <span>LT {unit.landSize2}m²</span>
                </div>
              </div>

              {unit.stock && (
                <p className="text-xs text-gray-600">Sisa {unit.stock} unit</p>
              )}

              <Button variant="outline" className="w-full bg-transparent border-gray-300 text-gray-900 hover:bg-gray-50 hover:text-gray-900">
                Lihat Detail
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}