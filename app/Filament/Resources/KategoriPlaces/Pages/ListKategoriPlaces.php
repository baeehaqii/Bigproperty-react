<?php

namespace App\Filament\Resources\KategoriPlaces\Pages;

use App\Filament\Resources\KategoriPlaces\KategoriPlaceResource;
use App\Models\KategoriPlace;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListKategoriPlaces extends ListRecords
{
    protected static string $resource = KategoriPlaceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('tambah_kategori')
                ->label('Tambah Kategori')
                ->color('gray') 
                ->icon('heroicon-o-tag')
                ->modalHeading('Buat Kategori Baru')
                ->modalDescription('Kategori ini akan muncul di pilihan saat input tempat terdekat.')
                ->modalSubmitActionLabel('Simpan Kategori')
                ->form([
                    TextInput::make('nama')
                        ->label('Nama Kategori')
                        ->required()
                        ->unique('kategori_places', 'nama') 
                        ->placeholder('Contoh: Pendidikan, Transportasi, dll'),
                ])
                ->action(function (array $data) {
                    
                    KategoriPlace::create($data);

                    
                    Notification::make()
                        ->title('Kategori Berhasil Dibuat')
                        ->success()
                        ->body("Kategori **{$data['nama']}** sekarang sudah bisa lu pilih.")
                        ->send();
                }),
        ];
    }
}
