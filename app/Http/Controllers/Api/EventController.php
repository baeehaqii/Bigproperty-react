<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
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
                ->with('developer')
                ->where('is_available', true)
                ->get();

            Log::info('Properties count:', ['count' => $properties->count()]);

            $mappedProperties = $properties->map(function ($property) {
                // Generate proper URL for private storage image
                $mainImageUrl = null;
                if ($property->main_image) {
                    // Hilangkan 'private/' prefix kalau ada
                    $imagePath = str_replace('private/', '', $property->main_image);
                    $mainImageUrl = url('/storage/private/' . $imagePath);
                }

                // Fallback ke images array kalau main_image kosong
                if (!$mainImageUrl && !empty($property->images)) {
                    $firstImage = $property->images[0];
                    $imagePath = str_replace('private/', '', $firstImage);
                    $mainImageUrl = url('/storage/private/' . $imagePath);
                }

                return [
                    'id' => $property->id,
                    'image' => $mainImageUrl, // URL lengkap sekarang
                    'promo_text' => $property->promo_text,
                    'kategori' => $property->kategori ?? [],
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
                    'developer_name' => $property->developer ? $property->developer->name : 'Developer',
                    'developer_logo' => $property->developer && $property->developer->logo ? 
                        url('/storage/private/' . str_replace('private/', '', $property->developer->logo)) : 
                        null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => [
                        'id' => $event->id,
                        'name' => $event->name,
                        'description' => $event->description,
                        'banner' => $event->banner ? url('/storage/private/' . str_replace('private/', '', $event->banner)) : null,
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