<?php

namespace App\Filament\Resources\Keunggulans\Pages;

use App\Filament\Resources\Keunggulans\KeunggulanResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListKeunggulans extends ListRecords
{
    protected static string $resource = KeunggulanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
