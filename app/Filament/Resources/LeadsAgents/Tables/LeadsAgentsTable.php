<?php

namespace App\Filament\Resources\LeadsAgents\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class LeadsAgentsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nama_lengkap')
                    ->label('Nama')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('no_whatsapp')
                    ->label('No. HP/WA')
                    ->searchable()
                    ->copyable()
                    ->copyMessage('Nomor disalin!'),
                TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->toggleable(),
                TextColumn::make('listing_source')
                    ->label('Dari Listing')
                    ->searchable()
                    ->limit(30),
                TextColumn::make('property.name')
                    ->label('Properti')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('agent.name')
                    ->label('Agent')
                    ->sortable(),
                TextColumn::make('status_lead')
                    ->label('Status Lead')
                    ->badge()
                    ->colors([
                        'info' => 'cold',
                        'warning' => 'warm',
                        'danger' => 'hot',
                    ]),
                TextColumn::make('status_followup')
                    ->label('Followup')
                    ->badge()
                    ->colors([
                        'warning' => 'belum',
                        'success' => 'sudah',
                    ]),
                TextColumn::make('contact_source')
                    ->label('Sumber')
                    ->badge()
                    ->colors([
                        'primary' => 'phone',
                        'success' => 'whatsapp',
                    ])
                    ->formatStateUsing(fn(string $state): string => $state === 'whatsapp' ? 'WhatsApp' : 'Telepon'),
                TextColumn::make('tanggal_leads')
                    ->label('Tanggal')
                    ->date('d M Y')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Dibuat')
                    ->dateTime('d M Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status_lead')
                    ->label('Status Lead')
                    ->options([
                        'cold' => 'Cold',
                        'warm' => 'Warm',
                        'hot' => 'Hot',
                    ]),
                SelectFilter::make('status_followup')
                    ->label('Status Followup')
                    ->options([
                        'belum' => 'Belum',
                        'sudah' => 'Sudah',
                    ]),
                SelectFilter::make('contact_source')
                    ->label('Sumber Kontak')
                    ->options([
                        'phone' => 'Telepon',
                        'whatsapp' => 'WhatsApp',
                    ]),
            ])
            ->defaultSort('tanggal_leads', 'desc')
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
