<?php

namespace App\Filament\Resources\Visitors\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Actions\ActionGroup;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class VisitorsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('photo')
                    ->label('Foto')
                    ->circular()
                    ->defaultImageUrl(url('/images/default-avatar.png'))
                    ->size(50)
                    ->alignCenter(),

                TextColumn::make('nama')
                    ->label('Nama Lengkap')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->icon('heroicon-o-user')
                    ->copyable()
                    ->copyMessage('Nama berhasil disalin!')
                    ->description(fn ($record) => $record->ktp)
                    ->wrap(),

                TextColumn::make('ktp')
                    ->label('No. KTP')
                    ->searchable()
                    ->toggleable()
                    ->copyable()
                    ->icon('heroicon-o-identification')
                    ->formatStateUsing(fn ($state) => chunk_split($state, 4, ' '))
                    ->fontFamily('mono'),

                TextColumn::make('no_wa')
                    ->label('WhatsApp')
                    ->searchable()
                    ->icon('heroicon-o-phone')
                    ->copyable()
                    ->formatStateUsing(fn ($state) => '+62 ' . $state)
                    ->color('success')
                    ->url(fn ($record) => 'https://wa.me/62' . $record->no_wa)
                    ->openUrlInNewTab(),

                TextColumn::make('sumber')
                    ->label('Sumber')
                    ->badge()
                    ->searchable()
                    ->sortable()
                    ->colors([
                        'primary' => 'walk_in',
                        'success' => 'referral',
                        'info' => 'online',
                        'warning' => 'social_media',
                        'danger' => 'iklan',
                        'gray' => 'event',
                        'secondary' => 'lainnya',
                    ])
                    ->formatStateUsing(fn ($state) => match($state) {
                        'walk_in' => '🚶 Walk In',
                        'referral' => '👥 Referral',
                        'online' => '💻 Online',
                        'social_media' => '📱 Social Media',
                        'iklan' => '📢 Iklan',
                        'event' => '🎪 Event',
                        'lainnya' => '📋 Lainnya',
                        default => $state,
                    }),

                TextColumn::make('created_at')
                    ->label('Terdaftar')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: false)
                    ->icon('heroicon-o-clock')
                    ->description(fn ($record) => $record->created_at->diffForHumans()),

                TextColumn::make('updated_at')
                    ->label('Update Terakhir')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->since(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('sumber')
                    ->label('Filter Sumber')
                    ->multiple()
                    ->options([
                        'walk_in' => '🚶 Walk In',
                        'referral' => '👥 Referral',
                        'online' => '💻 Online',
                        'social_media' => '📱 Social Media',
                        'iklan' => '📢 Iklan',
                        'event' => '🎪 Event',
                        'lainnya' => '📋 Lainnya',
                    ])
                    ->indicator('Sumber'),
            ])
            ->recordActions([
                \Filament\Actions\ActionGroup::make([
                    ViewAction::make()
                        ->icon('heroicon-o-eye')
                        ->color('info'),
                    EditAction::make()
                        ->icon('heroicon-o-pencil')
                        ->color('warning'),
                    DeleteBulkAction::make()
                        ->icon('heroicon-o-trash')
                        ->color('danger'),
                ])
                ->icon('heroicon-m-ellipsis-vertical')
                ->tooltip('Actions'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('Belum ada pengunjung')
            ->emptyStateDescription('Mulai tambahkan data pengunjung pertama Anda.')
            ->emptyStateIcon('heroicon-o-users');
    }
}