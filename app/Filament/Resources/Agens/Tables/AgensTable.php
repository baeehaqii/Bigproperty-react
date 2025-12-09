<?php

namespace App\Filament\Resources\Agens\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ForceDeleteBulkAction;
use Filament\Actions\RestoreBulkAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\Layout\Split;
use Filament\Tables\Columns\Layout\Stack;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class AgensTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                
                // Foto Profil (Bulet & Gede)
                ImageColumn::make('photo')
                    ->label('Foto')
                    ->circular() // Bikin bulet bro!
                    ->size(60)
                    ->defaultImageUrl(url('/images/default-avatar.png'))
                    ->extraAttributes(['class' => 'shadow-lg']),

                // Nama & Jabatan (Stack)
                TextColumn::make('name')
                        ->label('Nama')
                        ->searchable()
                        ->sortable()
                        ->weight('bold')
                        ->size('base')
                        ->copyable()
                        ->tooltip('Klik untuk copy'),

                // Developer
                TextColumn::make('developer.name')
                    ->label('Developer')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('success')
                    ->icon('heroicon-m-building-office-2'),

                // Email & Phone (Stack)
                TextColumn::make('email')
                        ->label('Email')
                        ->searchable()
                        ->icon('heroicon-m-envelope')
                        ->iconColor('gray')
                        ->copyable()
                        ->tooltip('Klik untuk copy'),

                TextColumn::make('phone')
                    ->label('WhatsApp')
                    ->searchable()
                    ->icon('heroicon-m-phone')
                    ->iconColor('gray')
                    ->url(fn ($record) => $record->whatsapp_link)
                    ->openUrlInNewTab(false),

                // WhatsApp
                TextColumn::make('sumber')
                    ->label('Sumber Informasi')
                    ->searchable()
                    ->badge(),

                // Status Aktif
                IconColumn::make('is_active')
                    ->label('Status')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger')
                    ->sortable()
                    ->tooltip(fn ($record) => $record->is_active ? 'Aktif' : 'Nonaktif'),

                // Tanggal Dibuat
                TextColumn::make('created_at')
                    ->label('Terdaftar')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->icon('heroicon-m-calendar'),

                // Tanggal Update
                TextColumn::make('updated_at')
                    ->label('Terakhir Update')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->since()
                    ->icon('heroicon-m-clock'),

            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                
                // Filter Soft Delete
                TrashedFilter::make()
                    ->label('Status Hapus')
                    ->placeholder('Semua Data')
                    ->trueLabel('Hanya yang Dihapus')
                    ->falseLabel('Tanpa yang Dihapus')
                    ->native(false),

                // Filter Developer
                SelectFilter::make('developer_id')
                    ->label('Developer')
                    ->relationship('developer', 'name')
                    ->searchable()
                    ->preload()
                    ->multiple()
                    ->placeholder('Semua Developer'),

                // Filter Status Aktif
                TernaryFilter::make('is_active')
                    ->label('Status Aktif')
                    ->placeholder('Semua Status')
                    ->trueLabel('Hanya Aktif')
                    ->falseLabel('Hanya Nonaktif')
                    ->native(false),

                // Filter Punya WhatsApp
                TernaryFilter::make('has_whatsapp')
                    ->label('Punya WhatsApp')
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('whatsapp'),
                        false: fn ($query) => $query->whereNull('whatsapp'),
                    )
                    ->placeholder('Semua')
                    ->trueLabel('Punya WhatsApp')
                    ->falseLabel('Tidak Punya WhatsApp')
                    ->native(false),

            ])
            ->recordActions([
                ViewAction::make()
                    ->label('Lihat')
                    ->icon('heroicon-m-eye')
                    ->color('info'),
                    
                EditAction::make()
                    ->label('Edit')
                    ->icon('heroicon-m-pencil-square')
                    ->color('warning'),
                DeleteAction::make(),

            ])
            ->toolbarActions([
                
            ])
            ->emptyStateHeading('Belum Ada Agen')
            ->emptyStateDescription('Mulai tambahkan agen/marketing untuk developer Anda.')
            ->emptyStateIcon('heroicon-o-user-group')
            ->striped()
            ->paginated([10, 25, 50, 100]);
    }
}