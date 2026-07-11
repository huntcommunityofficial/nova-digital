<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    protected $fillable = ['session_id', 'sender', 'message', 'read_at'];

    protected $casts = ['read_at' => 'datetime'];
}
