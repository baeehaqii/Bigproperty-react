<?php

namespace App\Filament\Resources\GolderDeals\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class GolderDealsForm
{
    protected static function formatPrice($amount): string
    {
        if ($amount >= 1000000000) {
            // Milyar
            $value = $amount / 1000000000;
            $formatted = $value == floor($value) 
                ? number_format($value, 0, ',', '.') 
                : number_format($value, 1, ',', '.');
            return $formatted . ' M';
        } elseif ($amount >= 1000000) {
            // Juta
            $value = $amount / 1000000;
            $formatted = $value == floor($value) 
                ? number_format($value, 0, ',', '.') 
                : number_format($value, 1, ',', '.');
            return $formatted . ' Jt';
        } elseif ($amount >= 1000) {
            // Ribu
            $value = $amount / 1000;
            $formatted = $value == floor($value) 
                ? number_format($value, 0, ',', '.') 
                : number_format($value, 1, ',', '.');
            return $formatted . ' Rb';
        } else {
            // Rupiah
            return number_format($amount, 0, ',', '.');
        }
    }
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Properti')
                    ->description('Detail utama properti yang akan ditampilkan')
                    ->icon('heroicon-o-home')
                    ->collapsible()
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('property_name')
                                    ->label('Nama Properti')
                                    ->required()
                                    ->maxLength(255)
                                    ->columnSpan(2)
                                    ->placeholder('Villa Bogor Indah 6'),

                                Select::make('type')
                                    ->label('Tipe Properti')
                                    ->options([
                                        'Rumah Baru' => 'Rumah Baru',
                                        'Apartemen' => 'Apartemen',
                                        'Kavling' => 'Kavling',
                                    ])
                                    ->required()
                                    ->native(false)
                                    ->searchable(),

                                Select::make('developer_id')
                                    ->label('Developer')
                                    ->relationship('developer', 'name')
                                    ->required()
                                    ->searchable()
                                    ->preload()
                                    ->createOptionForm([
                                        TextInput::make('name')
                                            ->required()
                                            ->maxLength(255),
                                        FileUpload::make('logo')
                                            ->image()
                                            ->maxSize(1024),
                                    ]),

                                TextInput::make('badge')
                                    ->label('Badge')
                                    ->placeholder('SIAP HUNI, READY, dll')
                                    ->maxLength(50),

                                TextInput::make('type_extra')
                                    ->label('Info Tambahan')
                                    ->placeholder('Sisa 4 Unit')
                                    ->maxLength(100),
                            ]),
                    ]),

                Section::make('Harga & Angsuran')
                    ->description('Informasi harga dan cicilan')
                    ->icon('heroicon-o-currency-dollar')
                    ->collapsible()
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                TextInput::make('price_min')
                                    ->label('Harga Minimum')
                                    ->required()
                                    ->numeric()
                                    ->prefix('Rp')
                                    ->placeholder('1200000000')
                                    ->helperText('Dalam Rupiah')
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function ($state, callable $set, callable $get) {
                                        $min = $state;
                                        $max = $get('price_max');
                                        
                                        if ($min && $max) {
                                            $minFormatted = self::formatPrice($min);
                                            $maxFormatted = self::formatPrice($max);
                                            $set('price_range', "Rp {$minFormatted} - Rp {$maxFormatted}");
                                        }
                                    }),

                                TextInput::make('price_max')
                                    ->label('Harga Maximum')
                                    ->required()
                                    ->numeric()
                                    ->prefix('Rp')
                                    ->placeholder('2100000000')
                                    ->helperText('Dalam Rupiah')
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function ($state, callable $set, callable $get) {
                                        $min = $get('price_min');
                                        $max = $state;
                                        
                                        if ($min && $max) {
                                            $minFormatted = self::formatPrice($min);
                                            $maxFormatted = self::formatPrice($max);
                                            $set('price_range', "Rp {$minFormatted} - Rp {$maxFormatted}");
                                        }
                                    }),

                                TextInput::make('installment_amount')
                                    ->label('Angsuran per Bulan')
                                    ->required()
                                    ->numeric()
                                    ->prefix('Rp')
                                    ->placeholder('8300000')
                                    ->helperText('Dalam Rupiah')
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(function ($state, callable $set) {
                                        if ($state) {
                                            $formatted = self::formatPrice($state);
                                            $set('installment_text', "Angsuran mulai dari Rp{$formatted}/bln");
                                        }
                                    }),
                            ]),

                        Grid::make(2)
                            ->schema([
                                TextInput::make('price_range')
                                    ->label('Text Range Harga')
                                    ->placeholder('Rp 1,2 M - Rp 2,1 M')
                                    ->readOnly()
                                    ->dehydrated()
                                    ->helperText('Opsional, auto-generate jika kosong'),

                                TextInput::make('installment_text')
                                    ->label('Text Angsuran')
                                    ->readOnly()
                                    ->dehydrated()
                                    ->placeholder('Angsuran mulai dari Rp8,3 Jt/bln')
                                    ->helperText('Opsional, auto-generate jika kosong'),
                            ]),
                    ]),

                Section::make('Lokasi')
                    ->description('Informasi lokasi properti')
                    ->icon('heroicon-o-map-pin')
                    ->collapsible()
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('location_district')
                                    ->label('Kecamatan')
                                    ->required()
                                    ->maxLength(100)
                                    ->placeholder('Sukaraja'),

                                TextInput::make('location_city')
                                    ->label('Kota/Kabupaten')
                                    ->required()
                                    ->maxLength(100)
                                    ->placeholder('Kab. Bogor'),
                            ]),
                    ]),

                Section::make('Spesifikasi')
                    ->description('Detail spesifikasi properti')
                    ->icon('heroicon-o-squares-2x2')
                    ->collapsible()
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                TextInput::make('bedrooms')
                                    ->label('Kamar Tidur')
                                    ->required()
                                    ->placeholder('2-3 KT')
                                    ->maxLength(50),

                                TextInput::make('land_size')
                                    ->label('Luas Tanah')
                                    ->required()
                                    ->placeholder('LT 72-84m²')
                                    ->maxLength(50),

                                TextInput::make('building_size')
                                    ->label('Luas Bangunan')
                                    ->required()
                                    ->placeholder('LB 60-80m²')
                                    ->maxLength(50),
                            ]),

                        Toggle::make('has_shm')
                            ->label('Sertifikat SHM')
                            ->default(false)
                            ->inline(false),
                    ]),

                Section::make('Media & Status')
                    ->description('Gambar dan status properti')
                    ->icon('heroicon-o-photo')
                    ->collapsible()
                    ->schema([
                        FileUpload::make('image')
                            ->label('Gambar Properti')
                            ->image()
                            ->maxSize(2048)
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '16:9',
                                '4:3',
                            ])
                            ->directory('golden-deals')
                            ->columnSpanFull(),

                        Select::make('status')
                            ->label('Status')
                            ->options([
                                'active' => 'Active',
                                'inactive' => 'Inactive',
                            ])
                            ->default('active')
                            ->required()
                            ->native(false),
                    ])
            ]);
    }
}
