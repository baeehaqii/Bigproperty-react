<?php

namespace App\Filament\Resources\Properties\Pages;

use App\Filament\Resources\Properties\PropertyResource;
use App\Models\KreditUser;
use Filament\Resources\Pages\CreateRecord;
use Filament\Notifications\Notification;

class CreateProperty extends CreateRecord
{
    protected static string $resource = PropertyResource::class;

    // Cek kredit sebelum render form
    public function mount(): void
    {
        parent::mount();

        if (auth()->user()->hasRole('super_admin')) {
            return;
        }
        $userId = auth()->id();
        $kreditUser = KreditUser::where('user_id', $userId)->first();

        // Cek apakah ada kredit tersisa
        if (!$this->hasAvailableKredit($kreditUser)) {
            Notification::make()
                ->danger()
                ->title('Kredit Habis!')
                ->body('Anda tidak memiliki kredit untuk membuat property baru. Silakan beli membership terlebih dahulu.')
                ->persistent()
                ->send();

            // Redirect ke halaman list atau membership
            $this->redirect(PropertyResource::getUrl('index'));
        }
    }

    // Override method beforeCreate untuk kurangi kredit
    protected function beforeCreate(): void
    {
        $userId = auth()->id();
        $kreditUser = KreditUser::where('user_id', $userId)->first();

        if (!$kreditUser) {
            $this->halt();
            Notification::make()
                ->danger()
                ->title('Error')
                ->body('Data kredit tidak ditemukan.')
                ->send();
            return;
        }

        // Logic pengurangan kredit
        if ($kreditUser->kredit_new_user > 0) {
            $kreditUser->decrement('kredit_new_user');
        } elseif ($kreditUser->kredit_listing > 0) {
            $kreditUser->decrement('kredit_listing');
        } else {
            $this->halt();
            Notification::make()
                ->danger()
                ->title('Kredit Habis!')
                ->body('Anda tidak memiliki kredit untuk membuat property.')
                ->send();
            return;
        }
    }

    // Override afterCreate untuk notifikasi
    protected function afterCreate(): void
    {
        $userId = auth()->id();
        $kreditUser = KreditUser::where('user_id', $userId)->first();

        $sisaKredit = ($kreditUser->kredit_new_user ?? 0) + ($kreditUser->kredit_listing ?? 0);

        Notification::make()
            ->success()
            ->title('Property Berhasil Dibuat!')
            ->body("Sisa kredit Anda: {$sisaKredit}")
            ->send();
    }

    // Helper function cek kredit
    private function hasAvailableKredit(?KreditUser $kreditUser): bool
    {
        if (!$kreditUser)
            return false;

        $totalKredit = ($kreditUser->kredit_new_user ?? 0) + ($kreditUser->kredit_listing ?? 0);
        return $totalKredit > 0;
    }

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $cloudinary = new \App\Services\CloudinaryService();
        $disk = \Illuminate\Support\Facades\Storage::disk('public');
        $log = \Illuminate\Support\Facades\Log::class;

        $log::info('CreateProperty: Starting Cloudinary upload process');

        // Handle Main Image
        if (!empty($data['main_image'])) {
            $log::info('CreateProperty Main Image: ' . $data['main_image']);

            if (!str_starts_with($data['main_image'], 'http')) {
                $path = $disk->path($data['main_image']);
                $log::info('CreateProperty Main Image Full Path: ' . $path);
                $log::info('CreateProperty Main Image Exists: ' . (file_exists($path) ? 'YES' : 'NO'));

                if (file_exists($path)) {
                    try {
                        $result = $cloudinary->uploadPropertyImage($path, 'properties/main');
                        $data['main_image'] = $result['url'];
                        $log::info('CreateProperty Main Image Uploaded to Cloudinary: ' . $result['url']);
                        @unlink($path);
                    } catch (\Exception $e) {
                        $log::error('Cloudinary main image upload failed: ' . $e->getMessage());
                    }
                }
            } else {
                $log::info('CreateProperty Main Image already Cloudinary URL');
            }
        }

        // Handle Gallery Images
        if (!empty($data['images']) && is_array($data['images'])) {
            $log::info('CreateProperty Gallery: Processing ' . count($data['images']) . ' images');
            $newImages = [];

            foreach ($data['images'] as $index => $image) {
                $log::info("CreateProperty Gallery[$index]: $image");

                if (!str_starts_with($image, 'http')) {
                    $path = $disk->path($image);
                    $log::info("CreateProperty Gallery[$index] Full Path: $path");
                    $log::info("CreateProperty Gallery[$index] Exists: " . (file_exists($path) ? 'YES' : 'NO'));

                    if (file_exists($path)) {
                        try {
                            $result = $cloudinary->uploadPropertyImage($path, 'properties/gallery');
                            $newImages[] = $result['url'];
                            $log::info("CreateProperty Gallery[$index] Uploaded: " . $result['url']);
                            @unlink($path);
                        } catch (\Exception $e) {
                            $log::error("Cloudinary gallery image upload failed: " . $e->getMessage());
                            $newImages[] = $image;
                        }
                    } else {
                        $newImages[] = $image;
                    }
                } else {
                    $newImages[] = $image;
                }
            }
            $data['images'] = $newImages;
            $log::info('CreateProperty Gallery: Final count ' . count($newImages));
        }

        $log::info('CreateProperty: Cloudinary upload process completed');
        return $data;
    }
}