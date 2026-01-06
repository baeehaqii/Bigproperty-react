<?php

namespace App\Filament\Resources\KategoriPlaces\Pages;

use App\Filament\Resources\KategoriPlaces\KategoriPlaceResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditKategoriPlace extends EditRecord
{
    protected static string $resource = KategoriPlaceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
