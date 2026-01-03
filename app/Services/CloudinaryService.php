<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Transformation\Transformation;
use Cloudinary\Transformation\Resize;
use Cloudinary\Transformation\Format;
use Cloudinary\Transformation\Overlay;
use Cloudinary\Transformation\Gravity;
use Cloudinary\Transformation\Position;
use Cloudinary\Transformation\Source;
use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    protected Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key' => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
            'url' => [
                'secure' => true,
            ]
        ]);
    }

    /**
     * Upload image to Cloudinary with watermark and AVIF conversion
     *
     * @param UploadedFile|string $file
     * @param string $folder
     * @return array{url: string, public_id: string, format: string}
     */
    public function uploadPropertyImage(UploadedFile|string $file, string $folder = 'properties'): array
    {
        $uploadPath = $file instanceof UploadedFile ? $file->getRealPath() : $file;

        // Upload with eager transformation to apply watermark and convert to AVIF
        $result = $this->cloudinary->uploadApi()->upload($uploadPath, [
            'folder' => $folder,
            'resource_type' => 'image',
            'use_filename' => true,
            'unique_filename' => true,
            // Apply transformations during upload (eager transformation)
            'eager' => [
                [
                    'format' => 'avif',
                    'quality' => 'auto:best',
                    'overlay' => [
                        'font_family' => 'Arial',
                        'font_size' => 24,
                        'font_weight' => 'bold',
                        'text' => 'Big Property',
                    ],
                    'color' => '#FFFFFF',
                    'opacity' => 50,
                    'gravity' => 'south_east',
                    'x' => 20,
                    'y' => 20,
                ],
            ],
            'eager_async' => false, // Process immediately
        ]);

        // Build the URL with watermark and AVIF format
        $publicId = $result['public_id'];

        // Generate the optimized URL with watermark
        $url = $this->getOptimizedUrl($publicId);

        return [
            'url' => $url,
            'public_id' => $publicId,
            'format' => 'avif',
            'original_url' => $result['secure_url'],
        ];
    }

    /**
     * Get optimized URL with watermark and AVIF format
     *
     * @param string $publicId
     * @param int|null $width
     * @param int|null $height
     * @return string
     */
    public function getOptimizedUrl(string $publicId, ?int $width = null, ?int $height = null): string
    {
        $cloudName = config('services.cloudinary.cloud_name');

        // Build transformation string
        $transformations = [];

        // Add resize if specified
        if ($width && $height) {
            $transformations[] = "c_fill,w_{$width},h_{$height}";
        } elseif ($width) {
            $transformations[] = "c_scale,w_{$width}";
        } elseif ($height) {
            $transformations[] = "c_scale,h_{$height}";
        }

        // Add quality optimization
        $transformations[] = 'q_auto:best';

        // Add text watermark
        // l_text: is the text overlay syntax
        // Font: Arial, size 24, bold, white color with 50% opacity
        $transformations[] = 'l_text:Arial_24_bold:Big%20Property,co_white,o_50,g_south_east,x_20,y_20';

        // Add format conversion to AVIF
        $transformations[] = 'f_avif';

        $transformationString = implode('/', $transformations);

        return "https://res.cloudinary.com/{$cloudName}/image/upload/{$transformationString}/{$publicId}";
    }

    /**
     * Upload multiple property images
     *
     * @param array<UploadedFile> $files
     * @param string $folder
     * @return array<array{url: string, public_id: string, format: string}>
     */
    public function uploadMultiplePropertyImages(array $files, string $folder = 'properties'): array
    {
        $results = [];

        foreach ($files as $file) {
            $results[] = $this->uploadPropertyImage($file, $folder);
        }

        return $results;
    }

    /**
     * Delete an image from Cloudinary
     *
     * @param string $publicId
     * @return bool
     */
    public function deleteImage(string $publicId): bool
    {
        try {
            $result = $this->cloudinary->uploadApi()->destroy($publicId);
            return $result['result'] === 'ok';
        } catch (\Exception $e) {
            \Log::error('Cloudinary delete error: ' . $e->getMessage());
            return false;
        }
    }
}
