<?php

namespace App\Http\Controllers;

use App\Services\MidtransService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    public function __construct(
        private MidtransService $midtransService,
        private PaymentService $paymentService
    ) {
    }

    /**
     * Handle webhook notification dari Midtrans
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            // Parse notification dari Midtrans
            $notification = $this->midtransService->parseNotification();

            $orderId = $notification->order_id;
            $statusCode = $notification->status_code;
            $grossAmount = $notification->gross_amount;
            $signatureKey = $notification->signature_key;
            $transactionStatus = $notification->transaction_status;
            $paymentType = $notification->payment_type;
            $fraudStatus = $notification->fraud_status ?? null;

            // Validasi signature
            if (
                !$this->midtransService->validateSignature(
                    $orderId,
                    $statusCode,
                    $grossAmount,
                    $signatureKey
                )
            ) {
                Log::warning('Midtrans webhook: Invalid signature', [
                    'order_id' => $orderId,
                ]);

                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid signature',
                ], 403);
            }

            // Log untuk debugging
            Log::info('Midtrans webhook received', [
                'order_id' => $orderId,
                'status' => $transactionStatus,
                'payment_type' => $paymentType,
            ]);

            // Proses berdasarkan status transaksi
            $result = $this->processTransactionStatus(
                $orderId,
                $transactionStatus,
                $paymentType,
                $fraudStatus,
                $request->all()
            );

            if ($result) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Webhook processed successfully',
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Transaction not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Midtrans webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Internal server error',
            ], 500);
        }
    }

    /**
     * Proses status transaksi dari Midtrans
     * 
     * @param string $orderId
     * @param string $transactionStatus
     * @param string $paymentType
     * @param string|null $fraudStatus
     * @param array $payload
     * @return bool
     */
    private function processTransactionStatus(
        string $orderId,
        string $transactionStatus,
        string $paymentType,
        ?string $fraudStatus,
        array $payload
    ): bool {
        // Handle berbagai status dari Midtrans
        // Referensi: https://docs.midtrans.com/docs/https-notification-webhooks

        switch ($transactionStatus) {
            case 'capture':
                // Untuk kartu kredit
                if ($fraudStatus === 'accept') {
                    $transaction = $this->paymentService->processSettlement(
                        $orderId,
                        $paymentType,
                        $payload
                    );
                    return $transaction !== null;
                }
                break;

            case 'settlement':
                // Pembayaran berhasil
                $transaction = $this->paymentService->processSettlement(
                    $orderId,
                    $paymentType,
                    $payload
                );
                return $transaction !== null;

            case 'pending':
                // Masih pending, tidak perlu action
                Log::info('Transaction pending', ['order_id' => $orderId]);
                return true;

            case 'deny':
            case 'cancel':
                // Transaksi dibatalkan
                $transaction = $this->paymentService->processExpireOrCancel(
                    $orderId,
                    'cancel',
                    $payload
                );
                return $transaction !== null;

            case 'expire':
                // Transaksi expired
                $transaction = $this->paymentService->processExpireOrCancel(
                    $orderId,
                    'expire',
                    $payload
                );
                return $transaction !== null;

            case 'refund':
            case 'partial_refund':
                // Handle refund jika diperlukan
                Log::info('Transaction refunded', ['order_id' => $orderId]);
                return true;

            default:
                Log::warning('Unknown transaction status', [
                    'order_id' => $orderId,
                    'status' => $transactionStatus,
                ]);
                return true;
        }

        return false;
    }
}
