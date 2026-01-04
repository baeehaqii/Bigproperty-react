<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Agen;
use App\Models\Membership;
use App\Services\MidtransService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MembershipPaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private MidtransService $midtransService
    ) {
    }

    /**
     * Get daftar paket membership yang tersedia
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function packages(Request $request): JsonResponse
    {
        $jenis = $request->query('jenis', 'highlight');

        $memberships = Membership::where('jenis', $jenis)->get();

        return response()->json([
            'status' => 'success',
            'data' => $memberships,
        ]);
    }

    /**
     * Checkout - Buat transaksi dan dapatkan snap token
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'membership_id' => 'required|exists:memberships,id',
        ]);

        // Get agen yang sedang login
        $agen = $this->getAuthenticatedAgen();

        if (!$agen) {
            return response()->json([
                'status' => 'error',
                'message' => 'Agen tidak ditemukan',
            ], 401);
        }

        // Get membership yang dipilih
        $membership = Membership::findOrFail($request->membership_id);

        // Buat transaksi dan dapatkan snap token
        $result = $this->paymentService->createTransaction($agen, $membership);

        return response()->json([
            'status' => 'success',
            'data' => [
                'transaction' => $result['transaction'],
                'snap_token' => $result['snap_token'],
                'client_key' => $this->midtransService->getClientKey(),
                'snap_url' => $this->midtransService->getSnapUrl(),
            ],
        ]);
    }

    /**
     * Get status transaksi
     * 
     * @param string $orderId
     * @return JsonResponse
     */
    public function status(string $orderId): JsonResponse
    {
        $transaction = $this->paymentService->getTransactionByOrderId($orderId);

        if (!$transaction) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $transaction,
        ]);
    }

    /**
     * Get snap token untuk transaksi pending (retry payment)
     * 
     * @param string $orderId
     * @return JsonResponse
     */
    public function retryPayment(string $orderId): JsonResponse
    {
        $transaction = $this->paymentService->getTransactionByOrderId($orderId);

        if (!$transaction) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi tidak ditemukan',
            ], 404);
        }

        if ($transaction->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi sudah tidak bisa diproses ulang',
            ], 400);
        }

        // Jika snap_token masih ada, gunakan yang lama
        // Jika tidak ada, buat baru
        $snapToken = $transaction->snap_token;

        if (!$snapToken) {
            $snapToken = $this->midtransService->createSnapToken($transaction);
            $transaction->update(['snap_token' => $snapToken]);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'transaction' => $transaction,
                'snap_token' => $snapToken,
                'client_key' => $this->midtransService->getClientKey(),
                'snap_url' => $this->midtransService->getSnapUrl(),
            ],
        ]);
    }

    /**
     * Get credit saya (untuk agen yang login)
     * 
     * @return JsonResponse
     */
    public function myCredits(): JsonResponse
    {
        $agen = $this->getAuthenticatedAgen();

        if (!$agen) {
            return response()->json([
                'status' => 'error',
                'message' => 'Agen tidak ditemukan',
            ], 401);
        }

        $credits = $this->paymentService->getActiveCredits($agen->id);
        $totalHighlight = $this->paymentService->getTotalRemainingHighlight($agen->id);

        return response()->json([
            'status' => 'success',
            'data' => [
                'credits' => $credits,
                'summary' => [
                    'total_remaining_highlight' => $totalHighlight,
                ],
            ],
        ]);
    }

    /**
     * Get authenticated agen
     * Sesuaikan dengan sistem auth yang digunakan
     * 
     * @return Agen|null
     */
    private function getAuthenticatedAgen(): ?Agen
    {
        // Jika menggunakan JWT auth untuk Agen
        if (Auth::guard('agen')->check()) {
            /** @var Agen $agen */
            $agen = Auth::guard('agen')->user();
            return $agen;
        }

        // Jika menggunakan relasi User -> Agen
        $user = Auth::user();
        if ($user && method_exists($user, 'agen') && $user->agen) {
            return $user->agen;
        }

        return null;
    }
}
