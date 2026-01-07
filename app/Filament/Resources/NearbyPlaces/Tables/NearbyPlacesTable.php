<?php

namespace App\Filament\Resources\NearbyPlaces\Tables;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Actions\EditAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;

class NearbyPlacesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nama')
                    ->label('Nama Lokasi')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('kategori')
                    ->label('Kategori')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'Transportasi' => 'info',
                        'Pendidikan'   => 'success',
                        'Kesehatan'    => 'danger',
                        'Perbelanjaan' => 'warning',
                        default => 'gray',
                    })
                    ->searchable(),

                TextColumn::make('properties_count')
                    ->counts('properties')
                    ->label('Digunakan di')
                    ->badge()
                    ->color('gray')
                    ->suffix(' Properti'),
            ])
            ->filters([])
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