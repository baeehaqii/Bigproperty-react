<?php

namespace App\Filament\Resources\Properties\Tables;

use App\Models\Agen;
use App\Models\Event;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class PropertiesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(function ($query) {
                $user = auth()->user();
                if (!$user->hasRole('super_admin')) {
                    $agen = Agen::where('user_id', $user->id)->first();
                    if ($agen) {
                        $query->where('agen_id', $agen->id);
                    }
                }
                return $query;
            })
            ->columns([
                ImageColumn::make('main_image')
                    ->label('Image')
                    ->circular()
                    ->defaultImageUrl(url('/placeholder.svg')),

                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->wrap()
                    ->limit(40),

                // MENAMPILKAN KONDISI (BARU/BEKAS) DENGAN BADGE
                TextColumn::make('condition')
                    ->label('Kondisi')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'Baru' => 'success',
                        'Bekas' => 'warning',
                        default => 'gray',
                    }),

                TextColumn::make('city')
                    ->label('Kota')
                    ->badge()
                    ->color('info'),

                // MENAMPILKAN PROMO DARI RELASI (MANY TO MANY)
                TextColumn::make('promos.nama')
                    ->label('Promo Aktif')
                    ->badge()
                    ->color('danger')
                    ->separator(',')
                    ->limitList(2),

                TextColumn::make('price_min')
                    ->label('Harga')
                    ->money('IDR')
                    ->formatStateUsing(function ($record) {
                        if ($record->price_max && $record->price_min !== $record->price_max) {
                            return 'Rp ' . number_format($record->price_min / 1000000, 1) . ' Jt - Rp ' .
                                number_format($record->price_max / 1000000, 1) . ' Jt';
                        }
                        return 'Rp ' . number_format($record->price_min / 1000000, 1) . ' Jt';
                    }),

                // INFO LISTRIK & AIR
                TextColumn::make('listrik')
                    ->label('Listrik')
                    ->formatStateUsing(fn($state) => $state . ' VA')
                    ->description(fn($record) => "Air: " . $record->jenis_air)
                    ->toggleable(),

                TextColumn::make('count_clicked')
                    ->label('Views')
                    ->sortable()
                    ->badge()
                    ->color('info'),

                IconColumn::make('is_verified')
                    ->label('Status')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-badge')
                    ->falseIcon('heroicon-o-clock')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                // FILTER BERDASARKAN PROMO (RELASI)
                SelectFilter::make('promos')
                    ->label('Berdasarkan Promo')
                    ->relationship('promos', 'nama')
                    ->multiple()
                    ->preload(),

                SelectFilter::make('condition')
                    ->label('Kondisi Properti')
                    ->options([
                        'Baru' => 'Baru',
                        'Bekas' => 'Bekas',
                    ]),

                SelectFilter::make('listrik')
                    ->label('Daya Listrik')
                    ->options([
                        450 => '450 VA',
                        900 => '900 VA',
                        1300 => '1300 VA',
                        2200 => '2200 VA',
                        3500 => '3500 VA',
                        5500 => '5500 VA',
                        6600 => '6600 VA',
                    ]),

                SelectFilter::make('jenis_air')
                    ->label('Sumber Air')
                    ->options([
                        'PDAM' => 'PDAM',
                        'Sumur Bor' => 'Sumur Bor',
                        'Sumur Tanah' => 'Sumur Tanah',
                    ]),

                TernaryFilter::make('is_verified')
                    ->label('Verifikasi'),

                SelectFilter::make('agen_id')
                    ->label('Agent')
                    ->relationship('agen', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                // View/Preview action
                Action::make('preview')
                    ->label('Preview')
                    ->icon('heroicon-o-eye')
                    ->color('info')
                    ->url(fn($record) => url("/property/{$record->id}"))
                    ->openUrlInNewTab(),

                // Approve action (for pending listings)
                Action::make('approve')
                    ->label('Approve')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->visible(fn($record) => !$record->is_verified)
                    ->requiresConfirmation()
                    ->modalHeading('Approve Listing')
                    ->modalDescription('Are you sure you want to approve this listing? It will be visible to the public.')
                    ->action(function ($record) {
                        $record->update([
                            'is_verified' => true,
                            'last_updated' => now(),
                        ]);

                        Notification::make()
                            ->title('Listing Approved')
                            ->body("'{$record->name}' has been approved and is now visible to the public.")
                            ->success()
                            ->send();
                    }),

                // Reject action (for pending listings)
                Action::make('reject')
                    ->label('Reject')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn($record) => !$record->is_verified)
                    ->requiresConfirmation()
                    ->modalHeading('Reject Listing')
                    ->modalDescription('Are you sure you want to reject this listing? It will not be visible to the public.')
                    ->action(function ($record) {
                        $record->update([
                            'is_verified' => false,
                            'is_available' => false,
                            'last_updated' => now(),
                        ]);

                        Notification::make()
                            ->title('Listing Rejected')
                            ->body("'{$record->name}' has been rejected.")
                            ->danger()
                            ->send();
                    }),

                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    // Bulk Approve
                    BulkAction::make('bulk_approve')
                        ->label('Approve Selected')
                        ->icon('heroicon-o-check-badge')
                        ->color('success')
                        ->requiresConfirmation()
                        ->modalHeading('Approve Selected Listings')
                        ->modalDescription('Are you sure you want to approve all selected listings? They will be visible to the public.')
                        ->action(function (Collection $records) {
                            $count = 0;
                            $records->each(function ($record) use (&$count) {
                                if (!$record->is_verified) {
                                    $record->update([
                                        'is_verified' => true,
                                        'last_updated' => now(),
                                    ]);
                                    $count++;
                                }
                            });

                            Notification::make()
                                ->title('Listings Approved')
                                ->body("{$count} listings have been approved.")
                                ->success()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),

                    // Bulk Reject
                    BulkAction::make('bulk_reject')
                        ->label('Reject Selected')
                        ->icon('heroicon-o-x-circle')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->modalHeading('Reject Selected Listings')
                        ->modalDescription('Are you sure you want to reject all selected listings?')
                        ->action(function (Collection $records) {
                            $count = 0;
                            $records->each(function ($record) use (&$count) {
                                if (!$record->is_verified) {
                                    $record->update([
                                        'is_verified' => false,
                                        'is_available' => false,
                                        'last_updated' => now(),
                                    ]);
                                    $count++;
                                }
                            });

                            Notification::make()
                                ->title('Listings Rejected')
                                ->body("{$count} listings have been rejected.")
                                ->danger()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),

                    DeleteBulkAction::make(),

                    BulkAction::make('mark_popular')
                        ->label('Mark as Popular')
                        ->icon('heroicon-o-star')
                        ->color('warning')
                        ->action(fn($records) => $records->each->update(['is_popular' => true]))
                        ->deselectRecordsAfterCompletion(),

                    BulkAction::make('assign_to_active_event')
                        ->label('Assign to Active Event')
                        ->icon('heroicon-o-calendar')
                        ->color('primary')
                        ->requiresConfirmation()
                        ->modalHeading('Assign Properties to Active Event')
                        ->modalDescription('This will assign all selected properties to the currently active event.')
                        ->modalSubmitActionLabel('Assign')
                        ->action(function ($records) {
                            // Cari event yang aktif
                            $activeEvent = Event::where('is_active', true)->first();

                            // Jika tidak ada event aktif, tampilkan notifikasi error
                            if (!$activeEvent) {
                                Notification::make()
                                    ->title('No Active Event')
                                    ->body('There is no active event available. Please activate an event first.')
                                    ->danger()
                                    ->send();
                                return;
                            }

                            // Update semua property yang dipilih dengan event_id aktif
                            $records->each->update(['event_id' => $activeEvent->id]);

                            // Tampilkan notifikasi sukses
                            Notification::make()
                                ->title('Properties Assigned Successfully')
                                ->body("Successfully assigned {$records->count()} properties to event: {$activeEvent->name}")
                                ->success()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),
                ]),

            ]);
    }
}

