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

                // Jika bukan super_admin, filter berdasarkan agen
                if (!$user->hasRole('super_admin')) {
                    $agen = Agen::where('user_id', $user->id)->first();

                    if ($agen) {
                        $query->where('agen_id', $agen->id);
                    }
                }

                // Jika super_admin, tampilkan semua (no filter)
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

                TextColumn::make('agen.name')
                    ->label('Agent')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('purple')
                    ->placeholder('No Agent'),

                TextColumn::make('city')
                    ->label('City')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('info'),

                TextColumn::make('location')
                    ->searchable()
                    ->limit(30),

                TextColumn::make('price_min')
                    ->label('Price')
                    ->money('IDR')
                    ->sortable()
                    ->formatStateUsing(function ($record) {
                        if ($record->price_max && $record->price_min !== $record->price_max) {
                            return 'Rp ' . number_format($record->price_min / 1000000, 1) . ' Jt - Rp ' .
                                number_format($record->price_max / 1000000, 1) . ' Jt';
                        }
                        return 'Rp ' . number_format($record->price_min / 1000000, 1) . ' Jt';
                    }),

                TextColumn::make('bedrooms')
                    ->label('Bedrooms')
                    ->badge()
                    ->color('success'),

                TextColumn::make('count_clicked')
                    ->label('Views')
                    ->sortable()
                    ->badge()
                    ->color('info')
                    ->formatStateUsing(fn($state) => number_format($state ?? 0)),

                // Verification Status - for moderation
                IconColumn::make('is_verified')
                    ->label('Verified')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-badge')
                    ->falseIcon('heroicon-o-clock')
                    ->trueColor('success')
                    ->falseColor('warning')
                    ->sortable(),

                IconColumn::make('is_popular')
                    ->label('Popular')
                    ->boolean()
                    ->trueIcon('heroicon-o-star')
                    ->falseIcon('heroicon-o-star')
                    ->trueColor('warning')
                    ->falseColor('gray'),

                IconColumn::make('is_available')
                    ->label('Available')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),

                TextColumn::make('last_updated')
                    ->label('Last Updated')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                // Verification status filter (for moderation)
                TernaryFilter::make('is_verified')
                    ->label('Verification Status')
                    ->placeholder('All Listings')
                    ->trueLabel('Verified Only')
                    ->falseLabel('Pending Verification'),

                SelectFilter::make('City')
                    ->label('City')
                    ->multiple()
                    ->preload(),

                SelectFilter::make('agen_id')
                    ->label('Agent')
                    ->relationship('agen', 'name')
                    ->searchable()
                    ->preload(),

                SelectFilter::make('type')
                    ->options([
                        'Rumah Baru' => 'Rumah Baru',
                        'Rumah Second' => 'Rumah Second',
                        'Apartemen' => 'Apartemen',
                        'Ruko' => 'Ruko',
                        'Tanah' => 'Tanah',
                    ])
                    ->multiple(),

                TernaryFilter::make('is_popular')
                    ->label('Popular Properties')
                    ->placeholder('All Properties')
                    ->trueLabel('Popular Only')
                    ->falseLabel('Not Popular'),

                TernaryFilter::make('is_available')
                    ->label('Availability')
                    ->placeholder('All')
                    ->trueLabel('Available Only')
                    ->falseLabel('Not Available'),
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

