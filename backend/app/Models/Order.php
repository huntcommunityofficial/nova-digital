<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'service_order';

    protected $fillable = [
        'order_number', 'user_id', 'service', 'client_name',
        'email', 'phone', 'price', 'status', 'details',
        'receipt_path', 'receipt_status', 'receipt_note',
        'deliverable_path',
    ];

    protected $casts = [
        'details' => 'array',
    ];
}
