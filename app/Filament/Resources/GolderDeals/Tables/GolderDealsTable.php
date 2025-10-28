<?php

namespace App\Filament\Resources\GolderDeals\Tables;

use App\Models\GoldenDealsProperty;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class GolderDealsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('image')
                    ->label('Gambar')
                    ->circular()
                    ->size(60),

                TextColumn::make('property_name')
                    ->label('Properti')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn (GoldenDealsProperty $record): string => 
                        $record->developer->name ?? '-'
                    )
                    ->icon('heroicon-o-home')
                    ->iconColor('primary'),

                BadgeColumn::make('type')
                    ->label('Tipe')
                    ->colors([
                        'success' => 'Rumah Baru',
                        'info' => 'Apartemen',
                        'warning' => 'Kavling',
                    ])
                    ->icons([
                        'heroicon-o-home' => 'Rumah Baru',
                        'heroicon-o-building-office-2' => 'Apartemen',
                        'heroicon-o-map' => 'Kavling',
                    ]),

                BadgeColumn::make('badge')
                    ->label('Badge')
                    ->color('warning')
                    ->icon('heroicon-o-star')
                    ->placeholder('-'),

                TextColumn::make('price_range_formatted')
                    ->label('Harga')
                    ->money('IDR', locale: 'id')
                    ->description(fn (GoldenDealsProperty $record): string => 
                        $record->installment_formatted
                    )
                    ->icon('heroicon-o-currency-dollar')
                    ->iconColor('success'),

                TextColumn::make('location_full')
                    ->label('Lokasi')
                    ->searchable(['location_district', 'location_city'])
                    ->icon('heroicon-o-map-pin')
                    ->iconColor('danger')
                    ->wrap(),

                TextColumn::make('bedrooms')
                    ->label('Spesifikasi')
                    ->description(fn (GoldenDealsProperty $record): string => 
                        $record->land_size . ' • ' . $record->building_size
                    )
                    ->icon('heroicon-o-squares-2x2'),

                BadgeColumn::make('status')
                    ->label('Status')
                    ->colors([
                        'success' => 'active',
                        'danger' => 'inactive',
                    ])
                    ->icons([
                        'heroicon-o-check-circle' => 'active',
                        'heroicon-o-x-circle' => 'inactive',
                    ]),

                // TextColumn::make('updated_at')
                //     ->label('Update Terakhir')
                //     ->dateTime('d M Y, H:i')
                //     ->sortable()
                //     ->since()
                //     ->description(fn (GoldenDealsProperty $record): string => 
                //         'Dibuat ' . $record->created_at->diffForHumans()
                //     ),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
