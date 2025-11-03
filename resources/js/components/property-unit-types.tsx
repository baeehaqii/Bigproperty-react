"use client"
import type { UnitType } from "@/types/property"
import { Bed, Bath, Maximize, Home } from "lucide-react"
import { Button } from "./ui/button"

interface PropertyUnitTypesProps {
  unitTypes: UnitType[]
}

export function PropertyUnitTypes({ unitTypes }: PropertyUnitTypesProps) {
  return (
    <section id="pilihan-tipe-unit" className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Pilihan Tipe Unit</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {unitTypes.map((unit, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Image */}
            <div className="relative h-48">
              <img
                src={unit.photos[0]?.url || "/placeholder.svg"}
                alt={unit.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-600">{unit.clusterName}</p>
                <h3 className="font-bold text-lg text-gray-900">{unit.name}</h3>
              </div>

              <p className="text-xl font-bold text-[#ECEC5C]">{unit.price}</p>

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
                  <span>LT {unit.landArea}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Home className="w-4 h-4 text-gray-600" />
                  <span>LB {unit.buildingArea}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600">Sisa {unit.stock} unit</p>

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
