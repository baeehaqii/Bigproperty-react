<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Api\Upload\UploadApi;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

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
     * - If AVIF: upload directly
     * - If PNG/JPG/JPEG: convert to AVIF locally first, then upload
     *
     * @param UploadedFile|string $file
     * @param string $folder
     * @return array{url: string, public_id: string, format: string}
     */
    public function uploadPropertyImage(UploadedFile|string $file, string $folder = 'properties'): array
    {
        $uploadPath = $file instanceof UploadedFile ? $file->getRealPath() : $file;
        $extension = $file instanceof UploadedFile ? strtolower($file->getClientOriginalExtension()) : pathinfo($file, PATHINFO_EXTENSION);

        // Check if image needs conversion to AVIF
        $needsConversion = in_array($extension, ['png', 'jpg', 'jpeg', 'gif', 'webp']);
        $convertedPath = null;

        if ($needsConversion && $this->canConvertToAvif()) {
            $convertedPath = $this->convertToAvif($uploadPath);
            if ($convertedPath) {
                $uploadPath = $convertedPath;
            }
        }

        try {
            // Upload to Cloudinary
            $result = $this->cloudinary->uploadApi()->upload($uploadPath, [
                'folder' => $folder,
                'resource_type' => 'image',
                'use_filename' => true,
                'unique_filename' => true,
                // Apply watermark transformation on delivery (not during upload)
                // This makes upload faster
            ]);

            // Clean up converted file
            if ($convertedPath && file_exists($convertedPath)) {
                unlink($convertedPath);
            }

            // Build the URL with watermark
            $publicId = $result['public_id'];
            $url = $this->getOptimizedUrl($publicId);

            return [
                'url' => $url,
                'public_id' => $publicId,
                'format' => $result['format'] ?? 'avif',
                'original_url' => $result['secure_url'],
            ];
        } catch (\Exception $e) {
            // Clean up converted file on error
            if ($convertedPath && file_exists($convertedPath)) {
                unlink($convertedPath);
            }
            throw $e;
        }
    }

    /**
     * Check if system can convert to AVIF (requires GD with AVIF support or Imagick)
     */
    protected function canConvertToAvif(): bool
    {
        // Check GD with AVIF support
        if (function_exists('imageavif') && function_exists('imagecreatefromstring')) {
            return true;
        }

        // Check Imagick
        if (extension_loaded('imagick')) {
            $imagick = new \Imagick();
            $formats = $imagick->queryFormats('AVIF');
            return !empty($formats);
        }

        return false;
    }

    /**
     * Convert image to AVIF format locally
     *
     * @param string $sourcePath
     * @return string|null Path to converted file, or null if conversion failed
     */
    protected function convertToAvif(string $sourcePath): ?string
    {
        try {
            $tempPath = sys_get_temp_dir() . '/' . uniqid('avif_') . '.avif';

            // Try GD first (faster)
            if (function_exists('imageavif') && function_exists('imagecreatefromstring')) {
                $imageData = file_get_contents($sourcePath);
                $image = @imagecreatefromstring($imageData);

                if ($image) {
                    // Preserve transparency for PNG
                    imagesavealpha($image, true);

                    // Convert to AVIF with quality 80 (good balance)
                    $success = imageavif($image, $tempPath, 80);
                    imagedestroy($image);

                    if ($success && file_exists($tempPath)) {
                        Log::info('Image converted to AVIF using GD', [
                            'original_size' => filesize($sourcePath),
                            'avif_size' => filesize($tempPath),
                        ]);
                        return $tempPath;
                    }
                }
            }

            // Fallback to Imagick
            if (extension_loaded('imagick')) {
                $imagick = new \Imagick($sourcePath);
                $imagick->setImageFormat('avif');
                $imagick->setImageCompressionQuality(80);
                $imagick->writeImage($tempPath);
                $imagick->destroy();

                if (file_exists($tempPath)) {
                    Log::info('Image converted to AVIF using Imagick', [
                        'original_size' => filesize($sourcePath),
                        'avif_size' => filesize($tempPath),
                    ]);
                    return $tempPath;
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::warning('AVIF conversion failed, uploading original: ' . $e->getMessage());
            return null;
        }
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
        $transformations[] = 'l_text:Arial_24_bold:Big%20Property,co_white,o_50,g_south_east,x_20,y_20';

        // Add format conversion to AVIF (on delivery)
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
            Log::error('Cloudinary delete error: ' . $e->getMessage());
            return false;
        }
    }
}

