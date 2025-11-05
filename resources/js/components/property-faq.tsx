"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface PropertyFAQProps {
  property: any
}

interface FAQItem {
  question: string
  answer: string
}

export function PropertyFAQ({ property }: PropertyFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (numPrice >= 1000000000) {
      return `Rp${(numPrice / 1000000000).toFixed(1).replace(".", ",")} M`
    }
    return `Rp${(numPrice / 1000000).toFixed(1)} Jt`
  }

  const faqs: FAQItem[] = [
    {
      question: `Berapa harga jual properti di ${property.name}?`,
      answer: `Harga jual properti ${property.name} adalah ${property.priceRange}.`,
    },
    {
      question: `Dimana lokasi ${property.name}?`,
      answer: `${property.name} berada di ${property.location?.full || property.location?.district}, ${property.location?.city}, ${property.location?.province}.`,
    },
    {
      question: `Berapa kamar yang tersedia di ${property.name}?`,
      answer: `${property.name} memiliki ${property.bedrooms} Kamar Tidur.`,
    },
    {
      question: `Berapa luas bangunan di ${property.name}?`,
      answer: `Luas bangunan properti ${property.name} adalah ${property.buildingSize} dan luas tanah ${property.landSize}.`,
    },
  ]

  return (
    <section className="space-y-4">
      <h3 className="text-2xl font-bold text-gray-900">
        FAQ {property.name} by {property.developer?.name || 'Developer'}
      </h3>

      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="font-medium pr-4 text-gray-900">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 shrink-0 transition-transform text-gray-600 ${openIndex === index ? "rotate-180" : ""}`}
              />
            </button>
            {openIndex === index && <div className="px-4 pb-4 text-sm text-gray-600">{faq.answer}</div>}
          </div>
        ))}
      </div>
    </section>
  )
}