"use client"

import { useState } from "react"
import type { PropertyLocation as PropertyLocationType } from "@/types/property"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "./ui/button"

interface PropertyLocationProps {
  location: PropertyLocationType
  propertyName: string
}

const nearbyPlacesByCategory = {
  school: [
    { name: "SMA Islam Terpadu Alia Islamic School", distance: "1,98 KM" },
    { name: "SD Negeri Cijantri 1", distance: "0,99 KM" },
    { name: "SMP Negeri 2 Pagedangan", distance: "1,72 KM" },
  ],
  shopping: [
    { name: "Summarecon Mall Serpong", distance: "2,5 KM" },
    { name: "AEON Mall BSD City", distance: "3,2 KM" },
    { name: "Living World Alam Sutera", distance: "4,1 KM" },
  ],
  transport: [
    { name: "Stasiun Serpong", distance: "2,7 KM" },
    { name: "Halte Transjakarta Serpong", distance: "2,3 KM" },
    { name: "Terminal Serpong", distance: "3,5 KM" },
  ],
}

export function PropertyLocation({ location, propertyName }: PropertyLocationProps) {
  const [activeTab, setActiveTab] = useState<"school" | "shopping" | "transport">("school")

  const displayedPlaces = nearbyPlacesByCategory[activeTab]

  return (
    <section className="bg-white border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Lokasi {propertyName}</h2>
        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Tanya Detail Lokasi
        </Button>
      </div>

      <div className="flex items-start gap-2 text-sm text-gray-700">
        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <a href="#" className="text-blue-600 hover:underline">
          {location.address}
        </a>
      </div>

      <div className="relative h-[300px] bg-gray-200 rounded-lg overflow-hidden">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.3076234567!2d106.6197!3d-6.2897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fb56b25975f9%3A0x50c7d605ba8542f5!2sLegok%2C%20Tangerang%20Regency%2C%20Banten!5e0!3m2!1sen!2sid!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute bottom-4 left-4">
          <Button
            variant="secondary"
            className="bg-white hover:bg-gray-50"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`,
                "_blank",
              )
            }
          >
            <Navigation className="w-4 h-4 mr-2" />
            Buka Peta
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("school")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors rounded-t-lg ${
            activeTab === "school"
              ? "border-[#ECEC5C] text-gray-900 bg-[#ECEC5C]/10"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Sekolah & Universitas
        </button>
        <button
          onClick={() => setActiveTab("shopping")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors rounded-t-lg ${
            activeTab === "shopping"
              ? "border-[#ECEC5C] text-gray-900 bg-[#ECEC5C]/10"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Pusat Perbelanjaan
        </button>
        <button
          onClick={() => setActiveTab("transport")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors rounded-t-lg ${
            activeTab === "transport"
              ? "border-[#ECEC5C] text-gray-900 bg-[#ECEC5C]/10"
              : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Aks
        </button>
      </div>

      <div className="space-y-3">
        {displayedPlaces.map((place, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{place.name}</span>
            </div>
            <span className="text-sm font-medium text-gray-900">{place.distance}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
