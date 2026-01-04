<?php

namespace App\Services;

use App\Models\MembershipTransaction;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class MidtransService
{
    public function __construct()
    {
        $this->setupConfig();
    }

    /**
     * Setup Midtrans configuration dari config file
     */
    private function setupConfig(): void
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$clientKey = config('midtrans.client_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Get client key untuk frontend
     */
    public function getClientKey(): string
    {
        return config('midtrans.client_key');
    }

    /**
     * Get Snap URL berdasarkan environment
     */
    public function getSnapUrl(): string
    {
        return config('midtrans.is_production')
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
    }

    /**
     * Buat Snap Token untuk transaksi
     * 
     * @param MembershipTransaction $transaction - Transaksi dengan relasi agen dan membership
     * @return string Snap Token
     */
    public function createSnapToken(MembershipTransaction $transaction): string
    {
        // Pastikan relasi sudah di-load (N+1 prevention)
        $transaction->loadMissing(['agen', 'membership']);

        $params = [
            'transaction_details' => [
                'order_id' => $transaction->order_id,
                'gross_amount' => (int) $transaction->gross_amount,
            ],
            'item_details' => [
                [
                    'id' => $transaction->membership->id,
                    'price' => (int) $transaction->gross_amount,
                    'quantity' => 1,
                    'name' => $this->truncateItemName($transaction->membership->nama),
                    'category' => $transaction->membership->jenis,
                ]
            ],
            'customer_details' => [
                'first_name' => $transaction->agen->name,
                'email' => $transaction->agen->email,
                'phone' => $transaction->agen->phone ?? '',
            ],
            'callbacks' => [
                'finish' => config('app.url') . '/payment/finish',
            ],
        ];

        return Snap::getSnapToken($params);
    }

    /**
     * Parse notifikasi dari Midtrans webhook
     * 
     * @return Notification
     */
    public function parseNotification(): Notification
    {
        return new Notification();
    }

    /**
     * Validasi signature key dari webhook
     * 
     * @param string $orderId
     * @param string $statusCode
     * @param string $grossAmount
     * @param string $signatureKey
     * @return bool
     */
    public function validateSignature(
        string $orderId,
        string $statusCode,
        string $grossAmount,
        string $signatureKey
    ): bool {
        $serverKey = config('midtrans.server_key');
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        return $signatureKey === $expectedSignature;
    }

    /**
     * Truncate nama item (max 50 karakter - requirement Midtrans)
     */
    private function truncateItemName(string $name): string
    {
        return strlen($name) > 50 ? substr($name, 0, 47) . '...' : $name;
    }
}
