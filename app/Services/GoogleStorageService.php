<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GoogleStorageService
{
    protected string $disk = 'gcs'; // Disk name in filesystems.php

    /**
     * Upload image to Google Cloud Storage with watermark and AVIF conversion
     *
     * @param UploadedFile|string $file
     * @param string $folder
     * @return array{url: string, public_id: string, format: string}
     */
    public function uploadPropertyImage(UploadedFile|string $file, string $folder = 'properties'): array
    {
        $uploadPath = $file instanceof UploadedFile ? $file->getRealPath() : $file;
        $extension = $file instanceof UploadedFile ? strtolower($file->getClientOriginalExtension()) : pathinfo($file, PATHINFO_EXTENSION);
        $originalName = $file instanceof UploadedFile ? $file->getClientOriginalName() : basename($file);

        // 1. Convert to AVIF if needed (System's "Compression & Conversion" step)
        $needsConversion = in_array($extension, ['png', 'jpg', 'jpeg', 'gif', 'webp']);
        $processedPath = $uploadPath;
        $isTempFile = false;

        if ($needsConversion && $this->canConvertToAvif()) {
            $avifPath = $this->convertToAvif($uploadPath);
            if ($avifPath) {
                $processedPath = $avifPath;
                $isTempFile = true; // Mark as temp for cleanup
                $extension = 'avif';
            }
        }

        // 2. Add Watermark (System's "Optimization & Watermark" step - done locally now)
        // Note: For best results, ensure a font file exists at public_path('fonts/Arial.ttf')
        $watermarkedPath = $this->addWatermark($processedPath);
        if ($watermarkedPath && $watermarkedPath !== $processedPath) {
            // If previous file was also temp (AVIF), delete it
            if ($isTempFile && file_exists($processedPath)) {
                @unlink($processedPath);
            }
            $processedPath = $watermarkedPath;
            $isTempFile = true;
        }

        try {
            // 3. Upload to Google Cloud Storage
            $fileName = uniqid() . '_' . pathinfo($originalName, PATHINFO_FILENAME) . '.' . $extension;
            $targetPath = $folder . '/' . $fileName;

            // Reading file content
            $fileContent = file_get_contents($processedPath);

            // Upload to GCS
            Storage::disk($this->disk)->put($targetPath, $fileContent, 'public');

            // Get URL
            $url = Storage::disk($this->disk)->url($targetPath);

            // 4. Cleanup (System's "Pembersihan" step)
            if ($isTempFile && file_exists($processedPath)) {
                @unlink($processedPath);
            }

            return [
                'url' => $url,
                'public_id' => $targetPath,
                'format' => $extension,
                'original_url' => $url,
            ];
        } catch (\Exception $e) {
            // Cleanup on error
            if ($isTempFile && file_exists($processedPath)) {
                @unlink($processedPath);
            }
            Log::error('GCS upload failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Add watermark text to image locally using GD
     */
    protected function addWatermark(string $sourcePath): ?string
    {
        try {
            if (!extension_loaded('gd') || !function_exists('imagecreatefromstring')) {
                Log::warning('GD not available for watermarking');
                return $sourcePath;
            }

            $image = @imagecreatefromstring(file_get_contents($sourcePath));
            if (!$image)
                return $sourcePath;

            $width = imagesx($image);
            $height = imagesy($image);

            // Watermark settings
            $text = "Big Property";
            $fontSize = 24; // Points
            $angle = 0;
            $padding = 20;
            $opacity = 50; // 0-127 in GD (0 is opaque, 127 is transparent). So 50% is ~64.

            // Convert percent opacity to GD alpha (0-127)
            $alpha = (int) (127 * (1 - ($opacity / 100)));
            // Correct logic: User said "opacity 50%". In GD: 0 = opaque, 127 = transparent.
            // So 50% visible means 50% transparent. 127 * 0.5 = ~63.
            $alpha = 63;

            // Font Path - Ensure you have this font!
            $fontPath = public_path('fonts/Poppins-Regular.ttf');

            // Fallback if font missing: simple string or skip
            if (!file_exists($fontPath)) {
                // Try to find any ttf in public/fonts
                $fonts = glob(public_path('fonts/*.ttf'));
                if (!empty($fonts)) {
                    $fontPath = $fonts[0];
                } else {
                    Log::warning("Watermark font not found at $fontPath. Skipping watermark.");
                    imagedestroy($image);
                    return $sourcePath;
                }
            }

            // Create color with alpha
            $white = imagecolorallocatealpha($image, 255, 255, 255, $alpha);

            // Calculate text box size
            $bbox = imagettfbbox($fontSize, $angle, $fontPath, $text);
            $textWidth = abs($bbox[4] - $bbox[0]);
            $textHeight = abs($bbox[5] - $bbox[1]);

            // Calculate position (Bottom Right)
            $x = $width - $textWidth - $padding;
            $y = $height - $padding; // GD y is from bottom for text baseline? No, usually top-left.
            // imagettftext coordinates are the bottom-left corner of the first character.
            // So y should be height - padding.

            // Add text
            imagettftext($image, $fontSize, $angle, $x, $y, $white, $fontPath, $text);

            // Save to new temp file
            $tempPath = sys_get_temp_dir() . '/' . uniqid('watermarked_') . '.' . pathinfo($sourcePath, PATHINFO_EXTENSION);

            // Save based on extension (or just use AVIF if it was already converted)
            // If source was AVIF, save as AVIF
            $ext = strtolower(pathinfo($sourcePath, PATHINFO_EXTENSION));

            if ($ext === 'avif' && function_exists('imageavif')) {
                imageavif($image, $tempPath, 80); // Maintain quality 80
            } elseif ($ext === 'png') {
                imagesavealpha($image, true);
                imagepng($image, $tempPath);
            } elseif (in_array($ext, ['jpg', 'jpeg'])) {
                imagejpeg($image, $tempPath, 90);
            } else {
                // Fallback
                imagejpeg($image, $tempPath, 90);
            }

            imagedestroy($image);

            return $tempPath;

        } catch (\Exception $e) {
            Log::error('Watermark failed: ' . $e->getMessage());
            return $sourcePath;
        }
    }

    /**
     * Check if system can convert to AVIF
     */
    protected function canConvertToAvif(): bool
    {
        // Reusing logic from CloudinaryService
        if (function_exists('imageavif') && function_exists('imagecreatefromstring')) {
            return true;
        }
        if (extension_loaded('imagick')) {
            $imagick = new \Imagick();
            $formats = $imagick->queryFormats('AVIF');
            return !empty($formats);
        }
        return false;
    }

    /**
     * Convert image to AVIF locally
     */
    protected function convertToAvif(string $sourcePath): ?string
    {
        // Reusing logic from CloudinaryService exactly
        try {
            $tempPath = sys_get_temp_dir() . '/' . uniqid('avif_') . '.avif';

            // Try GD first
            if (function_exists('imageavif') && function_exists('imagecreatefromstring')) {
                $imageData = file_get_contents($sourcePath);
                $image = @imagecreatefromstring($imageData);

                if ($image) {
                    imagesavealpha($image, true);
                    $success = imageavif($image, $tempPath, 80);
                    imagedestroy($image);

                    if ($success && file_exists($tempPath)) {
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
                    return $tempPath;
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::warning('AVIF conversion failed: ' . $e->getMessage());
            return null;
        }
    }

    public function uploadMultiplePropertyImages(array $files, string $folder = 'properties'): array
    {
        $results = [];
        foreach ($files as $file) {
            $results[] = $this->uploadPropertyImage($file, $folder);
        }
        return $results;
    }

    public function deleteImage(string $path): bool
    {
        return Storage::disk($this->disk)->delete($path);
    }
}
