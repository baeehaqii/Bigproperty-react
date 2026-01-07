<?php

namespace App\Filament\Resources\NearbyPlaces\Pages;

use App\Filament\Resources\NearbyPlaces\NearbyPlaceResource;
use App\Models\KategoriPlace; // Import model Kategori
use Filament\Actions\Action; // Gunakan Action biasa untuk modal custom
use Filament\Actions\CreateAction;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListNearbyPlaces extends ListRecords
{
    protected static string $resource = NearbyPlaceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            // Action utama untuk tambah Nearby Place (Bulk yang kita buat tadi)
            CreateAction::make()
                ->label('Tambah Tempat'),
        ];
    }
}