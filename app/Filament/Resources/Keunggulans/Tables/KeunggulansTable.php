<?php

namespace App\Filament\Resources\Keunggulans\Tables;

use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Actions\EditAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;

class KeunggulansTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('icon')
                    ->label('Icon')
                    ->html()
                    ->formatStateUsing(fn (string $state): string => 
                        "<i class='fi {$state} text-amber-500 text-2xl'></i>"
                    )
                    ->width('50px'),

                TextColumn::make('nama')
                    ->label('Nama Keunggulan')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('keterangan')
                    ->label('Keterangan')
                    ->limit(50)
                    ->wrap()
                    ->color('gray'),
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