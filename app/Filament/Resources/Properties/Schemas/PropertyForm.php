<?php

namespace App\Filament\Resources\Properties\Schemas;

use App\Models\PropertyCategory;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Get;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Http;

class PropertyForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Basic Information')
                    ->description('Property basic details and identification')
                    ->icon('heroicon-o-information-circle')
                    ->columns(2)
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->placeholder('e.g., Nuansa Bukit Bitung')
                            ->columnSpanFull(),
                        
                        // Province selector
                        Select::make('provinsi')
                            ->label('Province')
                            ->options(function () {
                                try {
                                    $response = Http::get('https://wilayah.id/api/provinces.json');
                                    
                                    if ($response->successful()) {
                                        $provinces = $response->json('data');
                                        return collect($provinces)->pluck('name', 'code')->toArray();
                                    }
                                } catch (\Exception $e) {
                                    // Log error if needed
                                }
                                
                                return [];
                            }) 
                            ->searchable()
                            ->required()
                            ->placeholder('Select province first'),
                        
                        // City/Regency selector (depends on province)
                        Select::make('city')
                            ->label('City / Regency')
                            ->options(function (callable $get) {
                                $provinceCode = $get('provinsi');
                                
                                if (!$provinceCode) {
                                    return [];
                                }
                                
                                try {
                                    $response = Http::get("https://wilayah.id/api/regencies/{$provinceCode}.json");
                                    
                                    if ($response->successful()) {
                                        $regencies = $response->json('data');
                                        return collect($regencies)->pluck('name', 'name')->toArray();
                                    }
                                } catch (\Exception $e) {
                                    // Log error if needed
                                }
                                
                                return [];
                            })
                            ->searchable()
                            ->required()
                            // ->disabled(fn (callable $get) => !$get('provinsi'))
                            ->dehydrated(true)
                            ->placeholder('Select province first')
                            ->helperText('Please select a province first'),
                        
                        TextInput::make('location')
                            ->required()
                            ->placeholder('e.g., Ciawi, Kab. Bogor')
                            ->maxLength(255),
                        
                        TextInput::make('units_remaining')
                            ->label('Units Remaining')
                            ->numeric()
                            ->placeholder('e.g., 16')
                            ->suffix('units'),
                        
                        Select::make('event_id')
                            ->label('Associated Event')
                            ->relationship('event', 'name')
                            ->searchable()
                            ->preload()
                            ->placeholder('Select event'),
                        
                        // Category selector - multiple selection with name as value
                        Select::make('kategori')
                            ->label('Property Categories')
                            ->multiple()
                            ->options(function () {
                                return PropertyCategory::where('is_active', true)
                                    ->orderBy('section')
                                    ->orderBy('order')
                                    ->get()
                                    ->mapWithKeys(function ($category) {
                                        return [$category->name => $category->name . ' (' . $category->section_label . ')'];
                                    })
                                    ->toArray();
                            })
                            ->searchable()
                            ->placeholder('Select property categories')
                            ->helperText('Select one or more categories for this property')
                            ->columnSpanFull(),
                    ]),

                // Price & Financing Section
                Section::make('Price & Financing')
                    ->description('Pricing and installment information')
                    ->icon('heroicon-o-currency-dollar')
                    ->columns(2)
                    ->schema([
                        TextInput::make('price_min')
                            ->label('Minimum Price')
                            ->required()
                            ->numeric()
                            ->prefix('Rp')
                            ->placeholder('732200000')
                            ->helperText('Enter in Rupiah (e.g., 732200000 for 732.2 Jt)'),
                        
                        TextInput::make('price_max')
                            ->label('Maximum Price')
                            ->numeric()
                            ->prefix('Rp')
                            ->placeholder('1800000000')
                            ->helperText('Leave empty if same as minimum'),
                        
                        TextInput::make('installment_start')
                            ->label('Starting Installment')
                            ->required()
                            ->numeric()
                            ->prefix('Rp')
                            ->suffix('/month')
                            ->columnSpanFull()
                            ->placeholder('5000000')
                            ->helperText('Monthly payment amount'),
                    ]),

                // Property Details Section
                Section::make('Property Specifications')
                    ->description('Detailed property specifications')
                    ->icon('heroicon-o-home')
                    ->schema([
                        TextInput::make('bedrooms')
                            ->label('Bedrooms')
                            ->suffix('KT')
                            ->required()
                            ->placeholder('2'),
                        
                        Select::make('certificate_type')
                            ->label('Certificate Type')
                            ->options([
                                'SHM' => 'SHM (Sertifikat Hak Milik)',
                                'HGB' => 'HGB (Hak Guna Bangunan)',
                                'SHGB' => 'SHGB',
                                'Strata Title' => 'Strata Title',
                            ])
                            ->placeholder('Select certificate type'),
                        
                        Grid::make(2)
                            ->schema([
                                TextInput::make('land_size_min')
                                    ->label('Land Size Min')
                                    ->required()
                                    ->numeric()
                                    ->suffix('m²')
                                    ->placeholder('60'),
                                
                                TextInput::make('land_size_max')
                                    ->label('Land Size Max')
                                    ->numeric()
                                    ->suffix('m²')
                                    ->placeholder('155'),
                            ]),
                        
                        Grid::make(2)
                            ->schema([
                                TextInput::make('building_size_min')
                                    ->label('Building Size Min')
                                    ->numeric()
                                    ->suffix('m²')
                                    ->placeholder('38'),
                                
                                TextInput::make('building_size_max')
                                    ->label('Building Size Max')
                                    ->numeric()
                                    ->suffix('m²')
                                    ->placeholder('70'),
                            ]),
                    ]),

                // Marketing Section
                Section::make('Marketing & Promotion')
                    ->description('Promotional content and features')
                    ->icon('heroicon-o-megaphone')
                    ->collapsible()
                    ->schema([
                        Textarea::make('promo_text')
                            ->label('Promo Text')
                            ->placeholder('e.g., Cuma di Pinhome: Emas Batangan hingga 12gr')
                            ->rows(2)
                            ->columnSpanFull(),
                        
                        TagsInput::make('features')
                            ->label('Property Features')
                            ->placeholder('Add feature and press Enter')
                            ->helperText('e.g., Swimming Pool, Security 24/7, Playground')
                            ->columnSpanFull(),
                    ]),

                // Images Section
                Section::make('Images')
                    ->description('Property images and gallery')
                    ->icon('heroicon-o-photo')
                    ->schema([
                        FileUpload::make('main_image')
                            ->label('Main Image')
                            ->image()
                            ->directory('properties/main')
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '16:9',
                                '4:3',
                            ])
                            ->columnSpanFull(),
                        
                        FileUpload::make('images')
                            ->label('Gallery Images')
                            ->image()
                            ->multiple()
                            ->directory('properties/gallery')
                            ->imageEditor()
                            ->reorderable()
                            ->maxFiles(10)
                            ->helperText('Upload up to 10 images')
                            ->columnSpanFull(),
                    ]),

                // Status & Settings Section
                Section::make('Status & Settings')
                    ->description('Property status and display settings')
                    ->icon('heroicon-o-cog-6-tooth')
                    ->columns(2)
                    ->schema([
                        Select::make('button_type')
                            ->label('Button Type')
                            ->options([
                                'view' => 'View Details',
                                'chat' => 'Chat Now',
                            ])
                            ->default('view')
                            ->required()
                            ->helperText('Button action on property card'),
                        
                        Toggle::make('is_available')
                            ->label('Available')
                            ->default(true)
                            ->inline(false)
                            ->helperText('Is this property available for sale?'),
                        
                        Toggle::make('is_popular')
                            ->label('Popular')
                            ->default(false)
                            ->inline(false)
                            ->helperText('Show in "Popular Properties" section'),
                        
                        DateTimePicker::make('last_updated')
                            ->disabled()
                            ->dehydrated(true)
                            ->label('Last Updated')
                            ->afterStateHydrated(function ($set) {
                                $set('last_updated', now()->format('Y-m-d H:i:s'));
                            })
                            ->helperText('When was this property last updated?')
                    ]),
            ]);
    }
}