<?php

namespace App\Filament\Resources\Visitors\Schemas;


use App\Models\Agen;
use App\Models\Developer;
use App\Models\Sumber;
use App\Models\User;
use App\Models\Visitor;
use Filament\Actions\Action;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class VisitorForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Section::make('Informasi Akun')
                    ->description('Pilih user yang akan dijadikan visitor')
                    ->icon('heroicon-o-user-plus')
                    ->columns(1)
                    ->schema([
                        Select::make('user_id')
                        ->label('User')
                        ->required()
                        ->searchable()
                        ->preload()
                        ->options(function ($record) {
                            $usedUserIds = Visitor::pluck('user_id')->toArray();
                            if ($record && $record->user_id) {
                                $usedUserIds = array_diff($usedUserIds, [$record->user_id]);
                            }
                            return User::role('Visitor')
                                ->whereNotIn('id', $usedUserIds)
                                ->get()
                                ->mapWithKeys(function ($user) {
                                    return [$user->id => $user->username . ' (' . $user->email . ')'];
                                });
                        })
                        ->prefixIcon('heroicon-o-user'),
                    ]),
                Section::make('Informasi Pribadi')
                    ->description('Data identitas pengunjung')
                    ->icon('heroicon-o-user-circle')
                    ->columns(2)
                    ->schema([
                        TextInput::make('nama')
                            ->label('Nama Lengkap')
                            ->required()
                            ->maxLength(255)
                            ->placeholder('Masukkan nama lengkap')
                            ->prefixIcon('heroicon-o-user')
                            ->columnSpan(2),

                        TextInput::make('ktp')
                            ->label('Nomor KTP')
                            ->required()
                            ->numeric()
                            ->length(16)
                            ->placeholder('3201234567891234')
                            ->prefixIcon('heroicon-o-identification')
                            ->helperText('Masukkan 16 digit nomor KTP')
                            ->columnSpan(1),

                        TextInput::make('no_wa')
                            ->label('Nomor WhatsApp')
                            ->required()
                            ->tel()
                            ->placeholder('08123456789')
                            ->prefixIcon('heroicon-o-phone')
                            ->prefix('+62')
                            ->helperText('Format: 8123456789 (tanpa 0)')
                            ->maxLength(15)
                            ->columnSpan(1),
                    ]),

                Section::make('Informasi Tambahan')
                    ->description('Data kunjungan dan foto')
                    ->icon('heroicon-o-document-text')
                    ->columns(1)
                    ->schema([
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
                            }),

                        FileUpload::make('photo')
                            ->label('Foto Pengunjung')
                            ->image()
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '1:1',
                                '4:3',
                                '16:9',
                            ])
                            ->directory('visitors')
                            ->visibility('public')
                            ->maxSize(2048)
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])
                            ->helperText('Upload foto max 2MB (JPG, PNG, WEBP)')
                            ->columnSpanFull()
                            ->imagePreviewHeight('250')
                            ->panelLayout('integrated')
                            ->removeUploadedFileButtonPosition('right')
                            ->uploadButtonPosition('left')
                            ->uploadProgressIndicatorPosition('left'),
                    ]),
            ]);
    }
}