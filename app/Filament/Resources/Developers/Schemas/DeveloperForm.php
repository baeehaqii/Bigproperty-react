<?php

namespace App\Filament\Resources\Developers\Schemas;

use App\Models\Developer;
use App\Models\Sumber;
use App\Models\Visitor;
use Filament\Actions\Action;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Placeholder;
use Filament\Notifications\Notification;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Facades\Storage;
use App\Models\Property;
use App\Models\Agen;

class DeveloperForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Developer')
                    ->description('Masukkan data lengkap developer properti')
                    ->icon('heroicon-o-building-office-2')
                    ->columns(2)
                    ->schema([
                        Grid::make(2)
                            ->columnSpanFull()
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nama Developer')
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('PT. Contoh Developer Indonesia')
                                    ->helperText('Nama lengkap perusahaan developer')
                                    ->columnSpan(1),

                                TextInput::make('pt')
                                    ->label('Nama PT')
                                    ->required()
                                    ->maxLength(255)
                                    ->placeholder('PT. ABC Property')
                                    ->helperText('Nama badan hukum perusahaan')
                                    ->columnSpan(1),
                            ]),

                        TextInput::make('alamat')
                            ->label('Alamat Kantor')
                            ->required()
                            ->maxLength(500)
                            ->placeholder('Jl. Contoh No. 123, Jakarta Selatan')
                            ->helperText('Alamat lengkap kantor developer'),

                        TextInput::make('kontak')
                            ->label('Kontak Kantor')
                            ->required()
                            ->tel()
                            ->maxLength(15)
                            ->prefix('+62')
                            ->placeholder('81234567890')
                            ->helperText('Nomor telepon kantor developer'),

                        TextInput::make('email_perusahaan')
                            ->label('Email Perusahaan')
                            ->email()
                            ->maxLength(255)
                            ->placeholder('info@developer.com')
                            ->helperText('Email resmi perusahaan'),

                        TextInput::make('website')
                            ->label('Website')
                            ->url()
                            ->maxLength(255)
                            ->placeholder('https://www.developer.com')
                            ->helperText('Website resmi developer : https://www.developer.com'),

                        FileUpload::make('nib')
                            ->label('Upload NIB')
                            ->image()
                            ->required()
                            ->directory('developers/nib')
                            ->openable()
                            ->downloadable()
                            ->maxSize(2048),

                        TextInput::make('nama_property')
                            ->label('Nama Property Utama')
                            ->maxLength(255)
                            ->placeholder('Grand City Residence')
                            ->helperText('Property flagship dari developer'),

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
                            }),

                        FileUpload::make('logo')
                            ->label('Logo Developer')
                            ->image()
                            ->imageEditor()
                            ->columnSpanFull()
                            ->imageEditorAspectRatios([
                                '16:9',
                                '4:3',
                                '1:1',
                            ])
                            ->maxSize(2048)
                            ->directory('developers/logos')
                            ->visibility('public')
                            ->helperText('Upload logo developer (Maks. 2MB, format: JPG, PNG)'),

                        Toggle::make('is_verified')
                            ->label('Developer Terverifikasi')
                            ->helperText('Tandai jika developer sudah diverifikasi'),
                    ])
                    ->collapsible()
                    ->persistCollapsed(),

                Section::make('Statistik Developer')
                    ->description('Ringkasan informasi developer')
                    ->icon('heroicon-o-chart-bar')
                    ->schema([
                        Grid::make(2)
                            ->schema([
                                Placeholder::make('total_properties')
                                    ->label('')
                                    ->content(fn ($record) => new HtmlString('
                                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                            <div style="color: white; font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Total Properties</div>
                                            <div style="color: white; font-size: 2rem; font-weight: bold;">' . ($record ? $record->properties()->count() : 0) . '</div>
                                        </div>
                                    ')),

                                Placeholder::make('total_agens')
                                    ->label('')
                                    ->content(fn ($record) => new HtmlString('
                                        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                            <div style="color: white; font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Total Agen</div>
                                            <div style="color: white; font-size: 2rem; font-weight: bold;">' . ($record ? $record->agens()->count() : 0) . '</div>
                                        </div>
                                    ')),

                                Placeholder::make('active_agens')
                                    ->label('')
                                    ->content(fn ($record) => new HtmlString('
                                        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                            <div style="color: white; font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Agen Aktif</div>
                                            <div style="color: white; font-size: 2rem; font-weight: bold;">' . ($record ? $record->activeAgens()->count() : 0) . '</div>
                                        </div>
                                    ')),

                                Placeholder::make('available_properties')
                                    ->label('')
                                    ->content(fn ($record) => new HtmlString('
                                        <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                            <div style="color: white; font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Properties Tersedia</div>
                                            <div style="color: white; font-size: 2rem; font-weight: bold;">' . ($record ? $record->properties()->where('is_available', true)->count() : 0) . '</div>
                                        </div>
                                    ')),
                            ]),
                    ])
                    ->collapsible()
                    ->collapsed()
                    ->visible(fn ($record) => $record !== null),

                Section::make('Daftar Agen')
                    ->description('Agen-agen yang terdaftar di developer ini')
                    ->icon('heroicon-o-user-group')
                    ->columnSpanfull()
                    ->schema([
                        Grid::make(2)
                            ->schema(function ($record) {
                                if (!$record) {
                                    return [
                                        Placeholder::make('no_record')
                                            ->label('')
                                            ->content(new HtmlString('
                                                <div style="background: #f3f4f6; padding: 2rem; border-radius: 12px; text-align: center; border: 2px dashed #d1d5db;">
                                                    <div style="font-size: 3rem; margin-bottom: 1rem;">💾</div>
                                                    <div style="color: #6b7280; font-size: 1rem;">Simpan developer terlebih dahulu untuk melihat daftar agen</div>
                                                </div>
                                            '))
                                            ->columnSpanFull(),
                                    ];
                                }

                                $agens = $record->agens()->get();
                                
                                if ($agens->isEmpty()) {
                                    return [
                                        Placeholder::make('no_agens')
                                            ->label('')
                                            ->content(new HtmlString('
                                                <div style="background: #fef3c7; padding: 2rem; border-radius: 12px; text-align: center; border: 2px solid #fbbf24;">
                                                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                                                    <div style="color: #92400e; font-size: 1rem; font-weight: 600;">Belum ada agen terdaftar untuk developer ini</div>
                                                </div>
                                            '))
                                            ->columnSpanFull(),
                                    ];
                                }

                                return $agens->map(function ($agen) {
                                    $statusBadge = $agen->is_active 
                                        ? '<span style="background: #d1fae5; color: #065f46; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">✅ Aktif</span>'
                                        : '<span style="background: #fee2e2; color: #991b1b; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">❌ Tidak Aktif</span>';
                                    
                                    $propertyCount = $agen->properties()->count();
                                    
                                    // FIX: Coba beberapa cara buat dapetin photo URL
                                    $photoUrl = null;
                                    if ($agen->photo) {
                                        // Try 1: Langsung pake path dari database
                                        if (file_exists(public_path('storage/' . $agen->photo))) {
                                            $photoUrl = asset('storage/' . $agen->photo);
                                        }
                                        // Try 2: Cek di storage/app/public
                                        elseif (Storage::disk('public')->exists($agen->photo)) {
                                            $photoUrl = Storage::disk('public')->url($agen->photo);
                                        }
                                        // Try 3: Cek di storage/app (private)
                                        elseif (Storage::exists($agen->photo)) {
                                            // Kalo di private, mau ga mau harus pake route atau base64
                                            $photoUrl = 'data:image/jpeg;base64,' . base64_encode(Storage::get($agen->photo));
                                        }
                                    }
                                    
                                    $avatar = $photoUrl
                                        ? '<img src="' . $photoUrl . '" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid #e5e7eb;" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';" /><div style="display: none; width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold; border: 3px solid #e5e7eb;">' . strtoupper(substr($agen->name, 0, 1)) . '</div>'
                                        : '<div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold; border: 3px solid #e5e7eb;">' 
                                        . strtoupper(substr($agen->name, 0, 1)) 
                                        . '</div>';
                                    
                                    $infoRows = '';
                                    
                                    if ($agen->phone) {
                                        $infoRows .= '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                            <span style="color: #3b82f6; font-size: 1.25rem;">📞</span>
                                            <span style="color: #374151; font-size: 0.875rem;">' . e($agen->phone) . '</span>
                                        </div>';
                                    }
                                    
                                    if ($agen->email) {
                                        $infoRows .= '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                            <span style="color: #8b5cf6; font-size: 1.25rem;">📧</span>
                                            <span style="color: #374151; font-size: 0.875rem;">' . e($agen->email) . '</span>
                                        </div>';
                                    }
                                    
                                    if ($agen->license_number) {
                                        $infoRows .= '<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                            <span style="color: #f59e0b; font-size: 1.25rem;">🪪</span>
                                            <span style="color: #374151; font-size: 0.875rem;">License: ' . e($agen->license_number) . '</span>
                                        </div>';
                                    }
                                    
                                    return Placeholder::make("agen_{$agen->id}")
                                        ->label('')
                                        ->content(new HtmlString('
                                            <div style="background: white; border: 2px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: all 0.3s;">
                                                <div style="display: flex; gap: 1.25rem; margin-bottom: 1rem;">
                                                    ' . $avatar . '
                                                    <div style="flex: 1;">
                                                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                                                            <h4 style="font-size: 1.125rem; font-weight: 700; color: #111827; margin: 0;">' . e($agen->name) . '</h4>
                                                            ' . $statusBadge . '
                                                        </div>
                                                        ' . $infoRows . '
                                                    </div>
                                                </div>
                                                <div style="border-top: 1px solid #e5e7eb; padding-top: 1rem; margin-top: 1rem;">
                                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                                        <span style="color: #ef4444; font-size: 1.25rem;">🏢</span>
                                                        <span style="color: #111827; font-weight: 600; font-size: 0.875rem;">' . $propertyCount . ' Properties</span>
                                                    </div>
                                                </div>
                                            </div>
                                        '));
                                })->toArray();
                            })
                            ->columnSpanFull(),
                    ])
                    ->collapsible()
                    ->collapsed()
                    ->visible(fn ($record) => $record !== null),
            ]);
    }
}