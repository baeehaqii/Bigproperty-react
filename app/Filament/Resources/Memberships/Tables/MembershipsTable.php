<?php

namespace App\Filament\Resources\Memberships\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class MembershipsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nama')
                    ->label('Nama Paket')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->size('sm'),

                BadgeColumn::make('jenis')
                    ->label('Jenis')
                    ->colors([
                        'primary' => 'agen',
                        'success' => 'developer',
                        'warning' => 'highlight',
                    ])
                    ->formatStateUsing(fn (string $state): string => ucfirst($state))
                    ->sortable(),

                TextColumn::make('price_display') // ← GANTI INI (bukan 'harga')
                    ->label('Harga')
                    ->state(function ($record) {
                        if (!$record->harga || !is_array($record->harga)) {
                            return '-';
                        }
                        
                        $amount = $record->harga['amount'] ?? 0;
                        $duration = $record->harga['duration'] ?? 1;
                        $period = $record->harga['period'] ?? 'year';
                        
                        if ($amount <= 0) {
                            return '-';
                        }
                        
                        $formattedAmount = number_format($amount, 0, ',', '.');
                        $periodText = match($period) {
                            'day' => 'hr',
                            'month' => 'bln',
                            'year' => 'thn',
                            default => 'thn'
                        };
                        
                        return "Rp {$formattedAmount}/{$duration}{$periodText}";
                    })
                    ->size('sm'),

                TextColumn::make('listing_display') // ← GANTI INI (bukan 'jumlah_listing')
                    ->label('Listing')
                    ->state(function ($record) {
                        if (!$record->jumlah_listing || !is_array($record->jumlah_listing)) {
                            return '-';
                        }
                        
                        $quantity = $record->jumlah_listing['quantity'] ?? 0;
                        $duration = $record->jumlah_listing['duration'] ?? 1;
                        $period = $record->jumlah_listing['period'] ?? 'year';
                        
                        $periodText = match($period) {
                            'day' => 'hr',
                            'month' => 'bln',
                            'year' => 'thn',
                            default => 'thn'
                        };
                        
                        return "{$quantity}/{$duration}{$periodText}";
                    })
                    ->alignCenter()
                    ->size('sm'),

                TextColumn::make('highlight_display') // ← GANTI INI (bukan 'jumlah_highlight')
                    ->label('Highlight')
                    ->state(function ($record) {
                        if (!$record->jumlah_highlight || !is_array($record->jumlah_highlight)) {
                            return '-';
                        }
                        
                        $quantity = $record->jumlah_highlight['quantity'] ?? 0;
                        $duration = $record->jumlah_highlight['duration'] ?? 1;
                        $period = $record->jumlah_highlight['period'] ?? 'day';
                        
                        $periodText = match($period) {
                            'day' => 'hr',
                            'month' => 'bln',
                            'year' => 'thn',
                            default => 'hr'
                        };
                        
                        return "{$quantity}/{$duration}{$periodText}";
                    })
                    ->alignCenter()
                    ->size('sm'),

                TextColumn::make('jumlah_agent')
                    ->label('Agent')
                    ->alignCenter()
                    ->sortable()
                    ->size('sm')
                    ->formatStateUsing(fn ($state) => $state ?: 0),

                TextColumn::make('popup_display') // ← GANTI INI (bukan 'popup_ads')
                    ->label('Popup Ads')
                    ->state(function ($record) {
                        if (!$record->popup_ads || !is_array($record->popup_ads)) {
                            return '-';
                        }
                        
                        $duration = $record->popup_ads['duration'] ?? 0;
                        $period = $record->popup_ads['period'] ?? 'day';
                        
                        if ($duration <= 0) {
                            return '-';
                        }
                        
                        $periodText = match($period) {
                            'day' => 'hr',
                            'month' => 'bln',
                            'year' => 'thn',
                            default => 'hr'
                        };
                        
                        return "{$duration}{$periodText}";
                    })
                    ->alignCenter()
                    ->size('sm'),

                TextColumn::make('banner_display') // ← GANTI INI (bukan 'banner_ads')
                    ->label('Banner Ads')
                    ->state(function ($record) {
                        if (!$record->banner_ads || !is_array($record->banner_ads)) {
                            return '-';
                        }
                        
                        $duration = $record->banner_ads['duration'] ?? 0;
                        $period = $record->banner_ads['period'] ?? 'day';
                        
                        if ($duration <= 0) {
                            return '-';
                        }
                        
                        $periodText = match($period) {
                            'day' => 'hr',
                            'month' => 'bln',
                            'year' => 'thn',
                            default => 'hr'
                        };
                        
                        return "{$duration}{$periodText}";
                    })
                    ->alignCenter()
                    ->size('sm'),

                TextColumn::make('created_at')
                    ->label('Dibuat')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->size('sm'),

                TextColumn::make('updated_at')
                    ->label('Diupdate')
                    ->dateTime('d M Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->size('sm'),
            ])
            ->filters([
                SelectFilter::make('jenis')
                    ->label('Jenis Membership')
                    ->options([
                        'agen' => 'Agen',
                        'developer' => 'Developer',
                        'highlight' => 'Highlight',
                    ])
                    ->multiple()
                    ->native(false),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->striped()
            ->emptyStateHeading('Belum ada paket membership')
            ->emptyStateDescription('Klik tombol "New" untuk membuat paket membership baru')
            ->emptyStateIcon('heroicon-o-ticket');
    }
}