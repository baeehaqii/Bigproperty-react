"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface PropertyDescriptionProps {
  description: string
  name: string
}

export function PropertyDescription({ description, name }: PropertyDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Deskripsi {name}</h2>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className={`prose prose-sm max-w-none ${!isExpanded ? "line-clamp-6" : ""}`}>
          {description.split("\n\n").map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0 text-gray-900">
              {paragraph}
            </p>
          ))}
        </div>

        <Button variant="ghost" className="mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? (
            <>
              Tampilkan Lebih Sedikit <ChevronUp className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Baca Selengkapnya <ChevronDown className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </section>
  )
}
