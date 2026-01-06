<?php

namespace App\Services;

use App\Models\Agen;
use App\Models\AgenCredit;
use App\Models\Membership;
use App\Models\MembershipTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(
        private MidtransService $midtransService
    ) {
    }

    /**
     * Buat transaksi baru dan dapatkan snap token
     * 
     * @param Agen $agen
     * @param Membership $membership
     * @return array{transaction: MembershipTransaction, snap_token: string}
     */
    public function createTransaction(Agen $agen, Membership $membership): array
    {
        // Buat transaksi dengan status pending
        $transaction = MembershipTransaction::create([
            'agen_id' => $agen->id,
            'membership_id' => $membership->id,
            'order_id' => MembershipTransaction::generateOrderId(),
            'gross_amount' => $membership->harga['amount'],
            'status' => 'pending',
        ]);

        // Dapatkan snap token dari Midtrans
        $snapToken = $this->midtransService->createSnapToken($transaction);

        // Update snap token ke transaksi
        $transaction->update(['snap_token' => $snapToken]);

        return [
            'transaction' => $transaction->load(['membership', 'agen']),
            'snap_token' => $snapToken,
        ];
    }

    /**
     * Proses webhook settlement dari Midtrans
     * Menggunakan DB Transaction untuk integritas data
     * 
     * @param string $orderId
     * @param string $paymentType
     * @param array $payloadMidtrans
     * @return MembershipTransaction|null
     */
    public function processSettlement(
        string $orderId,
        string $paymentType,
        array $payloadMidtrans
    ): ?MembershipTransaction {
        return DB::transaction(function () use ($orderId, $paymentType, $payloadMidtrans) {
            // Cari transaksi dengan eager loading (N+1 prevention)
            $transaction = MembershipTransaction::with(['membership', 'agen'])
                ->where('order_id', $orderId)
                ->first();

            if (!$transaction) {
                return null;
            }

            // Idempotency check: jangan proses ulang jika sudah settlement
            if ($transaction->status === 'settlement') {
                return $transaction;
            }

            // Update status transaksi
            $transaction->update([
                'status' => 'settlement',
                'payment_type' => $paymentType,
                'payload_midtrans' => $payloadMidtrans,
            ]);

            // Tambahkan credit ke agen
            $this->addCreditToAgen($transaction);

            return $transaction->fresh(['membership', 'agen']);
        });
    }

    /**
     * Proses status expire/cancel dari Midtrans
     * 
     * @param string $orderId
     * @param string $status
     * @param array $payloadMidtrans
     * @return MembershipTransaction|null
     */
    public function processExpireOrCancel(
        string $orderId,
        string $status,
        array $payloadMidtrans
    ): ?MembershipTransaction {
        $transaction = MembershipTransaction::where('order_id', $orderId)->first();

        if (!$transaction) {
            return null;
        }

        // Immutability check: jangan update jika sudah immutable
        if ($transaction->isImmutable()) {
            return $transaction;
        }

        $transaction->update([
            'status' => $status,
            'payload_midtrans' => $payloadMidtrans,
        ]);

        return $transaction;
    }

    /**
     * Tambahkan credit ke agen berdasarkan membership yang dibeli
     * Fokus untuk highlight credit
     * 
     * @param MembershipTransaction $transaction
     */
    private function addCreditToAgen(MembershipTransaction $transaction): void
    {
        $membership = $transaction->membership;

        // Hitung expired_at berdasarkan durasi di membership
        $expiredAt = $this->calculateExpiredAt($membership);

        // Data credit yang akan ditambahkan
        $creditData = [
            'remaining_listing' => $membership->jumlah_listing['quantity'] ?? 0,
            'remaining_highlight' => $membership->jumlah_highlight['quantity'] ?? 0,
            'remaining_agent_slots' => $membership->jumlah_agent ?? 0,
            'expired_at' => $expiredAt,
            'is_active' => true,
        ];

        // Buat credit baru (setiap pembelian = record baru)
        AgenCredit::create([
            'agen_id' => $transaction->agen_id,
            'membership_id' => $membership->id,
            ...$creditData,
        ]);
    }

    /**
     * Hitung tanggal expired berdasarkan durasi membership
     * Untuk highlight: gunakan durasi dari jumlah_highlight
     * Untuk membership biasa: gunakan durasi dari harga
     * 
     * @param Membership $membership
     * @return Carbon
     */
    private function calculateExpiredAt(Membership $membership): Carbon
    {
        // Untuk jenis highlight, gunakan durasi dari harga
        // Karena highlight tidak punya durasi listing terpisah
        if ($membership->jenis === 'highlight') {
            $duration = $membership->harga['duration'] ?? 1;
            $period = $membership->harga['period'] ?? 'year';
        } else {
            // Untuk agen/developer, gunakan durasi dari harga juga
            $duration = $membership->harga['duration'] ?? 1;
            $period = $membership->harga['period'] ?? 'year';
        }

        return match ($period) {
            'day' => now()->addDays($duration),
            'month' => now()->addMonths($duration),
            'year' => now()->addYears($duration),
            default => now()->addYear(),
        };
    }

    /**
     * Get transaksi by order_id dengan eager loading
     * 
     * @param string $orderId
     * @return MembershipTransaction|null
     */
    public function getTransactionByOrderId(string $orderId): ?MembershipTransaction
    {
        return MembershipTransaction::with(['membership', 'agen'])
            ->where('order_id', $orderId)
            ->first();
    }

    /**
     * Get active credits untuk agen tertentu
     * 
     * @param int $agenId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getActiveCredits(int $agenId)
    {
        return AgenCredit::with(['membership'])
            ->where('agen_id', $agenId)
            ->active()
            ->get();
    }

    /**
     * Get total remaining highlight untuk agen
     * 
     * @param int $agenId
     * @return int
     */
    public function getTotalRemainingHighlight(int $agenId): int
    {
        return AgenCredit::where('agen_id', $agenId)
            ->active()
            ->sum('remaining_highlight');
    }
}
