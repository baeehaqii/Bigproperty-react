<?php
// app/Http/Controllers/TestimoniController.php
namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use App\Models\Testimoni;
use Illuminate\Support\Facades\Log;

class TestimoniController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            Log::info('Fetching active testimonials');

            // Hapus orderBy('order'), pakai created_at atau id aja
            $testimonials = Testimoni::where('is_active', true)
                ->orderBy('created_at', 'desc')  // ✅ Atau pakai 'id'
                ->get();

            Log::info('Testimonials found:', ['count' => $testimonials->count()]);

            $mappedTestimonials = $testimonials->map(function ($testimonial) {
                $imageUrl = null;
                if ($testimonial->image) {
                    $imagePath = str_replace('private/', '', $testimonial->image);
                    $imageUrl = url('/storage/private/' . $imagePath);
                }

                return [
                    'id' => $testimonial->id,
                    'name' => $testimonial->name,
                    'role' => $testimonial->role,
                    'content' => $testimonial->content,
                    'image' => $imageUrl,
                    'rating' => $testimonial->rating ?? 5,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $mappedTestimonials
            ]);

        } catch (\Exception $e) {
            Log::error('Testimonials error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    }
}