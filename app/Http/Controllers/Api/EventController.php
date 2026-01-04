<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\PropertyCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function index()
    {
        try {
            Log::info('Golden Deals endpoint accessed');

            $event = Event::where('name', 'LIKE', '%Golden Deals%')
                ->where('is_active', true)
                ->whereDate('start_date', '<=', now())
                ->whereDate('end_date', '>=', now())
                ->first();

            Log::info('Event found:', ['event' => $event]);

            if (!$event) {
                $event = Event::where('is_active', true)->first();

                if (!$event) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Tidak ada event aktif',
                        'data' => null
                    ], 404);
                }
            }

            $properties = $event->properties()
                ->with(['developer', 'agen'])
                ->where('is_available', true)
                ->where('is_verified', true) // Only show approved listings
                ->get();

            Log::info('Properties count:', ['count' => $properties->count()]);

            $mappedProperties = $properties->map(function ($property) {
                // Helper function to get proper image URL
                $getImageUrl = function ($imagePath) {
                    if (!$imagePath)
                        return null;

                    // If already a full URL (http/https or Cloudinary), return as is
                    if (
                        str_starts_with($imagePath, 'http://') ||
                        str_starts_with($imagePath, 'https://') ||
                        str_starts_with($imagePath, '//')
                    ) {
                        return $imagePath;
                    }

                    // Otherwise, it's a local file - add storage prefix
                    $cleanPath = str_replace('private/', '', $imagePath);
                    return url('/storage/private/' . $cleanPath);
                };

                // Get main image URL
                $mainImageUrl = $getImageUrl($property->main_image);

                // Fallback to images array if main_image empty
                if (!$mainImageUrl && !empty($property->images)) {
                    $mainImageUrl = $getImageUrl($property->images[0]);
                }

                // Get all images for carousel
                $allImages = [];
                if (!empty($property->images) && is_array($property->images)) {
                    foreach ($property->images as $img) {
                        $imgUrl = $getImageUrl($img);
                        if ($imgUrl) {
                            $allImages[] = $imgUrl;
                        }
                    }
                }

                // Get developer/agent info - prioritize agen over developer
                $postedByName = 'Developer';
                $postedByLogo = null;

                if ($property->agen) {
                    $postedByName = $property->agen->name ?? $property->agen->nama ?? 'Agent';
                    $postedByLogo = $getImageUrl($property->agen->photo ?? $property->agen->foto ?? null);
                } elseif ($property->developer) {
                    $postedByName = $property->developer->name;
                    $postedByLogo = $getImageUrl($property->developer->logo);
                }

                // Get kategori - lookup names by ID from PropertyCategory table
                $kategoriArray = $property->kategori ?? [];
                $kategoriDisplay = [];
                if (is_array($kategoriArray) && count($kategoriArray) > 0) {
                    // Kategori stores IDs, so we need to lookup the names
                    $categoryIds = array_filter($kategoriArray, fn($val) => is_numeric($val));

                    if (!empty($categoryIds)) {
                        $categories = PropertyCategory::whereIn('id', $categoryIds)->pluck('name')->toArray();
                        $kategoriDisplay = $categories;
                    } else {
                        // Fallback: if kategori contains strings directly
                        foreach ($kategoriArray as $kat) {
                            if (is_string($kat) && !is_numeric($kat)) {
                                $kategoriDisplay[] = $kat;
                            }
                        }
                    }
                }

                return [
                    'id' => $property->id,
                    'image' => $mainImageUrl,
                    'images' => $allImages,
                    'promo_text' => $property->promo_text,
                    'kategori' => $kategoriDisplay,
                    'units_remaining' => $property->units_remaining,
                    'price_range' => $property->price_range,
                    'installment' => $property->installment_text,
                    'property_name' => $property->name,
                    'location' => $property->location,
                    'city' => $property->city,
                    'provinsi' => $property->provinsi,
                    'bedrooms' => $property->bedrooms,
                    'land_size' => $property->land_size_text,
                    'building_size' => $property->building_size_text,
                    'certificate_type' => $property->certificate_type,
                    'is_popular' => $property->is_popular,
                    'last_updated' => $property->last_updated ?
                        $property->last_updated->diffForHumans() :
                        'Baru diperbarui',
                    'posted_by_name' => $postedByName,
                    'posted_by_logo' => $postedByLogo,
                    'count_clicked' => $property->count_clicked ?? 0,
                ];
            });

            // Helper to get proper URL for event banner
            $getBannerUrl = function ($bannerPath) {
                if (!$bannerPath)
                    return null;

                if (
                    str_starts_with($bannerPath, 'http://') ||
                    str_starts_with($bannerPath, 'https://') ||
                    str_starts_with($bannerPath, '//')
                ) {
                    return $bannerPath;
                }

                $cleanPath = str_replace('private/', '', $bannerPath);
                return url('/storage/private/' . $cleanPath);
            };

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => [
                        'id' => $event->id,
                        'name' => $event->name,
                        'description' => $event->description,
                        'banner' => $getBannerUrl($event->banner),
                        'start_date' => $event->start_date,
                        'end_date' => $event->end_date,
                    ],
                    'properties' => $mappedProperties
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Golden Deals error:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}