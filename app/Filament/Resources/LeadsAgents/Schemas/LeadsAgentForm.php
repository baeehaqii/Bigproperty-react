<?php

namespace App\Filament\Resources\LeadsAgents\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class LeadsAgentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('nama_lengkap')
                    ->required(),
                TextInput::make('no_whatsapp')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email(),
                TextInput::make('listing_source')
                    ->required(),
                Select::make('property_id')
                    ->relationship('property', 'name'),
                Select::make('agent_id')
                    ->relationship('agent', 'name')
                    ->required(),
                Select::make('status_lead')
                    ->options(['cold' => 'Cold', 'warm' => 'Warm', 'hot' => 'Hot'])
                    ->default('cold')
                    ->required(),
                Select::make('status_followup')
                    ->options(['belum' => 'Belum', 'sudah' => 'Sudah'])
                    ->default('belum')
                    ->required(),
                DatePicker::make('tanggal_leads')
                    ->required(),
                Textarea::make('notes')
                    ->columnSpanFull(),
            ]);
    }
}
