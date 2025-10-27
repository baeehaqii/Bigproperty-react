"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  image: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Raden Kautsar",
    role: "Pembeli Panorama Bekasi Residence via Pinhome",
    content:
      "Cari hunian via aplikasi Pinhome lancar banget! Fitur pencarian terkategorisasi dengan baik. Setelah saya isi data diri untuk mencari info lebih lanjut soal Panorama Bekasi Residence, saya diarahkan untuk berkomunikasi langsung dengan agen. Agennya responsif dan ahli dalam pekerjaannya. Itu yang bikin saya yakin.",
    image: "/placeholder.svg?height=400&width=600",
    rating: 5,
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    role: "Pembeli Villa Kebun Raya via Pinhome",
    content:
      "Pengalaman membeli rumah pertama saya melalui Pinhome sangat menyenangkan. Tim mereka sangat membantu dan proses verifikasi properti membuat saya merasa aman. Cicilan yang ditawarkan juga sangat kompetitif.",
    image: "/placeholder.svg?height=400&width=600",
    rating: 5,
  },
  {
    id: 3,
    name: "Budi Santoso",
    role: "Investor Properti Jakarta",
    content:
      "Sudah beberapa kali transaksi properti melalui Pinhome. Yang saya suka adalah transparansi informasi dan kemudahan dalam proses negosiasi. Customer service mereka juga sangat responsif dalam menjawab pertanyaan.",
    image: "/placeholder.svg?height=400&width=600",
    rating: 5,
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handlePrevious = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mb-8 md:mb-12">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Kata Mereka</h2>
          <p className="mt-2 text-lg text-white/90">Testimoni dari pelanggan yang puas</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Section */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl">
              <div
                className={`aspect-[4/3] w-full transition-all duration-500 ${
                  isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
                }`}
              >
                <img
                  src={currentTestimonial.image || "/placeholder.svg"}
                  alt={currentTestimonial.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col justify-center">
            <div
              className={`mb-8 transition-all duration-500 ${
                isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
              }`}
            >
              <Quote className="mb-6 h-12 w-12 text-white/80 md:h-16 md:w-16" />

              <blockquote className="mb-8 text-lg leading-relaxed text-white md:text-xl">
                {currentTestimonial.content}
              </blockquote>

              <div>
                <div className="mb-1 text-xl font-bold text-white md:text-2xl">{currentTestimonial.name}</div>
                <div className="text-base text-white/90 md:text-lg">{currentTestimonial.role}</div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePrevious}
                disabled={isAnimating}
                size="icon"
                variant="secondary"
                className="h-12 w-12 rounded-full bg-white text-blue-600 hover:bg-white/90 disabled:opacity-50"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                onClick={handleNext}
                disabled={isAnimating}
                size="icon"
                variant="secondary"
                className="h-12 w-12 rounded-full bg-white text-blue-600 hover:bg-white/90 disabled:opacity-50"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Dots Indicator */}
              <div className="ml-4 flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isAnimating) {
                        setIsAnimating(true)
                        setCurrentIndex(index)
                        setTimeout(() => setIsAnimating(false), 500)
                      }
                    }}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
