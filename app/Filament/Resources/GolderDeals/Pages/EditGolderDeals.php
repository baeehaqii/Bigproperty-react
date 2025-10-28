<?php

namespace App\Filament\Resources\GolderDeals\Pages;

use App\Filament\Resources\GolderDeals\GolderDealsResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditGolderDeals extends EditRecord
{
    protected static string $resource = GolderDealsResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
