<?php

namespace App\Filament\Resources\Heroes\Schemas;

use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class HeroForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                
                Section::make('Branding Website')
                    ->description('Pengaturan judul, favicon, dan tema warna')
                    ->icon('heroicon-o-cog-6-tooth')
                    ->columns(2)
                    ->schema([
                        TextInput::make('site_title')
                            ->label('Judul Website (Kiri Atas)')
                            ->placeholder('Contoh: Pinhome Admin')
                            ->columnSpan(1),

                        FileUpload::make('favicon')
                            ->label('Favicon')
                            ->image()
                            ->directory('settings/favicons')
                            ->columnSpan(1),

                        ColorPicker::make('primary_color')
                            ->label('Warna Utama (Primary)')
                            ->helperText('Akan mengubah warna tombol dan aksen aktif')
                            ->default('#2563eb'),

                        ColorPicker::make('secondary_color')
                            ->label('Warna Sekunder')
                            ->default('#64748b'),
                    ]),

                Section::make('Konten Hero')
                    ->description('Atur judul dan deskripsi hero banner')
                    ->icon('heroicon-o-sparkles')
                    ->schema([
                        TextInput::make('title')
                            ->label('Judul')
                            ->placeholder('Contoh: #FindYourWayHome')
                            ->maxLength(255)
                            ->columnSpanFull(),

                        TextInput::make('subtitle')
                            ->label('Subtitle')
                            ->placeholder('Contoh: Semua kebutuhan properti ada di Pinhome')
                            ->maxLength(500)
                            ->columnSpanFull(),

                        Textarea::make('deskripsi')
                            ->label('Deskripsi')
                            ->rows(4)
                            ->maxLength(1000)
                            ->columnSpanFull(),
                    ])
                    ->collapsible(),

                Section::make('Media & Visual')
                    ->description('Upload gambar dan atur warna tema')
                    ->icon('heroicon-o-photo')
                    ->schema([
                        FileUpload::make('image')
                            ->label('Gallery Images')
                            ->image()
                            ->multiple()
                            ->directory('hero/images')
                            ->maxFiles(5)
                            ->columnSpanFull(),

                        ColorPicker::make('main_color')
                            ->label('Warna Banner')
                            ->default('#2563eb')
                            ->columnSpanFull(),
                    ])
                    ->collapsible(),

                Section::make('Call to Action (Opsional)')
                    ->icon('heroicon-o-cursor-arrow-ripple')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('link_text')
                                    ->label('Teks Tombol')
                                    ->maxLength(100),

                                TextInput::make('link_url')
                                    ->label('URL Link')
                                    ->url()
                                    ->maxLength(500),
                            ]),
                    ])
                    ->collapsible()
                    ->collapsed(),
            ]);
    }
}