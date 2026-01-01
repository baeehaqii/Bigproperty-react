"use client"

import type { PropertyDeveloper as DeveloperType } from "@/types/property"
import { Button } from "./ui/button"

interface PropertyDeveloperProps {
  developer: DeveloperType | null
}

export function PropertyDeveloper({ developer }: PropertyDeveloperProps) {
  if (!developer) {
    return (
      <section id="developer" className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Developer</h2>
        <p className="text-gray-600">Informasi developer tidak tersedia</p>
      </section>
    )
  }

  return (
    <section id="developer" className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Developer</h2>

      <div className="flex items-center gap-3">
        <img
          src={developer.logo || "/placeholder.svg"}
          alt={developer.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">{developer.name}</p>
        </div>
      </div>

      <Button variant="outline" className="w-full bg-transparent border-gray-300 text-gray-900 hover:bg-gray-50 hover:text-gray-900">
        Lihat Profil Developer
      </Button>
    </section>
  )
}
