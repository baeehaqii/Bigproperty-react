<?php

namespace App\Filament\Resources\Heroes\Pages;

use App\Filament\Resources\Heroes\HeroResource;
use App\Models\Hero;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListHeroes extends ListRecords
{
    protected static string $resource = HeroResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
            ->visible(
                function(){
                    $getHero = Hero::count();
                    if($getHero == 1){
                        return false;
                    }
                    return true;
                }
            ),
        ];
    }
}
