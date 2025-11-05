"use client"

import { 
  Users, Waves, Baby, Clock, Shield, Camera, Trees, Droplet, FileCheck,
  Home, Building, Car, Dumbbell, ShoppingCart, Wifi, Zap, Wind,
  Sun, Moon, Lock, Bell, Phone, Mail, MapPin, Navigation,
  Award, Star, Heart, Gift, Sparkles, CheckCircle, XCircle,
  Circle, Square, Triangle, Hexagon, Octagon
} from "lucide-react"
import { Button } from "./ui/button"

interface PropertyFacilitiesProps {
  facilities: any[]
}

export function PropertyFacilities({ facilities }: PropertyFacilitiesProps) {
  // Map heroicon names to lucide icons
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      // Common facilities
      'heroicon-o-home': Home,
      'heroicon-o-building-office': Building,
      'heroicon-o-building-storefront': ShoppingCart,
      'heroicon-o-squares-2x2': Square,
      'heroicon-o-users': Users,
      'heroicon-o-camera': Camera,
      'heroicon-o-shield-check': Shield,
      'heroicon-o-clock': Clock,
      'heroicon-o-wifi': Wifi,
      'heroicon-o-bolt': Zap,
      'heroicon-o-star': Star,
      'heroicon-o-heart': Heart,
      'heroicon-o-gift': Gift,
      'heroicon-o-sparkles': Sparkles,
      'heroicon-o-check-circle': CheckCircle,
      'heroicon-o-x-circle': XCircle,
      'heroicon-o-map-pin': MapPin,
      'heroicon-o-phone': Phone,
      'heroicon-o-envelope': Mail,
      'heroicon-o-lock-closed': Lock,
      'heroicon-o-bell': Bell,
      'heroicon-o-sun': Sun,
      'heroicon-o-moon': Moon,
      'heroicon-o-trophy': Award,
      
      // Specific facilities
      'kolam renang': Waves,
      'playground': Baby,
      'taman': Trees,
      'gym': Dumbbell,
      'parkir': Car,
      'air': Droplet,
      'keamanan': Shield,
      'security': Shield,
      'cctv': Camera,
    }
    
    // Cari exact match dulu
    if (iconMap[iconName.toLowerCase()]) {
      return iconMap[iconName.toLowerCase()]
    }
    
    // Cari partial match dari nama fasilitas
    const lowerName = iconName.toLowerCase()
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return icon
      }
    }
    
    // Default icon
    return CheckCircle
  }

  return (
    <section className="bg-white border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Spesifikasi & Fasilitas</h2>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Fasilitas berbeda tiap unit
          </p>
        </div>
        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm">
          Tanya Detail Fasilitas
        </Button>
      </div>

      {facilities && facilities.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
          {facilities.map((facility, index) => {
            const Icon = getIconComponent(facility.icon || facility.name)
            return (
              <div key={index} className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-gray-700" strokeWidth={1.5} />
                </div>
                <p className="text-xs text-gray-700 capitalize">{facility.name}</p>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-8">
          Informasi fasilitas belum tersedia
        </p>
      )}
    </section>
  )
}