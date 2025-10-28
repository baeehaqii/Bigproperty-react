<?php

namespace App\Filament\Resources\PropertyCategories\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class PropertyCategoryForm
{
    
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Kategori')
                    ->schema([
                        TextInput::make('name')
                            ->label('Nama Kategori')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn ($state, callable $set) => $set('slug', \Illuminate\Support\Str::slug($state))),
                        
                        TextInput::make('slug')
                            ->label('Slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->readOnly()
                            ->dehydrated()
                            ->helperText('URL-friendly versi dari nama kategori'),
                        
                        Select::make('section')
                            ->label('Tipe Section')
                            ->required()
                            ->options([
                                'buy' => 'Beli Properti',
                                'rent' => 'Sewa Properti',
                                'listing' => 'Titip Jual & Sewa',
                            ])
                            ->native(false),
                        
                        Select::make('icon')
                            ->label('Icon')
                            ->required()
                            ->searchable()
                            ->options(self::getHeroiconOptions())
                            ->default('heroicon-o-home')
                            ->helperText('Pilih icon dari Heroicons')
                            ->native(false)
                            ->allowHtml()
                            ->reactive()
                            ->suffixIcon(fn ($state) => $state),
                        
                        TextInput::make('order')
                            ->label('Urutan')
                            ->numeric()
                            ->default(0)
                            ->required()
                            ->helperText('Urutan tampilan kategori (kecil ke besar)'),
                    ])
                    ->columns(2),

                Section::make('Pengaturan Tampilan')
                    ->schema([
                        Toggle::make('is_highlighted')
                            ->label('Highlight')
                            ->helperText('Tampilkan dengan background gradient'),
                        
                        Toggle::make('has_badge')
                            ->label('Tampilkan Badge')
                            ->live()
                            ->helperText('Tampilkan badge di atas kategori'),
                        
                        TextInput::make('badge_text')
                            ->label('Teks Badge')
                            ->maxLength(50)
                            ->visible(fn (Get $get) => $get('has_badge'))
                            ->placeholder('BARU'),
                        
                        Select::make('badge_color')
                            ->label('Warna Badge')
                            ->options([
                                'red' => 'Merah',
                                'blue' => 'Biru',
                                'green' => 'Hijau',
                                'orange' => 'Orange',
                                'yellow' => 'Kuning',
                            ])
                            ->visible(fn (Get $get) => $get('has_badge'))
                            ->default('red')
                            ->native(false),
                        
                        Toggle::make('is_active')
                            ->label('Status Aktif')
                            ->default(true)
                            ->helperText('Kategori yang tidak aktif tidak akan ditampilkan'),
                    ])
                    ->columns(2),
            ]);
    }

    protected static function getHeroiconOptions(): array
    {
        $icons = [
            // Property & Real Estate
            'heroicon-o-home' => 'Home',
            'heroicon-o-home-modern' => 'Home Modern',
            'heroicon-o-building-office' => 'Building Office',
            'heroicon-o-building-office-2' => 'Building Office 2',
            'heroicon-o-building-storefront' => 'Building Storefront',
            'heroicon-o-building-library' => 'Building Library',
            
            // Location
            'heroicon-o-map-pin' => 'Map Pin',
            'heroicon-o-map' => 'Map',
            'heroicon-o-globe-alt' => 'Globe',
            
            // Business
            'heroicon-o-briefcase' => 'Briefcase',
            'heroicon-o-banknotes' => 'Banknotes',
            'heroicon-o-currency-dollar' => 'Currency Dollar',
            
            // Categories
            'heroicon-o-squares-2x2' => 'Squares',
            'heroicon-o-squares-plus' => 'Squares Plus',
            'heroicon-o-rectangle-group' => 'Rectangle Group',
            
            // Common
            'heroicon-o-star' => 'Star',
            'heroicon-o-heart' => 'Heart',
            'heroicon-o-fire' => 'Fire',
            'heroicon-o-sparkles' => 'Sparkles',
            'heroicon-o-bolt' => 'Bolt',
            'heroicon-o-key' => 'Key',
            'heroicon-o-shopping-cart' => 'Shopping Cart',
            'heroicon-o-shopping-bag' => 'Shopping Bag',
            
            // Facilities
            'heroicon-o-tv' => 'TV',
            'heroicon-o-wifi' => 'WiFi',
            'heroicon-o-truck' => 'Truck',
            'heroicon-o-wrench-screwdriver' => 'Wrench Screwdriver',
            
            // Nature
            'heroicon-o-sun' => 'Sun',
            'heroicon-o-moon' => 'Moon',
            'heroicon-o-cloud' => 'Cloud',
        ];

        // Format dengan HTML untuk menampilkan icon preview
        return collect($icons)->mapWithKeys(function ($label, $icon) {
            $svg = \Filament\Support\Facades\FilamentIcon::resolve($icon);
            return [
                $icon => "<div class='flex items-center gap-2'>
                            <span class='w-5 h-5'>{$svg}</span>
                            <span>{$label}</span>
                          </div>"
            ];
        })->toArray();
    }
}