<?php

namespace App\Filament\Resources\Testimonis\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class TestimoniForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Pelanggan')
                    ->description('Data pelanggan yang memberikan testimoni')
                    ->icon('heroicon-o-user-circle')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nama Lengkap')
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('Contoh: Raden Kautsar')
                                    ->columnSpan(1),

                                TextInput::make('role')
                                    ->label('Status Pembeli')
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('Contoh: Pembeli Panorama Bekasi Residence')
                                    ->columnSpan(1),
                            ]),
                    ])
                    ->collapsible(),

                Section::make('Media')
                    ->description('Upload foto pelanggan atau properti')
                    ->icon('heroicon-o-photo')
                    ->schema([
                        FileUpload::make('image')
                            ->label('Foto')
                            ->image()
                            ->required()
                            ->directory('testimonials')
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '4:3',
                                '16:9',
                            ])
                            ->maxSize(2048)
                            ->helperText('Upload gambar dengan rasio 4:3 atau 16:9. Maksimal 2MB')
                            ->columnSpanFull(),
                    ])
                    ->collapsible(),
                Section::make('Testimoni')
                    ->description('Isi testimoni dari pelanggan')
                    ->icon('heroicon-o-chat-bubble-left-right')
                    ->schema([
                        Textarea::make('content')
                            ->label('Isi Testimoni')
                            ->required()
                            ->rows(5)
                            ->maxLength(1000)
                            ->placeholder('Tuliskan testimoni pelanggan di sini...')
                            ->helperText('Maksimal 1000 karakter'),

                        Select::make('rating')
                            ->label('Rating')
                            ->required()
                            ->options([
                                1 => '⭐ 1 - Sangat Buruk',
                                2 => '⭐⭐ 2 - Buruk',
                                3 => '⭐⭐⭐ 3 - Cukup',
                                4 => '⭐⭐⭐⭐ 4 - Baik',
                                5 => '⭐⭐⭐⭐⭐ 5 - Sangat Baik',
                            ])
                            ->default(5)
                            ->native(false),
                    ])
                    ->collapsible(),
                Section::make('Pengaturan')
                    ->description('Atur tampilan dan urutan testimoni')
                    ->icon('heroicon-o-cog-6-tooth')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                Toggle::make('is_active')
                                    ->label('Tampilkan di Website')
                                    ->default(true)
                                    ->inline(false)
                                    ->helperText('Aktifkan untuk menampilkan testimoni ini')
                                    ->columnSpan(1),
                            ]),
                    ])
                    ->collapsible(),
            ]);
    }
}