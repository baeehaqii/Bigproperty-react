<?php

namespace App\Models;

use Filament\Panel;
use Illuminate\Support\Str;
use Spatie\Image\Enums\Fit;
use Laravel\Sanctum\HasApiTokens;
use Spatie\MediaLibrary\HasMedia;

use LaraZeus\Boredom\Enums\Variants;
use Filament\Models\Contracts\HasName;
use Spatie\Permission\Traits\HasRoles;

use Illuminate\Notifications\Notifiable;

use Filament\Models\Contracts\FilamentUser;
use Spatie\MediaLibrary\InteractsWithMedia;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject; // Tambahkan ini

class User extends Authenticatable implements FilamentUser, MustVerifyEmail, HasName, HasMedia, JWTSubject
{
    use InteractsWithMedia;
    use TwoFactorAuthenticatable;
    use HasUuids, HasRoles;
    use HasApiTokens, HasFactory, Notifiable;
    protected $guard_name = 'web';
    protected $fillable = [
        'username',
        'email',
        'firstname',
        'lastname',
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'email_verified_at'
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'two_factor_confirmed_at' => 'datetime',
    ];

    protected $appends = [
        'two_factor_enabled',
    ];

    // JWT Methods - TAMBAHKAN INI
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function getFilamentName(): string
    {
        return $this->username;
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return true;
    }

    public function getNameAttribute()
    {
        return "{$this->firstname} {$this->lastname}";
    }

    public function isSuperAdmin(): bool
    {
        return $this->hasRole(config('filament-shield.super_admin.name'));
    }

    public function registerMediaConversions(Media|null $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->fit(Fit::Contain, 300, 300)
            ->nonQueued();
    }

    public function hasEnabledTwoFactor(): bool
    {
        return !is_null($this->two_factor_secret);
    }

    public function hasConfirmedTwoFactor(): bool
    {
        return !is_null($this->two_factor_confirmed_at);
    }

    public function enableTwoFactorAuthentication(): void
    {
        $this->two_factor_confirmed_at = now();
        $this->save();
    }

    public function disableTwoFactorAuthentication(): void
    {
        $this->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
    }

    public function getTwoFactorEnabledAttribute(): bool
    {
        return $this->hasEnabledTwoFactor() && $this->hasConfirmedTwoFactor();
    }

    public function hasValidTwoFactorSession(): bool
    {
        if (!$this->hasEnabledTwoFactor()) {
            return true;
        }

        $sessionKey = 'login.id.' . session()->getId();
        $twoFactorKey = 'two_factor_confirmed_at.' . session()->getId();
        
        return session()->has($sessionKey) && 
               session()->has($twoFactorKey) && 
               session($sessionKey) === $this->getAuthIdentifier();
    }

    public function confirmTwoFactorSession(): void
    {
        session([
            'two_factor_confirmed_at.' . session()->getId() => now()->timestamp
        ]);
    }

    public function clearTwoFactorSession(): void
    {
        session()->forget('two_factor_confirmed_at.' . session()->getId());
    }

    // Relasi ke KreditUser
    public function kreditUser()
    {
        return $this->hasOne(\App\Models\KreditUser::class);
    }

    protected static function boot()
    {
        parent::boot();

        // Event setelah user dibuat - AUTO CREATE KREDIT
        static::created(function ($user) {
            \App\Models\KreditUser::create([
                'user_id' => $user->id,
                'kredit_new_user' => 3,
                'kredit_listing' => 0,
                'kredit_highlight' => 0,
                'kredit_popup' => 0,
                'kredit_banner' => 0,
            ]);
        });

        static::deleting(function ($user) {
            $user->roles()->detach();
            $user->permissions()->detach();
            $user->clearMediaCollection();
            
            // Hapus kredit user juga
            $user->kreditUser()->delete();
        });
    }
}