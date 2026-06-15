<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = ['name', 'company_name', 'phone', 'address', 'email', 'message', 'replied_at', 'admin_reply'];

    protected $casts = [
        'replied_at' => 'datetime',
    ];
}
