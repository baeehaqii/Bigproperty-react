<?php

namespace App\Filament\Resources\LeadsAgents\Pages;

use App\Filament\Resources\LeadsAgents\LeadsAgentResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditLeadsAgent extends EditRecord
{
    protected static string $resource = LeadsAgentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
