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
        if (!$kreditUser) return false;
        
        $totalKredit = ($kreditUser->kredit_new_user ?? 0) + ($kreditUser->kredit_listing ?? 0);
        return $totalKredit > 0;
    }
}