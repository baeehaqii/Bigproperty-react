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
      <section className="relative overflow-hidden bg-linear-to-br from-[#1E40AF] to-[#3B82F6] py-16 md:py-24">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-lg">Memuat testimoni...</div>
          </div>
        </div>
      </section>
    )
  }

  if (error || testimonials.length === 0) {
    return (
      <section className="relative overflow-hidden bg-linear-to-br from-[#1E40AF] to-[#3B82F6] py-16 md:py-24">
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="mb-8 md:mb-12">
            <h2 className="text-3xl font-bold text-white md:text-4xl">Kata Mereka</h2>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-lg">{error || 'Belum ada testimoni'}</div>
          </div>
        </div>
      </section>
    )
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-[#1E40AF] to-[#3B82F6] py-16 md:py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(255,255,255,0.05),transparent_70%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12 text-left">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Kata Mereka</h2>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Image Section */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl">
              <div
                className={`aspect-4/5 w-full transition-all duration-500 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
                  }`}
              >
                <img
                  src={currentTestimonial.image || "/placeholder.svg"}
                  alt={currentTestimonial.name}
                  className="h-full w-full object-cover"
                />
              </div>
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col justify-center">
            <div
              className={`transition-all duration-500 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                }`}
            >
              {/* Quote Icon */}
              <div className="mb-8">
                <Quote className="h-16 w-16 text-white/80 fill-white/20" />
              </div>

              {/* Testimonial Content */}
              <blockquote className="mb-8 text-lg leading-relaxed text-white md:text-xl lg:text-2xl">
                {currentTestimonial.content}
              </blockquote>

              {/* Author Info */}
              <div className="mb-8">
                <div className="mb-1 text-2xl font-bold text-white md:text-3xl">
                  {currentTestimonial.name}
                </div>
                <div className="text-lg text-white/80 md:text-xl">{currentTestimonial.role}</div>
              </div>

              {/* Rating Stars */}
              {currentTestimonial.rating && (
                <div className="flex gap-1 mb-8">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${i < currentTestimonial.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-white/20 text-white/20"
                        }`}
                    />
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePrevious}
                  disabled={isAnimating}
                  size="icon"
                  className="h-14 w-14 rounded-full bg-white/20 text-white hover:bg-white/30 disabled:opacity-50 backdrop-blur-sm border border-white/30"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isAnimating}
                  size="icon"
                  className="h-14 w-14 rounded-full bg-white/20 text-white hover:bg-white/30 disabled:opacity-50 backdrop-blur-sm border border-white/30"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* Dots Indicator */}
                {testimonials.length > 1 && (
                  <div className="ml-6 flex gap-3">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleDotClick(index)}
                        className={`h-3 rounded-full transition-all duration-300 ${index === currentIndex
                          ? "w-10 bg-white"
                          : "w-3 bg-white/40 hover:bg-white/60"
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
      </div>
    </section>
  )
}