"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "John Doe",
    role: "Customer",
    content: "Great product!",
    image: "https://res.cloudinary.com/dx8w9qwl6/image/upload/v1749477428/image_15_b2vcbb.png",
  },
  {
    name: "Jane Smith",
    role: "Client",
    content: "Excellent service!",
    image: "https://res.cloudinary.com/dx8w9qwl6/image/upload/v1749477428/image_15_b2vcbb.png",
  },
  // Add more testimonials as needed
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

              <blockquote className="mb-8 text-lg leading-relaxed text-gray-900 md:text-xl">
                {currentTestimonial.content}
              </blockquote>

              <div>
                <div className="mb-1 text-xl font-bold text-gray-900 md:text-2xl">{currentTestimonial.name}</div>
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
