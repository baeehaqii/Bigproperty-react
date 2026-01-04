<?php

namespace App\Http\Controllers;

use App\Models\Developer;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Services\CloudinaryService;
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
            'developer_id' => $agent->developer_id,
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

        // Get all properties for this agent
        $listings = Property::where('agen_id', $agent->id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate stats
        $stats = [
            'total' => $listings->count(),
            'active' => $listings->where('is_available', true)->where('is_verified', true)->count(),
            'pending' => $listings->where('is_verified', false)->count(),
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

            'price_min' => ['required', 'numeric', 'min:0'],
            'price_max' => ['nullable', 'numeric', 'min:0'],
            'installment_start' => ['required', 'numeric', 'min:0'],

            'bedrooms' => ['required', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'carport' => ['nullable', 'integer', 'min:0'],
            'listrik' => ['nullable', 'integer', 'min:0'],
            'certificate_type' => ['nullable', 'string', 'max:50'],
            'land_size_min' => ['required', 'integer', 'min:0'],
            'land_size_max' => ['nullable', 'integer', 'min:0'],
            'building_size_min' => ['required', 'integer', 'min:0'],
            'building_size_max' => ['nullable', 'integer', 'min:0'],

            'keunggulan' => ['nullable', 'string'],
            'fasilitas' => ['nullable', 'string'],
            'nearest_place' => ['nullable', 'string'],

            'promo_text' => ['nullable', 'string', 'max:2000'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        try {
            $property->update([
                'name' => $validated['name'],
                'provinsi' => $validated['provinsi'],
                'city' => $validated['city'],
                'location' => $validated['location'],
                'url_maps' => $validated['url_maps'] ?? $property->url_maps,
                'units_remaining' => $validated['units_remaining'] ?? $property->units_remaining,
                'developer_id' => $validated['developer_id'] ?? $property->developer_id,
                'kategori' => json_decode($validated['kategori'] ?? '[]', true),

                'price_min' => $validated['price_min'],
                'price_max' => $validated['price_max'] ?? $validated['price_min'],
                'installment_start' => $validated['installment_start'],

                'bedrooms' => $validated['bedrooms'],
                'bathrooms' => $validated['bathrooms'] ?? $property->bathrooms,
                'carport' => $validated['carport'] ?? $property->carport,
                'listrik' => $validated['listrik'] ?? $property->listrik,
                'certificate_type' => $validated['certificate_type'] ?? $property->certificate_type,
                'land_size_min' => $validated['land_size_min'],
                'land_size_max' => $validated['land_size_max'] ?? $validated['land_size_min'],
                'building_size_min' => $validated['building_size_min'],
                'building_size_max' => $validated['building_size_max'] ?? $property->building_size_max,

                'keunggulan' => json_decode($validated['keunggulan'] ?? '[]', true),
                'fasilitas' => json_decode($validated['fasilitas'] ?? '[]', true),
                'nearest_place' => json_decode($validated['nearest_place'] ?? '[]', true),

                'promo_text' => $validated['promo_text'] ?? $property->promo_text,
                'has_promo' => !empty($validated['promo_text']),
                'is_available' => $validated['is_available'] ?? $property->is_available,
                'is_verified' => false, // Need re-verification after edit
                'last_updated' => now(),
            ]);

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

        return Inertia::render('DashboardAgent/UploadListing/index', [
            'agent' => $this->getAgentData(),
            'developers' => $developers,
            'categories' => $categories,
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

            'price_min' => ['required', 'numeric', 'min:0'],
            'price_max' => ['nullable', 'numeric', 'min:0'],
            'installment_start' => ['required', 'numeric', 'min:0'],

            'bedrooms' => ['required', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'carport' => ['nullable', 'integer', 'min:0'],
            'listrik' => ['nullable', 'integer', 'min:0'],
            'certificate_type' => ['nullable', 'string', 'max:50'],
            'land_size_min' => ['required', 'integer', 'min:0'],
            'land_size_max' => ['nullable', 'integer', 'min:0'],
            'building_size_min' => ['required', 'integer', 'min:0'],
            'building_size_max' => ['nullable', 'integer', 'min:0'],

            'keunggulan' => ['nullable', 'string'], // JSON string
            'fasilitas' => ['nullable', 'string'], // JSON string
            'nearest_place' => ['nullable', 'string'], // JSON string

            'promo_text' => ['nullable', 'string', 'max:2000'],

            'main_image' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,svg,webp,avif', 'max:5120'], // 5MB max
            'images.*' => ['nullable', 'file', 'mimes:jpeg,png,jpg,gif,svg,webp,avif', 'max:5120'], // 5MB max

        ]);

        try {
            // Initialize Cloudinary service
            $cloudinaryService = new CloudinaryService();

            // Handle main image upload to Cloudinary
            $mainImageUrl = null;
            if ($request->hasFile('main_image')) {
                $result = $cloudinaryService->uploadPropertyImage(
                    $request->file('main_image'),
                    'big-property/properties'
                );
                $mainImageUrl = $result['url'];
            }

            // Handle gallery images upload to Cloudinary
            $galleryImages = [];
            if ($request->hasFile('images')) {
                $results = $cloudinaryService->uploadMultiplePropertyImages(
                    $request->file('images'),
                    'big-property/properties'
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

                'price_min' => $validated['price_min'],
                'price_max' => $validated['price_max'] ?? $validated['price_min'],
                'installment_start' => $validated['installment_start'],

                'bedrooms' => $validated['bedrooms'],
                'bathrooms' => $validated['bathrooms'] ?? null,
                'carport' => $validated['carport'] ?? null,
                'listrik' => $validated['listrik'] ?? null,
                'certificate_type' => $validated['certificate_type'] ?? null,
                'land_size_min' => $validated['land_size_min'],
                'land_size_max' => $validated['land_size_max'] ?? $validated['land_size_min'],
                'building_size_min' => $validated['building_size_min'],
                'building_size_max' => $validated['building_size_max'] ?? null,

                'keunggulan' => json_decode($validated['keunggulan'] ?? '[]', true),
                'fasilitas' => json_decode($validated['fasilitas'] ?? '[]', true),
                'nearest_place' => json_decode($validated['nearest_place'] ?? '[]', true),

                'promo_text' => $validated['promo_text'] ?? null,
                'has_promo' => !empty($validated['promo_text']),

                'main_image' => $mainImageUrl,
                'images' => $galleryImages,

                'button_type' => 'whatsapp',
                'is_available' => true,
                'is_popular' => false,
                'is_verified' => false, // Needs admin verification

                'agen_id' => $agent->id,
                'last_updated' => now(),
                'count_clicked' => 0,
            ]);

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
     * Show report page (placeholder)
     */
    public function report()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        return Inertia::render('DashboardAgent/Overview/index', [
            'agent' => $this->getAgentData(),
            'stats' => [
                'totalListings' => $agent->properties()->count(),
                'totalViews' => $agent->properties()->sum('count_clicked') ?? 0,
                'totalInquiries' => 0,
                'totalLeads' => 0,
            ],
        ]);
    }

    /**
     * Show beli credit page (placeholder)
     */
    public function beliCredit()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        return Inertia::render('DashboardAgent/Overview/index', [
            'agent' => $this->getAgentData(),
            'stats' => [
                'totalListings' => $agent->properties()->count(),
                'totalViews' => $agent->properties()->sum('count_clicked') ?? 0,
                'totalInquiries' => 0,
                'totalLeads' => 0,
            ],
        ]);
    }

    /**
     * Show history credit page (placeholder)
     */
    public function historyCredit()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        return Inertia::render('DashboardAgent/Overview/index', [
            'agent' => $this->getAgentData(),
            'stats' => [
                'totalListings' => $agent->properties()->count(),
                'totalViews' => $agent->properties()->sum('count_clicked') ?? 0,
                'totalInquiries' => 0,
                'totalLeads' => 0,
            ],
        ]);
    }
}
