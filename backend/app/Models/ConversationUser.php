<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConversationUser extends Model
{
    use HasFactory;

    protected $guarded = ['*'];

    protected $casts = [
        'created_at' => 'datetime:Y-m-d H:i:s', // Định dạng ngày giờ khi truy xuất
    ];

}
