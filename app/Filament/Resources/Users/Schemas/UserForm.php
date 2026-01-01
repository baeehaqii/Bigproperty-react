<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('username')
                    ->required()
                    ->unique(ignoreRecord: true),
                TextInput::make('firstname')
                    ->required()
                    ->label('First Name'),
                TextInput::make('lastname')
                    ->required()
                    ->label('Last Name'),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required()
                    ->unique(ignoreRecord: true),
                    
                // FIX: Tambahin multiple() untuk handle array
                Select::make('roles')
                    ->relationship('roles', 'name')
                    ->multiple() // Tambahin ini!
                    ->preload()
                    ->searchable()
                    ->label('Roles')
                    ->placeholder('Select roles'),
                    
                DateTimePicker::make('email_verified_at')
                    ->label('Email Verified At'),
                    
                TextInput::make('password')
                    ->password()
                    ->required(fn (string $operation): bool => $operation === 'create') // Required hanya saat create
                    ->dehydrated(fn ($state) => filled($state)) // Hanya update kalo diisi
                    ->revealable() // Bisa show/hide password
                    ->minLength(8),
            ]);
    }
}