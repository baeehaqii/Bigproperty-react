Link dokumentasi : https://github.com/Midtrans/midtrans-php


1. Konteks & Tujuan
Kita akan membangun sistem Listing Credit untuk agen properti. User (Agen) dapat membeli paket membership yang memberikan kuota tertentu (Listing, Highlight, Agent Slots). Integrasi menggunakan gateway Midtrans dengan metode Snap.

2. Persyaratan Arsitektur (Clean Code & Best Practices)
Service Pattern: Jangan menaruh logika Midtrans di Controller. Buatlah MidtransService untuk komunikasi API dan PaymentService untuk logika database internal.

Database Transactions: Gunakan DB::transaction() saat proses Webhook untuk memastikan integritas data antara tabel transaksi dan saldo.

Zero N+1 Query: * Setiap pengambilan data relasi (misal: Transaksi -> Agen -> Membership) wajib menggunakan Eager Loading with(['relation_name']).

Gunakan $with property di Model hanya jika relasi tersebut benar-benar selalu dibutuhkan.

Immutability: Tabel membership_transactions tidak boleh di-update setelah status mencapai settlement, expire, atau cancel (kecuali untuk logging).

Type Hinting: Gunakan strong typing pada parameter method dan return types.

3. Tugas Tahap 1: Database & Model
Buatlah migration dan model berdasarkan skema berikut:

A. Tabel membership_transactions
Simpan order_id unik (Format: INV-HGL-{timestamp}-{id}).

Simpan snap_token untuk memfasilitasi pembayaran ulang jika modal tertutup.

Model Relationship: belongsTo(Agen), belongsTo(Membership).

B. Tabel agen_credits
Simpan saldo aktif dan expired_at.

Model Relationship: belongsTo(Agen), belongsTo(Membership).

Instruksi AI: "Generate migration sesuai schema yang diberikan di chat sebelumnya. Pastikan model memiliki casting untuk kolom JSON dan relasi didefinisikan dengan benar."

4. Tugas Tahap 2: Midtrans Service Wrapper
Buatlah App\Services\MidtransService:

Gunakan library midtrans/midtrans-php.

Konfigurasi Server Key dan Client Key dari .env.

Method createSnapToken(MembershipTransaction $transaction): Mengirim detail item_details dan customer_details (diambil dari relasi Agen).

5. Tugas Tahap 3: Logic Webhook (Automated Credit Inflow)
Buatlah controller MidtransWebhookController:

Validasi signature_key dari Midtrans.

Jika status settlement:

Cari transaksi berdasarkan order_id (Gunakan with(['membership', 'agen']) untuk menghindari N+1).

Hitung expired_at menggunakan Carbon berdasarkan field JSON harga di tabel membership.

Gunakan updateOrCreate pada tabel agen_credits untuk menambah saldo/kuota:

remaining_listing += jumlah_listing['quantity']

remaining_highlight += jumlah_highlight['quantity']

Update status transaksi menjadi settlement.

6. Tugas Tahap 4: Optimalisasi Query (N+1 Prevention Check)
Pastikan pada halaman List Transaksi atau Dashboard Agen, pengambilan data credit menggunakan:

PHP

$credits = AgenCredit::where('agen_id', $id)->with(['membership'])->get();
Jangan memanggil $transaction->membership->nama di dalam loop tanpa eager loading di awal.

7. Penanganan Error & Edge Cases
Idempotency: Cek apakah status transaksi di database sudah settlement sebelum memproses penambahan credit untuk menghindari duplikasi saldo jika Midtrans mengirim webhook berkali-kali.

Expired Handling: Tambahkan Scope pada model AgenCredit untuk memfilter saldo yang belum expired:

PHP

public function scopeActive($query) {
    return $query->where('is_active', true)->where('expired_at', '>', now());
}

Tabel membership_transactions :
Schema::create('membership_transactions', function (Blueprint $table) {
    $table->id();
    // Relasi ke agen yang membeli
    $table->foreignId('agen_id')->constrained('agens')->onDelete('cascade');
    // Relasi ke paket yang dibeli
    $table->foreignId('membership_id')->constrained('memberships');
    
    // Data untuk Midtrans
    $table->string('order_id')->unique(); // Contoh: INV-HGL-20260104-001
    $table->decimal('gross_amount', 15, 2);
    $table->string('status')->default('pending'); // pending, settlement, expire, cancel
    $table->string('payment_type')->nullable(); // qris, bank_transfer, dll
    $table->string('snap_token')->nullable(); // Untuk memunculkan pop-up Midtrans kembali
    
    // Payload mentah (opsional untuk audit/debug)
    $table->json('payload_midtrans')->nullable();
    
    $table->timestamps();
});

Tabel agen_credits :
Schema::create('agen_credits', function (Blueprint $table) {
    $table->id();
    $table->foreignId('agen_id')->constrained('agens')->onDelete('cascade');
    $table->foreignId('membership_id')->constrained('memberships');
    
    // Saldo yang bisa dikonsumsi
    $table->integer('remaining_listing')->default(0);
    $table->integer('remaining_highlight')->default(0);
    $table->integer('remaining_agent_slots')->default(0);
    
    // Masa Berlaku
    $table->timestamp('expired_at')->nullable();
    $table->boolean('is_active')->default(true);
    
    $table->timestamps();
});

workflow singkat :
Langkah,Proses
1. Checkout,User pilih paket -> Buat data di membership_transactions -> Panggil SDK Midtrans untuk dapat snap_token.
2. Payment,User bayar via Snap UI (Frontend).
3. Webhook,"Midtrans kirim POST ke server Anda -> Cek status -> Jika settlement, cari data di membership_transactions -> Update/Buat data di agen_credits."

Tips Tambahan:

Pada tabel memberships, kolom JSON harga Anda memiliki struktur {amount: 6000000, duration: 1, period: 'year'}. Pastikan saat proses Webhook, Anda menggunakan library Carbon untuk menghitung expired_at:

// Contoh logic sederhana di Controller saat payment success
$membership = $transaction->membership;
$duration = $membership->harga['duration'];
$period = $membership->harga['period']; // 'day', 'month', 'year'

$expiredAt = now()->add($duration, $period);