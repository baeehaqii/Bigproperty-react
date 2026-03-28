<?php

namespace App\Http\Controllers;

use App\Models\Developer;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Services\GoogleStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AgentDashboardController extends Controller
{
    /**
     * Get the guard to be used during authentication.
     */
    protected function guard()
    {
        return Auth::guard('agent');
    }

    /**
     * Get agent data for all pages
     */
    protected function getAgentData()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return null;
        }

        return [
            'id' => $agent->id,
            'name' => $agent->name,
            'email' => $agent->email,
            'phone' => $agent->phone,
            'photo' => $agent->photo,
            'ktp' => $agent->ktp,
            'license_number' => $agent->license_number,
            'developer_id' => $agent->developer_id,
            'is_active' => $agent->is_active,
            'sumber' => $agent->sumber,

            // Jenis akun
            'jenis_akun' => $agent->jenis_akun,
            'jenis_akun_label' => $agent->jenis_akun_label,

            // Agensi/Broker fields
            'nama_agensi' => $agent->nama_agensi,
            'logo_agensi' => $agent->logo_agensi,
            'email_agensi' => $agent->email_agensi,
            'website_agensi' => $agent->website_agensi,

            // PIC fields
            'nama_pic' => $agent->nama_pic,
            'foto_pic' => $agent->foto_pic,
            'ktp_pic' => $agent->ktp_pic,
            'email_pic' => $agent->email_pic,
            'wa_pic' => $agent->wa_pic,

            // Computed fields
            'display_name' => $agent->display_name,
            'display_photo' => $agent->display_photo,
            'contact_email' => $agent->contact_email,
            'contact_phone' => $agent->contact_phone,
            'is_profile_complete' => $agent->isProfileComplete(),
            'is_agensi_broker' => $agent->isAgensiBroker(),
        ];
    }

    /**
     * Show agent dashboard overview
     */
    public function overview()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        // Get leads count
        $leadsCount = \App\Models\LeadsAgent::where('agent_id', $agent->id)->count();
        $leadsNotFollowed = \App\Models\LeadsAgent::where('agent_id', $agent->id)
            ->where('status_followup', 'belum')
            ->count();

        // Get agent stats
        $stats = [
            'totalListings' => $agent->properties()->count(),
            'totalViews' => $agent->properties()->sum('count_clicked') ?? 0,
            'totalInquiries' => $leadsNotFollowed, // Leads yang belum di-followup
            'totalLeads' => $leadsCount,
        ];

        return Inertia::render('DashboardAgent/Overview/index', [
            'agent' => $this->getAgentData(),
            'stats' => $stats,
        ]);
    }

    /**
     * Show agent's listings (Listing Saya)
     */
    public function listingSaya()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        // Initialize WilayahService for location lookup
        $wilayahService = new \App\Services\WilayahService();

        // Cache for province/city lookups to avoid repeated API calls
        $provinceCache = [];
        $cityCache = [];

        // Get all properties for this agent
        $listings = Property::where('agen_id', $agent->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($property) use ($wilayahService, &$provinceCache, &$cityCache) {
                $provinceCode = $property->provinsi;
                $cityCode = $property->city;

                // Lookup province name
                $provinceName = $provinceCode;
                if ($provinceCode && !isset($provinceCache[$provinceCode])) {
                    try {
                        $provinces = $wilayahService->getProvinces();
                        if (isset($provinces['data']) && is_array($provinces['data'])) {
                            foreach ($provinces['data'] as $province) {
                                $provinceCache[$province['code']] = $province['name'];
                            }
                        }
                    } catch (\Exception $e) {
                        \Log::warning('Failed to lookup province: ' . $e->getMessage());
                    }
                }
                $provinceName = $provinceCache[$provinceCode] ?? $provinceCode;

                // Lookup city name
                $cityName = $cityCode;
                if ($cityCode && $provinceCode && !isset($cityCache[$cityCode])) {
                    try {
                        $cities = $wilayahService->getCities($provinceCode);
                        if (isset($cities['data']) && is_array($cities['data'])) {
                            foreach ($cities['data'] as $city) {
                                $cityCache[$city['code']] = $city['name'];
                            }
                        }
                    } catch (\Exception $e) {
                        \Log::warning('Failed to lookup city: ' . $e->getMessage());
                    }
                }
                $cityName = $cityCache[$cityCode] ?? $cityCode;

                // Add formatted location to property
                $property->province_name = $provinceName;
                $property->city_name = $cityName;

                return $property;
            });

        // Calculate stats
        $stats = [
            'total' => $listings->count(),
            'active' => $listings->where('is_available', true)->where('is_verified', true)->count(),
            'pending' => $listings->where('is_verified', false)->where('is_draft', false)->count(),
            'draft' => $listings->where('is_draft', true)->count(),
            'totalViews' => $listings->sum('count_clicked') ?? 0,
        ];

        return Inertia::render('DashboardAgent/ListingSaya/index', [
            'agent' => $this->getAgentData(),
            'listings' => $listings,
            'stats' => $stats,
        ]);
    }

    /**
     * Delete a listing
     */
    public function deleteListing($id)
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        // Find property and verify ownership
        $property = Property::where('id', $id)
            ->where('agen_id', $agent->id)
            ->first();

        if (!$property) {
            return back()->withErrors([
                'general' => 'Properti tidak ditemukan atau Anda tidak memiliki akses.',
            ]);
        }

        try {
            $property->delete();
            return redirect()->route('agent.dashboard.listing-saya')
                ->with('success', 'Properti berhasil dihapus.');
        } catch (\Exception $e) {
            \Log::error('Property deletion error: ' . $e->getMessage());
            return back()->withErrors([
                'general' => 'Terjadi kesalahan saat menghapus properti.',
            ]);
        }
    }

    /**
     * Update listing status (sold/cancelled/active)
     */
    public function updateListingStatus($id, \Illuminate\Http\Request $request)
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        $request->validate([
            'status' => 'required|in:active,sold,cancelled',
        ]);

        // Find property and verify ownership
        $property = Property::where('id', $id)
            ->where('agen_id', $agent->id)
            ->first();

        if (!$property) {
            return back()->withErrors([
                'general' => 'Properti tidak ditemukan atau Anda tidak memiliki akses.',
            ]);
        }

        // Only allow status change for verified properties
        if (!$property->is_verified) {
            return back()->withErrors([
                'general' => 'Status hanya dapat diubah untuk properti yang sudah diverifikasi.',
            ]);
        }

        try {
            $property->status_listing = $request->status;
            // Update is_available based on status
            $property->is_available = $request->status === 'active';
            $property->save();

            $statusMessages = [
                'active' => 'Properti berhasil diaktifkan kembali.',
                'sold' => 'Properti berhasil ditandai sebagai Terjual.',
                'cancelled' => 'Properti berhasil dibatalkan.',
            ];

            return redirect()->route('agent.dashboard.listing-saya')
                ->with('success', $statusMessages[$request->status] ?? 'Status berhasil diubah.');
        } catch (\Exception $e) {
            \Log::error('Property status update error: ' . $e->getMessage());
            return back()->withErrors([
                'general' => 'Terjadi kesalahan saat mengubah status properti.',
            ]);
        }
    }

    /**
     * Show edit listing form
     */
    public function editListingForm($id)
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        // Find property and verify ownership
        $property = Property::where('id', $id)
            ->where('agen_id', $agent->id)
            ->first();

        if (!$property) {
            return redirect()->route('agent.dashboard.listing-saya')
                ->withErrors(['general' => 'Properti tidak ditemukan atau Anda tidak memiliki akses.']);
        }

        // Get developers
        $developers = Developer::select('id', 'name')->orderBy('name')->get();

        // Get property categories
        $categories = PropertyCategory::where('is_active', true)
            ->select('id', 'name', 'slug')
            ->orderBy('order')
            ->get();

        return Inertia::render('DashboardAgent/EditListing/index', [
            'agent' => $this->getAgentData(),
            'property' => $property,
            'developers' => $developers,
            'categories' => $categories,
        ]);
    }

    /**
     * Update a listing
     */
    public function updateListing(Request $request, $id)
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        // Find property and verify ownership
        $property = Property::where('id', $id)
            ->where('agen_id', $agent->id)
            ->first();

        if (!$property) {
            return back()->withErrors([
                'general' => 'Properti tidak ditemukan atau Anda tidak memiliki akses.',
            ]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'provinsi' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'location' => ['required', 'string', 'max:255'],
            'url_maps' => ['nullable', 'url', 'max:500'],
            'units_remaining' => ['nullable', 'integer', 'min:0'],
            'developer_id' => ['nullable', 'exists:developers,id'],
            'kategori' => ['nullable', 'string'],

            'price_min' => ['nullable', 'numeric', 'min:0'],
            'price_max' => ['nullable', 'numeric', 'min:0'],
            'pajak' => ['nullable', 'numeric', 'min:0'],
            'notaris' => ['nullable', 'numeric', 'min:0'],

            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'carport' => ['nullable', 'integer', 'min:0'],
            'listrik' => ['nullable', 'integer', 'min:0'],
            'jenis_air' => ['nullable', 'string', 'max:50'],
            'condition' => ['nullable', 'string', 'in:Baru,Bekas'],
            'certificate_type' => ['nullable', 'string', 'max:50'],
            'land_size_min' => ['nullable', 'integer', 'min:0'],
            'land_size_max' => ['nullable', 'integer', 'min:0'],
            'building_size_min' => ['nullable', 'integer', 'min:0'],
            'building_size_max' => ['nullable', 'integer', 'min:0'],

            'keunggulan' => ['nullable', 'string'],
            'fasilitas' => ['nullable', 'string'],
            'nearby_places' => ['nullable', 'string'],
            'promos' => ['nullable', 'string'],

            'promo_text' => ['nullable', 'string', 'max:2000'],
            'is_available' => ['nullable', 'boolean'],
            'is_draft' => ['nullable', 'boolean'],
            'main_image' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,svg,webp,avif', 'max:5120'], // 5MB max
            'images.*' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,svg,webp,avif', 'max:5120'], // 5MB max
        ]);

        try {
            // Increase execution time and memory for image processing
            set_time_limit(120); // 2 minutes for multiple image uploads
            ini_set('memory_limit', '256M');

            // Initialize GCS service
            $storageService = new GoogleStorageService();

            // Handle main image upload to GCS
            $mainImageUrl = null;
            if ($request->hasFile('main_image')) {
                $result = $storageService->uploadPropertyImage(
                    $request->file('main_image'),
                    'website_image_listing'
                );
                $mainImageUrl = $result['url'];
            }

            // Handle gallery images upload to GCS
            $galleryImages = [];
            if ($request->hasFile('images')) {
                $results = $storageService->uploadMultiplePropertyImages(
                    $request->file('images'),
                    'website_image_listing'
                );
                $galleryImages = array_map(fn($r) => $r['url'], $results);
            }

            $property->update([
                'name' => $validated['name'],
                'provinsi' => $validated['provinsi'],
                'city' => $validated['city'],
                'location' => $validated['location'],
                'url_maps' => $validated['url_maps'] ?? $property->url_maps,
                'units_remaining' => $validated['units_remaining'] ?? $property->units_remaining,
                'developer_id' => $validated['developer_id'] ?? $property->developer_id,
                'kategori' => json_decode($validated['kategori'] ?? '[]', true),

                'price_min' => $validated['price_min'] ?? $property->price_min,
                'price_max' => $validated['price_max'] ?? ($validated['price_min'] ?? $property->price_max),
                'pajak' => $validated['pajak'] ?? $property->pajak,
                'notaris' => $validated['notaris'] ?? $property->notaris,

                'bedrooms' => $validated['bedrooms'] ?? $property->bedrooms,
                'bathrooms' => $validated['bathrooms'] ?? $property->bathrooms,
                'carport' => $validated['carport'] ?? $property->carport,
                'listrik' => $validated['listrik'] ?? $property->listrik,
                'jenis_air' => $validated['jenis_air'] ?? $property->jenis_air,
                'condition' => $validated['condition'] ?? $property->condition,
                'certificate_type' => $validated['certificate_type'] ?? $property->certificate_type,
                'land_size_min' => $validated['land_size_min'] ?? $property->land_size_min,
                'land_size_max' => $validated['land_size_max'] ?? ($validated['land_size_min'] ?? $property->land_size_max),
                'building_size_min' => $validated['building_size_min'] ?? $property->building_size_min,
                'building_size_max' => $validated['building_size_max'] ?? $property->building_size_max,

                'keunggulan' => json_decode($validated['keunggulan'] ?? '[]', true),
                'fasilitas' => json_decode($validated['fasilitas'] ?? '[]', true),
                'nearby_places' => json_decode($validated['nearby_places'] ?? '[]', true),

                'promo_text' => $validated['promo_text'] ?? $property->promo_text,
                'has_promo' => !empty($validated['promo_text'] ?? $property->promo_text) || (isset($validated['promos']) ? !empty(json_decode($validated['promos'], true)) : $property->promos()->exists()),
                'is_available' => $validated['is_available'] ?? $property->is_available,
                'is_verified' => false, // Need re-verification after edit
                'is_draft' => $validated['is_draft'] ?? $property->is_draft,
                'main_image' => $mainImageUrl ?? $property->main_image,
                'images' => !empty($galleryImages) ? array_merge($property->images ?? [], $galleryImages) : $property->images,
                'last_updated' => now(),
            ]);

            if (isset($validated['promos'])) {
                $property->promos()->sync(json_decode($validated['promos'], true));
            }

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Step saved successfully',
                    'id' => $property->id,
                ]);
            }

            return redirect()->route('agent.dashboard.listing-saya')
                ->with('success', 'Properti berhasil diperbarui! Menunggu verifikasi ulang.');

        } catch (\Exception $e) {
            \Log::error('Property update error: ' . $e->getMessage());
            return back()->withErrors([
                'general' => 'Terjadi kesalahan saat memperbarui properti: ' . $e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Show upload listing form
     */
    public function uploadListingForm()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        // Get developers
        $developers = Developer::select('id', 'name')->orderBy('name')->get();

        // Get property categories
        $categories = PropertyCategory::where('is_active', true)
            ->select('id', 'name', 'slug')
            ->orderBy('order')
            ->get();

        // Get keunggulan list from database
        $keunggulanList = \App\Models\Keunggulan::select('id', 'nama', 'icon', 'keterangan')
            ->orderBy('nama')
            ->get();

        // Get fasilitas list from database
        $fasilitasList = \App\Models\Fasilitas::select('id', 'nama', 'icon')
            ->orderBy('nama')
            ->get();

        // Get kategori places list from database
        $kategoriPlacesList = \App\Models\KategoriPlace::select('id', 'nama')
            ->orderBy('nama')
            ->get();

        // Get active promos
        $promosList = \App\Models\Promo::where('is_active', true)
            ->select('id', 'nama')
            ->get();

        return Inertia::render('DashboardAgent/UploadListing/index', [
            'agent' => $this->getAgentData(),
            'developers' => $developers,
            'categories' => $categories,
            'keunggulanList' => $keunggulanList,
            'fasilitasList' => $fasilitasList,
            'kategoriPlacesList' => $kategoriPlacesList,
            'promosList' => $promosList,
        ]);
    }

    /**
     * Store a new property listing
     */
    public function storeProperty(Request $request)
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'provinsi' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'location' => ['required', 'string', 'max:255'],
            'url_maps' => ['nullable', 'url', 'max:500'],
            'units_remaining' => ['nullable', 'integer', 'min:0'],
            'developer_id' => ['nullable', 'exists:developers,id'],
            'kategori' => ['nullable', 'string'], // JSON string

            'price_min' => ['nullable', 'numeric', 'min:0'],

            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'carport' => ['nullable', 'integer', 'min:0'],
            'certificate_type' => ['nullable', 'string', 'max:50'],
            'land_size_min' => ['nullable', 'integer', 'min:0'],
            'land_size_max' => ['nullable', 'integer', 'min:0'],
            'building_size_min' => ['nullable', 'integer', 'min:0'],
            'building_size_max' => ['nullable', 'integer', 'min:0'],
            'listrik' => ['nullable', 'integer', 'min:0'],
            'jenis_air' => ['nullable', 'string', 'max:50'],
            'condition' => ['nullable', 'string', 'in:Baru,Bekas'],

            'keunggulan' => ['nullable', 'string'], // JSON string - array of IDs
            'fasilitas' => ['nullable', 'string'], // JSON string - array of IDs
            'nearby_places' => ['nullable', 'string'], // JSON string - array of IDs
            'promos' => ['nullable', 'string'], // JSON string - array of IDs

            'promo_text' => ['nullable', 'string', 'max:2000'],

            'main_image' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,svg,webp,avif', 'max:5120'], // 5MB max
            'images.*' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,svg,webp,avif', 'max:5120'], // 5MB max
            'is_draft' => ['nullable', 'boolean'],
        ]);

        try {
            // Increase execution time and memory for image processing
            set_time_limit(120); // 2 minutes for multiple image uploads
            ini_set('memory_limit', '256M');

            // Sanitize promo_text to prevent XSS and code injection
            $sanitizedPromoText = null;
            if (!empty($validated['promo_text'])) {
                // Strip all HTML tags
                $sanitizedPromoText = strip_tags($validated['promo_text']);
                // Remove any remaining script-like content
                $sanitizedPromoText = preg_replace('/javascript:/i', '', $sanitizedPromoText);
                $sanitizedPromoText = preg_replace('/on\w+\s*=/i', '', $sanitizedPromoText);
                // Trim whitespace
                $sanitizedPromoText = trim($sanitizedPromoText);
                // Convert special characters to HTML entities
                $sanitizedPromoText = htmlspecialchars($sanitizedPromoText, ENT_QUOTES, 'UTF-8');
            }

            // Initialize GCS service
            $storageService = new GoogleStorageService();

            // Handle main image upload to GCS
            $mainImageUrl = null;
            if ($request->hasFile('main_image')) {
                $result = $storageService->uploadPropertyImage(
                    $request->file('main_image'),
                    'website_image_listing'
                );
                $mainImageUrl = $result['url'];
            }

            // Handle gallery images upload to GCS
            $galleryImages = [];
            if ($request->hasFile('images')) {
                $results = $storageService->uploadMultiplePropertyImages(
                    $request->file('images'),
                    'website_image_listing'
                );
                $galleryImages = array_map(fn($r) => $r['url'], $results);
            }

            // Create property
            $property = Property::create([
                'name' => $validated['name'],
                'provinsi' => $validated['provinsi'],
                'city' => $validated['city'],
                'location' => $validated['location'],
                'url_maps' => $validated['url_maps'] ?? null,
                'units_remaining' => $validated['units_remaining'] ?? null,
                'developer_id' => $validated['developer_id'] ?? null,
                'kategori' => json_decode($validated['kategori'] ?? '[]', true),

                'price_min' => $validated['price_min'] ?? 0,
                'price_max' => $validated['price_min'] ?? 0, // Same as price_min since we removed max

                'bedrooms' => $validated['bedrooms'] ?? 0,
                'bathrooms' => $validated['bathrooms'] ?? null,
                'carport' => $validated['carport'] ?? null,
                'certificate_type' => $validated['certificate_type'] ?? null,
                'land_size_min' => $validated['land_size_min'] ?? 0,
                'land_size_max' => $validated['land_size_max'] ?? ($validated['land_size_min'] ?? 0),
                'building_size_min' => $validated['building_size_min'] ?? 0,
                'building_size_max' => $validated['building_size_max'] ?? null,
                'listrik' => $validated['listrik'] ?? null,
                'jenis_air' => $validated['jenis_air'] ?? null,
                'condition' => $validated['condition'] ?? null,

                'keunggulan' => json_decode($validated['keunggulan'] ?? '[]', true),
                'fasilitas' => json_decode($validated['fasilitas'] ?? '[]', true),
                'nearby_places' => json_decode($validated['nearby_places'] ?? '[]', true),

                'promo_text' => $sanitizedPromoText,
                'has_promo' => !empty($sanitizedPromoText) || !empty(json_decode($validated['promos'] ?? '[]', true)),

                'main_image' => $mainImageUrl,
                'images' => $galleryImages,

                'button_type' => 'whatsapp',
                'is_available' => true,
                'is_popular' => false,
                'is_verified' => false, // Needs admin verification
                'is_draft' => $validated['is_draft'] ?? true,
                'agen_id' => $agent->id,
                'last_updated' => now(),
                'count_clicked' => 0,
            ]);

            // Sync promos
            $property->promos()->sync(json_decode($validated['promos'] ?? '[]', true));

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Step saved successfully',
                    'id' => $property->id,
                ]);
            }

            return redirect()->route('agent.dashboard')
                ->with('success', 'Properti berhasil ditambahkan!');

        } catch (\Exception $e) {
            \Log::error('Property creation error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return back()->withErrors([
                'general' => 'Terjadi kesalahan saat menyimpan properti: ' . $e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Show leads page
     */
    public function leads()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        // Get leads for this agent
        $leads = \App\Models\LeadsAgent::where('agent_id', $agent->id)
            ->with('property:id,name')
            ->orderBy('tanggal_leads', 'desc')
            ->get();

        // Calculate stats
        $stats = [
            'total' => $leads->count(),
            'cold' => $leads->where('status_lead', 'cold')->count(),
            'warm' => $leads->where('status_lead', 'warm')->count(),
            'hot' => $leads->where('status_lead', 'hot')->count(),
            'followed' => $leads->where('status_followup', 'sudah')->count(),
            'notFollowed' => $leads->where('status_followup', 'belum')->count(),
        ];

        return Inertia::render('DashboardAgent/Leads/index', [
            'agent' => $this->getAgentData(),
            'leads' => $leads,
            'stats' => $stats,
        ]);
    }

    /**
     * Show report page with comprehensive analytics
     */
    public function report()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        // Get all properties for this agent
        $properties = Property::where('agen_id', $agent->id)->get();

        // Listing statistics
        $totalListings = $properties->count();
        $activeListings = $properties->where('is_available', true)->where('is_verified', true)->count();
        $pendingListings = $properties->where('is_verified', false)->where('is_draft', false)->count();
        $draftListings = $properties->where('is_draft', true)->count();
        $totalViews = $properties->sum('count_clicked') ?? 0;

        // Lead statistics
        $leads = \App\Models\LeadsAgent::where('agent_id', $agent->id)->get();
        $totalLeads = $leads->count();
        $coldLeads = $leads->where('status_lead', 'cold')->count();
        $warmLeads = $leads->where('status_lead', 'warm')->count();
        $hotLeads = $leads->where('status_lead', 'hot')->count();
        $followedLeads = $leads->where('status_followup', 'sudah')->count();
        $unfollowedLeads = $leads->where('status_followup', 'belum')->count();

        // Calculate conversion rate (views to leads percentage)
        $conversionRate = $totalViews > 0 ? round(($totalLeads / $totalViews) * 100, 2) : 0;

        // Calculate trends (comparing current month vs last month)
        $currentMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();

        $currentMonthLeads = \App\Models\LeadsAgent::where('agent_id', $agent->id)
            ->where('tanggal_leads', '>=', $currentMonth)
            ->count();
        $lastMonthLeads = \App\Models\LeadsAgent::where('agent_id', $agent->id)
            ->whereBetween('tanggal_leads', [$lastMonth, $lastMonthEnd])
            ->count();
        $leadsTrend = $lastMonthLeads > 0 ? round((($currentMonthLeads - $lastMonthLeads) / $lastMonthLeads) * 100) : 0;

        // Views trend (simplified - would need historical data for real trend)
        $viewsTrend = 0; // Placeholder - requires view history tracking
        $listingsTrend = 0; // Placeholder - requires listing history tracking

        // Monthly data for charts (last 6 months)
        $monthlyLabels = [];
        $monthlyViews = [];
        $monthlyLeads = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthlyLabels[] = $month->format('M');

            // Get leads count for this month
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();
            $monthlyLeads[] = \App\Models\LeadsAgent::where('agent_id', $agent->id)
                ->whereBetween('tanggal_leads', [$monthStart, $monthEnd])
                ->count();

            // Views - using placeholder (would need view history for real data)
            $monthlyViews[] = 0; // Placeholder
        }

        // Top properties by views
        $topProperties = $properties
            ->sortByDesc('count_clicked')
            ->take(5)
            ->map(function ($property) use ($agent) {
                $leadsCount = \App\Models\LeadsAgent::where('agent_id', $agent->id)
                    ->where('property_id', $property->id)
                    ->count();

                return [
                    'id' => $property->id,
                    'name' => $property->name,
                    'views' => $property->count_clicked ?? 0,
                    'leads' => $leadsCount,
                    'location' => $property->location ?? '-',
                ];
            })
            ->values()
            ->toArray();

        // Lead sources (from listing_source field)
        $leadSources = $leads->groupBy('listing_source')
            ->map(function ($group, $source) use ($totalLeads) {
                $count = $group->count();
                return [
                    'name' => $source ?: 'Unknown',
                    'count' => $count,
                    'percentage' => $totalLeads > 0 ? round(($count / $totalLeads) * 100, 1) : 0,
                ];
            })
            ->values()
            ->take(5)
            ->toArray();

        // Weekly activity (leads per day of week)
        $weeklyActivity = [];
        for ($i = 0; $i < 7; $i++) {
            $dayStart = now()->startOfWeek()->addDays($i)->startOfDay();
            $dayEnd = now()->startOfWeek()->addDays($i)->endOfDay();

            $weeklyActivity[] = \App\Models\LeadsAgent::where('agent_id', $agent->id)
                ->whereBetween('tanggal_leads', [$dayStart, $dayEnd])
                ->count();
        }

        // Average response time (placeholder - would need response tracking)
        $avgResponseTime = '-';

        return Inertia::render('DashboardAgent/Report/index', [
            'agent' => $this->getAgentData(),
            'reportData' => [
                // Performance Summary
                'totalListings' => $totalListings,
                'activeListings' => $activeListings,
                'pendingListings' => $pendingListings,
                'draftListings' => $draftListings,
                'totalViews' => $totalViews,
                'totalLeads' => $totalLeads,
                'conversionRate' => $conversionRate,
                'avgResponseTime' => $avgResponseTime,

                // Lead Stats
                'coldLeads' => $coldLeads,
                'warmLeads' => $warmLeads,
                'hotLeads' => $hotLeads,
                'followedLeads' => $followedLeads,
                'unfollowedLeads' => $unfollowedLeads,

                // Trends
                'viewsTrend' => $viewsTrend,
                'leadsTrend' => $leadsTrend,
                'listingsTrend' => $listingsTrend,

                // Monthly Data
                'monthlyViews' => $monthlyViews,
                'monthlyLeads' => $monthlyLeads,
                'monthlyLabels' => $monthlyLabels,

                // Top Properties
                'topProperties' => $topProperties,

                // Lead Sources
                'leadSources' => $leadSources,

                // Weekly Activity
                'weeklyActivity' => $weeklyActivity,
            ],
        ]);
    }

    /**
     * Show beli credit page with membership packages
     */
    public function beliCredit()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        // Get highlight memberships only (sorted by price)
        $memberships = \App\Models\Membership::where('jenis', 'highlight')
            ->orderBy('harga->amount', 'asc')
            ->get()
            ->map(function ($membership) {
                return [
                    'id' => $membership->id,
                    'nama' => $membership->nama,
                    'jenis' => $membership->jenis,
                    'deskripsi' => $membership->deskripsi,
                    'harga' => $membership->harga,
                    'jumlah_highlight' => $membership->jumlah_highlight,
                    'formatted_harga' => $membership->formatted_harga,
                    'formatted_highlight' => $membership->formatted_highlight,
                ];
            });

        // Get active credits for this agent
        $activeCredits = \App\Models\AgenCredit::with(['membership:id,nama,jenis'])
            ->where('agen_id', $agent->id)
            ->where('is_active', true)
            ->where('expired_at', '>', now())
            ->orderBy('expired_at', 'asc')
            ->get();

        // Calculate total remaining highlight
        $totalRemainingHighlight = $activeCredits->sum('remaining_highlight');

        // Midtrans config for frontend
        $midtransConfig = [
            'clientKey' => config('midtrans.client_key'),
            'snapUrl' => config('midtrans.is_production')
                ? 'https://app.midtrans.com/snap/snap.js'
                : 'https://app.sandbox.midtrans.com/snap/snap.js',
        ];

        return Inertia::render('DashboardAgent/BeliCredit/index', [
            'agent' => $this->getAgentData(),
            'memberships' => $memberships,
            'activeCredits' => $activeCredits,
            'totalRemainingHighlight' => $totalRemainingHighlight,
            'midtransConfig' => $midtransConfig,
        ]);
    }

    /**
     * Show history credit page with transactions
     */
    public function historyCredit()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        // Get all transactions for this agent
        $transactions = \App\Models\MembershipTransaction::with(['membership:id,nama,jenis,harga'])
            ->where('agen_id', $agent->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'order_id' => $transaction->order_id,
                    'membership_name' => $transaction->membership->nama ?? 'N/A',
                    'membership_type' => $transaction->membership->jenis ?? 'N/A',
                    'gross_amount' => $transaction->gross_amount,
                    'status' => $transaction->status,
                    'payment_type' => $transaction->payment_type,
                    'created_at' => $transaction->created_at->format('d M Y H:i'),
                    'snap_token' => $transaction->status === 'pending' ? $transaction->snap_token : null,
                ];
            });

        // Calculate stats
        $stats = [
            'total' => $transactions->count(),
            'settlement' => $transactions->where('status', 'settlement')->count(),
            'pending' => $transactions->where('status', 'pending')->count(),
            'totalSpent' => $transactions->where('status', 'settlement')->sum('gross_amount'),
        ];

        // Midtrans config for retry payment
        $midtransConfig = [
            'clientKey' => config('midtrans.client_key'),
            'snapUrl' => config('midtrans.is_production')
                ? 'https://app.midtrans.com/snap/snap.js'
                : 'https://app.sandbox.midtrans.com/snap/snap.js',
        ];

        return Inertia::render('DashboardAgent/HistoryCredit/index', [
            'agent' => $this->getAgentData(),
            'transactions' => $transactions,
            'stats' => $stats,
            'midtransConfig' => $midtransConfig,
        ]);
    }

    /**
     * Show profile page
     */
    public function profileForm()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        return Inertia::render('DashboardAgent/Profile/index', [
            'agent' => $this->getAgentData(),
        ]);
    }

    /**
     * Update profile
     */
    public function updateProfile(Request $request)
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        $jenisAkun = $request->input('jenis_akun', $agent->jenis_akun);
        $isAgensiBroker = $jenisAkun === 'agensi_broker';

        // Base validation rules
        $rules = [
            'jenis_akun' => ['required', 'in:agensi_broker,agent_perorangan'],
        ];

        $messages = [
            'jenis_akun.required' => 'Jenis akun wajib dipilih.',
        ];

        // Validation rules based on account type
        if ($isAgensiBroker) {
            // Agensi/Broker validation
            $rules = array_merge($rules, [
                'nama_agensi' => ['required', 'string', 'max:255'],
                'email_agensi' => ['required', 'email', 'max:255'],
                'website_agensi' => ['nullable', 'url', 'max:500'],
                'logo_agensi' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:1024'],
                'nama_pic' => ['required', 'string', 'max:255'],
                'email_pic' => ['required', 'email', 'max:255'],
                'wa_pic' => ['required', 'string', 'max:20'],
                'foto_pic' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:1024'],
                'ktp_pic' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:1024'],
            ]);

            $messages = array_merge($messages, [
                'nama_agensi.required' => 'Nama agensi wajib diisi.',
                'email_agensi.required' => 'Email agensi wajib diisi.',
                'email_agensi.email' => 'Format email agensi tidak valid.',
                'logo_agensi.max' => 'Ukuran logo maksimal 1MB.',
                'nama_pic.required' => 'Nama PIC wajib diisi.',
                'email_pic.required' => 'Email PIC wajib diisi.',
                'wa_pic.required' => 'No. WhatsApp PIC wajib diisi.',
                'foto_pic.max' => 'Ukuran foto PIC maksimal 1MB.',
                'ktp_pic.max' => 'Ukuran foto KTP PIC maksimal 1MB.',
            ]);
        } else {
            // Agent Perorangan / Developer validation
            $rules = array_merge($rules, [
                'name' => ['required', 'string', 'max:255'],
                'phone' => ['nullable', 'string', 'max:20'],
                'license_number' => ['nullable', 'string', 'max:100'],
                'photo' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:1024'],
                'ktp' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:1024'],
            ]);

            $messages = array_merge($messages, [
                'name.required' => 'Nama lengkap wajib diisi.',
                'photo.max' => 'Ukuran foto profil maksimal 1MB.',
                'ktp.max' => 'Ukuran foto KTP maksimal 1MB.',
            ]);
        }

        $validated = $request->validate($rules, $messages);

        try {
            // Initialize GCS service
            $storageService = new GoogleStorageService();

            // Base update data
            $updateData = [
                'jenis_akun' => $validated['jenis_akun'],
            ];

            if ($isAgensiBroker) {
                // Agensi/Broker fields
                $updateData['nama_agensi'] = $validated['nama_agensi'];
                $updateData['email_agensi'] = $validated['email_agensi'];
                $updateData['website_agensi'] = $validated['website_agensi'] ?? null;
                $updateData['nama_pic'] = $validated['nama_pic'];
                $updateData['email_pic'] = $validated['email_pic'];
                $updateData['wa_pic'] = $validated['wa_pic'];

                // Handle logo upload
                if ($request->hasFile('logo_agensi')) {
                    $result = $storageService->uploadPropertyImage(
                        $request->file('logo_agensi'),
                        'big-property/agents/logos'
                    );
                    $updateData['logo_agensi'] = $result['url'];
                }

                // Handle foto PIC upload
                if ($request->hasFile('foto_pic')) {
                    $result = $storageService->uploadPropertyImage(
                        $request->file('foto_pic'),
                        'big-property/agents/photos'
                    );
                    $updateData['foto_pic'] = $result['url'];
                }

                // Handle KTP PIC upload
                if ($request->hasFile('ktp_pic')) {
                    $result = $storageService->uploadPropertyImage(
                        $request->file('ktp_pic'),
                        'big-property/agents/ktp'
                    );
                    $updateData['ktp_pic'] = $result['url'];
                }
            } else {
                // Agent Perorangan / Developer fields
                $updateData['name'] = $validated['name'];
                $updateData['phone'] = $validated['phone'] ?? null;
                $updateData['license_number'] = $validated['license_number'] ?? null;

                // Handle photo upload
                if ($request->hasFile('photo')) {
                    $result = $storageService->uploadPropertyImage(
                        $request->file('photo'),
                        'big-property/agents/photos'
                    );
                    $updateData['photo'] = $result['url'];
                }

                // Handle KTP upload
                if ($request->hasFile('ktp')) {
                    $result = $storageService->uploadPropertyImage(
                        $request->file('ktp'),
                        'big-property/agents/ktp'
                    );
                    $updateData['ktp'] = $result['url'];
                }
            }

            $agent->update($updateData);

            // Check if profile is now complete
            if ($agent->isProfileComplete()) {
                return redirect()->route('agent.dashboard')
                    ->with('success', 'Profil berhasil dilengkapi! Selamat datang di Agent Hub.');
            }

            return back()->with('success', 'Profil berhasil diperbarui!');

        } catch (\Exception $e) {
            \Log::error('Profile update error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}

