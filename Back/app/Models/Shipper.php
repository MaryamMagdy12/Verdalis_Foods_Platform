<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\Contracts\HasApiTokens as HasApiTokensContract;
use Laravel\Sanctum\HasApiTokens;

class Shipper extends Authenticatable implements HasApiTokensContract
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'shippers';

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'address', 'shipper_pin',
        'shipper_identity', 'shipper_certificates', 'photo', 'is_active', 'last_activity_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'shipper_certificates' => 'array',
            'last_activity_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function assignedOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'shipper_id');
    }

    public function notifications(): MorphMany
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }
}
