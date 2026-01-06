<?php

namespace App\Http\Controllers;

use App\Models\Agen;
use App\Models\Membership;
use App\Services\MidtransService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AgentMembershipController extends Controller
{
    public function __construct(
        private PaymentService $paymentService,
        private MidtransService $midtransService
    ) {
    }

    /**
     * Checkout - Buat transaksi dan dapatkan snap token
     * Untuk agent yang login via session (web guard)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function checkout(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'membership_id' => 'required|exists:memberships,id',
            ]);

            // Get agen yang sedang login via agent guard (session-based)
            $agen = Auth::guard('agent')->user();

            if (!$agen) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Agen tidak ditemukan atau session expired',
                ], 401);
            }

            // Cast to Agen model to ensure proper type
            /** @var Agen $agen */

            // Get membership yang dipilih
            $membership = Membership::findOrFail($request->membership_id);

            // Validate membership is highlight type
            if ($membership->jenis !== 'highlight') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Paket yang dipilih tidak valid',
                ], 400);
            }

            // Buat transaksi dan dapatkan snap token
            $result = $this->paymentService->createTransaction($agen, $membership);

            Log::info('Agent membership checkout created', [
                'agen_id' => $agen->id,
                'membership_id' => $membership->id,
                'order_id' => $result['transaction']->order_id,
            ]);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'transaction' => $result['transaction'],
                    'snap_token' => $result['snap_token'],
                    'client_key' => $this->midtransService->getClientKey(),
                    'snap_url' => $this->midtransService->getSnapUrl(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Agent membership checkout error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get status transaksi
     * 
     * @param string $orderId
     * @return JsonResponse
     */
    public function status(string $orderId): JsonResponse
    {
        $agen = Auth::guard('agent')->user();

        if (!$agen) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 401);
        }

        $transaction = $this->paymentService->getTransactionByOrderId($orderId);

        if (!$transaction) {
            return response()->json([
                'status' => 'error',
                'message' => 'Transaksi tidak ditemukan',
            ], 404);
        }

        // Verify ownership
        if ($transaction->agen_id !== $agen->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $transaction,
        ]);
    }

    /**
     * Retry payment - get snap token untuk transaksi pending
     * 
     * @param string $orderId
     * @return JsonResponse
     */
    public function retryPayment(string $orderId): JsonResponse
    {
        try {
            $agen = Auth::guard('agent')->user();

            if (!$agen) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized',
                ], 401);
            }

            $transaction = $this->paymentService->getTransactionByOrderId($orderId);

            if (!$transaction) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Transaksi tidak ditemukan',
                ], 404);
            }

            // Verify ownership
            if ($transaction->agen_id !== $agen->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Unauthorized',
                ], 403);
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

        } catch (\Exception $e) {
            Log::error('Agent retry payment error', [
                'error' => $e->getMessage(),
                'order_id' => $orderId,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan',
            ], 500);
        }
    }

    /**
     * Get credit saya
     * 
     * @return JsonResponse
     */
    public function myCredits(): JsonResponse
    {
        $agen = Auth::guard('agent')->user();

        if (!$agen) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized',
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
}
