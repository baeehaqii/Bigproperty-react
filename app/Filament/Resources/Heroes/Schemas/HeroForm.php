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
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use Str;

class HeroForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Konten Hero')
                    ->description('Atur judul dan deskripsi hero banner')
                    ->icon('heroicon-o-sparkles')
                    ->schema([
                        TextInput::make('title')
                            ->label('Judul')
                            ->placeholder('Contoh: #FindYourWayHome')
                            ->maxLength(255)
                            ->helperText('Kosongkan untuk menggunakan judul default')
                            ->columnSpanFull(),

                        TextInput::make('subtitle')
                            ->label('Subtitle')
                            ->placeholder('Contoh: Semua kebutuhan properti ada di Pinhome')
                            ->maxLength(500)
                            ->helperText('Kosongkan untuk menggunakan subtitle default')
                            ->columnSpanFull(),

                        Textarea::make('deskripsi')
                            ->label('Deskripsi')
                            ->rows(4)
                            ->maxLength(1000)
                            ->placeholder('Deskripsi tambahan untuk hero banner (opsional)')
                            ->helperText('Maksimal 1000 karakter')
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
                                    ->helperText('Upload up to 10 images')
                                    ->columnSpanFull(),

                        ColorPicker::make('main_color')
                            ->label('Warna Utama')
                            ->helperText('Pilih warna tema untuk hero banner')
                            ->default('#2563eb')
                            ->columnSpanFull(),
                    ])
                    ->collapsible(),

                Section::make('Call to Action (Opsional)')
                    ->description('Tambahkan tombol atau link pada hero banner')
                    ->icon('heroicon-o-cursor-arrow-ripple')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('link_text')
                                    ->label('Teks Tombol')
                                    ->placeholder('Contoh: Lihat Properti')
                                    ->maxLength(100)
                                    ->columnSpan(1),

                                TextInput::make('link_url')
                                    ->label('URL Link')
                                    ->url()
                                    ->placeholder('https://example.com')
                                    ->maxLength(500)
                                    ->columnSpan(1),
                            ]),
                    ])
                    ->collapsible()
                    ->collapsed(),
            ]);
    }
}