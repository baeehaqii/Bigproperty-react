<?php

namespace App\Filament\Resources\LeadsAgents\Pages;

use App\Filament\Resources\LeadsAgents\LeadsAgentResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListLeadsAgents extends ListRecords
{
    protected static string $resource = LeadsAgentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
