<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Models\Agen;

class OtpService
{
    /**
     * Generate and send OTP to the given email if it exists.
     */
    public function sendOtp(string $email, string $type = 'agent')
    {
        // Check if email exists
        $user = null;
        if ($type === 'agent') {
            $user = Agen::where('email', $email)->first();
        } else {
            $user = User::where('email', $email)->first();
        }

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Email tidak ditemukan di sistem.'
            ];
        }

        // Generate 6 digit OTP
        $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store in cache for 10 minutes
        $cacheKey = 'otp_reset_' . $type . '_' . $email;
        Cache::put($cacheKey, $otp, now()->addMinutes(10));

        // Dummy send logic as requested by user
        \Log::info("Bypass Dummy OTP send to $email: $otp");
        
        return [
            'success' => true,
            'message' => 'Kode OTP telah dikirimkan ke email Anda (cek log untuk dummy OTP).',
            'dummy_otp' => $otp // Exposing only for dummy testing phase
        ];
    }

    public function verifyOtp(string $email, string $otp, string $type = 'agent')
    {
        $cacheKey = 'otp_reset_' . $type . '_' . $email;
        $storedOtp = Cache::get($cacheKey);

        if (!$storedOtp || $storedOtp !== $otp) {
            return false;
        }

        return true;
    }

    public function clearOtp(string $email, string $type = 'agent')
    {
        $cacheKey = 'otp_reset_' . $type . '_' . $email;
        Cache::forget($cacheKey);
    }
}
