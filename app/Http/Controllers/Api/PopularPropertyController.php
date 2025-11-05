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
            // Ambil semua kota yang punya properti available
            $cities = Property::where('is_available', true)
                ->whereNotNull('city')
                ->where('city', '!=', '')
                ->pluck('city')
                ->unique() 
                ->sort()    
                ->values()  
                ->toArray();
                
            return response()->json([
                'success' => true,
                'data' => $cities
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

            // HAPUS is_popular filter, ambil semua yang available saja
            // Urutkan berdasarkan count_clicked terbanyak
            $properties = Property::with('developer')
                ->where('is_available', true)
                ->where('city', $city)
                ->orderByDesc('count_clicked') // Urutkan dari terbanyak ke tersedikit
                ->orderByDesc('last_updated') // Secondary sort
                ->get();

            Log::info('Properties found:', ['count' => $properties->count()]);

            $mappedProperties = $properties->map(function ($property) {
                // Generate URL untuk main image
                $mainImageUrl = null;
                if ($property->main_image) {
                    $imagePath = str_replace('private/', '', $property->main_image);
                    $mainImageUrl = url('/storage/private/' . $imagePath);
                }

                // Fallback ke images array
                if (!$mainImageUrl && !empty($property->images)) {
                    $firstImage = $property->images[0];
                    $imagePath = str_replace('private/', '', $firstImage);
                    $mainImageUrl = url('/storage/private/' . $imagePath);
                }

                // Map semua images ke full URL
                $imagesUrls = [];
                if (!empty($property->images)) {
                    foreach ($property->images as $image) {
                        $imagePath = str_replace('private/', '', $image);
                        $imagesUrls[] = url('/storage/private/' . $imagePath);
                    }
                }

                // Developer logo URL
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
     * Get all properties grouped by city (alternative endpoint)
     */
    public function index(): JsonResponse
    {
        try {
            $propertiesByCity = [];

            // Get unique cities
            $cities = Property::where('is_available', true)
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