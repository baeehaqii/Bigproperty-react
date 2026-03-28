"use client"
import { useState } from "react"
import { Button } from "./ui/button"
import { ImageLightbox } from "./image-lightbox"

interface PropertyGalleryProps {
  images: string[] // Array of image paths
  title: string
  developer?: string
}

import { OptimizedImage } from "./optimized-image"

export function PropertyGallery({ images, title, developer }: PropertyGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  // Convert string array to PropertyImage format for lightbox
  const formattedImages = images.map((url, index) => ({
    url,
    alt: `${title} - Photo ${index + 1}`,
    priority: index,
  }))

  return (
    <>
      <section className="relative bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-2">
            {/* Main Image */}
            <div className="relative h-[300px] md:h-[400px] cursor-pointer group" onClick={() => openLightbox(0)}>
              <OptimizedImage
                src={images[0] || "/placeholder.svg"}
                alt={`${title} - Main`}
                priority={true}
                layout="full"
                blur={true}
                containerClassName="w-full h-full rounded-lg"
                className="w-full h-full rounded-lg"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg" />
            </div>

            {/* Thumbnail Grid - 2x2 */}
            <div className="grid grid-cols-2 gap-2">
              {images.slice(1, 5).map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative h-[145px] md:h-[196px] cursor-pointer group"
                  onClick={() => openLightbox(index + 1)}
                >
                  <OptimizedImage
                    src={imageUrl || "/placeholder.svg"}
                    alt={`${title} - ${index + 2}`}
                    layout="card"
                    blur={true}
                    containerClassName="w-full h-full rounded-lg"
                    className="w-full h-full rounded-lg"
                    objectFit="cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg" />

                  {index === 3 && images.length > 5 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                      <Button variant="secondary" className="bg-white hover:bg-white/90 text-foreground font-medium pointer-events-none">
                        <span className="mr-2">📷</span>
                        {images.length} Foto
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ImageLightbox
        images={formattedImages}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setCurrentImageIndex}
        title={title}
        developer={developer}
      />
    </>
  )
}