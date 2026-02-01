<?php
// app/Http/Controllers/Api/PopularPropertyController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PopularPropertyController extends Controller
{
    /**
     * Get unique cities with properties
     */
    public function getCities(): JsonResponse
    {
        try {
            // Get all properties with city codes and locations
            $properties = Property::where('is_available', true)
                ->where('is_verified', true) // Only show approved listings
                ->whereNotNull('city')
                ->where('city', '!=', '')
                ->select('city', 'location', 'provinsi')
                ->get();

            // Group by city and extract display name from location
            $citiesWithNames = $properties->groupBy('city')->map(function ($group, $cityCode) {
                $firstProperty = $group->first();
                $location = $firstProperty->location ?? '';

                // Try to extract city/area name from location string
                // Patterns: "Jl. xxx Brebes no 1" -> "Brebes"
                $cityName = null;

                // Common Indonesian city names
                $cityPatterns = [
                    'brebes',
                    'banyumas',
                    'cilacap',
                    'semarang',
                    'surabaya',
                    'jakarta',
                    'bandung',
                    'tangerang',
                    'bekasi',
                    'depok',
                    'bogor',
                    'purwokerto',
                    'tegal',
                    'pekalongan',
                    'solo',
                    'yogyakarta',
                    'malang'
                ];

                foreach ($cityPatterns as $pattern) {
                    if (stripos($location, $pattern) !== false) {
                        $cityName = ucfirst($pattern);
                        break;
                    }
                }

                // If no city found, use the location or fallback to code
                if (!$cityName) {
                    $cityName = $location ?: $cityCode;
                }

                return [
                    'code' => $cityCode,
                    'name' => $cityName
                ];
            })->values()->toArray();

            return response()->json([
                'success' => true,
                'data' => $citiesWithNames
            ]);

        } catch (\Exception $e) {
            Log::error('Get cities error:', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get properties by city, sorted by count_clicked (most to least)
     */
    public function getByCity(string $city): JsonResponse
    {
        try {
            Log::info('Fetching properties for city:', ['city' => $city]);

            // Include agen relationship
            $properties = Property::with(['developer', 'agen'])
                ->where('is_available', true)
                ->where('is_verified', true) // Only show approved listings
                ->where('city', $city)
                ->orderByDesc('count_clicked')
                ->orderByDesc('last_updated')
                ->get();

            Log::info('Properties found:', ['count' => $properties->count()]);

            // Get property categories mapping
            $categories = \App\Models\PropertyCategory::pluck('name', 'id')->toArray();

            // Helper function for image URL (supports Cloudinary)
            $getImageUrl = function ($path) {
                if (!$path)
                    return null;
                // If it's already a full URL (Cloudinary), return as is
                if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    return $path;
                }
                // Local path
                $imagePath = str_replace('private/', '', $path);
                return url('/storage/' . $imagePath);
            };

            $mappedProperties = $properties->map(function ($property) use ($getImageUrl, $categories) {
                // Main image URL
                $mainImageUrl = $getImageUrl($property->main_image);

                // Fallback to images array
                if (!$mainImageUrl && !empty($property->images)) {
                    $mainImageUrl = $getImageUrl($property->images[0]);
                }

                // Map all images
                $imagesUrls = [];
                if (!empty($property->images)) {
                    foreach ($property->images as $image) {
                        $url = $getImageUrl($image);
                        if ($url)
                            $imagesUrls[] = $url;
                    }
                }

                // Agent photo URL
                $agentPhotoUrl = $property->agen ? $getImageUrl($property->agen->photo) : null;

                // Developer logo URL
                $developerLogoUrl = $property->developer ? $getImageUrl($property->developer->logo) : null;

                // Determine type
                $type = 'Rumah Baru';
                if (!empty($property->kategori) && isset($property->kategori[0])) {
                    $catId = $property->kategori[0];
                    if (isset($categories[$catId])) {
                        $type = $categories[$catId];
                        // If type is "Beli Rumah" or "Sewa Rumah", maybe simplify? User asked for "label (beli)".
                        // Let's just use the category name for now. Or transform it.
                        // If name is "Beli Rumah", maybe just "Dijual" or keep "Beli Rumah".
                        // Given the space on card, "Beli Rumah" might be long?
                        // The user said: "ada angka 1, seharusnya itu label (beli)".
                        // So name "Beli Rumah" should be fine, or map "Beli Rumah" -> "Beli".
                        // Let's use the full name first, it's safer.
                    }
                }

                return [
                    'id' => $property->id,
                    'image' => $mainImageUrl,
                    'images' => $imagesUrls,
                    'promoText' => null, // Remove promo text from card
                    'features' => $property->keunggulan ?? [],
                    'type' => $type,
                    'units' => $property->units_remaining ? "Sisa {$property->units_remaining} Unit" : null,
                    'priceRange' => 'Rp ' . number_format($property->price_min ?? 0, 0, ',', '.'),
                    'installment' => $property->installment_text,
                    'name' => $property->name,
                    // Use agent name, fallback to developer name
                    'developer' => $property->agen?->name ?? $property->developer?->name ?? 'Developer',
                    'developerLogo' => $agentPhotoUrl ?: $developerLogoUrl,
                    // Agent data for avatar fallback
                    'agent' => $property->agen ? [
                        'name' => $property->agen->name,
                        'photo' => $agentPhotoUrl,
                    ] : null,
                    // Location - just the address, no city code
                    'location' => $property->location,
                    'bedrooms' => $property->bedrooms,
                    'landSize' => $property->land_size_text,
                    'buildingSize' => $property->building_size_text,
                    'additionalInfo' => $property->certificate_type,
                    'condition' => $property->condition,
                    'lastUpdated' => $property->last_updated ?
                        $property->last_updated->diffForHumans() :
                        'Diperbarui lebih dari 1 bulan lalu',
                    'buttonType' => $property->button_type ?? 'view',
                    'available' => $property->is_available,
                    'countClicked' => $property->count_clicked ?? 0,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'city' => $city,
                    'properties' => $mappedProperties
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Get properties by city error:', [
                'city' => $city,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get all popular properties without city filtering
     */
    public function getAll(): JsonResponse
    {
        try {
            Log::info('Fetching all popular properties');

            // Include agen relationship
            $properties = Property::with(['developer', 'agen'])
                ->where('is_available', true)
                ->where('is_verified', true) // Only show approved listings
                ->orderByDesc('count_clicked')
                ->orderByDesc('last_updated')
                ->take(20) // Limit to 20 properties
                ->get();

            Log::info('Properties found:', ['count' => $properties->count()]);

            // Get property categories mapping
            $categories = \App\Models\PropertyCategory::pluck('name', 'id')->toArray();

            // Helper function for image URL (supports Cloudinary)
            $getImageUrl = function ($path) {
                if (!$path)
                    return null;
                // If it's already a full URL (Cloudinary), return as is
                if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    return $path;
                }
                // Local path
                $imagePath = str_replace('private/', '', $path);
                return url('/storage/' . $imagePath);
            };

            $mappedProperties = $properties->map(function ($property) use ($getImageUrl, $categories) {
                // Main image URL
                $mainImageUrl = $getImageUrl($property->main_image);

                // Fallback to images array
                if (!$mainImageUrl && !empty($property->images)) {
                    $mainImageUrl = $getImageUrl($property->images[0]);
                }

                // Map all images
                $imagesUrls = [];
                if (!empty($property->images)) {
                    foreach ($property->images as $image) {
                        $url = $getImageUrl($image);
                        if ($url)
                            $imagesUrls[] = $url;
                    }
                }

                // Agent photo URL
                $agentPhotoUrl = $property->agen ? $getImageUrl($property->agen->photo) : null;

                // Developer logo URL
                $developerLogoUrl = $property->developer ? $getImageUrl($property->developer->logo) : null;

                // Determine type
                $type = 'Rumah Baru';
                if (!empty($property->kategori) && isset($property->kategori[0])) {
                    $catId = $property->kategori[0];
                    if (isset($categories[$catId])) {
                        $type = $categories[$catId];
                    }
                }

                return [
                    'id' => $property->id,
                    'image' => $mainImageUrl,
                    'images' => $imagesUrls,
                    'promoText' => null,
                    'features' => $property->keunggulan ?? [],
                    'type' => $type,
                    'units' => $property->units_remaining ? "Sisa {$property->units_remaining} Unit" : null,
                    'priceRange' => 'Rp ' . number_format($property->price_min ?? 0, 0, ',', '.'),
                    'installment' => $property->installment_text,
                    'name' => $property->name,
                    // Use agent name, fallback to developer name
                    'developer' => $property->agen?->name ?? $property->developer?->name ?? 'Developer',
                    'developerLogo' => $agentPhotoUrl ?: $developerLogoUrl,
                    // Agent data for avatar fallback
                    'agent' => $property->agen ? [
                        'name' => $property->agen->name,
                        'photo' => $agentPhotoUrl,
                    ] : null,
                    // Location - just the address
                    'location' => $property->location,
                    'city' => $property->city,
                    'province' => $property->provinsi,
                    'bedrooms' => $property->bedrooms,
                    'landSize' => $property->land_size_text,
                    'buildingSize' => $property->building_size_text,
                    'additionalInfo' => $property->certificate_type,
                    'condition' => $property->condition,
                    'lastUpdated' => $property->last_updated ?
                        $property->last_updated->diffForHumans() :
                        'Diperbarui lebih dari 1 bulan lalu',
                    'buttonType' => $property->button_type ?? 'view',
                    'available' => $property->is_available,
                    'countClicked' => $property->count_clicked ?? 0,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'properties' => $mappedProperties,
                    'total' => $mappedProperties->count(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Get all popular properties error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get latest approved properties with pagination (12 per page for 4-column grid)
     * Sorted by last_updated (newest first)
     * Avoids N+1 by eager loading developer and agen relationships
     */
    public function getLatest(): JsonResponse
    {
        try {
            $perPage = 12; // 4 columns x 3 rows
            $page = request()->input('page', 1);

            Log::info('Fetching latest properties', ['page' => $page, 'perPage' => $perPage]);

            // Eager load relationships to avoid N+1
            // Load categories once for mapping
            $categories = \App\Models\PropertyCategory::pluck('name', 'id')->toArray();

            // Query with pagination - sorted by last_updated DESC (newest first)
            $query = Property::with(['developer', 'agen'])
                ->where('is_available', true)
                ->where('is_verified', true)
                ->where(function ($q) {
                    $q->whereNull('is_draft')
                        ->orWhere('is_draft', false);
                })
                ->orderByDesc('last_updated')
                ->orderByDesc('created_at');

            $paginatedProperties = $query->paginate($perPage);

            // Helper function for image URL (supports Cloudinary)
            $getImageUrl = function ($path) {
                if (!$path)
                    return null;
                // If it's already a full URL (Cloudinary), return as is
                if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    return $path;
                }
                // Local path
                $imagePath = str_replace('private/', '', $path);
                return url('/storage/' . $imagePath);
            };

            $mappedProperties = $paginatedProperties->getCollection()->map(function ($property) use ($getImageUrl, $categories) {
                // Main image URL
                $mainImageUrl = $getImageUrl($property->main_image);

                // Fallback to images array
                if (!$mainImageUrl && !empty($property->images)) {
                    $mainImageUrl = $getImageUrl($property->images[0]);
                }

                // Map all images
                $imagesUrls = [];
                if (!empty($property->images)) {
                    foreach ($property->images as $image) {
                        $url = $getImageUrl($image);
                        if ($url)
                            $imagesUrls[] = $url;
                    }
                }

                // Agent photo URL
                $agentPhotoUrl = $property->agen ? $getImageUrl($property->agen->photo) : null;

                // Developer logo URL
                $developerLogoUrl = $property->developer ? $getImageUrl($property->developer->logo) : null;

                // Determine type
                $type = 'Rumah Baru';
                if (!empty($property->kategori) && isset($property->kategori[0])) {
                    $catId = $property->kategori[0];
                    if (isset($categories[$catId])) {
                        $type = $categories[$catId];
                    }
                }

                return [
                    'id' => $property->id,
                    'image' => $mainImageUrl,
                    'images' => $imagesUrls,
                    'promoText' => null, // Remove promo text from card to avoid long text display
                    'features' => $property->keunggulan ?? [],
                    'type' => $type,
                    'units' => $property->units_remaining ? "Sisa {$property->units_remaining} Unit" : null,
                    'priceRange' => 'Rp ' . number_format($property->price_min ?? 0, 0, ',', '.'),
                    'installment' => $property->installment_text,
                    'name' => $property->name,
                    // Use agent name, fallback to developer name
                    'developer' => $property->agen?->name ?? $property->developer?->name ?? 'Developer',
                    'developerLogo' => $agentPhotoUrl ?: $developerLogoUrl,
                    // Agent data for avatar fallback
                    'agent' => $property->agen ? [
                        'name' => $property->agen->name,
                        'photo' => $agentPhotoUrl,
                    ] : null,
                    // Location - just the address
                    'location' => $property->location,
                    'city' => $property->city,
                    'province' => $property->provinsi,
                    'bedrooms' => $property->bedrooms,
                    'landSize' => $property->land_size_text,
                    'buildingSize' => $property->building_size_text,
                    'additionalInfo' => $property->certificate_type,
                    'condition' => $property->condition,
                    'lastUpdated' => $property->last_updated ?
                        $property->last_updated->diffForHumans() :
                        'Baru ditambahkan',
                    'buttonType' => $property->button_type ?? 'view',
                    'available' => $property->is_available,
                    'countClicked' => $property->count_clicked ?? 0,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'properties' => $mappedProperties,
                    'pagination' => [
                        'current_page' => $paginatedProperties->currentPage(),
                        'last_page' => $paginatedProperties->lastPage(),
                        'per_page' => $paginatedProperties->perPage(),
                        'total' => $paginatedProperties->total(),
                        'has_more_pages' => $paginatedProperties->hasMorePages(),
                        'from' => $paginatedProperties->firstItem(),
                        'to' => $paginatedProperties->lastItem(),
                    ],
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Get latest properties error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Get all properties grouped by city (alternative endpoint)
     */
    public function index(): JsonResponse
    {
        try {
            $propertiesByCity = [];

            // Get unique cities
            $cities = Property::where('is_available', true)
                ->where('is_verified', true) // Only show approved listings
                ->select('city')
                ->distinct()
                ->orderBy('city')
                ->pluck('city')
                ->filter()
                ->toArray();

            // Get properties for each city
            foreach ($cities as $city) {
                $properties = Property::with('developer')
                    ->where('is_available', true)
                    ->where('is_verified', true) // Only show approved listings
                    ->where('city', $city)
                    ->orderByDesc('count_clicked') // Urutkan dari terbanyak
                    ->orderByDesc('last_updated')
                    ->get();

                $mappedProperties = $properties->map(function ($property) {
                    $mainImageUrl = null;
                    if ($property->main_image) {
                        $imagePath = str_replace('private/', '', $property->main_image);
                        $mainImageUrl = url('/storage/private/' . $imagePath);
                    }

                    if (!$mainImageUrl && !empty($property->images)) {
                        $firstImage = $property->images[0];
                        $imagePath = str_replace('private/', '', $firstImage);
                        $mainImageUrl = url('/storage/private/' . $imagePath);
                    }

                    $imagesUrls = [];
                    if (!empty($property->images)) {
                        foreach ($property->images as $image) {
                            $imagePath = str_replace('private/', '', $image);
                            $imagesUrls[] = url('/storage/private/' . $imagePath);
                        }
                    }

                    $developerLogoUrl = null;
                    if ($property->developer && $property->developer->logo) {
                        $logoPath = str_replace('private/', '', $property->developer->logo);
                        $developerLogoUrl = url('/storage/private/' . $logoPath);
                    }

                    return [
                        'id' => $property->id,
                        'image' => $mainImageUrl,
                        'images' => $imagesUrls,
                        'promoText' => $property->promo_text ?? '',
                        'features' => $property->keunggulan ?? [],
                        'type' => $property->kategori[0] ?? 'Rumah Baru',
                        'units' => $property->units_remaining ? "Sisa {$property->units_remaining} Unit" : null,
                        'priceRange' => $property->price_range,
                        'installment' => $property->installment_text,
                        'name' => $property->name,
                        'developer' => $property->developer ? $property->developer->name : 'Developer',
                        'developerLogo' => $developerLogoUrl,
                        'location' => $property->location . ', ' . $property->city,
                        'bedrooms' => $property->bedrooms,
                        'landSize' => $property->land_size_text,
                        'buildingSize' => $property->building_size_text,
                        'additionalInfo' => $property->certificate_type,
                        'lastUpdated' => $property->last_updated ?
                            $property->last_updated->diffForHumans() :
                            'Diperbarui lebih dari 1 bulan lalu',
                        'buttonType' => $property->button_type ?? 'view',
                        'available' => $property->is_available,
                        'countClicked' => $property->count_clicked ?? 0,
                    ];
                });

                $propertiesByCity[$city] = $mappedProperties;
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'cities' => $cities,
                    'propertiesByCity' => $propertiesByCity
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Get all properties error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}