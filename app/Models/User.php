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
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements FilamentUser, MustVerifyEmail, HasName, HasMedia
{
    use InteractsWithMedia;
    use TwoFactorAuthenticatable;
    use HasUuids, HasRoles;
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'firstname',
        'lastname',
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<string, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'two_factor_confirmed_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'two_factor_enabled',
    ];

    public function getFilamentName(): string
    {
        return $this->username;
    }

    public function canAccessPanel(Panel $panel): bool
    {
        // if ($panel->getId() === 'admin') {
        //     return str_ends_with($this->email, '@yourdomain.com') && $this->hasVerifiedEmail();
        // }

        return true;
    }
    // Define an accessor for the 'name' attribute
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

    /**
     * Determine if two-factor authentication has been enabled.
     */
    public function hasEnabledTwoFactor(): bool
    {
        return !is_null($this->two_factor_secret);
    }

    /**
     * Determine if two-factor authentication has been confirmed.
     */
    public function hasConfirmedTwoFactor(): bool
    {
        return !is_null($this->two_factor_confirmed_at);
    }

    /**
     * Enable two-factor authentication for the user.
     */
    public function enableTwoFactorAuthentication(): void
    {
        $this->two_factor_confirmed_at = now();
        $this->save();
    }

    /**
     * Disable two-factor authentication for the user.
     */
    public function disableTwoFactorAuthentication(): void
    {
        $this->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
    }

    /**
     * Get the two-factor authentication enabled state.
     */
    public function getTwoFactorEnabledAttribute(): bool
    {
        return $this->hasEnabledTwoFactor() && $this->hasConfirmedTwoFactor();
    }

    /**
     * Determine if the user has a valid two-factor authentication session.
     */
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

    /**
     * Mark the current session as having passed two-factor authentication.
     */
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
}