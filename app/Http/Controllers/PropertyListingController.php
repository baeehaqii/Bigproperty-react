<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Developer;
use App\Models\PropertyCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class PropertyListingController extends Controller
{
    /**
     * Display property listing for Beli (Buy)
     */
    public function beli(Request $request)
    {
        return $this->renderListing($request, 'beli');
    }

    /**
     * Display property listing for Sewa (Rent)
     */
    public function sewa(Request $request)
    {
        return $this->renderListing($request, 'sewa');
    }

    /**
     * Render property listing page with comprehensive filters
     */
    private function renderListing(Request $request, string $type)
    {
        // Get all filters from request
        $filters = $this->extractFilters($request);
        $sort = $request->input('sort', 'terbaru');
        $perPage = min((int) $request->input('per_page', 20), 50); // Max 50 per page

        // Build optimized query with eager loading to avoid N+1
        $query = Property::query()
            ->with(['developer:id,name,logo']) // Eager load only needed columns
            ->select([
                'id',
                'name',
                'city',
                'provinsi',
                'location',
                'price_min',
                'price_max',
                'installment_start',
                'bedrooms',
                'bathrooms',
                'carport',
                'listrik',
                'land_size_min',
                'land_size_max',
                'building_size_min',
                'building_size_max',
                'certificate_type',
                'market_type',
                'construction_status',
                'kategori',
                'images',
                'main_image',
                'is_available',
                'is_verified',
                'has_promo',
                'tanpa_perantara',
                'developer_id',
                'button_type',
                'count_clicked',
                'last_updated'
            ])
            ->where('is_available', true);

        // Filter by listing type (beli/sewa)
        // Properties have 'kategori' JSON column with values like 'Beli Rumah', 'Sewa Apartemen', etc.
        // We filter by checking if any category starts with the listing type prefix
        $listingPrefix = $type === 'beli' ? 'Beli' : 'Sewa';
        $query->where(function ($q) use ($listingPrefix) {
            // Search for categories that start with the listing prefix (case-insensitive)
            $q->where('kategori', 'like', '%"' . $listingPrefix . ' %')
                ->orWhere('kategori', 'like', '%"' . $listingPrefix . '"%');
        });

        // Apply all filters using indexed columns
        $this->applyFilters($query, $filters);

        // Apply sorting (using indexed columns for performance)
        $this->applySorting($query, $sort);

        // Paginate results
        $properties = $query->paginate($perPage);

        // Format properties for frontend (single transformation, no extra queries)
        $formattedProperties = $this->formatProperties($properties->getCollection(), $type);

        // Get filter options from database (cached for performance)
        $filterOptions = $this->getFilterOptions();

        // Get categories based on type
        $categories = $this->getCategories($type);

        return Inertia::render('PropertyListing', [
            'type' => $type,
            'properties' => $formattedProperties,
            'categories' => $categories,
            'developers' => $filterOptions['developers'],
            'pagination' => [
                'total' => $properties->total(),
                'perPage' => $properties->perPage(),
                'currentPage' => $properties->currentPage(),
                'lastPage' => $properties->lastPage(),
            ],
            'filters' => $filters,
            'filterOptions' => $filterOptions,
        ]);
    }

    /**
     * Extract all filter parameters from request
     */
    private function extractFilters(Request $request): array
    {
        return [
            'search' => $request->input('search'),
            'category' => $request->input('category'),

            // Tipe Pasar
            'marketType' => $request->input('market_type', []),

            // Harga
            'priceMin' => $request->input('price_min'),
            'priceMax' => $request->input('price_max'),

            // Tipe Properti
            'propertyTypes' => $request->input('property_types', []),

            // Iklan Spesial
            'isVerified' => $request->boolean('is_verified'),
            'hasPromo' => $request->boolean('has_promo'),
            'tanpaPerantara' => $request->boolean('tanpa_perantara'),

            // Developer
            'developerId' => $request->input('developer_id'),

            // Kamar
            'bedrooms' => $request->input('bedrooms'),
            'bathrooms' => $request->input('bathrooms'),

            // Luas
            'landSizeMin' => $request->input('land_size_min'),
            'landSizeMax' => $request->input('land_size_max'),
            'buildingSizeMin' => $request->input('building_size_min'),
            'buildingSizeMax' => $request->input('building_size_max'),

            // Sertifikat
            'certificates' => $request->input('certificates', []),

            // Carport
            'carport' => $request->input('carport'),

            // Listrik
            'listrik' => $request->input('listrik', []),

            // Status Konstruksi
            'constructionStatus' => $request->input('construction_status', []),

            // Kota
            'city' => $request->input('city'),
        ];
    }

    /**
     * Apply all filters to query using indexed columns
     */
    private function applyFilters($query, array $filters): void
    {
        // Search filter (uses indexes on name, location, city)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        // Tipe Pasar (uses index on market_type)
        if (!empty($filters['marketType']) && is_array($filters['marketType'])) {
            $query->whereIn('market_type', $filters['marketType']);
        }

        // Price filter (uses composite index idx_available_price)
        if (!empty($filters['priceMin'])) {
            $query->where('price_min', '>=', (float) $filters['priceMin']);
        }
        if (!empty($filters['priceMax'])) {
            $query->where('price_max', '<=', (float) $filters['priceMax']);
        }

        // Property types (kategori JSON column)
        if (!empty($filters['propertyTypes']) && is_array($filters['propertyTypes'])) {
            $query->where(function ($q) use ($filters) {
                foreach ($filters['propertyTypes'] as $type) {
                    $q->orWhereJsonContains('kategori', $type);
                }
            });
        }

        // Category filter (from kategori JSON column)
        if (!empty($filters['category'])) {
            $query->whereJsonContains('kategori', $filters['category']);
        }

        // Iklan Spesial filters (uses indexes)
        if ($filters['isVerified']) {
            $query->where('is_verified', true);
        }
        if ($filters['hasPromo']) {
            $query->where('has_promo', true);
        }
        if ($filters['tanpaPerantara']) {
            $query->where('tanpa_perantara', true);
        }

        // Developer filter (uses index on developer_id)
        if (!empty($filters['developerId'])) {
            $query->where('developer_id', $filters['developerId']);
        }

        // Bedrooms filter (uses index on bedrooms)
        if (!empty($filters['bedrooms']) && $filters['bedrooms'] !== 'semua') {
            $minBedrooms = (int) str_replace('+', '', $filters['bedrooms']);
            $query->where('bedrooms', '>=', $minBedrooms);
        }

        // Bathrooms filter (uses index on bathrooms)
        if (!empty($filters['bathrooms']) && $filters['bathrooms'] !== 'semua') {
            $minBathrooms = (int) str_replace('+', '', $filters['bathrooms']);
            $query->where('bathrooms', '>=', $minBathrooms);
        }

        // Land size filter (uses indexes)
        if (!empty($filters['landSizeMin'])) {
            $query->where('land_size_min', '>=', (int) $filters['landSizeMin']);
        }
        if (!empty($filters['landSizeMax'])) {
            $query->where('land_size_max', '<=', (int) $filters['landSizeMax']);
        }

        // Building size filter (uses indexes)
        if (!empty($filters['buildingSizeMin'])) {
            $query->where('building_size_min', '>=', (int) $filters['buildingSizeMin']);
        }
        if (!empty($filters['buildingSizeMax'])) {
            $query->where('building_size_max', '<=', (int) $filters['buildingSizeMax']);
        }

        // Certificate filter (uses index on certificate_type)
        if (!empty($filters['certificates']) && is_array($filters['certificates'])) {
            $query->whereIn('certificate_type', $filters['certificates']);
        }

        // Carport filter (uses index on carport)
        if (!empty($filters['carport']) && $filters['carport'] !== 'semua') {
            $minCarport = (int) str_replace('+', '', $filters['carport']);
            $query->where('carport', '>=', $minCarport);
        }

        // Listrik filter (uses index on listrik)
        if (!empty($filters['listrik']) && is_array($filters['listrik'])) {
            $query->whereIn('listrik', array_map('intval', $filters['listrik']));
        }

        // Construction status filter (uses index)
        if (!empty($filters['constructionStatus']) && is_array($filters['constructionStatus'])) {
            $query->whereIn('construction_status', $filters['constructionStatus']);
        }

        // City filter
        if (!empty($filters['city'])) {
            $query->where('city', $filters['city']);
        }
    }

    /**
     * Apply sorting using indexed columns
     */
    private function applySorting($query, string $sort): void
    {
        switch ($sort) {
            case 'termurah':
                $query->orderBy('price_min', 'asc');
                break;
            case 'termahal':
                $query->orderBy('price_max', 'desc');
                break;
            case 'populer':
                $query->orderBy('count_clicked', 'desc');
                break;
            case 'terbaru':
            default:
                $query->orderBy('last_updated', 'desc');
                break;
        }
    }

    /**
     * Format properties collection for frontend
     * Single pass transformation, no additional queries
     */
    private function formatProperties($properties, string $type): array
    {
        return $properties->map(function ($property) use ($type) {
            // Helper function for private image URL
            $getImageUrl = function ($path) {
                if (!$path)
                    return null;
                return '/storage/private/' . $path;
            };

            return [
                'id' => (string) $property->id,
                'name' => $property->name,
                'type' => $this->getPropertyType($property->kategori),
                'images' => array_filter(array_map($getImageUrl, $property->images ?? [])),
                'mainImage' => $getImageUrl($property->main_image),
                'priceRange' => $property->price_range,
                'pricePerPeriod' => $type === 'sewa' ? '/Tahun' : null,
                'installment' => $type === 'beli' ? $property->installment_text : null,
                'location' => $property->location,
                'city' => $property->city,
                'bedrooms' => (int) $property->bedrooms,
                'bathrooms' => (int) ($property->bathrooms ?? 0),
                'landSize' => $property->land_size_text,
                'buildingSize' => $property->building_size_text,
                'certificateType' => $property->certificate_type,
                'marketType' => $property->market_type ?? 'baru',
                // Developer is already eager loaded
                'developer' => $property->developer ? [
                    'name' => $property->developer->name,
                    'logo' => $getImageUrl($property->developer->logo),
                ] : null,
                'isFurnished' => false,
                'isVerified' => (bool) $property->is_verified,
                'hasPromo' => (bool) $property->has_promo,
                'lastUpdated' => $property->last_updated ? $property->last_updated->diffForHumans() : 'Baru saja',
                'countClicked' => $property->count_clicked ?? 0,
                'isAvailable' => $property->is_available,
                'buttonType' => $property->button_type ?? 'chat',
            ];
        })->toArray();
    }

    /**
     * Get filter options from database (cached for performance)
     */
    private function getFilterOptions(): array
    {
        // Cache developers list for 1 hour
        $developers = Cache::remember('property_filter_developers', 3600, function () {
            return Developer::select('id', 'name', 'logo')
                ->orderBy('name')
                ->get()
                ->map(function ($dev) {
                    return [
                        'id' => $dev->id,
                        'name' => $dev->name,
                        'logo' => $dev->logo ? '/storage/private/' . $dev->logo : null,
                    ];
                })
                ->toArray();
        });

        // Cache distinct certificate types for 1 hour
        $certificateTypes = Cache::remember('property_filter_certificates', 3600, function () {
            return Property::whereNotNull('certificate_type')
                ->distinct()
                ->pluck('certificate_type')
                ->filter()
                ->values()
                ->toArray();
        });

        // Cache distinct cities for 1 hour
        $cities = Cache::remember('property_filter_cities', 3600, function () {
            return Property::where('is_available', true)
                ->distinct()
                ->pluck('city')
                ->filter()
                ->sort()
                ->values()
                ->toArray();
        });

        return [
            'developers' => $developers,
            'certificateTypes' => $certificateTypes,
            'cities' => $cities,
        ];
    }

    /**
     * Get categories based on type
     */
    private function getCategories(string $type): array
    {
        $section = $type === 'beli' ? 'buy' : 'rent';

        return Cache::remember("property_categories_{$section}", 3600, function () use ($section) {
            return PropertyCategory::where('section', $section)
                ->where('is_active', true)
                ->orderBy('order')
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'icon' => $category->icon,
                        'section' => $category->section,
                        'is_highlighted' => $category->is_highlighted,
                        'has_badge' => $category->has_badge,
                        'badge_text' => $category->badge_text,
                        'badge_color' => $category->badge_color,
                        'order' => $category->order,
                        'is_active' => $category->is_active,
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Get property type from kategori array
     */
    private function getPropertyType($kategori): string
    {
        if (!$kategori || !is_array($kategori)) {
            return 'Rumah';
        }
        return $kategori[0] ?? 'Rumah';
    }

    /**
     * API endpoint to get property count with filters (for live count in filter modal)
     */
    public function getFilteredCount(Request $request)
    {
        $filters = $this->extractFilters($request);

        $query = Property::query()
            ->where('is_available', true);

        $this->applyFilters($query, $filters);

        return response()->json([
            'count' => $query->count(),
        ]);
    }

    /**
     * API endpoint for search suggestions
     */
    public function searchSuggestions(Request $request)
    {
        $query = $request->input('q');
        if (strlen($query) < 2) {
            return response()->json(['suggestions' => []]);
        }

        // Search Cities
        $cities = Property::where('city', 'like', "%{$query}%")
            ->where('is_available', true)
            ->distinct()
            ->select('city')
            ->limit(3)
            ->get()
            ->map(fn($item) => [
                'type' => 'city',
                'label' => $item->city,
                'value' => $item->city,
                'subtext' => 'Kota & Kabupaten',
                'icon' => 'map-pin'
            ]);

        // Search Developers
        $developers = Developer::where('name', 'like', "%{$query}%")
            ->select('id', 'name')
            ->limit(3)
            ->get()
            ->map(fn($item) => [
                'type' => 'developer',
                'label' => $item->name,
                'value' => $item->id,
                'subtext' => 'Developer',
                'icon' => 'building'
            ]);

        // Search Properties
        $properties = Property::where('name', 'like', "%{$query}%")
            ->where('is_available', true)
            ->select('id', 'name', 'city')
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'type' => 'property',
                'label' => $item->name,
                'value' => $item->name, // Search by name
                'subtext' => $item->city,
                'icon' => 'home'
            ]);

        return response()->json([
            'suggestions' => $cities->merge($developers)->merge($properties)
        ]);
    }
}
