<?php

namespace App\Filament\Resources\KategoriPlaces\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class KategoriPlaceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Master Kategori Lokasi')
                ->schema([
                    TextInput::make('nama')
                        ->required()
                        ->unique(ignoreRecord: true) 
                        ->placeholder('Contoh: Transportasi, Pendidikan, dll'),
                ])
            ]);
    }
}
