<?php
// app/Http/Controllers/Api/ImageController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    public function show(Request $request)
    {
        $path = $request->query('path');
        
        if (!$path || !Storage::exists($path)) {
            return response()->json(['error' => 'File tidak ditemukan'], 404);
        }
        
        $file = Storage::get($path);
        $mimeType = Storage::mimeType($path);
        
        return response($file, 200)->header('Content-Type', $mimeType);
    }
}