<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number', 'tracking_token', 'client_id', 'shipper_id', 'status', 'payment_status', 'payment_method',
        'subtotal', 'tax', 'shipping', 'discount', 'total', 'coupon_code', 'shipping_address',
        'delivery_token', 'delivery_otp', 'delivery_otp_hash', 'delivery_otp_attempts',
        'delivery_otp_locked_until', 'delivery_otp_verified_at', 'delivery_otp_sent_at',
        'qr_payload', 'qr_used_at', 'is_wholesale', 'notes',
        'paid_at', 'payment_expires_at', 'stock_reserved_at',
        'ready_at', 'picked_up_at', 'delivered_at',
        'pickup_latitude', 'pickup_longitude', 'delivery_latitude', 'delivery_longitude',
        'pickup_photo', 'pickup_truck_number', 'pickup_serial_hash', 'pickup_serial_expires_at', 'pickup_serial_used_at',
        'delivery_photo', 'delivery_signature', 'failure_reason',
    ];

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array',
            'is_wholesale' => 'boolean',
            'paid_at' => 'datetime',
            'payment_expires_at' => 'datetime',
            'stock_reserved_at' => 'datetime',
            'ready_at' => 'datetime',
            'picked_up_at' => 'datetime',
            'delivered_at' => 'datetime',
            'delivery_otp_sent_at' => 'datetime',
            'delivery_otp_locked_until' => 'datetime',
            'delivery_otp_verified_at' => 'datetime',
            'qr_used_at' => 'datetime',
            'pickup_serial_expires_at' => 'datetime',
            'pickup_serial_used_at' => 'datetime',
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'shipping' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id')->withoutGlobalScopes();
    }

    public function user(): BelongsTo
    {
        return $this->client();
    }

    public function shipper(): BelongsTo
    {
        return $this->belongsTo(Shipper::class, 'shipper_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function deliveryEvents(): HasMany
    {
        return $this->hasMany(DeliveryEvent::class);
    }

    public function paymentTransactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }
}
