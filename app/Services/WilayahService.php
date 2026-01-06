<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class WilayahService
{
    protected $baseUrl = 'https://wilayah.id/api';

    public function getProvinces()
    {
        return Cache::remember('wilayah_provinces', 60 * 60 * 24, function () {
            $response = Http::get("{$this->baseUrl}/provinces.json");
            return $response->json();
        });
    }

    public function getCities($provinceCode)
    {
        return Cache::remember("wilayah_cities_{$provinceCode}", 60 * 60 * 24, function () use ($provinceCode) {
            $response = Http::get("{$this->baseUrl}/regencies/{$provinceCode}.json");
            return $response->json();
        });
    }
}
