"use client"
import { useEffect, useState } from "react"
import type React from "react"

import { X, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react"
import { Button } from "./ui/button"
import type { PropertyImage } from "@/types/property"

interface ImageLightboxProps {
  images: PropertyImage[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
  title: string
  developer?: string
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
  title,
  developer,
}: ImageLightboxProps) {
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") handlePrevious()
      if (e.key === "ArrowRight") handleNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      onIndexChange(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
    }
  }

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped left
      handleNext()
    }

    if (touchStart - touchEnd < -75) {
      // Swiped right
      handlePrevious()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏢</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">{title}</h2>
              {developer && <p className="text-sm text-gray-600">by {developer}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button className="bg-[#ECEC5C] hover:bg-[#ECEC5C]/90 text-gray-900 font-medium">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Image Area */}
        <div
          className="flex-1 relative flex items-center justify-center bg-gray-50 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={images[currentIndex]?.url || "/placeholder.svg"}
            alt={images[currentIndex]?.alt}
            className="max-w-full max-h-full object-contain transition-opacity duration-300"
          />

          {/* Photo Counter Badge */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-medium">
            📷 {currentIndex + 1} / {images.length} Foto
          </div>

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full w-12 h-12"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}

          {currentIndex < images.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full w-12 h-12"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
        </div>

        {/* Thumbnail Strip */}
        <div className="border-t bg-white p-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-[#ECEC5C] ring-2 ring-[#ECEC5C]/30"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img src={image.url || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
