<?php

namespace App\Filament\Resources\Properties\Pages;

use App\Filament\Resources\Properties\PropertyResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditProperty extends EditRecord
{
    protected static string $resource = PropertyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $storageService = new \App\Services\GoogleStorageService();
        $disk = \Illuminate\Support\Facades\Storage::disk('public');
        $log = \Illuminate\Support\Facades\Log::class;

        $log::info('EditProperty: Starting GCS upload process');

        // Handle Main Image
        if (!empty($data['main_image'])) {
            $log::info('EditProperty Main Image: ' . $data['main_image']);

            if (!str_starts_with($data['main_image'], 'http')) {
                $path = $disk->path($data['main_image']);
                $log::info('EditProperty Main Image Full Path: ' . $path);
                $log::info('EditProperty Main Image Exists: ' . (file_exists($path) ? 'YES' : 'NO'));

                if (file_exists($path)) {
                    try {
                        $result = $storageService->uploadPropertyImage($path, 'website_image_listing');
                        $data['main_image'] = $result['url'];
                        $log::info('EditProperty Main Image Uploaded to GCS: ' . $result['url']);
                        @unlink($path);
                    } catch (\Exception $e) {
                        $log::error('GCS main image upload failed: ' . $e->getMessage());
                    }
                }
            } else {
                $log::info('EditProperty Main Image already URL');
            }
        }

        // Handle Gallery Images
        if (!empty($data['images']) && is_array($data['images'])) {
            $log::info('EditProperty Gallery: Processing ' . count($data['images']) . ' images');
            $newImages = [];

            foreach ($data['images'] as $index => $image) {
                $log::info("EditProperty Gallery[$index]: $image");

                if (!str_starts_with($image, 'http')) {
                    $path = $disk->path($image);
                    $log::info("EditProperty Gallery[$index] Full Path: $path");
                    $log::info("EditProperty Gallery[$index] Exists: " . (file_exists($path) ? 'YES' : 'NO'));

                    if (file_exists($path)) {
                        try {
                            $result = $storageService->uploadPropertyImage($path, 'website_image_listing');
                            $newImages[] = $result['url'];
                            $log::info("EditProperty Gallery[$index] Uploaded to GCS: " . $result['url']);
                            @unlink($path);
                        } catch (\Exception $e) {
                            $log::error("GCS gallery image upload failed: " . $e->getMessage());
                            $newImages[] = $image; // Keep original on failure
                        }
                    } else {
                        $newImages[] = $image; // File doesn't exist, keep path
                    }
                } else {
                    $newImages[] = $image; // Already a URL
                }
            }
            $data['images'] = $newImages;
            $log::info('EditProperty Gallery: Final count ' . count($newImages));
        }

        $log::info('EditProperty: GCS upload process completed');
        return $data;
    }
}
