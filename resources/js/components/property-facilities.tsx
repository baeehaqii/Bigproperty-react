"use client"

import { Users, Waves, Baby, Clock, Shield, Camera, Trees, Droplet, FileCheck } from "lucide-react"
import { Button } from "./ui/button"

interface PropertyFacilitiesProps {
  facilities: any[]
}

export function PropertyFacilities({ facilities }: PropertyFacilitiesProps) {
  const facilityList = [
    { name: "Area Umum", icon: Users },
    { name: "Kolam Renang", icon: Waves },
    { name: "Arena Bermain", icon: Baby },
    { name: "Akses 24/7", icon: Clock },
    { name: "Keamanan 24 Jam", icon: Shield },
    { name: "CCTV", icon: Camera },
    { name: "Taman", icon: Trees },
    { name: "Sumber Air PAM", icon: Droplet },
    { name: "Sertifikat", icon: FileCheck },
  ]

  return (
    <section className="bg-white border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Spesifikasi & Fasilitas</h2>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Fasilitas berbeda tiap unit
          </p>
        </div>
        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm">
          Tanya Detail Fasilitas
        </Button>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
        {facilityList.map((facility, index) => {
          const Icon = facility.icon
          return (
            <div key={index} className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 flex items-center justify-center">
                <Icon className="w-8 h-8 text-gray-700" strokeWidth={1.5} />
              </div>
              <p className="text-xs text-gray-700">{facility.name}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
