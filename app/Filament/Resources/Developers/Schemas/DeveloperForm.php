<?php

namespace App\Filament\Resources\Developers\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use App\Models\Property;

class DeveloperForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Developer')
                    ->description('Masukkan data lengkap developer properti')
                    ->icon('heroicon-o-building-office-2')
                    ->columns(2)
                    ->schema([
                        Grid::make(2)
                            ->ColumnSpanFull()
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nama Developer')
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('PT. Contoh Developer Indonesia')
                                    ->helperText('Nama lengkap perusahaan developer')
                                    ->columnSpan(1),

                                TextInput::make('pt')
                                    ->label('Nama PT')
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('PT. ABC Property')
                                    ->helperText('Nama badan hukum perusahaan')
                                    ->columnSpan(1),
                            ]),

                        TextInput::make('alamat')
                            ->label('Alamat Kantor')
                            ->required()
                            ->maxLength(500)
                            ->placeholder('Jl. Contoh No. 123, Jakarta Selatan')
                            ->helperText('Alamat lengkap kantor developer'),
                        TextInput::make('Kontak')
                            ->label('Kontak Kantor')
                            ->required()
                            ->numeric()
                            ->maxLength(15)
                            ->prefix('+62/+21')
                            ->helperText('Alamat lengkap kantor developer'),
                        FileUpload::make('logo')
                            ->label('Logo Developer')
                            ->image()
                            ->imageEditor()
                            ->ColumnSpanFull()

                            ->imageEditorAspectRatios([
                                '16:9',
                                '4:3',
                                '1:1',
                            ])
                            ->maxSize(2048)
                            ->directory('developers/logos')
                            ->visibility('public')
                            ->helperText('Upload logo developer (Maks. 2MB, format: JPG, PNG)'),
                        Toggle::make('is_verified')
                            ->label('Developer Terverifikasi'),
                    ])
                    ->collapsible()
                    ->persistCollapsed(),

                // Section::make('Property Portfolio')
                //     ->description('Pilih property yang dikembangkan oleh developer ini')
                //     ->icon('heroicon-o-building-storefront')
                //     ->schema([
                //         Select::make('list_property')
                //             ->label('Daftar Property')
                //             ->multiple()
                //             ->searchable()
                //             ->preload()
                //             ->options(function () {
                //                 return Property::query()
                //                     ->where('is_available', true)
                //                     ->orderBy('name')
                //                     ->get()
                //                     ->mapWithKeys(function ($property) {
                //                         $label = $property->name;
                                        
                //                         // Tambahkan info lokasi
                //                         if ($property->city) {
                //                             $label .= ' - ' . $property->city;
                //                         }
                                        
                //                         // Tambahkan range harga
                //                         if ($property->price_min) {
                //                             $priceRange = number_format($property->price_min / 1000000, 0) . 'jt';
                //                             if ($property->price_max && $property->price_max != $property->price_min) {
                //                                 $priceRange .= ' - ' . number_format($property->price_max / 1000000, 0) . 'jt';
                //                             }
                //                             $label .= ' (' . $priceRange . ')';
                //                         }
                                        
                //                         // Tambahkan badge popular
                //                         if ($property->is_popular) {
                //                             $label .= ' ⭐';
                //                         }
                                        
                //                         return [$property->id => $label];
                //                     })
                //                     ->toArray();
                //             })
                //             ->getSearchResultsUsing(function (string $search) {
                //                 return Property::query()
                //                     ->where('is_available', true)
                //                     ->where(function ($query) use ($search) {
                //                         $query->where('name', 'like', "%{$search}%")
                //                             ->orWhere('city', 'like', "%{$search}%")
                //                             ->orWhere('location', 'like', "%{$search}%");
                //                     })
                //                     ->limit(50)
                //                     ->get()
                //                     ->mapWithKeys(function ($property) {
                //                         return [$property->id => $property->name . ' - ' . $property->city];
                //                     })
                //                     ->toArray();
                //             })
                //             ->helperText('Pilih satu atau lebih property yang dikembangkan')
                //             ->hint('Tekan Ctrl/Cmd untuk pilih multiple')
                //             ->hintIcon('heroicon-m-information-circle')
                //             ->native(false)
                //             ->columnSpanFull(),
                //     ])
                //     ->collapsible()
                //     ->persistCollapsed(),
            ]);
    }
}