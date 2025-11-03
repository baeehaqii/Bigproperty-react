"use client"

import type { PropertyDetail } from "@/types/property"
import { Button } from "./ui/button"
import { Calculator } from "lucide-react"

interface PropertyMortgageProps {
  property: PropertyDetail
}

export function PropertyMortgage({ property }: PropertyMortgageProps) {
  return (
    <section id="pembiayaan-kpr" className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Estimasi KPR</h2>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-gray-600 uppercase mb-2">ESTIMASI ANGSURAN KPR/KPA MULAI DARI</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">{property.installment.monthly} /Bln</p>
            <Button variant="link" className="text-[#ECEC5C] p-0 h-auto">
              Lihat Detail Perhitungan
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            DP: Mulai dari {property.installment.downPayment} (estimasi)
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-600 uppercase mb-2">BIAYA LAINNYA</p>
          <p className="text-sm text-gray-900">
            Biaya akad: Mulai dari <strong>{property.installment.downPayment}</strong> (estimasi)*
          </p>
          <p className="text-xs text-gray-600">*belum termasuk biaya notaris</p>
        </div>
      </div>

      <Button className="w-full bg-[#ECEC5C] hover:bg-[#ECEC5C]/90 text-gray-900">
        <Calculator className="w-4 h-4 mr-2" />
        Simulasikan KPR
      </Button>
    </section>
  )
}
