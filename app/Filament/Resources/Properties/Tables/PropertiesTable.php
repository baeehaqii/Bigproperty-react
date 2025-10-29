<?php

namespace App\Filament\Resources\Properties\Tables;

use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class PropertiesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('main_image')
                    ->label('Image')
                    ->circular()
                    ->defaultImageUrl(url('/placeholder.svg')),
                
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->wrap(),
                
                TextColumn::make('developer.name')
                    ->label('Developer')
                    ->searchable()
                    ->sortable()
                    ,
                
                TextColumn::make('city')
                    ->label('City')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('info'),
                
                TextColumn::make('location')
                    ->searchable()
                    
                    ->limit(30),
                
                TextColumn::make('price_min')
                    ->label('Price')
                    ->money('IDR')
                    ->sortable()
                    ->formatStateUsing(function ($record) {
                        if ($record->price_max && $record->price_min !== $record->price_max) {
                            return 'Rp ' . number_format($record->price_min / 1000000, 1) . ' Jt - Rp ' . 
                                   number_format($record->price_max / 1000000, 1) . ' Jt';
                        }
                        return 'Rp ' . number_format($record->price_min / 1000000, 1) . ' Jt';
                    }),
                
                TextColumn::make('bedrooms')
                    ->label('Bedrooms')
                    ->badge()
                    ->color('success'),
                
                TextColumn::make('units_remaining')
                    ->label('Units Left')
                    ->badge()
                    ->color(fn ($state) => $state && $state < 5 ? 'danger' : 'warning')
                    ->formatStateUsing(fn ($state) => $state ? "{$state} units" : 'N/A')
                    ,
                
                IconColumn::make('is_popular')
                    ->label('Popular')
                    ->boolean()
                    ->trueIcon('heroicon-o-star')
                    ->falseIcon('heroicon-o-star')
                    ->trueColor('warning')
                    ->falseColor('gray')
                    ,
                
                IconColumn::make('is_available')
                    ->label('Available')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),
                
                TextColumn::make('type')
                    ->badge()
                    ->color('primary')
                    ,
                
                TextColumn::make('last_updated')
                    ->label('Last Updated')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ,
                
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ,
            ])
            ->filters([
                SelectFilter::make('City')
                    ->label('City')
                    ->multiple()
                    ->preload(),
                
                SelectFilter::make('developer_id')
                    ->label('Developer')
                    ->relationship('developer', 'name')
                    ->multiple()
                    ->preload(),
                
                SelectFilter::make('type')
                    ->options([
                        'Rumah Baru' => 'Rumah Baru',
                        'Rumah Second' => 'Rumah Second',
                        'Apartemen' => 'Apartemen',
                        'Ruko' => 'Ruko',
                        'Tanah' => 'Tanah',
                    ])
                    ->multiple(),
                
                TernaryFilter::make('is_popular')
                    ->label('Popular Properties')
                    ->placeholder('All Properties')
                    ->trueLabel('Popular Only')
                    ->falseLabel('Not Popular'),
                
                TernaryFilter::make('is_available')
                    ->label('Availability')
                    ->placeholder('All')
                    ->trueLabel('Available Only')
                    ->falseLabel('Not Available'),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                    BulkAction::make('mark_popular')
                        ->label('Mark as Popular')
                        ->icon('heroicon-o-star')
                        ->color('warning')
                        ->action(fn ($records) => $records->each->update(['is_popular' => true]))
                        ->deselectRecordsAfterCompletion(),
                    
                   BulkAction::make('mark_available')
                        ->label('Mark as Available')
                        ->icon('heroicon-o-check-circle')
                        ->color('success')
                        ->action(fn ($records) => $records->each->update(['is_available' => true]))
                        ->deselectRecordsAfterCompletion(),
                ]),
               
            ]);
    }
}
