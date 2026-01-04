<?php

namespace App\Filament\Resources\Memberships\Schemas;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class MembershipForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Dasar')
                    ->description('Informasi umum paket membership')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('nama')
                                    ->label('Nama Paket')
                                    ->placeholder('Contoh: PLATINUM')
                                    ->required()
                                    ->maxLength(255)
                                    ->columnSpan(1),

                                Select::make('jenis')
                                    ->label('Jenis Membership')
                                    ->reactive()
                                    ->options([
                                        'agen' => 'Agen',
                                        'developer' => 'Developer',
                                        'highlight' => 'Highlight',
                                    ])
                                    ->required()
                                    ->native(false)
                                    ->columnSpan(1),
                            ]),

                        Textarea::make('deskripsi')
                            ->label('Deskripsi')
                            ->placeholder('Deskripsi singkat paket membership')
                            ->rows(3)
                            ->columnSpanFull(),
                    ])
                    ->collapsible(),

                Section::make('Harga Paket')
                    ->description('Tentukan harga dan periode pembayaran')
                    ->schema([
                        Grid::make(3)
                            ->schema([
                                TextInput::make('harga.amount')
                                    ->label('Harga')
                                    ->numeric()
                                    ->prefix('Rp')
                                    ->placeholder('6000000')
                                    ->required()
                                    ->minValue(0)
                                    ->columnSpanFull(),

                                TextInput::make('harga.duration')
                                    ->label('Durasi')
                                    ->numeric()
                                    ->placeholder('1')
                                    ->required()
                                    ->minValue(1)
                                    ->visible(fn(callable $get) => $get('jenis') === 'highlight')
                                    ->columnSpan(1),

                                Select::make('harga.period')
                                    ->label('Periode')
                                    ->options([
                                        'day' => 'Hari',
                                        'month' => 'Bulan',
                                        'year' => 'Tahun',
                                    ])
                                    ->required()
                                    ->visible(fn(callable $get) => $get('jenis') === 'highlight')
                                    ->native(false)
                                    ->columnSpan(2),
                            ]),
                    ])
                    ->collapsible(),

                Section::make('Fitur Listing')
                    ->description('Kuota listing dan highlight untuk paket ini')
                    ->schema([
                        Grid::make(3)
                            ->visible(fn(callable $get) => $get('jenis') === 'developer' || $get('jenis') === 'agen')
                            ->schema([
                                TextInput::make('jumlah_listing.quantity')
                                    ->label('Jumlah Listing')
                                    ->numeric()
                                    ->placeholder('100')
                                    ->required()
                                    ->minValue(0)
                                    ->helperText('Jumlah listing yang tersedia')
                                    ->columnSpan(1),

                                TextInput::make('jumlah_listing.duration')
                                    ->label('Durasi')
                                    ->numeric()
                                    ->placeholder('1')
                                    ->required()
                                    ->minValue(1)
                                    ->columnSpan(1),

                                Select::make('jumlah_listing.period')
                                    ->label('Periode')
                                    ->options([
                                        'day' => 'Hari',
                                        'month' => 'Bulan',
                                        'year' => 'Tahun',
                                    ])
                                    ->placeholder('Periode')
                                    ->required()
                                    ->native(false)
                                    ->columnSpan(1),
                            ]),

                        Grid::make(3)
                            ->schema([
                                TextInput::make('jumlah_highlight.quantity')
                                    ->label('Jumlah Highlight')
                                    ->numeric()
                                    ->placeholder('30')
                                    ->required()
                                    ->minValue(0)
                                    ->helperText('Jumlah listing yang bisa di-highlight')
                                    ->columnSpan(1),

                                TextInput::make('jumlah_highlight.duration')
                                    ->label('Durasi')
                                    ->numeric()
                                    ->placeholder('7')
                                    ->required()
                                    ->minValue(1)
                                    ->columnSpan(1),

                                Select::make('jumlah_highlight.period')
                                    ->label('Periode')
                                    ->placeholder('Periode')
                                    ->options([
                                        'day' => 'Hari',
                                        'month' => 'Bulan',
                                        'year' => 'Tahun',
                                    ])
                                    ->required()
                                    ->native(false)
                                    ->columnSpan(1),
                            ]),

                        TextInput::make('jumlah_agent')
                            ->label('Jumlah Agent')
                            ->numeric()
                            ->placeholder('5')
                            ->required()
                            ->reactive()
                            ->minValue(0)
                            ->helperText('Jumlah agent yang dapat ditambahkan')
                            ->visible(fn(callable $get) => $get('jenis') === 'developer')
                            ->columnSpanFull(),
                    ])
                    ->collapsible(),

                Section::make('Fitur Iklan')
                    ->description('Kuota iklan popup dan banner')
                    ->visible(fn(callable $get) => $get('jenis') === 'developer')
                    ->reactive()
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('popup_ads.duration')
                                    ->label('Popup Ads - Durasi')
                                    ->numeric()
                                    ->placeholder('3')
                                    // ->required()
                                    ->minValue(0)
                                    ->columnSpan(1),

                                Select::make('popup_ads.period')
                                    ->label('Popup Ads - Periode')
                                    ->options([
                                        'day' => 'Hari',
                                        'month' => 'Bulan',
                                        'year' => 'Tahun',
                                    ])
                                    // ->required()
                                    ->native(false)
                                    ->columnSpan(1),
                            ]),

                        Grid::make(2)
                            ->schema([
                                TextInput::make('banner_ads.duration')
                                    ->label('Banner Ads - Durasi')
                                    ->numeric()
                                    ->placeholder('7')
                                    // ->required()
                                    ->minValue(0)
                                    ->columnSpan(1),

                                Select::make('banner_ads.period')
                                    ->label('Banner Ads - Periode')
                                    ->options([
                                        'day' => 'Hari',
                                        'month' => 'Bulan',
                                        'year' => 'Tahun',
                                    ])
                                    // ->required()
                                    ->native(false)
                                    ->columnSpan(1),
                            ]),
                    ])
                    ->collapsible(),
            ]);
    }
}