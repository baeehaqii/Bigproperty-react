<?php

namespace App\Filament\Resources\Keunggulans\Pages;

use App\Filament\Resources\Keunggulans\KeunggulanResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditKeunggulan extends EditRecord
{
    protected static string $resource = KeunggulanResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
