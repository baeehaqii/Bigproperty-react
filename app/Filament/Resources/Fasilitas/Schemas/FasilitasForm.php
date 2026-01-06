<?php

namespace App\Filament\Resources\Fasilitas\Schemas;


use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class FasilitasForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Fasilitas')
                    
                    ->description('Tambahkan nama fasilitas dan pilih icon yang sesuai.')
                    ->columns(2)
                    ->schema([
                        TextInput::make('nama')
                            ->required()
                            ->placeholder('e.g., Kolam Renang')
                            ->maxLength(255),

                        Select::make('icon')
                            ->required()
                            ->searchable()
                            ->options(self::getFlaticonOptions())
                            ->allowHtml()
                            ->placeholder('Pilih Icon Fasilitas'),
                    ]),
            ]);
    }

    // Helper untuk daftar icon (Kamu bisa tambah list-nya di sini)
    protected static function getFlaticonOptions(): array
{
    $icons = [
        // Basic & Utilities
        'fi-rr-swimming-pool' => 'Kolam Renang',
        'fi-rr-parking'       => 'Area Parkir',
        'fi-rr-bolt'          => 'Listrik',
        'fi-rr-wifi'          => 'Free WiFi',
        'fi-rr-trash'         => 'Pengelolaan Sampah',
        'fi-rr-washer'        => 'Laundry Room',

        // Sports & Leisure
        'fi-rr-gym'           => 'Pusat Kebugaran (Gym)',
        'fi-rr-running'       => 'Jogging Track',
        'fi-rr-basketball'    => 'Lapangan Basket',
        'fi-rr-football'      => 'Lapangan Bola/Futsal',
        'fi-rr-tennis'        => 'Lapangan Tenis',
        'fi-rr-biking'        => 'Jalur Sepeda',

        // Safety & Security
        'fi-rr-shield-check'  => 'Keamanan 24 Jam',
        'fi-rr-camera'        => 'CCTV Sistem',
        'fi-rr-fire-burner'   => 'Pemadam Kebakaran',
        'fi-rr-megaphone'     => 'Sistem Alarm',
        'fi-rr-user-lock'     => 'One Gate System',

        // Nature & Environment
        'fi-rr-leaf'          => 'Taman Tematik',
        'fi-rr-tree'          => 'Hutan Kota/Area Hijau',
        'fi-rr-sun'           => 'Panel Surya',
        'fi-rr-water'         => 'Danau Buatan/Kolam Ikan',

        // Social & Public
        'fi-rr-home-location' => 'Club House',
        'fi-rr-play-alt'      => 'Taman Bermain Anak',
        'fi-rr-moon'          => 'Tempat Ibadah (Musholla)',
        'fi-rr-shopping-bag'  => 'Mini Market/Kantin',
        'fi-rr-hospital'      => 'Klinik Kesehatan',
        'fi-rr-school'        => 'Area Pendidikan/PAUD',
        'fi-rr-grill'         => 'Area Barbeque',
        
        // Tech
        'fi-rr-smartphone'    => 'Smart Home System',
    ];

    return collect($icons)->mapWithKeys(function ($label, $class) {
        return [
            $class => "<div class='flex items-center gap-3'>
                         <i class='fi {$class} text-xl mt-1' style='color: #fbbf24;'></i>
                         <span class='font-medium'>{$label}</span>
                       </div>"
        ];
    })->toArray();
}
}