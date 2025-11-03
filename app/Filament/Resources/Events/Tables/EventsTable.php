<?php

namespace App\Filament\Resources\Events\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Notifications\Notification;

class EventsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('banner')
                    ->label('Gambar Banner')
                    ->circular()
                    ->defaultImageUrl(url('/images/placeholder.jpg'))
                    ->size(60),
                TextColumn::make('name')
                    ->label('Nama Event')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->color('primary')
                    ->description(fn ($record) => \Illuminate\Support\Str::limit(strip_tags($record->description), 100))
                    ->wrap(),

                TextColumn::make('periode')
                    ->label('Periode Event')
                    ->getStateUsing(function ($record) {
                        return \Carbon\Carbon::parse($record->start_date)->format('d M Y') . ' - ' . 
                               \Carbon\Carbon::parse($record->end_date)->format('d M Y');
                    })
                    ->icon('heroicon-o-calendar-days')
                    ->color('info')
                    ->wrap(),

                TextColumn::make('duration')
                    ->label('Durasi')
                    ->getStateUsing(function ($record) {
                        $start = \Carbon\Carbon::parse($record->start_date);
                        $end = \Carbon\Carbon::parse($record->end_date);
                        $days = $start->diffInDays($end) + 1;
                        return $days . ' hari';
                    })
                    ->icon('heroicon-o-clock')
                    ->color('gray')
                    ->alignCenter(),

                TextColumn::make('properties_count')
                    ->label('Jumlah Property')
                    ->counts('properties')
                    ->badge()
                    ->color('info')
                    ->icon('heroicon-o-building-office-2')
                    ->sortable()
                    ->alignCenter()
                    ->suffix(' property'),

                ToggleColumn::make('is_active')
                    ->label('Status Aktif')
                    ->alignCenter()
                    ->disabled(fn ($record) => \Carbon\Carbon::parse($record->end_date)->lt(now()))
                    ->beforeStateUpdated(function ($record, $state) {
                        // Jika akan diaktifkan, nonaktifkan semua event lain
                        if ($state) {
                            // Cek apakah event sudah selesai
                            if (\Carbon\Carbon::parse($record->end_date)->lt(now())) {
                                Notification::make()
                                    ->warning()
                                    ->title('Event Sudah Selesai')
                                    ->body('Event yang sudah melewati tanggal berakhir tidak dapat diaktifkan.')
                                    ->send();
                                return false;
                            }
                            
                            // Nonaktifkan semua event lain
                            \App\Models\Event::where('id', '!=', $record->id)
                                ->update(['is_active' => false]);
                            
                            Notification::make()
                                ->success()
                                ->title('Event Diaktifkan')
                                ->body('Event "' . $record->name . '" berhasil diaktifkan. Event lain telah dinonaktifkan.')
                                ->send();
                        }
                    })
                    ->afterStateUpdated(function ($record, $state) {
                        if ($state) {
                            Notification::make()
                                ->success()
                                ->title('Event Aktif')
                                ->body('Event "' . $record->name . '" sekarang menjadi event aktif.')
                                ->send();
                        }
                    }),

                TextColumn::make('status')
                    ->label('Status Event')
                    ->badge()
                    ->getStateUsing(function ($record) {
                        $now = now();
                        $start = \Carbon\Carbon::parse($record->start_date);
                        $end = \Carbon\Carbon::parse($record->end_date);

                        if ($now->lt($start)) {
                            return 'Akan Datang';
                        } elseif ($now->between($start, $end)) {
                            return 'Berlangsung';
                        } else {
                            return 'Selesai';
                        }
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'Akan Datang' => 'warning',
                        'Berlangsung' => 'success',
                        'Selesai' => 'danger',
                    })
                    ->icon(fn (string $state): string => match ($state) {
                        'Akan Datang' => 'heroicon-o-clock',
                        'Berlangsung' => 'heroicon-o-check-circle',
                        'Selesai' => 'heroicon-o-x-circle',
                    })
                    ->alignCenter(),

                TextColumn::make('created_at')
                    ->label('Dibuat')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->color('gray'),

                TextColumn::make('updated_at')
                    ->label('Diperbarui')
                    ->dateTime('d M Y, H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->color('gray'),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Status Event')
                    ->options([
                        'upcoming' => 'Akan Datang',
                        'ongoing' => 'Berlangsung',
                        'finished' => 'Selesai',
                    ])
                    ->query(function (Builder $query, array $data) {
                        if (!isset($data['value']) || $data['value'] === null) {
                            return $query;
                        }

                        return match ($data['value']) {
                            'upcoming' => $query->where('start_date', '>', now()),
                            'ongoing' => $query->where('start_date', '<=', now())
                                              ->where('end_date', '>=', now()),
                            'finished' => $query->where('end_date', '<', now()),
                            default => $query,
                        };
                    }),

                Filter::make('is_active')
                    ->label('Event Aktif')
                    ->query(fn (Builder $query): Builder => $query->where('is_active', true))
                    ->toggle(),

                Filter::make('has_properties')
                    ->label('Memiliki Property')
                    ->query(fn (Builder $query): Builder => $query->has('properties'))
                    ->toggle(),

                Filter::make('date_range')
                    ->form([
                        \Filament\Forms\Components\DatePicker::make('start_from')
                            ->label('Mulai Dari')
                            ->native(false),
                        \Filament\Forms\Components\DatePicker::make('start_until')
                            ->label('Mulai Sampai')
                            ->native(false),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['start_from'] ?? null,
                                fn (Builder $query, $date): Builder => $query->whereDate('start_date', '>=', $date),
                            )
                            ->when(
                                $data['start_until'] ?? null,
                                fn (Builder $query, $date): Builder => $query->whereDate('start_date', '<=', $date),
                            );
                    })
                    ->indicateUsing(function (array $data): array {
                        $indicators = [];
                        if ($data['start_from'] ?? null) {
                            $indicators[] = 'Mulai dari: ' . \Carbon\Carbon::parse($data['start_from'])->format('d M Y');
                        }
                        if ($data['start_until'] ?? null) {
                            $indicators[] = 'Mulai sampai: ' . \Carbon\Carbon::parse($data['start_until'])->format('d M Y');
                        }
                        return $indicators;
                    }),
            ])
            ->recordActions([
                EditAction::make()
                    ->color('warning'),
                DeleteAction::make()
                    ->requiresConfirmation()
                    ->color('danger'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->requiresConfirmation(),
                ]),
            ])
            ->defaultSort('start_date', 'desc')
            ->striped()
            ->paginated([10, 25, 50, 100])
            ->emptyStateHeading('Belum Ada Event')
            ->emptyStateDescription('Mulai buat event pertama Anda untuk menampilkan property dalam event tersebut.')
            ->emptyStateIcon('heroicon-o-calendar-days');
    }
}