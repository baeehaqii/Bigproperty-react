"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  image: string | null
  rating: number
  order: number
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch testimonials on mount
  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/testimonials')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Testimonials response:', data)
      
      if (data.success && Array.isArray(data.data)) {
        setTestimonials(data.data)
      } else {
        setError('Tidak ada testimoni tersedia')
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err)
      setError('Gagal memuat testimoni')
    } finally {
      setLoading(false)
    }
  }

  const handlePrevious = () => {
    if (isAnimating || testimonials.length === 0) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleNext = () => {
    if (isAnimating || testimonials.length === 0) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleDotClick = (index: number) => {
    if (!isAnimating && index !== currentIndex) {
      setIsAnimating(true)
      setCurrentIndex(index)
      setTimeout(() => setIsAnimating(false), 500)
    }
  }

  // Auto-play carousel every 5 seconds
  useEffect(() => {
    if (testimonials.length <= 1) return

    const interval = setInterval(() => {
      handleNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentIndex, testimonials.length, isAnimating])

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#ECEC5C] via-[#d4d44a] to-[#c4a747] py-16 md:py-24">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-900 text-lg">Memuat testimoni...</div>
          </div>
        </div>
      </section>
    )
  }

  if (error || testimonials.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#ECEC5C] via-[#d4d44a] to-[#c4a747] py-16 md:py-24">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-8 md:mb-12">
            <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Kata Mereka</h2>
            <p className="mt-2 text-lg text-gray-900/90">Testimoni dari pelanggan yang puas</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-900 text-lg">{error || 'Belum ada testimoni'}</div>
          </div>
        </div>
      </section>
    )
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#ECEC5C] via-[#d4d44a] to-[#c4a747] py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1600')] bg-cover bg-center" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 px-6 md:mb-12">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">Kata Mereka</h2>
          <p className="mt-2 text-lg text-gray-900/90">Testimoni dari pelanggan yang puas</p>
        </div>

        <div className="grid gap-8 px-6 lg:grid-cols-2 lg:gap-12">
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
              <Quote className="mb-6 h-12 w-12 text-gray-900/70 md:h-16 md:w-16" />

              <blockquote className="mb-6 text-lg leading-relaxed text-gray-900 md:text-xl">
                {currentTestimonial.content}
              </blockquote>

              {/* Rating Stars */}
              {currentTestimonial.rating && (
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < currentTestimonial.rating
                          ? "fill-gray-900 text-gray-900"
                          : "fill-gray-900/20 text-gray-900/20"
                      }`}
                    />
                  ))}
                </div>
              )}

              <div>
                <div className="mb-1 text-xl font-bold text-gray-900 md:text-2xl">
                  {currentTestimonial.name}
                </div>
                <div className="text-base text-gray-900/80 md:text-lg">{currentTestimonial.role}</div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePrevious}
                disabled={isAnimating}
                size="icon"
                variant="secondary"
                className="h-12 w-12 rounded-full bg-white text-[#c4a747] hover:bg-white/90 disabled:opacity-50"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                onClick={handleNext}
                disabled={isAnimating}
                size="icon"
                variant="secondary"
                className="h-12 w-12 rounded-full bg-white text-[#c4a747] hover:bg-white/90 disabled:opacity-50"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Dots Indicator */}
              {testimonials.length > 1 && (
                <div className="ml-4 flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}