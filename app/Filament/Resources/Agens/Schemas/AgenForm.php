<?php

namespace App\Filament\Resources\Agens\Schemas;

use App\Models\Agen;
use App\Models\User;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Forms\Get;

class AgenForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                
                // Section: Foto Profile
                Section::make('Foto Profil')
                    ->description('Upload foto profil agen/marketing')
                    ->schema([
                        FileUpload::make('photo')
                            ->label('Foto Profil')
                            ->image()
                            ->avatar()
                            ->imageEditor()
                            ->circleCropper()
                            ->directory('agens/photos')
                            ->maxSize(2048)
                            ->columnSpanFull()
                            ->alignCenter()
                            ->helperText('Rekomendasi: foto persegi 500x500px, max 2MB'),
                    ])
                    ->columns(1)
                    ->collapsible(),

                // Section: Informasi Developer
                Section::make('Informasi Developer')
                    ->schema([
                        Select::make('developer_id')
                            ->label('Developer')
                            ->relationship('developer', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->columnSpanFull(),
                    ])
                    ->columns(1),

                // Section: Akun User
                Section::make('Akun User')
                    ->description('Pilih user yang akan dijadikan agen')
                    ->schema([
                        Select::make('user_id')
                            ->label('Email User')
                            ->options(function (callable $get, $record) {
                                // Ambil user yang punya role "agen"
                                $usersWithAgenRole = User::role('agen')->pluck('id');
                                
                                // Ambil user_id yang sudah dipilih agen lain
                                $usedUserIds = Agen::whereNotNull('user_id')
                                    ->when($record, function ($query) use ($record) {
                                        // Kecuali record yang sedang diedit
                                        return $query->where('id', '!=', $record->id);
                                    })
                                    ->pluck('user_id');
                                
                                // Return user yang role-nya agen DAN belum dipilih
                                return User::whereIn('id', $usersWithAgenRole)
                                    ->whereNotIn('id', $usedUserIds)
                                    ->get()
                                    ->mapWithKeys(function ($user) {
                                        return [$user->id => $user->email . ' (' . $user->name . ')'];
                                    });
                            })
                            ->searchable()
                            ->preload()
                            ->nullable()
                            ->helperText('Pilih user dengan role "agen" yang belum terhubung dengan agen lain')
                            ->columnSpanFull(),
                    ])
                    ->columns(1)
                    ->collapsible(),

                // Section: Data Pribadi
                Section::make('Data Pribadi')
                    ->description('Informasi pribadi agen/marketing')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nama Lengkap')
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('Contoh: John Doe'),
                            ]),

                        Grid::make(2)
                            ->schema([
                                TextInput::make('email')
                                    ->label('Email')
                                    ->email()
                                    ->maxLength(255)
                                    ->placeholder('contoh@email.com')
                                    ->prefixIcon('heroicon-o-envelope'),

                                TextInput::make('license_number')
                                    ->label('Nomor Lisensi')
                                    ->maxLength(255)
                                    ->placeholder('Nomor izin/lisensi (opsional)')
                                    ->prefixIcon('heroicon-o-identification'),
                            ]),
                    ])
                    ->columns(1)
                    ->collapsible(),

                // Section: Kontak
                Section::make('Informasi Kontak')
                    ->description('Nomor telepon & WhatsApp untuk dihubungi')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                TextInput::make('phone')
                                    ->label('WhatsApp')
                                    ->tel()
                                    ->maxLength(20)
                                    ->placeholder('0812-3456-7890')
                                    ->prefixIcon('heroicon-o-chat-bubble-left-right')
                                    ->helperText('Kosongkan jika sama dengan no. telepon'),
                            ]),
                    ])
                    ->columns(1)
                    ->collapsible(),

                // Section: Status
                Section::make('Status')
                    ->schema([
                        Toggle::make('is_active')
                            ->label('Status Aktif')
                            ->helperText('Nonaktifkan jika agen tidak lagi bekerja')
                            ->default(true)
                            ->inline(false)
                            ->columnSpanFull(),
                    ])
                    ->columns(1)
                    ->collapsible(),

            ]);
    }
}