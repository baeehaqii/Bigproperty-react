<?php

namespace App\Filament\Resources\Events\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\HtmlString;
use App\Models\Property;
use App\Models\Event;
use Filament\Forms\Get;
use Filament\Notifications\Notification;

class EventForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make('Informasi Event')
                    ->description('Masukkan detail informasi event properti')
                    ->icon('heroicon-o-calendar')
                    ->schema([
                        TextInput::make('name')
                            ->label('Nama Event')
                            ->required()
                            ->maxLength(255)
                            ->placeholder('Contoh: Grand Opening Property Expo 2025')
                            ->columnSpanFull(),
                        
                        RichEditor::make('description')
                            ->label('Deskripsi Event')
                            ->required()
                            ->placeholder('Jelaskan detail event, promo, dan benefit yang ditawarkan...')
                            ->toolbarButtons([
                                'bold',
                                'italic',
                                'underline',
                                'bulletList',
                                'orderedList',
                            ])
                            ->columnSpanFull(),
                            FileUpload::make('banner')
                            ->label('Gambar Banner')
                            ->image()
                            ->directory('event/banner')
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                '16:9',
                                '4:3',
                            ])
                            ->columnSpanFull(),
                    ])
                    ->columns(2)
                    ->collapsible(),

                Section::make('Periode Event')
                    ->description('Tentukan waktu pelaksanaan event')
                    ->icon('heroicon-o-clock')
                    ->schema([
                        DatePicker::make('start_date')
                            ->label('Tanggal Mulai')
                            ->required()
                            ->native(false)
                            ->displayFormat('d F Y')
                            ->closeOnDateSelection()
                            ->prefix('Dari')
                            ->live(),
                        
                        DatePicker::make('end_date')
                            ->label('Tanggal Selesai')
                            ->required()
                            ->native(false)
                            ->displayFormat('d F Y')
                            ->closeOnDateSelection()
                            ->after('start_date')
                            ->prefix('Sampai')
                            ->live()
                            ->afterStateUpdated(function ($state, callable $set, $record) {
                                // Jika end_date kurang dari hari ini, auto non-aktifkan
                                if ($state && \Carbon\Carbon::parse($state)->lt(now()->startOfDay())) {
                                    $set('is_active', false);
                                    
                                    // Tampilkan notifikasi
                                    Notification::make()
                                        ->warning()
                                        ->title('Event Otomatis Dinonaktifkan')
                                        ->body('Event tidak dapat diaktifkan karena tanggal berakhir sudah lewat.')
                                        ->send();
                                }
                            }),
                        
                        Toggle::make('is_active')
                            ->label('Aktifkan Event')
                            ->helperText(function (callable $get) {
                                $endDate = $get('end_date');
                                if ($endDate && \Carbon\Carbon::parse($endDate)->lt(now()->startOfDay())) {
                                    return new HtmlString('<span class="text-danger-600 dark:text-danger-400 font-medium">Event sudah berakhir dan tidak dapat diaktifkan.</span>');
                                }
                                return 'Tandai jika event ini sedang aktif. Event lain akan otomatis dinonaktifkan.';
                            })
                            ->default(false)
                            ->live()
                            ->disabled(function (callable $get) {
                                $endDate = $get('end_date');
                                // Disable jika end_date sudah lewat
                                return $endDate && \Carbon\Carbon::parse($endDate)->lt(now()->startOfDay());
                            })
                            ->afterStateUpdated(function ($state, $record, callable $get) {
                                // Kalau toggle diaktifkan
                                if ($state === true) {
                                    $endDate = $get('end_date');
                                    
                                    // Cek lagi apakah end_date valid
                                    if ($endDate && \Carbon\Carbon::parse($endDate)->lt(now()->startOfDay())) {
                                        Notification::make()
                                            ->danger()
                                            ->title('Gagal Mengaktifkan Event')
                                            ->body('Event tidak dapat diaktifkan karena tanggal berakhir sudah lewat.')
                                            ->send();
                                        return;
                                    }
                                    
                                    // Non-aktifkan semua event lain kecuali yang sedang diedit
                                    Event::where('is_active', true)
                                        ->when($record, fn($query) => $query->where('id', '!=', $record->id))
                                        ->update(['is_active' => false]);
                                    
                                    Notification::make()
                                        ->success()
                                        ->title('Event Diaktifkan')
                                        ->body('Event berhasil diaktifkan. Event lain telah dinonaktifkan.')
                                        ->send();
                                }
                            }),
                    ])
                    ->columns(2)
                    ->collapsible(),
            ]);
    }
}