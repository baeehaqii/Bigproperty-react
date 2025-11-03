<?php

namespace App\Filament\Resources\Heroes\Tables;

use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Tables;
use Filament\Tables\Table;

class HeroesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->label('Gambar')
                    ->getStateUsing(function ($record) {
                        if (!$record->image || !is_array($record->image)) {
                            return [];
                        }
                        
                        // Generate full URL untuk setiap image
                        return collect($record->image)->map(function ($path) {
                            // Kalau udah full URL, return aja
                            if (filter_var($path, FILTER_VALIDATE_URL)) {
                                return $path;
                            }
                            
                            // Generate URL: /storage/heroes/filename.jpg
                            return asset('storage/' . $path);
                        })->toArray();
                    })
                    ->circular()
                    ->stacked()
                    ->limit(3)
                    ->limitedRemainingText()
                    ->ring(2)
                    ->defaultImageUrl(url('/images/placeholder.jpg'))
                    ->size(60),

                Tables\Columns\TextColumn::make('title')
                    ->label('Judul')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->placeholder('Tidak ada judul')
                    ->limit(50)
                    ->tooltip(function (Tables\Columns\TextColumn $column): ?string {
                        $state = $column->getState();
                        if (strlen($state) <= 50) {
                            return null;
                        }
                        return $state;
                    }),

                Tables\Columns\TextColumn::make('subtitle')
                    ->label('Subtitle')
                    ->searchable()
                    ->limit(40)
                    ->placeholder('Tidak ada subtitle')
                    ->color('gray')
                    ->toggleable(isToggledHiddenByDefault: false),

                Tables\Columns\ColorColumn::make('main_color')
                    ->label('Warna')
                    ->copyable()
                    ->copyMessage('Warna berhasil disalin!')
                    ->toggleable(),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->sortable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('link_text')
                    ->label('CTA Button')
                    ->badge()
                    ->color('info')
                    ->placeholder('Tidak ada CTA')
                    ->icon('heroicon-o-cursor-arrow-ripple')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('link_url')
                    ->label('Link URL')
                    ->url(fn ($record) => $record->link_url)
                    ->openUrlInNewTab()
                    ->icon('heroicon-o-link')
                    ->limit(30)
                    ->placeholder('Tidak ada link')
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Dibuat')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Diperbarui')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->since()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('deleted_at')
                    ->label('Dihapus')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                
            ])
            ->recordActions([
                ActionGroup::make([
                    EditAction::make(),
                ])
                ->icon('heroicon-m-ellipsis-vertical')
                ->tooltip('Actions'),
            ])
            ->bulkActions([
            ])
            ->striped()
            ->emptyStateHeading('Belum ada hero banner')
            ->emptyStateDescription('Buat hero banner pertama Anda untuk memulai')
            ->emptyStateIcon('heroicon-o-photo')
            ->persistFiltersInSession()
            ->persistSearchInSession()
            ->persistColumnSearchesInSession();
    }
}