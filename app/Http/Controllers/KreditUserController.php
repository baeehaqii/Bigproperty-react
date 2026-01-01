<?php

namespace App\Http\Controllers;

use App\Models\Agen;
use App\Models\Developer;
use App\Models\User;
use App\Models\KreditUser;
use App\Models\Membership;
use App\Models\HistoryPembelian;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class KreditUserController extends Controller
{
    /**
     * Beli membership baru atau perpanjang
     */
    public function beliMembership(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'membership_id' => 'required|exists:memberships,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $user = User::findOrFail($request->user_id);
            // dd($user->hasRole('Agen'));

            $membership = Membership::findOrFail($request->membership_id);
            $kreditUser = KreditUser::where('user_id', $user->id)->first();


            // Validasi: pastikan kreditUser sudah ada
            if (!$kreditUser) {
                throw new \Exception('Kredit user tidak ditemukan');
            }

            if($user->hasRole('Agen')){
                $Agen = Agen::where('user_id', '=',$user->id)->first();
                if(!$Agen){
                    throw new \Exception('User belum terdaftar sebagai Agen');
                }
                if(!$Agen->developer_id){
                    if($membership->jenis !== 'agen'){
                        throw new \Exception('Agen hanya dapat membeli membership untuk agen');
                    }
                }
            }elseif($user->hasRole('Developer')){
                if($membership->jenis !== 'developer'){
                    throw new \Exception('Developer hanya dapat membeli membership untuk Developer');
                }
            }elseif($user->hasRole('Visitor')){
                throw new \Exception('Visitor tidak dapat membeli membership');
            }


            // Extract duration dari membership (asumsi harga berisi duration)
            $durationMonths = $membership->harga['duration'] ?? 1;
            $amount = $membership->harga['amount'] ?? 0;

            // Tentukan tanggal mulai dan selesai
            $tglBeli = now();
            $tglMulai = $tglBeli;
            $tglSelesai = null;

            // LOGIC: Jika sudah punya membership aktif, extend dari tgl_selesai sebelumnya
            if ($kreditUser->tgl_selesai && $kreditUser->tgl_selesai->isFuture()) {
                // Membership masih aktif, extend dari tgl_selesai yang lama
                $tglMulai = $kreditUser->tgl_selesai;
                $tglSelesai = $kreditUser->tgl_selesai->copy()->addMonths($durationMonths);
            } else {
                // Membership baru atau sudah expired, mulai dari sekarang
                $tglSelesai = $tglBeli->copy()->addMonths($durationMonths);
            }

            // Update KreditUser
            $kreditUser->update([
                'tgl_beli' => $tglBeli,
                'tgl_selesai' => $tglSelesai,
                'jenis_membership' => $membership->nama,
                'kredit_listing' => $kreditUser->kredit_listing + ($membership->jumlah_listing['quantity'] ?? 0),
                'kredit_highlight' => $kreditUser->kredit_highlight + ($membership->jumlah_highlight['quantity'] ?? 0),
                'kredit_popup' => $kreditUser->kredit_popup + ($membership->popup_ads['duration'] ?? 0),
                'kredit_banner' => $kreditUser->kredit_banner + ($membership->banner_ads['duration'] ?? 0),
            ]);

            // Create History Pembelian
            $historyPembelian = HistoryPembelian::create([
                'user_id' => $user->id,
                'membership_id' => $membership->id,
                'membership_type' => $membership->nama,
                'purchase_date' => $tglBeli,
                'amount' => $amount,
                'duration_months' => $durationMonths,
                'start_date' => $tglMulai,
                'end_date' => $tglSelesai,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Membership berhasil dibeli!',
                'data' => [
                    'kredit_user' => $kreditUser->fresh(),
                    'history_pembelian' => $historyPembelian,
                    'membership_info' => [
                        'nama' => $membership->nama,
                        'duration' => "{$durationMonths} bulan",
                        'tgl_beli' => $tglBeli->format('Y-m-d H:i:s'),
                        'tgl_mulai' => $tglMulai->format('Y-m-d H:i:s'),
                        'tgl_selesai' => $tglSelesai->format('Y-m-d H:i:s'),
                        'days_remaining' => $kreditUser->daysRemaining(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membeli membership',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get history pembelian user
     */
    public function getHistoryPembelian($userId)
    {
        try {
            $user = User::findOrFail($userId);
            $history = HistoryPembelian::where('user_id', $userId)
                ->with('membership')
                ->orderBy('purchase_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                    ],
                    'history' => $history
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil history pembelian',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get detail kredit user
     */
    public function getKreditUser($userId)
    {
        try {
            $user = User::with('kreditUser')->findOrFail($userId);
            $kreditUser = $user->kreditUser;

            if (!$kreditUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kredit user tidak ditemukan'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'email' => $user->email,
                    ],
                    'kredit' => $kreditUser,
                    'membership_status' => [
                        'is_active' => $kreditUser->isActive(),
                        'days_remaining' => $kreditUser->daysRemaining(),
                        'tgl_beli' => $kreditUser->tgl_beli?->format('Y-m-d H:i:s'),
                        'tgl_selesai' => $kreditUser->tgl_selesai?->format('Y-m-d H:i:s'),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kredit user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get semua membership yang tersedia
     */
    public function getMemberships()
    {
        try {
            $memberships = Membership::all()->map(function($membership) {
                return [
                    'id' => $membership->id,
                    'nama' => $membership->nama,
                    'jenis' => $membership->jenis,
                    'deskripsi' => $membership->deskripsi,
                    'harga' => $membership->harga,
                    'harga_formatted' => $membership->formatted_harga,
                    'jumlah_listing' => $membership->jumlah_listing,
                    'listing_formatted' => $membership->formatted_listing,
                    'jumlah_highlight' => $membership->jumlah_highlight,
                    'highlight_formatted' => $membership->formatted_highlight,
                    'jumlah_agent' => $membership->jumlah_agent,
                    'popup_ads' => $membership->popup_ads,
                    'popup_formatted' => $membership->formatted_popup_ads,
                    'banner_ads' => $membership->banner_ads,
                    'banner_formatted' => $membership->formatted_banner_ads,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $memberships
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data membership',
                'error' => $e->getMessage()
            ], 500);
        }
    }

public function upgradeRole($id, Request $request)
{
    try {
        DB::beginTransaction();
        
        $user = User::findOrFail($id);
        $newRole = $request->role;
        
        // CEK ROLE SEKARANG (DARI GUARD 'web')
        $currentRole = $user->roles()->where('guard_name', 'web')->first()->name ?? null;
        
        // SCENARIO 1: VISITOR → AGEN
        if ($currentRole === 'Visitor' && $newRole === 'Agen') {
            $visitor = Visitor::where('user_id', $user->id)->first();
            
            if (!$visitor) {
                throw new \Exception("Data visitor tidak ditemukan");
            }
            
            $agen = $this->createAgenFromVisitor($visitor, null, $user->id);
            $visitor->delete();
            
            $developer = null;
        }
        
        // SCENARIO 2: VISITOR → DEVELOPER
        elseif ($currentRole === 'Visitor' && $newRole === 'Developer') {
            $visitor = Visitor::where('user_id', $user->id)->first();
            
            if (!$visitor) {
                throw new \Exception("Data visitor tidak ditemukan");
            }
            
            $request->validate([
                'developer_name' => 'required|string',
                'pt' => 'required|string',
                'alamat' => 'required|string',
                'kontak' => 'required|string',
                'email_perusahaan' => 'required|email',
                'nib' => 'required|string',
            ]);
            
            $developer = Developer::create([
                'name' => $request->developer_name,
                'pt' => $request->pt,
                'alamat' => $request->alamat,
                'kontak' => $request->kontak,
                'email_perusahaan' => $request->email_perusahaan,
                'nib' => $request->nib,
                'website' => $request->website ?? null,
                'nama_property' => $request->nama_property ?? null,
                'is_verified' => false,
                'sumber' => $visitor->sumber,
            ]);
            
            $agen = $this->createAgenFromVisitor($visitor, $developer->id, $user->id);
            $visitor->delete();
        }
        
        // SCENARIO 3: AGEN → DEVELOPER
        elseif ($currentRole === 'Agen' && $newRole === 'Developer') {
            $agen = Agen::where('user_id', $user->id)->first();
            
            if (!$agen) {
                throw new \Exception("Data agen tidak ditemukan");
            }
            
            if ($agen->developer_id) {
                throw new \Exception("Agen ini sudah terdaftar sebagai developer");
            }
            
            $request->validate([
                'developer_name' => 'required|string',
                'pt' => 'required|string',
                'alamat' => 'required|string',
                'kontak' => 'required|string',
                'email_perusahaan' => 'required|email',
                'nib' => 'required|string',
            ]);
            
            $developer = Developer::create([
                'name' => $request->developer_name,
                'pt' => $request->pt,
                'alamat' => $request->alamat,
                'kontak' => $request->kontak,
                'email_perusahaan' => $request->email_perusahaan,
                'nib' => $request->nib,
                'website' => $request->website ?? null,
                'nama_property' => $request->nama_property ?? null,
                'is_verified' => false,
                'sumber' => $agen->sumber,
            ]);
            
            $agen->update([
                'developer_id' => $developer->id
            ]);
        }
        
        else {
            throw new \Exception("Upgrade role dari {$currentRole} ke {$newRole} tidak diizinkan");
        }
        
        // UPDATE ROLE - PAKE GUARD 'web' ONLY
        $user->syncRoles([]); // hapus semua role (default guard 'web')
        $user->assignRole($newRole); // assign role baru (default guard 'web')
        
        DB::commit();
        
        return response()->json([
            'success' => true,
            'message' => "Berhasil upgrade dari {$currentRole} ke {$newRole}",
            'data' => [
                'user' => $user->load('roles'),
                'agen' => $agen ?? null,
                'developer' => $developer ?? null
            ]
        ], 200);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Validasi gagal',
            'errors' => $e->errors()
        ], 422);
        
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Gagal memperbarui role',
            'error' => $e->getMessage()
        ], 500);
    }
}

    private function createAgenFromVisitor($visitor, $developerId = null, $userId)
    {
        return Agen::create([
            'developer_id' => $developerId,
            'ktp' => $visitor->ktp,
            'name' => $visitor->nama,
            'phone' => $visitor->no_wa,
            'photo' => $visitor->photo,
            'license_number' => $this->generateLicenseNumber(),
            'is_active' => true,
            'user_id' => $userId,
            'sumber' => $visitor->sumber,
            'email' => null, // atau ambil dari $user->email jika mau
        ]);
    }

    private function generateLicenseNumber()
    {
        $year = date('Y');
        $lastAgen = Agen::whereYear('created_at', $year)
                        ->orderBy('id', 'desc')
                        ->first();
        
        $number = $lastAgen ? (int)substr($lastAgen->license_number, -5) + 1 : 1;
        
        return 'AGN-' . $year . '-' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }
}