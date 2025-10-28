<?php

namespace App\Filament\Resources\GolderDeals\Pages;

use App\Filament\Resources\GolderDeals\GolderDealsResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListGolderDeals extends ListRecords
{
    protected static string $resource = GolderDealsResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
