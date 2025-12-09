<?php

namespace App\Filament\Resources\Users\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('username')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('firstname')
                    ->searchable()
                    ->sortable()
                    ->label('First Name'),
                TextColumn::make('lastname')
                    ->searchable()
                    ->sortable()
                    ->label('Last Name'),
                TextColumn::make('email')
                    ->label('Email address')
                    ->searchable()
                    ->sortable(),
                    
                // FIX: Handle kalo roles kosong
                TextColumn::make('roles.name')
                    ->label('Roles')
                    ->badge()
                    ->searchable()
                    ->default('No Role') // Kalo kosong, tampilkan "No Role"
                    ->separator(','), // Kalo multiple roles, pisahin pake koma
                    
                TextColumn::make('email_verified_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                    
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
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
            ])
            ->defaultSort('created_at', 'desc');
    }
}