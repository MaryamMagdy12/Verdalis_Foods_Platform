<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\Contracts\HasApiTokens as HasApiTokensContract;
use Laravel\Sanctum\HasApiTokens;

class Client extends Authenticatable implements HasApiTokensContract
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'clients';

    protected static function booted(): void
    {
        static::creating(function (Client $model) {
            if (! isset($model->role)) {
                $model->role = 'client';
            }
            if ($model->role === 'client') {
                $model->retailer_status = null;
            }
        });
    }

    protected $fillable = [
        'name', 'email', 'password', 'role', 'phone', 'address', 'personal_address',
        'location_lat', 'location_lng', 'photo', 'google_id', 'profile_complete',
        'company_name', 'store_name', 'store_address', 'retailer_status', 'last_activity_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'profile_complete' => 'boolean',
            'last_activity_at' => 'datetime',
        ];
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class, 'client_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'client_id');
    }

    public function notifications(): MorphMany
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }

    public function isRetailer(): bool
    {
        return $this->role === 'retailer' && $this->retailer_status === 'approved';
    }
}
