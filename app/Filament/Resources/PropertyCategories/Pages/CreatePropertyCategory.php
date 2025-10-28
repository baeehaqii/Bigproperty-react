<?php

namespace App\Filament\Resources\PropertyCategories\Pages;

use App\Filament\Resources\PropertyCategories\PropertyCategoryResource;
use Filament\Resources\Pages\CreateRecord;

class CreatePropertyCategory extends CreateRecord
{
    protected static string $resource = PropertyCategoryResource::class;
            protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
