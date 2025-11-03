"use client"

import type { PropertyDetail } from "@/types/property"
import { MessageCircle, FileText, Heart, Share2, Home } from "lucide-react"
import { Button } from "./ui/button"

interface PropertyContactProps {
  property: PropertyDetail
}

export function PropertyContact({ property }: PropertyContactProps) {
  return (
    <div className="space-y-4">
      {/* Main contact card */}
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="space-y-3">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat & Raih Cashback
          </Button>
          <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent">
            <FileText className="w-4 h-4 mr-2" />
            Dapatkan Brosur
          </Button>
          <Button variant="outline" className="w-full bg-transparent border-gray-300 text-gray-900 hover:bg-gray-50 hover:text-gray-900">
            <Heart className="w-4 h-4 mr-2" />
            Tambahkan ke Wishlist
          </Button>
        </div>

        <hr className="border-gray-200" />

        <Button variant="ghost" className="w-full justify-between hover:bg-gray-50">
          <span>Bagikan</span>
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-white border rounded-lg p-6 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Home className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">Punya properti yang ingin dijual atau disewa? Pasarkan di Pinhome!</p>
          </div>
        </div>
        <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent">
          Pasang Iklan Gratis
        </Button>
      </div>
    </div>
  )
}
