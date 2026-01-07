<?php

namespace App\Filament\Resources\Keunggulans\Schemas;

use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Get;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\HtmlString;

class KeunggulanForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Input Keunggulan Properti')
                    ->description('Masukkan poin-poin keunggulan utama (USP) dari properti ini.')
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                TextInput::make('nama')
                                    ->label('Nama Keunggulan')
                                    ->required()
                                    ->placeholder('e.g., Lokasi Strategis')
                                    ->columnSpan(1),

                                Select::make('icon')
                                    ->label('Pilih Icon')
                                    ->required()
                                    ->searchable()
                                    ->options(self::getUSPFlaticonOptions())
                                    ->allowHtml()
                                    ->live()
                                    ->placeholder('Pilih Icon')
                                    ->columnSpan(2),
                                
                                Textarea::make('keterangan')
                                    ->label('Penjelasan Singkat')
                                    ->placeholder('e.g., Hanya 5 menit dari gerbang tol pusat kota.')
                                    ->rows(2)
                                    ->columnSpanFull(),
                            ]),
                    ]),
            ]);
    }

    protected static function getUSPFlaticonOptions(): array
    {
        $icons = [
            // Location & Access
            'fi-rr-map-marker-home' => 'Lokasi Strategis',
            'fi-rr-road'            => 'Akses Tol Dekat',
            'fi-rr-train'           => 'Dekat Stasiun/Transportasi',
            'fi-rr-plane'           => 'Akses Bandara Mudah',
            
            // Financial & Investment
            'fi-rr-stats'           => 'Investasi Menguntungkan',
            'fi-rr-label'           => 'Harga Kompetitif',
            'fi-rr-bank'            => 'Bisa KPR Bank Besar',
            'fi-rr-percentage'      => 'Promo Bunga Rendah',
            'fi-rr-hand-holding-usd'=> 'DP Ringan / 0%',
            
            // Building & Design
            
            'fi-rr-paint-roller'    => 'Desain Modern Minimalis',
            'fi-rr-box-alt'         => 'Tata Ruang Efisien',
            'fi-rr-shield-check'    => 'Sertifikat SHM Aman',
            'fi-rr-sparkles'        => 'Fasilitas Mewah',
            'fi-rr-leaf'            => 'Eco-Friendly / Green Living',
            'fi-rr-bolt'            => 'Smart Home Ready',
        ];

        return collect($icons)->mapWithKeys(function ($label, $class) {
            return [
                $class => "<div class='flex items-center gap-3'>
                             <i class='fi {$class} text-xl mt-1' style='color: #f59e0b;'></i>
                             <span>{$label}</span>
                           </div>"
            ];
        })->toArray();
    }
}