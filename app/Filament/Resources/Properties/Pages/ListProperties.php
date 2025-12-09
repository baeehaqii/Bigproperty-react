<?php

namespace App\Filament\Resources\Properties\Pages;

use App\Filament\Resources\Properties\PropertyResource;
use App\Models\KreditUser;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListProperties extends ListRecords
{
    protected static string $resource = PropertyResource::class;

    protected function getHeaderActions(): array
    {
        $userId = auth()->id();
        $kreditUser = KreditUser::where('user_id', $userId)->first();
        
        // Cek total kredit
        $totalKredit = 0;
        if ($kreditUser) {
            $totalKredit = ($kreditUser->kredit_new_user ?? 0) + ($kreditUser->kredit_listing ?? 0);
        }
        
        $hasKredit = $totalKredit > 0;

        return [
            CreateAction::make()
                ->disabled(function() use ($hasKredit) {
                    // Kalo super_admin, selalu bisa create
                    if (auth()->user()->hasRole('super_admin')) {
                        return false;
                    }
                    
                    // Kalo bukan super_admin, cek kredit
                    return !$hasKredit;
                })
                ->tooltip(function() use ($hasKredit) {
                    // Super admin ga perlu tooltip
                    if (auth()->user()->hasRole('super_admin')) {
                        return null;
                    }
                    
                    return $hasKredit ? null : '⚠️ Kredit Anda sudah habis! Silakan beli membership terlebih dahulu.';
                })
                ->color(function() use ($hasKredit) {
                    if (auth()->user()->hasRole('super_admin')) {
                        return 'primary';
                    }
                    return $hasKredit ? 'primary' : 'danger';
                })
                ->icon(function() use ($hasKredit) {
                    if (auth()->user()->hasRole('super_admin')) {
                        return 'heroicon-o-plus';
                    }
                    return $hasKredit ? 'heroicon-o-plus' : 'heroicon-o-x-circle';
                })
                ->before(function () use ($hasKredit) {
                    // Kalo super admin, skip validasi kredit
                    dd(auth()->user()->hasRole('super_admin'));
                    if (auth()->user()->hasRole('super_admin')) {
                        return;
                    }
                    
                    // Block kalo ga punya kredit
                    if (!$hasKredit) {
                        \Filament\Notifications\Notification::make()
                            ->danger()
                            ->title('Kredit Habis!')
                            ->body('Anda tidak memiliki kredit untuk membuat property. Beli membership dulu!')
                            ->persistent()
                            ->send();
                        
                        // Stop proses create
                        $this->halt();
                    }
                }),
        ];
    }
}