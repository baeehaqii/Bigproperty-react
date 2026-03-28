<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Keunggulan;
use App\Models\Fasilitas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PropertyController extends Controller
{
    /**
     * Display property detail page
     */
    public function show($id)
    {
        $property = Property::with(['developer', 'event', 'agen'])
            ->findOrFail($id);

        $property->increment('count_clicked');

        // Helper function untuk image URL (supports Cloudinary URLs and local paths)
        $getImageUrl = function ($path) {
            if (!$path)
                return null;

            $path = trim($path, " \t\n\r\0\x0B\"'");

            \Illuminate\Support\Facades\Log::info('PropertyDetail Image Path: ' . $path);

            // If it's already a full URL (Cloudinary), return as is
            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }

            // Local path - use storage URL
            return '/storage/' . $path;
        };

        $formattedProperty = [
            'id' => $property->id,
            'name' => $property->name,
            'type' => $this->getPropertyType($property->kategori),
            'priceRange' => $property->price_range,
            'installment' => $property->installment_text,
            'units' => $property->units_remaining ? $property->units_remaining . ' Unit' : null,
            'bedrooms' => $property->bedrooms,
            'bathrooms' => $property->bathrooms,
            'landSize' => $property->land_size_text,
            'buildingSize' => $property->building_size_text,
            'electricPower' => $property->listrik,
            'certificateType' => $property->certificate_type,
            'available' => $property->is_available,
            'countClicked' => $property->count_clicked,
            'lastUpdated' => $property->last_updated->diffForHumans(),

            // Images - PAKAI HELPER
            'images' => array_filter(array_map($getImageUrl, $property->images ?? [])),
            'mainImage' => $getImageUrl($property->main_image),

            // Location
            'location' => [
                'province' => $property->provinsi,
                'city' => $property->city,
                'district' => $this->extractDistrict($property->location),
                'full' => $property->location,
                'mapUrl' => $this->convertGoogleMapsUrl($property->url_maps)
                    ?? "https://maps.google.com/maps?q=" . urlencode($property->location . ', ' . $property->city . ', ' . $property->provinsi) . "&z=15&output=embed",
                'mapUrlOriginal' => $property->url_maps,
                'nearestPlaces' => $this->formatNearestPlaces($property->nearest_place),
            ],

            // Agent - from agen relationship
            'agent' => $property->agen ? [
                'id' => $property->agen->id,
                'name' => $property->agen->name,
                'phone' => $property->agen->phone,
                'whatsapp' => $property->agen->phone, // Using phone as whatsapp
                'photo' => $getImageUrl($property->agen->photo),
                'licenseNumber' => $property->agen->license_number,
                'role' => 'Agen Properti',
            ] : null,

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
            'nearbyPlaces' => $this->formatNearbyPlaces($property->nearby_places),

            // Description & Details
            'description' => $property->promo_text ?: $property->description ?: $this->generateDescription($property),
            'promoText' => $property->promo_text,

            // Unit Types - PASS HELPER KE FUNCTION
            'unitTypes' => $this->generateUnitTypes($property, $getImageUrl),

            // Price details
            'priceDetails' => [
                'min' => $property->price_min,
                'max' => $property->price_max,
                'minFormatted' => $this->formatPriceFull($property->price_min),
                'maxFormatted' => $this->formatPriceFull($property->price_max),
                'minShort' => $this->formatPrice($property->price_min),
                'maxShort' => $this->formatPrice($property->price_max),
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

    private function convertGoogleMapsUrl($url)
    {
        if (!$url)
            return null;

        // If already an embed URL, return as is
        if (strpos($url, 'google.com/maps/embed') !== false || strpos($url, 'maps.google.com/maps?') !== false) {
            return $url;
        }

        // Try to extract coordinates from various URL formats
        $lat = null;
        $lng = null;
        $placeName = null;
        $originalUrl = $url;

        // Handle various Google short links by following redirects
        $shortLinkDomains = ['maps.app.goo.gl', 'goo.gl', 'share.google', 'g.co', 'g.page'];
        $isShortLink = false;
        foreach ($shortLinkDomains as $domain) {
            if (strpos($url, $domain) !== false) {
                $isShortLink = true;
                break;
            }
        }

        if ($isShortLink) {
            try {
                // Follow redirect using curl
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_HEADER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                $response = curl_exec($ch);
                $url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
                curl_close($ch);

                \Log::info('Short URL resolved', ['original' => $originalUrl, 'resolved' => $url]);
            } catch (\Exception $e) {
                \Log::error('Failed to follow maps short URL: ' . $e->getMessage());
            }
        }

        // Extract coordinates from @lat,lng format (e.g., @-6.9175,110.4203)
        if (preg_match('/@(-?\d+\.?\d*),(-?\d+\.?\d*)/', $url, $matches)) {
            $lat = $matches[1];
            $lng = $matches[2];
        }

        // Try to extract coordinates from !3d and !4d format in embed URLs
        if (!$lat && preg_match('/!3d(-?\d+\.?\d*)/', $url, $latMatch) && preg_match('/!4d(-?\d+\.?\d*)/', $url, $lngMatch)) {
            $lat = $latMatch[1];
            $lng = $lngMatch[1];
        }

        // Extract place name from /place/Name format
        if (preg_match('/place\/([^\/@?]+)/', $url, $matches)) {
            $placeName = urldecode(str_replace('+', ' ', $matches[1]));
        }

        // Build the FREE embed URL (no API key required)
        if ($lat && $lng) {
            return "https://maps.google.com/maps?q={$lat},{$lng}&z=15&output=embed";
        }

        // If we have a place name, use that
        if ($placeName) {
            return "https://maps.google.com/maps?q=" . urlencode($placeName) . "&z=15&output=embed";
        }

        // Fallback: use city + province from property if URL doesn't contain usable info
        // This will be handled by the caller
        return null;
    }

    public function getCities()
    {
        try {
            // Get cities from verified and available properties
            // Sorted by most clicked properties (popular)
            $cityCodes = Property::where('is_available', true)
                ->where('is_verified', true) // Only show approved listings
                ->whereNotNull('city')
                ->select('city', 'provinsi')
                ->selectRaw('SUM(count_clicked) as total_clicks')
                ->groupBy('city', 'provinsi')
                ->orderByDesc('total_clicks')
                ->get();

            // Lookup city names using WilayahService
            $wilayahService = new \App\Services\WilayahService();

            $cities = $cityCodes->map(function ($item) use ($wilayahService) {
                $cityCode = $item->city;
                $provinceCode = $item->provinsi;

                // Get city name from wilayah API (cached)
                $cityName = $cityCode; // Fallback to code

                try {
                    $regencies = $wilayahService->getCities($provinceCode);
                    if (isset($regencies['data']) && is_array($regencies['data'])) {
                        foreach ($regencies['data'] as $regency) {
                            if ($regency['code'] === $cityCode) {
                                $cityName = $regency['name'];
                                break;
                            }
                        }
                    }
                } catch (\Exception $e) {
                    \Log::warning('Failed to lookup city name: ' . $e->getMessage());
                }

                return [
                    'code' => $cityCode,
                    'name' => $cityName,
                ];
            })->filter()->values();

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
     * Get all popular properties without city filtering
     */
    public function getAllPopularProperties()
    {
        try {
            // Helper function untuk image URL
            $getImageUrl = function ($path) {
                if (!$path)
                    return null;

                $path = trim($path, " \t\n\r\0\x0B\"'");

                if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    return $path;
                }
                return '/storage/' . $path;
            };

            // Get all verified and available properties
            // Sorted by click count (most popular first)
            $properties = Property::with(['developer', 'agen'])
                ->where('is_available', true)
                ->where('is_verified', true) // Only show approved listings
                ->orderBy('count_clicked', 'desc')
                ->take(20) // Limit to 20 properties
                ->get()
                ->map(function ($property) use ($getImageUrl) {
                    return [
                        'id' => $property->id,
                        'image' => $getImageUrl($property->main_image),
                        'images' => array_filter(array_map($getImageUrl, $property->images ?? [])),
                        'promoText' => $property->promo_text,
                        'features' => [],
                        'type' => $this->getPropertyType($property->kategori),
                        'units' => $property->units_remaining ? $property->units_remaining . ' Unit' : null,
                        'priceRange' => $property->price_range,
                        'installment' => $property->installment_text,
                        'name' => $property->name,
                        // Use agent name, fallback to developer name
                        'developer' => $property->agen->name ?? $property->developer->name ?? 'Unknown',
                        'developerLogo' => $getImageUrl($property->agen->photo ?? null) ?: $getImageUrl($property->developer->logo ?? null),
                        // Agent data for avatar fallback
                        'agent' => $property->agen ? [
                            'name' => $property->agen->name,
                            'photo' => $getImageUrl($property->agen->photo),
                        ] : null,
                        'location' => $property->location,
                        'city' => $property->city,
                        'province' => $property->provinsi,
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
                'message' => 'Gagal memuat properti',
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
            // Get verified and available properties for this city
            // Sorted by click count (most popular first)
            $properties = Property::with(['developer', 'agen'])
                ->where('city', $city)
                ->where('is_available', true)
                ->where('is_verified', true) // Only show approved listings
                ->orderBy('count_clicked', 'desc')
                ->take(10)
                ->get()
                ->map(function ($property) {
                    // Helper function untuk image URL
                    $getImageUrl = function ($path) {
                        if (!$path)
                            return null;

                        $path = trim($path, " \t\n\r\0\x0B\"'");

                        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                            return $path;
                        }
                        return '/storage/' . $path;
                    };

                    return [
                        'id' => $property->id,
                        'image' => $getImageUrl($property->main_image),
                        'images' => array_filter(array_map($getImageUrl, $property->images ?? [])),
                        'promoText' => $property->promo_text,
                        'features' => [],
                        'type' => $this->getPropertyType($property->kategori),
                        'units' => $property->units_remaining ? $property->units_remaining . ' Unit' : null,
                        'priceRange' => $property->price_range,
                        'installment' => $property->installment_text,
                        'name' => $property->name,
                        // Use agent name, fallback to developer name
                        'developer' => $property->agen->name ?? $property->developer->name ?? 'Unknown',
                        'developerLogo' => $getImageUrl($property->agen->photo ?? null) ?: $getImageUrl($property->developer->logo ?? null),
                        // Agent data for avatar fallback
                        'agent' => $property->agen ? [
                            'name' => $property->agen->name,
                            'photo' => $getImageUrl($property->agen->photo),
                        ] : null,
                        'location' => $property->location,
                        'city' => $property->city,
                        'province' => $property->provinsi,
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
        if (!$location)
            return '';

        $parts = explode(',', $location);
        return trim($parts[0] ?? '');
    }

    /**
     * Format keunggulan from database structure
     * Input can be:
     * - Array of IDs: [1, 2, 3]
     * - Array of objects: [{"icon":"heroicon-o-home","nama":"Lokasi nyaman","keterangan":"dwad"}]
     */
    private function formatAdvantages($keunggulan): array
    {
        if (!$keunggulan || !is_array($keunggulan)) {
            return [];
        }

        // Check if it's an array of IDs (integers)
        if (!empty($keunggulan) && is_int($keunggulan[0])) {
            // Lookup from database
            $keunggulanData = Keunggulan::whereIn('id', $keunggulan)->get();
            return $keunggulanData->map(function ($item) {
                return [
                    'icon' => $item->icon ?? '✓',
                    'title' => $item->nama ?? '',
                    'description' => $item->keterangan ?? '',
                ];
            })->toArray();
        }

        // Handle array of objects format
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
     * Input can be:
     * - Array of IDs: [1, 2, 3]
     * - Array of objects: [{"icon":"heroicon-o-home","nama":"kolam renang"}]
     */
    private function formatFacilities($fasilitas): array
    {
        if (!$fasilitas || !is_array($fasilitas)) {
            return [];
        }

        // Check if it's an array of IDs (integers)
        if (!empty($fasilitas) && is_int($fasilitas[0])) {
            // Lookup from database
            $fasilitasData = Fasilitas::whereIn('id', $fasilitas)->get();
            return $fasilitasData->map(function ($item) {
                return [
                    'name' => $item->nama ?? '',
                    'icon' => $item->icon ?? '',
                ];
            })->toArray();
        }

        // Handle array of objects format
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
     * Format nearby places from database structure
     * Input: [{"kategori":"sekolah","nama":"SMP N 1"}]
     */
    private function formatNearbyPlaces($nearbyPlaces): array
    {
        if (!$nearbyPlaces || !is_array($nearbyPlaces)) {
            return [];
        }

        // Category to icon mapping
        $categoryIcons = [
            'sekolah' => 'heroicon-o-academic-cap',
            'rumah sakit' => 'heroicon-o-building-office',
            'pasar' => 'heroicon-o-building-storefront',
            'mall' => 'heroicon-o-building-storefront',
            'bank' => 'heroicon-o-banknotes',
            'atm' => 'heroicon-o-credit-card',
            'stasiun' => 'heroicon-o-ticket',
            'terminal' => 'heroicon-o-truck',
            'bandara' => 'heroicon-o-paper-airplane',
            'masjid' => 'heroicon-o-building-library',
            'gereja' => 'heroicon-o-building-library',
            'tempat ibadah' => 'heroicon-o-building-library',
            'taman' => 'heroicon-o-sparkles',
            'gym' => 'heroicon-o-bolt',
            'restoran' => 'heroicon-o-cake',
            'cafe' => 'heroicon-o-cup-soda',
            'spbu' => 'heroicon-o-fire',
            'apotek' => 'heroicon-o-beaker',
            'minimarket' => 'heroicon-o-shopping-bag',
            'kantor' => 'heroicon-o-building-office-2',
        ];

        return array_map(function ($item) use ($categoryIcons) {
            if (is_array($item)) {
                $kategori = strtolower($item['kategori'] ?? '');
                $icon = 'heroicon-o-map-pin'; // default

                foreach ($categoryIcons as $key => $iconName) {
                    if (str_contains($kategori, $key)) {
                        $icon = $iconName;
                        break;
                    }
                }

                return [
                    'category' => $item['kategori'] ?? '',
                    'name' => $item['nama'] ?? '',
                    'icon' => $icon,
                ];
            }

            return [
                'category' => $item->kategori ?? '',
                'name' => $item->nama ?? '',
                'icon' => 'heroicon-o-map-pin',
            ];
        }, $nearbyPlaces);
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

    private function formatPriceFull($price): string
    {
        return 'Rp ' . number_format($price, 0, ',', '.');
    }

    /**
     * Get similar properties based on same city and similar price range
     * Similar price = ±15 million from current property price
     */
    public function getSimilarProperties($id)
    {
        try {
            $currentProperty = Property::findOrFail($id);

            // Get the minimum price of current property
            $currentPrice = $currentProperty->price_min ?? 0;
            $priceVariation = 15000000; // 15 juta

            $minPrice = $currentPrice - $priceVariation;
            $maxPrice = $currentPrice + $priceVariation;

            // Get city from current property
            $city = $currentProperty->city;

            // Helper function untuk image URL
            $getImageUrl = function ($path) {
                if (!$path)
                    return null;

                $path = trim($path, " \t\n\r\0\x0B\"'");

                if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    return $path;
                }
                return '/storage/' . $path;
            };

            $properties = Property::with(['developer', 'agen'])
                ->where('id', '!=', $id) // Exclude current property
                ->where('city', $city) // Same city/kabupaten
                ->where('is_available', true)
                ->where('is_verified', true) // Only show approved listings
                ->where(function ($query) use ($minPrice, $maxPrice) {
                    $query->whereBetween('price_min', [$minPrice, $maxPrice])
                        ->orWhereBetween('price_max', [$minPrice, $maxPrice]);
                })
                ->orderBy('count_clicked', 'desc')
                ->take(4) // Limit to 4 properties
                ->get()
                ->map(function ($property) use ($getImageUrl) {
                    return [
                        'id' => $property->id,
                        'image' => $getImageUrl($property->main_image),
                        'images' => array_filter(array_map($getImageUrl, $property->images ?? [])),
                        'promoText' => $property->promo_text,
                        'features' => [],
                        'type' => $this->getPropertyType($property->kategori),
                        'units' => $property->units_remaining ? $property->units_remaining . ' Unit' : null,
                        'priceRange' => $property->price_range,
                        'installment' => $property->installment_text,
                        'name' => $property->name,
                        'developer' => $property->agen->name ?? $property->developer->name ?? 'Unknown',
                        'developerLogo' => $getImageUrl($property->agen->photo ?? null) ?: $getImageUrl($property->developer->logo ?? null),
                        'agent' => $property->agen ? [
                            'name' => $property->agen->name,
                            'photo' => $getImageUrl($property->agen->photo),
                        ] : null,
                        'location' => $property->location,
                        'city' => $property->city,
                        'province' => $property->provinsi,
                        'bedrooms' => $property->bedrooms,
                        'landSize' => $property->land_size_text,
                        'buildingSize' => $property->building_size_text,
                        'additionalInfo' => $property->certificate_type,
                        'lastUpdated' => $property->last_updated->diffForHumans(),
                        'buttonType' => 'view',
                        'available' => $property->is_available,
                        'countClicked' => $property->count_clicked ?? 0,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'properties' => $properties,
                    'total' => $properties->count(),
                    'currentCity' => $city,
                    'priceRange' => [
                        'min' => $minPrice,
                        'max' => $maxPrice,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat properti serupa',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}