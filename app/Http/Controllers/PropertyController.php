<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    public function show(Property $property): Response
    {
        try {
            $property->load('developer');

            return Inertia::render('PropertyDetail', [
                'property' => [
                    'id' => (string) $property->id,
                    'name' => $property->name,
                    'type' => $property->type,
                    'status' => $property->is_available ? 'Available' : 'Sold Out',
                    'price' => [
                        'min' => $property->price_min,
                        'max' => $property->price_max,
                        'currency' => 'IDR'
                    ],
                    'images' => collect($property->images ?? [])->map(function ($image) use ($property) {
                        return [
                            'url' => $image,
                            'alt' => $property->name,
                            'priority' => 1
                        ];
                    })->toArray(),
                    'specifications' => [
                        'bedrooms' => $property->bedrooms,
                        'bathrooms' => '1-2',
                        'landArea' => $property->land_size_text,
                        'buildingArea' => $property->building_size_text,
                        'certificateType' => $property->certificate_type ?? 'SHM'
                    ],
                    'installment' => [
                        'monthly' => $property->installment_text,
                    ],
                    'developer' => [
                        'name' => $property->developer->name,
                        'logo' => $property->developer->logo,
                    ],
                    'location' => [
                        'district' => 'Legok',
                        'subDistrict' => 'Legok',
                        'city' => $property->city,
                        'province' => 'Banten',
                    ],
                    'description' => $property->developer->description ?? 'Properti berkualitas dengan lokasi strategis dan fasilitas lengkap.',
                    'remainingUnits' => $property->units_remaining ?? 0
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Property controller error: ' . $e->getMessage());
            return Inertia::render('PropertyDetail', [
                'property' => [
                    'id' => '1',
                    'name' => 'Test Property',
                    'type' => 'Rumah',
                    'status' => 'Available',
                    'price' => [
                        'min' => 500000000,
                        'max' => 800000000,
                        'currency' => 'IDR'
                    ],
                    'images' => [
                        ['url' => 'https://via.placeholder.com/600x400', 'alt' => 'Test Property', 'priority' => 1]
                    ],
                    'specifications' => [
                        'bedrooms' => '2-3 BR',
                        'bathrooms' => '1-2',
                        'landArea' => '60-90m²',
                        'buildingArea' => '45-70m²',
                        'certificateType' => 'SHM'
                    ],
                    'installment' => [
                        'monthly' => 'Angsuran mulai dari Rp5Jt/bln',
                    ],
                    'developer' => [
                        'name' => 'Test Developer',
                        'logo' => 'https://via.placeholder.com/40',
                    ],
                    'location' => [
                        'district' => 'Legok',
                        'subDistrict' => 'Legok',
                        'city' => 'Tangerang',
                        'province' => 'Banten',
                    ],
                    'description' => 'Test property dengan lokasi strategis.',
                    'remainingUnits' => 10
                ]
            ]);
        }
    }
}