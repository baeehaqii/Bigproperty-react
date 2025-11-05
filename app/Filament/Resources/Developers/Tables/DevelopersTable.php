<?php

namespace App\Filament\Resources\Developers\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Filters\SelectFilter;
use App\Models\Property;
use Illuminate\Database\Eloquent\Builder;

class DevelopersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('logo')
                    ->label('Logo')
                    ->circular()
                    ->size(60)
                    ->defaultImageUrl(url('/images/default-developer.png')),

                TextColumn::make('name')
                    ->label('Nama Developer')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn ($record) => $record->pt)
                    ->icon('heroicon-o-building-office-2')
                    ->iconColor('primary')
                    ->wrap(),

                TextColumn::make('alamat')
                    ->label('Alamat')
                    ->searchable()
                    ->limit(50)
                    ->tooltip(fn ($record) => $record->alamat)
                    ->iconColor('gray')
                    ->wrap(),
                ToggleColumn::make('is_verified')
                    ->label('Terverifikasi')
                    ->alignCenter(),
                TextColumn::make('created_at')
                    ->label('Dibuat')
                    ->dateTime('d M Y')
                    ->sortable()
                    
                    ->icon('heroicon-o-clock'),

                TextColumn::make('updated_at')
                    ->label('Diperbarui')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    
                    ->since()
                    ->icon('heroicon-o-arrow-path'),
            ])
            ->filters([
                SelectFilter::make('has_properties')
                    ->label('Filter Property')
                    ->options([
                        'with' => 'Punya Property',
                        'without' => 'Belum Ada Property',
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query->when(
                            $data['value'] === 'with',
                            fn (Builder $query) => $query->whereNotNull('list_property')
                                ->whereRaw('JSON_LENGTH(COALESCE(list_property, "[]")) > 0')
                        )->when(
                            $data['value'] === 'without',
                            fn (Builder $query) => $query->where(function ($q) {
                                $q->whereNull('list_property')
                                    ->orWhereRaw('JSON_LENGTH(COALESCE(list_property, "[]")) = 0');
                            })
                        );
                    })
                    ->native(false),
            ])
            ->recordActions([
                ViewAction::make()
                    ->label('Lihat')
                    ->icon('heroicon-o-eye'),
                EditAction::make()
                    ->label('Edit')
                    ->icon('heroicon-o-pencil'),
                DeleteAction::make()
                    ->label('Hapus')
                    ->icon('heroicon-o-trash')
                    ->requiresConfirmation(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->label('Hapus Terpilih')
                        ->requiresConfirmation(),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->striped()
            ->paginated([10, 25, 50, 100])
            ->deferLoading()
            ->persistFiltersInSession()
            ->persistSortInSession()
            ->persistSearchInSession()
            ->emptyStateHeading('Belum ada developer')
            ->emptyStateDescription('Mulai tambahkan developer properti pertama Anda.')
            ->emptyStateIcon('heroicon-o-building-office-2')
            ->recordUrl(null);
    }
}