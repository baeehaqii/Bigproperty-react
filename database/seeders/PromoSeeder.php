<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PromoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
    $promos = [
        ['nama' => 'Diskon Harga', 'slug' => 'diskon'],
        ['nama' => 'Free Biaya Proses KPR', 'slug' => 'free-kpr'],
        ['nama' => 'Subsidi Biaya Proses KPR', 'slug' => 'subsidi-kpr'],
        ['nama' => 'Free Pajak (BPHTB)', 'slug' => 'free-pajak'],
        ['nama' => 'Promo Lainnya', 'slug' => 'lainnya'],
    ];

    foreach ($promos as $p) {
        \App\Models\Promo::create($p);
    }
}
}
