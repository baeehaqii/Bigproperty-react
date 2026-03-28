<?php

namespace App\Filament\Resources\Properties\Schemas;

use App\Models\Promo;
use App\Models\PropertyCategory;
use App\Models\Nearest_place_category;
use App\Models\Property;
use App\Models\Developer;
use App\Models\Agen;
use Filament\Actions\Action;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Get;
use Filament\Schemas\Components\Fieldset;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Http;
use Filament\Notifications\Notification;
use Filament\Forms\Components\Placeholder;

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
                        Hidden::make("agen_id")
                            ->afterStateHydrated(function (callable $set, $record) {
                                if (!$record) {
                                    if (auth()->user()->hasRole("agen")) {
                                        $agen = Agen::where("user_id", '=', auth()->user()->id)->first();
                                        $set("agen_id", $agen->id);
                                    }
                                }
                            })
                            ->dehydrated(),

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

                                }

                                return [];
                            })
                            ->searchable()
                            ->required()
                            ->placeholder('Select province first'),


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
                                        return collect($regencies)->pluck('name', 'code')->toArray();
                                    }
                                } catch (\Exception $e) {

                                }

                                return [];
                            })
                            ->searchable()
                            ->required()
                            ->dehydrated(true)
                            ->placeholder('Select province first')
                            ->helperText('Please select a province first'),

                        TextInput::make('location')
                            ->required()
                            ->placeholder('e.g., Ciawi, Kab. Bogor')
                            ->maxLength(255),

                        TextInput::make('url_maps')
                            ->label('Google Maps URL')
                            ->url()
                            ->placeholder('https://maps.google.com/...')
                            ->maxLength(500)
                            ->columnSpanFull(),

                        TextInput::make('units_remaining')
                            ->label('Units Remaining')
                            ->numeric()
                            ->visible(function () {
                                return auth()->user()->hasRole(['super_admin', 'developer']);
                            })
                            ->placeholder('e.g., 16')
                            ->suffix('units'),

                        Select::make('developer_id')
                            ->afterstateHydrated(function (callable $set, $state) {
                                if (auth()->user()->hasRole('Agen')) {
                                    $agen = Agen::where("user_id", '=', auth()->user()->id)->first();

                                    if ($agen->developer_id) {
                                        $set($state, $agen->developer_id);
                                    }
                                }
                            })
                            ->options(function () {
                                return Developer::orderBy('name')->pluck('name', 'id');
                            })
                            ->label('Developer '),
                        Select::make('kategori')
                            ->label('Property Categories')
                            ->multiple()
                            ->options(function () {
                                return PropertyCategory::where('is_active', true)
                                    ->orderBy('section')
                                    ->orderBy('order')
                                    ->get()
                                    ->mapWithKeys(function ($category) {
                                        return [$category->id => $category->name . ' (' . ucfirst($category->section) . ')'];
                                    })
                                    ->toArray();
                            })
                            ->searchable()
                            ->placeholder('Select property categories')
                            ->helperText('Select one or more categories for this property')
                            ->columnSpanFull(),
                    ]),


                Section::make('Pricing & Features')
                    ->description('Price, keunggulan, fasilitas, dan lokasi terdekat')
                    ->icon('heroicon-o-currency-dollar')
                    ->columns(1)
                    ->schema([
                        TextInput::make('price_min')
                            ->label('Harga Properti')
                            ->required()
                            ->numeric()
                            ->prefix('Rp'),

                        // Divider - Keunggulan & Fasilitas
                        Placeholder::make('divider_features')
                            ->label('')
                            ->content(new \Illuminate\Support\HtmlString('<div class="w-full border-t-2 border-gray-200 my-4 relative"><span class="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-sm font-medium text-gray-500">Keunggulan & Fasilitas</span></div>'))
                            ->columnSpanFull(),

                        // Keunggulan
                        Repeater::make('keunggulanPivot')
                            ->label("Keunggulan Properti")
                            ->relationship()
                            ->schema([
                                Select::make('keunggulan_id')
                                    ->label('Pilih Keunggulan')
                                    ->options(\App\Models\Keunggulan::pluck('nama', 'id'))
                                    ->required()
                                    ->searchable()
                                    ->columnSpanFull()
                                    ->preload()
                            ])
                            ->addActionLabel('Tambah Keunggulan')
                            ->columnSpanFull(),

                        // Fasilitas
                        Repeater::make('fasilitasPivot')
                            ->label("Fasilitas Properti")
                            ->relationship()
                            ->schema([
                                Select::make('fasilitas_id')
                                    ->label('Pilih Fasilitas')
                                    ->options(\App\Models\Fasilitas::pluck('nama', 'id'))
                                    ->required()
                                    ->columnSpanFull()
                                    ->searchable()
                                    ->preload()
                            ])
                            ->addActionLabel('Tambah Fasilitas')
                            ->columnSpanFull(),

                        // Divider - Nearby Places
                        Placeholder::make('divider_nearby')
                            ->label('')
                            ->content(new \Illuminate\Support\HtmlString('<div class="w-full border-t border-gray-200 my-4"></div>'))
                            ->columnSpanFull(),

                        // Nearby Places
                        Repeater::make('nearbyPlacePivot')
                            ->label("Lokasi Terdekat")
                            ->relationship()
                            ->schema([
                                Select::make('nearby_place_id')
                                    ->label('Tempat / Lokasi')
                                    ->options(\App\Models\NearbyPlace::pluck('nama', 'id'))
                                    ->required()
                                    ->searchable()
                                    ->preload()
                                    ->columnSpan(2),

                                TextInput::make('jarak')
                                    ->label('Waktu (Menit)')
                                    ->required()
                                    ->numeric()
                                    ->columnSpan(1),
                            ])
                            ->columns(3)
                            ->defaultItems(1)
                            ->reorderable()
                            ->addActionLabel('Tambah Lokasi Terdekat')
                            ->columnSpanFull(),
                    ]),


                Section::make('Property Specifications')
                    ->description('Detailed property specifications')
                    ->icon('heroicon-o-home')
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                TextInput::make('bedrooms')
                                    ->label('Bedrooms')
                                    ->suffix('KT')
                                    ->required()
                                    ->placeholder('2'),

                                TextInput::make('bathrooms')
                                    ->label('Bathrooms')
                                    ->suffix('KM')
                                    ->numeric()
                                    ->placeholder('1'),

                                TextInput::make('carport')
                                    ->label('Carport')
                                    ->suffix('Unit')
                                    ->numeric()
                                    ->placeholder('1'),
                            ]),

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
                        Select::make('listrik')
                            ->label('Daya Listrik (VA)')
                            ->options([
                                450 => '450 VA',
                                900 => '900 VA',
                                1300 => '1300 VA',
                                2200 => '2200 VA',
                                3500 => '3500 VA',
                                5500 => '5500 VA',
                                6600 => '6600 VA',
                            ])
                            ->searchable(),

                        // JENIS AIR SELECT
                        Select::make('jenis_air')
                            ->label('Sumber Air')
                            ->options([
                                'PDAM' => 'PDAM',
                                'Sumur Bor' => 'Sumur Bor',
                                'Sumur Tanah' => 'Sumur Tanah',
                            ]),

                        // KONDISI BARANG
                        Select::make('condition')
                            ->label('Kondisi Properti')
                            ->options([
                                'Baru' => 'Baru (Gress)',
                                'Bekas' => 'Bekas / Second',
                            ])
                            ->required(),
                    ]),



                Section::make('Media Assets')
                    ->columnspanFull()
                    ->schema([

                        Section::make('Marketing & Promotion')
                            ->description('Promotional content and features')
                            ->icon('heroicon-o-megaphone')
                            ->collapsible()
                            ->schema([
                                Select::make('promos')
                                    ->relationship('promos', 'nama')
                                    ->multiple()
                                    ->searchable()
                                    ->preload()
                                    ->placeholder('Ketik untuk mencari...'),
                                Textarea::make('promo_text')
                                    ->label('Tentang Property')
                                    ->placeholder('Deskripsikan properti secara detail. Ceritakan tentang keunggulan lokasi, fasilitas sekitar, dan hal menarik lainnya...')
                                    ->rows(5)
                                    ->maxLength(2000)
                                    ->helperText('Deskripsi detail tentang properti ini. Maksimal 2000 karakter. HTML dan script tidak diizinkan.')
                                    ->columnSpanFull()
                                    ->dehydrateStateUsing(function ($state) {
                                        // Sanitize input on save
                                        if (empty($state))
                                            return null;
                                        $sanitized = strip_tags($state);
                                        $sanitized = preg_replace('/javascript:/i', '', $sanitized);
                                        $sanitized = preg_replace('/on\w+\s*=/i', '', $sanitized);
                                        $sanitized = trim($sanitized);
                                        return htmlspecialchars($sanitized, ENT_QUOTES, 'UTF-8');
                                    }),
                            ]),


                        Section::make('Images')
                            ->description('Property images and gallery')
                            ->icon('heroicon-o-photo')
                            ->schema([
                                // Display existing main image if it's a URL
                                Placeholder::make('existing_main_image')
                                    ->label('Current Main Image')
                                    ->content(function ($record) {
                                        if (!$record || !$record->main_image) {
                                            return 'No image uploaded';
                                        }
                                        $url = $record->main_image;
                                        if (str_starts_with($url, 'http')) {
                                            return new \Illuminate\Support\HtmlString(
                                                '<img src="' . $url . '" class="max-h-48 rounded-lg" alt="Main Image">'
                                            );
                                        }
                                        return 'Local file: ' . $url;
                                    })
                                    ->visible(fn($record) => $record && $record->main_image && str_starts_with($record->main_image, 'http'))
                                    ->columnSpanFull(),

                                FileUpload::make('main_image')
                                    ->label('Upload New Main Image')
                                    ->helperText('Upload a new image to replace the existing one')
                                    ->image()
                                    ->disk('public')
                                    ->visibility('public')
                                    ->directory('properties/main')
                                    ->imageEditor()
                                    ->imageEditorAspectRatios([
                                        '16:9',
                                        '4:3',
                                    ])
                                    ->columnSpanFull(),

                                // Display existing gallery images if they are URLs
                                Placeholder::make('existing_gallery_images')
                                    ->label('Current Gallery Images')
                                    ->content(function ($record) {
                                        if (!$record || !$record->images || !is_array($record->images)) {
                                            return 'No gallery images';
                                        }
                                        $html = '<div class="flex flex-wrap gap-2">';
                                        foreach ($record->images as $image) {
                                            if (str_starts_with($image, 'http')) {
                                                $html .= '<img src="' . $image . '" class="h-24 rounded-lg object-cover" alt="Gallery">';
                                            }
                                        }
                                        $html .= '</div>';
                                        return new \Illuminate\Support\HtmlString($html);
                                    })
                                    ->visible(fn($record) => $record && $record->images && is_array($record->images) && count(array_filter($record->images, fn($img) => str_starts_with($img, 'http'))) > 0)
                                    ->columnSpanFull(),

                                FileUpload::make('images')
                                    ->label('Upload New Gallery Images')
                                    ->helperText('Upload new images to add to or replace the gallery (up to 10)')
                                    ->image()
                                    ->disk('public')
                                    ->visibility('public')
                                    ->multiple()
                                    ->required()
                                    ->directory('properties/gallery')
                                    ->imageEditor()
                                    ->reorderable()
                                    ->maxFiles(10)
                                    ->columnSpanFull(),
                            ]),
                    ]),
            ]);
    }

    protected static function getHeroiconOptions(): array
    {
        $icons = [

            'heroicon-o-home' => 'Home',
            'heroicon-o-home-modern' => 'Home Modern',
            'heroicon-o-building-office' => 'Building Office',
            'heroicon-o-building-office-2' => 'Building Office 2',
            'heroicon-o-building-storefront' => 'Building Storefront',
            'heroicon-o-building-library' => 'Building Library',


            'heroicon-o-map-pin' => 'Map Pin',
            'heroicon-o-map' => 'Map',
            'heroicon-o-globe-alt' => 'Globe Alt',
            'heroicon-o-globe-americas' => 'Globe Americas',
            'heroicon-o-globe-asia-australia' => 'Globe Asia Australia',
            'heroicon-o-globe-europe-africa' => 'Globe Europe Africa',


            'heroicon-o-briefcase' => 'Briefcase',
            'heroicon-o-banknotes' => 'Banknotes',
            'heroicon-o-currency-dollar' => 'Currency Dollar',
            'heroicon-o-currency-euro' => 'Currency Euro',
            'heroicon-o-currency-pound' => 'Currency Pound',
            'heroicon-o-currency-rupee' => 'Currency Rupee',
            'heroicon-o-currency-yen' => 'Currency Yen',
            'heroicon-o-currency-bangladeshi' => 'Currency Bangladeshi',
            'heroicon-o-credit-card' => 'Credit Card',
            'heroicon-o-wallet' => 'Wallet',
            'heroicon-o-receipt-percent' => 'Receipt Percent',
            'heroicon-o-receipt-refund' => 'Receipt Refund',
            'heroicon-o-scale' => 'Scale',


            'heroicon-o-shopping-cart' => 'Shopping Cart',
            'heroicon-o-shopping-bag' => 'Shopping Bag',
            'heroicon-o-gift' => 'Gift',
            'heroicon-o-gift-top' => 'Gift Top',
            'heroicon-o-ticket' => 'Ticket',
            'heroicon-o-tag' => 'Tag',


            'heroicon-o-squares-2x2' => 'Squares 2x2',
            'heroicon-o-squares-plus' => 'Squares Plus',
            'heroicon-o-rectangle-group' => 'Rectangle Group',
            'heroicon-o-rectangle-stack' => 'Rectangle Stack',
            'heroicon-o-square-2-stack' => 'Square 2 Stack',
            'heroicon-o-square-3-stack-3d' => 'Square 3 Stack 3D',
            'heroicon-o-circle-stack' => 'Circle Stack',
            'heroicon-o-queue-list' => 'Queue List',
            'heroicon-o-list-bullet' => 'List Bullet',
            'heroicon-o-numbered-list' => 'Numbered List',


            'heroicon-o-star' => 'Star',
            'heroicon-o-heart' => 'Heart',
            'heroicon-o-fire' => 'Fire',
            'heroicon-o-sparkles' => 'Sparkles',
            'heroicon-o-bolt' => 'Bolt',
            'heroicon-o-bolt-slash' => 'Bolt Slash',
            'heroicon-o-trophy' => 'Trophy',
            'heroicon-o-check-badge' => 'Check Badge',
            'heroicon-o-shield-check' => 'Shield Check',
            'heroicon-o-shield-exclamation' => 'Shield Exclamation',


            'heroicon-o-key' => 'Key',
            'heroicon-o-lock-closed' => 'Lock Closed',
            'heroicon-o-lock-open' => 'Lock Open',
            'heroicon-o-finger-print' => 'Finger Print',
            'heroicon-o-identification' => 'Identification',


            'heroicon-o-tv' => 'TV',
            'heroicon-o-wifi' => 'WiFi',
            'heroicon-o-signal' => 'Signal',
            'heroicon-o-signal-slash' => 'Signal Slash',
            'heroicon-o-computer-desktop' => 'Computer Desktop',
            'heroicon-o-device-phone-mobile' => 'Device Phone Mobile',
            'heroicon-o-device-tablet' => 'Device Tablet',
            'heroicon-o-cpu-chip' => 'CPU Chip',
            'heroicon-o-camera' => 'Camera',
            'heroicon-o-video-camera' => 'Video Camera',
            'heroicon-o-video-camera-slash' => 'Video Camera Slash',
            'heroicon-o-photo' => 'Photo',
            'heroicon-o-film' => 'Film',
            'heroicon-o-microphone' => 'Microphone',
            'heroicon-o-speaker-wave' => 'Speaker Wave',
            'heroicon-o-speaker-x-mark' => 'Speaker X Mark',
            'heroicon-o-radio' => 'Radio',
            'heroicon-o-musical-note' => 'Musical Note',


            'heroicon-o-truck' => 'Truck',
            'heroicon-o-paper-airplane' => 'Paper Airplane',
            'heroicon-o-rocket-launch' => 'Rocket Launch',


            'heroicon-o-wrench-screwdriver' => 'Wrench Screwdriver',
            'heroicon-o-wrench' => 'Wrench',
            'heroicon-o-cog' => 'Cog',
            'heroicon-o-cog-6-tooth' => 'Cog 6 Tooth',
            'heroicon-o-cog-8-tooth' => 'Cog 8 Tooth',
            'heroicon-o-adjustments-horizontal' => 'Adjustments Horizontal',
            'heroicon-o-adjustments-vertical' => 'Adjustments Vertical',
            'heroicon-o-beaker' => 'Beaker',
            'heroicon-o-bug-ant' => 'Bug Ant',
            'heroicon-o-calculator' => 'Calculator',
            'heroicon-o-scissors' => 'Scissors',
            'heroicon-o-paint-brush' => 'Paint Brush',
            'heroicon-o-swatch' => 'Swatch',
            'heroicon-o-eye-dropper' => 'Eye Dropper',


            'heroicon-o-sun' => 'Sun',
            'heroicon-o-moon' => 'Moon',
            'heroicon-o-cloud' => 'Cloud',
            'heroicon-o-cloud-arrow-up' => 'Cloud Arrow Up',
            'heroicon-o-cloud-arrow-down' => 'Cloud Arrow Down',


            'heroicon-o-cake' => 'Cake',


            'heroicon-o-chat-bubble-left' => 'Chat Bubble Left',
            'heroicon-o-chat-bubble-left-right' => 'Chat Bubble Left Right',
            'heroicon-o-chat-bubble-left-ellipsis' => 'Chat Bubble Left Ellipsis',
            'heroicon-o-chat-bubble-bottom-center' => 'Chat Bubble Bottom Center',
            'heroicon-o-chat-bubble-bottom-center-text' => 'Chat Bubble Bottom Center Text',
            'heroicon-o-chat-bubble-oval-left' => 'Chat Bubble Oval Left',
            'heroicon-o-chat-bubble-oval-left-ellipsis' => 'Chat Bubble Oval Left Ellipsis',
            'heroicon-o-envelope' => 'Envelope',
            'heroicon-o-envelope-open' => 'Envelope Open',
            'heroicon-o-phone' => 'Phone',
            'heroicon-o-phone-arrow-up-right' => 'Phone Arrow Up Right',
            'heroicon-o-phone-arrow-down-left' => 'Phone Arrow Down Left',
            'heroicon-o-phone-x-mark' => 'Phone X Mark',
            'heroicon-o-megaphone' => 'Megaphone',
            'heroicon-o-bell' => 'Bell',
            'heroicon-o-bell-alert' => 'Bell Alert',
            'heroicon-o-bell-slash' => 'Bell Slash',
            'heroicon-o-bell-snooze' => 'Bell Snooze',
            'heroicon-o-rss' => 'RSS',
            'heroicon-o-newspaper' => 'Newspaper',
            'heroicon-o-at-symbol' => 'At Symbol',
            'heroicon-o-hashtag' => 'Hashtag',
            'heroicon-o-language' => 'Language',


            'heroicon-o-document' => 'Document',
            'heroicon-o-document-text' => 'Document Text',
            'heroicon-o-document-plus' => 'Document Plus',
            'heroicon-o-document-minus' => 'Document Minus',
            'heroicon-o-document-duplicate' => 'Document Duplicate',
            'heroicon-o-document-arrow-up' => 'Document Arrow Up',
            'heroicon-o-document-arrow-down' => 'Document Arrow Down',
            'heroicon-o-document-check' => 'Document Check',
            'heroicon-o-document-magnifying-glass' => 'Document Magnifying Glass',
            'heroicon-o-document-chart-bar' => 'Document Chart Bar',
            'heroicon-o-document-currency-dollar' => 'Document Currency Dollar',
            'heroicon-o-document-currency-euro' => 'Document Currency Euro',
            'heroicon-o-document-currency-pound' => 'Document Currency Pound',
            'heroicon-o-document-currency-rupee' => 'Document Currency Rupee',
            'heroicon-o-document-currency-yen' => 'Document Currency Yen',
            'heroicon-o-document-currency-bangladeshi' => 'Document Currency Bangladeshi',
            'heroicon-o-folder' => 'Folder',
            'heroicon-o-folder-open' => 'Folder Open',
            'heroicon-o-folder-plus' => 'Folder Plus',
            'heroicon-o-folder-minus' => 'Folder Minus',
            'heroicon-o-folder-arrow-down' => 'Folder Arrow Down',
            'heroicon-o-clipboard' => 'Clipboard',
            'heroicon-o-clipboard-document' => 'Clipboard Document',
            'heroicon-o-clipboard-document-list' => 'Clipboard Document List',
            'heroicon-o-clipboard-document-check' => 'Clipboard Document Check',
            'heroicon-o-book-open' => 'Book Open',
            'heroicon-o-bookmark' => 'Bookmark',
            'heroicon-o-bookmark-square' => 'Bookmark Square',
            'heroicon-o-bookmark-slash' => 'Bookmark Slash',


            'heroicon-o-archive-box' => 'Archive Box',
            'heroicon-o-archive-box-arrow-down' => 'Archive Box Arrow Down',
            'heroicon-o-archive-box-x-mark' => 'Archive Box X Mark',
            'heroicon-o-inbox' => 'Inbox',
            'heroicon-o-inbox-arrow-down' => 'Inbox Arrow Down',
            'heroicon-o-inbox-stack' => 'Inbox Stack',
            'heroicon-o-server' => 'Server',
            'heroicon-o-server-stack' => 'Server Stack',
            'heroicon-o-cube' => 'Cube',
            'heroicon-o-cube-transparent' => 'Cube Transparent',


            'heroicon-o-chart-bar' => 'Chart Bar',
            'heroicon-o-chart-bar-square' => 'Chart Bar Square',
            'heroicon-o-chart-pie' => 'Chart Pie',
            'heroicon-o-presentation-chart-bar' => 'Presentation Chart Bar',
            'heroicon-o-presentation-chart-line' => 'Presentation Chart Line',


            'heroicon-o-calendar' => 'Calendar',
            'heroicon-o-calendar-days' => 'Calendar Days',
            'heroicon-o-calendar-date-range' => 'Calendar Date Range',
            'heroicon-o-clock' => 'Clock',


            'heroicon-o-academic-cap' => 'Academic Cap',
            'heroicon-o-puzzle-piece' => 'Puzzle Piece',
            'heroicon-o-light-bulb' => 'Light Bulb',


            'heroicon-o-user' => 'User',
            'heroicon-o-user-circle' => 'User Circle',
            'heroicon-o-user-plus' => 'User Plus',
            'heroicon-o-user-minus' => 'User Minus',
            'heroicon-o-users' => 'Users',
            'heroicon-o-user-group' => 'User Group',
            'heroicon-o-hand-raised' => 'Hand Raised',
            'heroicon-o-hand-thumb-up' => 'Hand Thumb Up',
            'heroicon-o-hand-thumb-down' => 'Hand Thumb Down',
            'heroicon-o-face-smile' => 'Face Smile',
            'heroicon-o-face-frown' => 'Face Frown',


            'heroicon-o-play' => 'Play',
            'heroicon-o-play-circle' => 'Play Circle',
            'heroicon-o-play-pause' => 'Play Pause',
            'heroicon-o-pause' => 'Pause',
            'heroicon-o-pause-circle' => 'Pause Circle',
            'heroicon-o-stop' => 'Stop',
            'heroicon-o-stop-circle' => 'Stop Circle',
            'heroicon-o-forward' => 'Forward',
            'heroicon-o-backward' => 'Backward',
            'heroicon-o-power' => 'Power',


            'heroicon-o-check' => 'Check',
            'heroicon-o-check-circle' => 'Check Circle',
            'heroicon-o-x-mark' => 'X Mark',
            'heroicon-o-x-circle' => 'X Circle',
            'heroicon-o-exclamation-circle' => 'Exclamation Circle',
            'heroicon-o-exclamation-triangle' => 'Exclamation Triangle',
            'heroicon-o-information-circle' => 'Information Circle',
            'heroicon-o-question-mark-circle' => 'Question Mark Circle',
            'heroicon-o-no-symbol' => 'No Symbol',
            'heroicon-o-flag' => 'Flag',


            'heroicon-o-arrow-up' => 'Arrow Up',
            'heroicon-o-arrow-down' => 'Arrow Down',
            'heroicon-o-arrow-left' => 'Arrow Left',
            'heroicon-o-arrow-right' => 'Arrow Right',
            'heroicon-o-arrow-up-circle' => 'Arrow Up Circle',
            'heroicon-o-arrow-down-circle' => 'Arrow Down Circle',
            'heroicon-o-arrow-left-circle' => 'Arrow Left Circle',
            'heroicon-o-arrow-right-circle' => 'Arrow Right Circle',
            'heroicon-o-arrow-long-up' => 'Arrow Long Up',
            'heroicon-o-arrow-long-down' => 'Arrow Long Down',
            'heroicon-o-arrow-long-left' => 'Arrow Long Left',
            'heroicon-o-arrow-long-right' => 'Arrow Long Right',
            'heroicon-o-arrow-small-up' => 'Arrow Small Up',
            'heroicon-o-arrow-small-down' => 'Arrow Small Down',
            'heroicon-o-arrow-small-left' => 'Arrow Small Left',
            'heroicon-o-arrow-small-right' => 'Arrow Small Right',
            'heroicon-o-arrow-up-left' => 'Arrow Up Left',
            'heroicon-o-arrow-up-right' => 'Arrow Up Right',
            'heroicon-o-arrow-down-left' => 'Arrow Down Left',
            'heroicon-o-arrow-down-right' => 'Arrow Down Right',
            'heroicon-o-arrow-path' => 'Arrow Path',
            'heroicon-o-arrow-path-rounded-square' => 'Arrow Path Rounded Square',
            'heroicon-o-arrow-uturn-up' => 'Arrow U-turn Up',
            'heroicon-o-arrow-uturn-down' => 'Arrow U-turn Down',
            'heroicon-o-arrow-uturn-left' => 'Arrow U-turn Left',
            'heroicon-o-arrow-uturn-right' => 'Arrow U-turn Right',
            'heroicon-o-arrows-right-left' => 'Arrows Right Left',
            'heroicon-o-arrows-up-down' => 'Arrows Up Down',
            'heroicon-o-arrows-pointing-in' => 'Arrows Pointing In',
            'heroicon-o-arrows-pointing-out' => 'Arrows Pointing Out',
            'heroicon-o-chevron-up' => 'Chevron Up',
            'heroicon-o-chevron-down' => 'Chevron Down',
            'heroicon-o-chevron-left' => 'Chevron Left',
            'heroicon-o-chevron-right' => 'Chevron Right',
            'heroicon-o-chevron-up-down' => 'Chevron Up Down',
            'heroicon-o-chevron-double-up' => 'Chevron Double Up',
            'heroicon-o-chevron-double-down' => 'Chevron Double Down',
            'heroicon-o-chevron-double-left' => 'Chevron Double Left',
            'heroicon-o-chevron-double-right' => 'Chevron Double Right',


            'heroicon-o-arrow-up-tray' => 'Arrow Up Tray',
            'heroicon-o-arrow-down-tray' => 'Arrow Down Tray',
            'heroicon-o-arrow-up-on-square' => 'Arrow Up On Square',
            'heroicon-o-arrow-down-on-square' => 'Arrow Down On Square',
            'heroicon-o-arrow-up-on-square-stack' => 'Arrow Up On Square Stack',
            'heroicon-o-arrow-down-on-square-stack' => 'Arrow Down On Square Stack',
            'heroicon-o-arrow-top-right-on-square' => 'Arrow Top Right On Square',


            'heroicon-o-arrow-trending-up' => 'Arrow Trending Up',
            'heroicon-o-arrow-trending-down' => 'Arrow Trending Down',
            'heroicon-o-bars-arrow-up' => 'Bars Arrow Up',
            'heroicon-o-bars-arrow-down' => 'Bars Arrow Down',


            'heroicon-o-eye' => 'Eye',
            'heroicon-o-eye-slash' => 'Eye Slash',
            'heroicon-o-window' => 'Window',
            'heroicon-o-view-columns' => 'View Columns',
            'heroicon-o-viewfinder-circle' => 'Viewfinder Circle',
            'heroicon-o-table-cells' => 'Table Cells',


            'heroicon-o-magnifying-glass' => 'Magnifying Glass',
            'heroicon-o-magnifying-glass-circle' => 'Magnifying Glass Circle',
            'heroicon-o-magnifying-glass-plus' => 'Magnifying Glass Plus',
            'heroicon-o-magnifying-glass-minus' => 'Magnifying Glass Minus',
            'heroicon-o-funnel' => 'Funnel',


            'heroicon-o-pencil' => 'Pencil',
            'heroicon-o-pencil-square' => 'Pencil Square',
            'heroicon-o-plus' => 'Plus',
            'heroicon-o-plus-circle' => 'Plus Circle',
            'heroicon-o-plus-small' => 'Plus Small',
            'heroicon-o-minus' => 'Minus',
            'heroicon-o-minus-circle' => 'Minus Circle',
            'heroicon-o-minus-small' => 'Minus Small',
            'heroicon-o-trash' => 'Trash',
            'heroicon-o-paper-clip' => 'Paper Clip',
            'heroicon-o-backspace' => 'Backspace',
            'heroicon-o-cursor-arrow-rays' => 'Cursor Arrow Rays',
            'heroicon-o-cursor-arrow-ripple' => 'Cursor Arrow Ripple',


            'heroicon-o-bold' => 'Bold',
            'heroicon-o-italic' => 'Italic',
            'heroicon-o-underline' => 'Underline',
            'heroicon-o-strikethrough' => 'Strikethrough',
            'heroicon-o-h1' => 'H1',
            'heroicon-o-h2' => 'H2',
            'heroicon-o-h3' => 'H3',


            'heroicon-o-code-bracket' => 'Code Bracket',
            'heroicon-o-code-bracket-square' => 'Code Bracket Square',
            'heroicon-o-command-line' => 'Command Line',
            'heroicon-o-variable' => 'Variable',


            'heroicon-o-share' => 'Share',
            'heroicon-o-link' => 'Link',
            'heroicon-o-link-slash' => 'Link Slash',
            'heroicon-o-qr-code' => 'QR Code',


            'heroicon-o-printer' => 'Printer',


            'heroicon-o-battery-0' => 'Battery 0',
            'heroicon-o-battery-50' => 'Battery 50',
            'heroicon-o-battery-100' => 'Battery 100',


            'heroicon-o-bars-2' => 'Bars 2',
            'heroicon-o-bars-3' => 'Bars 3',
            'heroicon-o-bars-4' => 'Bars 4',
            'heroicon-o-bars-3-bottom-left' => 'Bars 3 Bottom Left',
            'heroicon-o-bars-3-bottom-right' => 'Bars 3 Bottom Right',
            'heroicon-o-bars-3-center-left' => 'Bars 3 Center Left',
            'heroicon-o-ellipsis-horizontal' => 'Ellipsis Horizontal',
            'heroicon-o-ellipsis-horizontal-circle' => 'Ellipsis Horizontal Circle',
            'heroicon-o-ellipsis-vertical' => 'Ellipsis Vertical',


            'heroicon-o-lifebuoy' => 'Lifebuoy',
            'heroicon-o-gif' => 'GIF',
            'heroicon-o-slash' => 'Slash',
            'heroicon-o-equals' => 'Equals',
            'heroicon-o-divide' => 'Divide',
            'heroicon-o-percent-badge' => 'Percent Badge',


            'heroicon-o-arrow-left-on-rectangle' => 'Arrow Left On Rectangle',
            'heroicon-o-arrow-right-on-rectangle' => 'Arrow Right On Rectangle',
            'heroicon-o-arrow-left-start-on-rectangle' => 'Arrow Left Start On Rectangle',
            'heroicon-o-arrow-left-end-on-rectangle' => 'Arrow Left End On Rectangle',
            'heroicon-o-arrow-right-start-on-rectangle' => 'Arrow Right Start On Rectangle',
            'heroicon-o-arrow-right-end-on-rectangle' => 'Arrow Right End On Rectangle',


            'heroicon-o-arrow-turn-down-left' => 'Arrow Turn Down Left',
            'heroicon-o-arrow-turn-down-right' => 'Arrow Turn Down Right',
            'heroicon-o-arrow-turn-up-left' => 'Arrow Turn Up Left',
            'heroicon-o-arrow-turn-up-right' => 'Arrow Turn Up Right',
            'heroicon-o-arrow-turn-left-down' => 'Arrow Turn Left Down',
            'heroicon-o-arrow-turn-left-up' => 'Arrow Turn Left Up',
            'heroicon-o-arrow-turn-right-down' => 'Arrow Turn Right Down',
            'heroicon-o-arrow-turn-right-up' => 'Arrow Turn Right Up',
        ];


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