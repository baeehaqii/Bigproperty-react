<?php

namespace App\Filament\Resources\Agens\Schemas;

use App\Models\Agen;
use App\Models\Developer;
use App\Models\Sumber;
use App\Models\User;
use App\Models\Visitor;
use Filament\Actions\Action;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Forms\Get;
use Filament\Notifications\Notification;


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
                        Toggle::make('is_developer')
                            ->label('Agen Developer ?')
                            ->disabled(function (callable $get) {
                                return $get('developer_id') !== null;
                            })
                            ->afterstateHydrated(function (callable $get, $set) {
                                // dd($get('developer_id'));
                                if($get('developer_id') !== null){
                                    $set('is_developer', true);
                                }else{
                                    $set('is_developer', false);
                                }
                            })
                            ->reactive()
                            ->columnSpanFull(),
                        Select::make('developer_id')
                            ->label('Developer')
                            ->relationship('developer', 'name')
                            ->searchable()
                            ->visible(function (callable $get) {
                                return $get('is_developer') === true;
                            })
                            ->reactive()
                            ->preload()
                            ->required(function (callable $get) {
                                return $get('is_developer') === true;
                            })
                            ->columnSpanFull(),
                    ])
                    ->columns(2),

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
                                    ->placeholder('Contoh: Slamet Riyadi'),
                                FileUpload::make('ktp')
                                    ->label('Upload ktp')
                                    ->image()
                                    ->required()
                                    ->directory('agen/ktp')
                                    ->openable()
                                    ->downloadable()
                                    ->maxSize(2048),
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
                        Select::make("sumber")
                            ->label('Sumber Informasi')
                            ->suffixAction(
                            Action::make('addCategory')
                                        ->icon('heroicon-o-plus-circle')
                                        ->color('success')
                                        ->form([
                                                TextInput::make('nama')
                                                    ->label('Nama Sumber')
                                                    ->required()
                                                    ->maxLength(255)
                                                    ->placeholder('e.g., Facebook, Instagram, Teman, Event')
                                            ])
                                            ->action(function (array $data, $set, $get) {
                                                // Check if category already exists
                                                $exists = Sumber::where('nama', $data['nama'])->exists();
                                                
                                                if ($exists) {
                                                    Notification::make()
                                                        ->title('Sumber sudah ada')
                                                        ->warning()
                                                        ->send();
                                                    return;
                                                }
                                                
                                                // Create new category
                                                Sumber::create([
                                                    'nama' => $data['nama']
                                                ]);
                                                
                                                Notification::make()
                                                    ->title('Sumber berhasil ditambahkan')
                                                    ->success()
                                                    ->send();
                                                
                                                // Set the newly created category
                                                // $set('sumber', $data['sumber']);
                                            })
                                    )
                                    ->prefixAction(
                                        Action::make('deleteCategory')
                                            ->icon('heroicon-o-trash')
                                            ->color('danger')
                                            ->requiresConfirmation()
                                            ->modalHeading('Hapus Sumber')
                                            ->modalDescription(fn ($get) => 
                                                'Apakah Anda yakin ingin menghapus Sumber "' . $get('sumber') . '"? Sumber yang sudah digunakan tidak dapat dihapus.'
                                            )
                                            ->modalSubmitActionLabel('Hapus')
                                            ->action(function ($get, $set,$record) {
                                                $categoryName = $get('sumber');
                                                
                                                if (!$categoryName) {
                                                    Notification::make()
                                                        ->title('Pilih sumber terlebih dahulu')
                                                        ->warning()
                                                        ->send();
                                                    return;
                                                }
                                                
                                                // Check if category is being used
                                                $isUsed = Agen::where('sumber', $categoryName)->where('id', '!=',$record->id)->exists();
                                                $isUsed2 = Visitor::where('sumber', $categoryName)->where('id', '!=',$record->id)->exists();
                                                $isUsed3 = Developer::where('sumber', $categoryName)->where('id', '!=',$record->id)->exists();
                                                
                                                if ($isUsed && $isUsed2 && $isUsed3) {
                                                    Notification::make()
                                                        ->title('sumber tidak dapat dihapus')
                                                        ->body('sumber ini sedang digunakan oleh property lain.')
                                                        ->danger()
                                                        ->send();
                                                    return;
                                                }
                                                
                                                // Delete category
                                                $deleted = sumber::where('nama', $categoryName)->delete();
                                                
                                                if ($deleted) {
                                                    Notification::make()
                                                        ->title('sumber berhasil dihapus')
                                                        ->success()
                                                        ->send();
                                                    
                                                    // Clear the select field
                                                    $set('kategori', null);
                                                    $record->sumber = null;
                                                    $record->save();
                                                }
                                            })
                                            ->hidden(fn ($get) => !$get('sumber'))
                                    )
                            ->options(function () {
                                return Sumber::orderBy('nama')->pluck('nama', 'nama');
                            })
                    ])
                    ->columns(1)
                    ->collapsible(),

            ]);
    }
}