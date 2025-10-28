<?php

namespace App\Filament\Resources\PropertyCategories\Tables;

use App\Models\PropertyCategory;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class PropertyCategoriesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Nama')
                    ->searchable()
                    ->sortable(),
                
                BadgeColumn::make('section')
                    ->label('Section')
                    ->formatStateUsing(fn (string $state): string => match($state) {
                        'buy' => 'Beli',
                        'rent' => 'Sewa',
                        'listing' => 'Listing',
                        default => $state,
                    })
                    ->colors([
                        'primary' => 'buy',
                        'success' => 'rent',
                        'warning' => 'listing',
                    ]),
                
                TextColumn::make('icon')
                    ->label('Icon')
                    ->searchable(),
                
                IconColumn::make('is_highlighted')
                    ->label('Highlight')
                    ->boolean(),
                
                TextColumn::make('order')
                    ->label('Urutan')
                    ->sortable()
                    ->alignCenter(),
                
                IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean()
                    ->sortable(),
                
                TextColumn::make('created_at')
                    ->label('Dibuat')
                    ->dateTime('d M Y H:i')
                    ->sortable()
            ])
            
            ->defaultSort('section')
            ->defaultSort('order')
            ->filters([
                SelectFilter::make('section')
                    ->label('Section')
                    ->options([
                        'buy' => 'Beli Properti',
                        'rent' => 'Sewa Properti',
                        'listing' => 'Titip Jual & Sewa',
                    ]),
                
                TernaryFilter::make('is_highlighted')
                    ->label('Highlighted'),
                
                TernaryFilter::make('is_active')
                    ->label('Status Aktif'),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
