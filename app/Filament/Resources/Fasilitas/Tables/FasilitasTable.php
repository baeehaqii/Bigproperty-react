<?php

namespace App\Filament\Resources\Fasilitas\Tables;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Actions\EditAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;

class FasilitasTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nama')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('icon')
                    ->label('Preview Icon')
                    ->html() // PENTING: Agar class fi-rr dirender sebagai icon
                    ->formatStateUsing(fn (string $state): string => 
                        "<div class='flex items-center gap-2'>
                            <i class='fi {$state} text-primary-600 text-2xl'></i>
                         </div>"
                    ),
                
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