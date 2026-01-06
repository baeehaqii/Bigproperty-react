<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WilayahService;
use Illuminate\Http\Request;

class WilayahController extends Controller
{
    protected $wilayahService;

    public function __construct(WilayahService $wilayahService)
    {
        $this->wilayahService = $wilayahService;
    }

    public function provinces()
    {
        $data = $this->wilayahService->getProvinces();
        return response()->json($data);
    }

    public function cities($provinceCode)
    {
        $data = $this->wilayahService->getCities($provinceCode);
        return response()->json($data);
    }
}
