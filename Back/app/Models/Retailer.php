<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class Retailer extends Client
{
    protected static function booted(): void
    {
        static::addGlobalScope('retailer', function (Builder $query) {
            $query->where('role', 'retailer');
        });

        static::creating(function (Retailer $model) {
            $model->role = 'retailer';
            $model->retailer_status = $model->retailer_status ?? 'pending';
        });
    }

    public function isApproved(): bool
    {
        return $this->retailer_status === 'approved';
    }
}
