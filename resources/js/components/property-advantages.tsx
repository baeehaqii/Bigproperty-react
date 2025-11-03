"use client"

import type { PropertyAdvantage } from "@/types/property"
import { MapPin, Building2, GraduationCap, Hospital, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"

interface PropertyAdvantagesProps {
  advantages: PropertyAdvantage[]
  propertyName: string
}

const iconMap: Record<string, any> = {
  building: Building2,
  location: MapPin,
  school: GraduationCap,
  hospital: Hospital,
  road: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  ),
}

export function PropertyAdvantages({ advantages, propertyName }: PropertyAdvantagesProps) {
  return (
    <section className="bg-white border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Keunggulan {propertyName}</h2>
        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Tanya Keunggulan Lainnya
        </Button>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {advantages.map((advantage, index) => {
            const Icon = iconMap[advantage.icon] || MapPin
            return (
              <div
                key={index}
                className="flex-shrink-0 w-[180px] border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  {typeof Icon === "function" ? <Icon /> : <Icon className="w-6 h-6 text-blue-600" />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{advantage.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{advantage.description}</p>
                </div>
              </div>
            )
          })}
        </div>
        {/* Scroll indicator */}
        <button className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </section>
  )
}
