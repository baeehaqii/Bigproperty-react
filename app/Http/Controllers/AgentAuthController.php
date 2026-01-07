<?php

namespace App\Http\Controllers;

use App\Models\Agen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class AgentAuthController extends Controller
{
    /**
     * Get the guard to be used during authentication.
     */
    protected function guard()
    {
        return Auth::guard('agent');
    }

    /**
     * Show agent signup form
     */
    public function showSignupForm()
    {
        return Inertia::render('AgentSignup');
    }

    /**
     * Handle agent registration
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:agens,email'],
            'phone' => ['required', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'sumber' => ['required', 'string', 'in:instagram,facebook,whatsapp,email,google,lainnya'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'phone.required' => 'No. WhatsApp wajib diisi.',
            'password.required' => 'Password wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'password.min' => 'Password minimal 8 karakter.',
            'sumber.required' => 'Sumber informasi wajib dipilih.',
            'sumber.in' => 'Sumber informasi tidak valid.',
        ]);

        try {
            // Create agent with password (Agent is its own authenticatable model)
            Agen::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'],
                'sumber' => $validated['sumber'],
                'is_active' => false, // Will be activated by admin
            ]);

            return redirect()->route('agent.login')
                ->with('success', 'Pendaftaran berhasil! Silakan login dengan akun Anda.');

        } catch (\Exception $e) {
            \Log::error('Agent registration error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());

            return back()->withErrors([
                'email' => 'Terjadi kesalahan saat mendaftar: ' . $e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Show agent login form
     */
    public function showLoginForm()
    {
        return Inertia::render('AgentLogin');
    }

    /**
     * Handle agent login
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        // Attempt to authenticate using agent guard
        if ($this->guard()->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            $agent = $this->guard()->user();

            // Check if profile is incomplete using model method
            if (!$agent->isProfileComplete()) {
                return redirect()->route('agent.dashboard.profile')
                    ->with('warning', 'Silakan lengkapi profil Anda terlebih dahulu untuk mengaktifkan akun.');
            }

            // Redirect to agent dashboard
            return redirect()->intended('/agent/dashboard');
        }

        return back()->withErrors([
            'email' => 'Email atau password salah.',
        ])->onlyInput('email');
    }

    /**
     * Handle agent logout
     */
    public function logout(Request $request)
    {
        $this->guard()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Show agent dashboard
     */
    public function dashboard()
    {
        $agent = $this->guard()->user();

        if (!$agent) {
            return redirect()->route('agent.login')
                ->with('error', 'Akun agent tidak ditemukan.');
        }

        // Get agent stats
        $stats = [
            'totalListings' => $agent->properties()->count(),
            'totalViews' => $agent->properties()->sum('count_clicked') ?? 0,
            'totalInquiries' => 0, // Will be implemented later
            'totalLeads' => 0, // Will be implemented later
        ];

        return Inertia::render('AgentDashboard', [
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'email' => $agent->email,
                'phone' => $agent->phone,
                'photo' => $agent->photo,
            ],
            'stats' => $stats,
        ]);
    }
}
