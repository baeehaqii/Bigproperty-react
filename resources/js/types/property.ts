export interface PropertyImage {
  url: string
  alt: string
  priority: number
}

export interface PropertySpecification {
  bedrooms: string
  bathrooms: string
  landArea: string
  buildingArea: string
  floors?: string
  certificateType: string
}

export interface PropertyPrice {
  min: number
  max: number
  currency: string
}

export interface PropertyInstallment {
  monthly: string
  downPayment: string
  tenure: number
}

export interface PropertyDeveloper {
  name: string
  logo: string
  slug: string
}

export interface PropertyAdvantage {
  icon: string
  title: string
  description: string
}

export interface PropertyFacility {
  icon: string
  name: string
}

export interface UnitType {
  name: string
  clusterName: string
  photos: PropertyImage[]
  bedrooms: string
  bathrooms: string
  buildingArea: string
  landArea: string
  floors: string
  price: string
  stock: number
  slug: string
}

export interface PropertyLocation {
  address: string
  district: string
  subDistrict?: string
  city: string
  province: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface PropertyDetail {
  id: string
  name: string
  slug: string
  type: string
  marketType: string
  status: string
  price: PropertyPrice
  images: PropertyImage[]
  specifications: PropertySpecification
  installment: PropertyInstallment
  developer: PropertyDeveloper
  location: PropertyLocation
  advantages: PropertyAdvantage[]
  facilities: PropertyFacility[]
  unitTypes: UnitType[]
  description: string
  remainingUnits: number
}
