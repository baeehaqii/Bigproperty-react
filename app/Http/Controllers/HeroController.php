<?php

namespace App\Http\Controllers;

use App\Models\Hero;
use Illuminate\Http\Request;

class HeroController extends Controller
{
    public function index(){
        $heroes = Hero::active()
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($hero) {
            if ($hero->image && is_array($hero->image)) {
                $hero->image = array_map(function ($imagePath) {
                    if (str_starts_with($imagePath, 'http')) {
                        return $imagePath;
                    }
                    // Hilangkan prefix disk kalo ada
                    $cleanPath = str_replace(['public/', 'local/'], '', $imagePath);
                    // Generate URL ke route kita
                    return url('/storage/' . $cleanPath);
                }, $hero->image);
            }
            return $hero;
        });

    return response()->json([
        'success' => true,
        'data' => $heroes
    ]);
    }
}
