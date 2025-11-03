<?php

namespace App\Filament\Resources\Heroes\Pages;

use App\Filament\Resources\Heroes\HeroResource;
use Filament\Resources\Pages\CreateRecord;

class CreateHero extends CreateRecord
{
    protected static string $resource = HeroResource::class;
    protected static bool $canCreateAnother = false;
     protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
