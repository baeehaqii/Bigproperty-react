<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyController extends Controller
{
    /**
     * Display property detail page
     */
    public function show($id)
{
    $property = Property::with(['developer', 'event'])
        ->findOrFail($id);
    
    $property->increment('count_clicked');
    
    // Helper function untuk private image URL
    $getImageUrl = function($path) {
        if (!$path) return null;
        return '/storage/private/' . $path;
    };
    
    $formattedProperty = [
        'id' => $property->id,
        'name' => $property->name,
        'type' => $this->getPropertyType($property->kategori),
        'priceRange' => $property->price_range,
        'installment' => $property->installment_text,
        'units' => $property->units_remaining ? $property->units_remaining . ' Unit' : null,
        'bedrooms' => $property->bedrooms,
        'landSize' => $property->land_size_text,
        'buildingSize' => $property->building_size_text,
        'certificateType' => $property->certificate_type,
        'available' => $property->is_available,
        'countClicked' => $property->count_clicked,
        'lastUpdated' => $property->last_updated->diffForHumans(),
        
        // Images - PAKAI HELPER
        'images' => array_filter(array_map($getImageUrl, $property->images ?? [])),
        'mainImage' => $getImageUrl($property->main_image),
        
        // Location
        // Location
        'location' => [
            'province' => $property->provinsi,
            'city' => $property->city,
            'district' => $this->extractDistrict($property->location),
            'full' => $property->location,
            'mapUrl' => $this->convertGoogleMapsUrl($property->url_maps), // AUTO CONVERT
            'mapUrlOriginal' => $property->url_maps, // Link asli
            'nearestPlaces' => $this->formatNearestPlaces($property->nearest_place),
        ],
        
        // Developer - PAKAI HELPER
        'developer' => $property->developer ? [
            'id' => $property->developer->id,
            'name' => $property->developer->name,
            'logo' => $getImageUrl($property->developer->logo),
            'description' => $property->developer->description ?? '',
            'establishedYear' => $property->developer->established_year ?? null,
        ] : null,
        
        // Features
        'advantages' => $this->formatAdvantages($property->keunggulan),
        'facilities' => $this->formatFacilities($property->fasilitas),
        
        // Description & Details
        'description' => $property->description ?? $this->generateDescription($property),
        'promoText' => $property->promo_text,
        
        // Unit Types - PASS HELPER KE FUNCTION
        'unitTypes' => $this->generateUnitTypes($property, $getImageUrl),
        
        // Price details
        'priceDetails' => [
            'min' => $property->price_min,
            'max' => $property->price_max,
            'minFormatted' => $this->formatPrice($property->price_min),
            'maxFormatted' => $this->formatPrice($property->price_max),
            'installmentStart' => $property->installment_start,
            'installmentFormatted' => $this->formatPrice($property->installment_start),
        ],
        
        // Event
        'event' => $property->event ? [
            'id' => $property->event->id,
            'name' => $property->event->name,
            'startDate' => $property->event->start_date,
            'endDate' => $property->event->end_date,
        ] : null,
    ];
    
    return Inertia::render('PropertyDetail', [
        'property' => $formattedProperty,
    ]);
}
    
    private function convertGoogleMapsUrl($url) {
    if (!$url) return null;
    
    // Kalo udah format embed, return aja
    if (strpos($url, 'google.com/maps/embed') !== false) {
        return $url;
    }
    
    // Kalo shortlink, follow redirect dulu
    if (strpos($url, 'maps.app.goo.gl') !== false || strpos($url, 'goo.gl') !== false) {
        try {
            // Follow redirect pake curl
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_HEADER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_exec($ch);
            $finalUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
            curl_close($ch);
            
            // Extract coordinates dari final URL
            if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $finalUrl, $matches)) {
                $lat = $matches[1];
                $lng = $matches[2];
                return "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d{$lng}!3d{$lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid";
            }
            
            // Atau extract place_id
            if (preg_match('/place\/([^\/]+)/', $finalUrl, $matches)) {
                $placeId = urlencode($matches[1]);
                return "https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=place_id:{$placeId}";
            }
            
        } catch (\Exception $e) {
            \Log::error('Failed to convert maps URL: ' . $e->getMessage());
        }
    }
    
    // Kalo format biasa, extract coordinates
    if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $url, $matches)) {
        $lat = $matches[1];
        $lng = $matches[2];
        return "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000!2d{$lng}!3d{$lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid";
    }
    
    // Fallback: return original
    return $url;
}
    public function getCities()
    {
        try {
            $cities = Property::where('is_popular', true)
                ->where('is_available', true)
                ->distinct()
                ->pluck('city')
                ->filter()
                ->values();
            
            return response()->json([
                'success' => true,
                'data' => $cities,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data kota',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Get properties by city
     */
    public function getPropertiesByCity($city)
    {
        try {
            $properties = Property::with('developer')
                ->where('city', $city)
                ->where('is_popular', true)
                ->where('is_available', true)
                ->orderBy('count_clicked', 'desc')
                ->take(10)
                ->get()
                ->map(function ($property) {
                    return [
                        'id' => $property->id,
                        'image' => $property->main_image,
                        'images' => $property->images ?? [],
                        'promoText' => $property->promo_text,
                        'features' => [],
                        'type' => $this->getPropertyType($property->kategori),
                        'units' => $property->units_remaining ? $property->units_remaining . ' Unit' : null,
                        'priceRange' => $property->price_range,
                        'installment' => $property->installment_text,
                        'name' => $property->name,
                        'developer' => $property->developer->name ?? 'Unknown',
                        'developerLogo' => $property->developer->logo ?? '/images/default-developer.png',
                        'location' => $property->location,
                        'bedrooms' => $property->bedrooms,
                        'landSize' => $property->land_size_text,
                        'buildingSize' => $property->building_size_text,
                        'additionalInfo' => $property->certificate_type,
                        'lastUpdated' => $property->last_updated->diffForHumans(),
                        'buttonType' => $property->button_type ?? 'chat',
                        'available' => $property->is_available,
                        'countClicked' => $property->count_clicked ?? 0,
                    ];
                });
            
            return response()->json([
                'success' => true,
                'data' => [
                    'properties' => $properties,
                    'total' => $properties->count(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data properti',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    // Helper methods
    
    private function getPropertyType($kategori): string
    {
        if (!$kategori || !is_array($kategori)) {
            return 'Rumah';
        }
        return $kategori[0] ?? 'Rumah';
    }
    
    private function extractDistrict($location): string
    {
        // Extract district from full location string
        // Example: "Legok, Kab. Tangerang, Banten" -> "Legok"
        if (!$location) return '';
        
        $parts = explode(',', $location);
        return trim($parts[0] ?? '');
    }
    
    /**
     * Format keunggulan from database structure
     * Input: [{"icon":"heroicon-o-home","nama":"Lokasi nyaman","keterangan":"dwad"}]
     */
    private function formatAdvantages($keunggulan): array
    {
        if (!$keunggulan || !is_array($keunggulan)) {
            return [];
        }
        
        return array_map(function ($item) {
            // Handle both object and array format
            if (is_array($item)) {
                return [
                    'icon' => $item['icon'] ?? '✓',
                    'title' => $item['nama'] ?? '',
                    'description' => $item['keterangan'] ?? '',
                ];
            }
            
            // Fallback for object
            return [
                'icon' => $item->icon ?? '✓',
                'title' => $item->nama ?? '',
                'description' => $item->keterangan ?? '',
            ];
        }, $keunggulan);
    }
    
    /**
     * Format fasilitas from database structure
     * Input: [{"icon":"heroicon-o-home","nama":"kolam renang"}]
     */
    private function formatFacilities($fasilitas): array
{
    if (!$fasilitas || !is_array($fasilitas)) {
        return [];
    }
    
    return array_map(function ($item) {
        if (is_array($item)) {
            return [
                'name' => $item['nama'] ?? '',
                'icon' => $item['icon'] ?? '',
            ];
        }
        
        return [
            'name' => $item->nama ?? '',
            'icon' => $item->icon ?? '',
        ];
    }, $fasilitas);
}
    
    /**
     * Format nearest places from database structure
     * Input: [{"kategori":"sekolah","nama":"smp n 1","jarak":"15 menit"}]
     */
    private function formatNearestPlaces($nearestPlaces): array
    {
        if (!$nearestPlaces || !is_array($nearestPlaces)) {
            return [];
        }
        
        return array_map(function ($item) {
            // Handle both object and array format
            if (is_array($item)) {
                return [
                    'category' => $item['kategori'] ?? '',
                    'name' => $item['nama'] ?? '',
                    'distance' => $item['jarak'] ?? '',
                ];
            }
            
            // Fallback for object
            return [
                'category' => $item->kategori ?? '',
                'name' => $item->nama ?? '',
                'distance' => $item->jarak ?? '',
            ];
        }, $nearestPlaces);
    }
    
    private function generateDescription($property): string
    {
        return "{$property->name} adalah hunian modern yang terletak di {$property->location}. " .
               "Dengan luas tanah mulai dari {$property->land_size_text} dan luas bangunan {$property->building_size_text}, " .
               "properti ini menawarkan kenyamanan maksimal untuk keluarga Anda.";
    }
    
    private function generateUnitTypes($property, $getImageUrl = null): array
{
    return [
        [
            'name' => "Tipe {$property->building_size_min}",
            'name2' => "Tipe {$property->building_size_max}",
            'buildingSize' => $property->building_size_min,
            'landSize' => $property->land_size_min,
            'landSize2' => $property->land_size_max,
            'bedrooms' => $property->bedrooms,
            'bathrooms' => (int) filter_var($property->bedrooms, FILTER_SANITIZE_NUMBER_INT),
            'price' => $property->price_min,
            'priceFormatted' => $this->formatPrice($property->price_min),
            'image' => $getImageUrl ? $getImageUrl($property->main_image) : null,
            'stock' => $property->units_remaining,
        ]
    ];
}
    
    private function formatPrice($price): string
    {
        if ($price >= 1000000000) {
            return 'Rp ' . number_format($price / 1000000000, 1, ',', '.') . ' M';
        }
        return 'Rp ' . number_format($price / 1000000, 1, ',', '.') . ' Jt';
    }
}