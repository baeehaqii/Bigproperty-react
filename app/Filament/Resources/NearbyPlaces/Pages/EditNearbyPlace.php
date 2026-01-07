<?php

namespace App\Filament\Resources\NearbyPlaces\Pages;

use App\Filament\Resources\NearbyPlaces\NearbyPlaceResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditNearbyPlace extends EditRecord
{
    protected static string $resource = NearbyPlaceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
