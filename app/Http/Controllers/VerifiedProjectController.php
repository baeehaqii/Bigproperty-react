<?php
// app/Http/Controllers/Api/VerifiedProjectController.php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class VerifiedProjectController extends Controller
{
    /**
     * Get unique cities with verified projects
     */
    public function getCities(): JsonResponse
    {
        try {
            // Ambil kota yang punya properti dengan developer verified
            $cities = Property::where('is_available', true)
                ->whereHas('developer', function($query) {
                    $query->where('is_verified', true);
                })
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
            Log::error('Get verified cities error:', [
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
     * Get verified projects by city, sorted by count_clicked
     */
    public function getByCity(string $city): JsonResponse
    {
        try {
            Log::info('Fetching verified projects for city:', ['city' => $city]);

            // Ambil properti yang developer-nya verified
            // Urutkan berdasarkan count_clicked terbanyak
            $properties = Property::with('developer')
                ->where('is_available', true)
                ->where('city', $city)
                ->whereHas('developer', function($query) {
                    $query->where('is_verified', true);
                })
                ->orderByDesc('count_clicked')
                ->orderByDesc('last_updated')
                ->get();

            Log::info('Verified projects found:', ['count' => $properties->count()]);

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
                    'countClicked' => $property->count_clicked ?? 0,
                    'isVerified' => true, // Semua properti di sini sudah verified
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
            Log::error('Get verified projects by city error:', [
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
     * Get all verified projects (simple list, sorted by count_clicked)
     */
    public function index(): JsonResponse
    {
        try {
            Log::info('Fetching all verified projects');

            // Ambil semua properti yang developer-nya verified
            // Urutkan berdasarkan count_clicked terbanyak
            $properties = Property::with('developer')
                ->where('is_available', true)
                ->whereHas('developer', function($query) {
                    $query->where('is_verified', true);
                })
                ->orderByDesc('count_clicked')
                ->orderByDesc('last_updated')
                ->get();

            Log::info('Verified projects found:', ['count' => $properties->count()]);

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
                    'countClicked' => $property->count_clicked ?? 0,
                    'isVerified' => true,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $mappedProperties
            ]);

        } catch (\Exception $e) {
            Log::error('Get all verified projects error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => []
            ], 500);
        }
    }
}