<?php

namespace App\Filament\Resources\NearbyPlaces\Schemas;

use App\Models\KategoriPlace; // Import model baru
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class NearbyPlaceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Input Tempat Terdekat')
                    ->description('Masukkan daftar tempat penting. Kategori diambil dari data Master Kategori Place.')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('nama')
                                    ->label('Nama Tempat / Lokasi')
                                    ->required()
                                    ->placeholder('e.g., Gerbang Tol Ciawi')
                                    ->columnSpan(1),

                                Select::make('kategori')
                                    ->label('Kategori')
                                    ->required()
                                    ->options(KategoriPlace::pluck('nama', 'nama')) 
                                    ->searchable()
                                    ->preload()
                                    ->columnSpan(1),
                            ]),
                    ]),
            ]);
    }
}