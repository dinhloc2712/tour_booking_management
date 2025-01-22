<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    public $timestamps = true;

    const TYPE_PERCENT = 'percent';
    const TYPE_MONEY = 'money';

    const OBJECT_TYPE_TOUR = 'tour';
    const OBJECT_TYPE_USER = 'user';
    
    protected $fillable = [
        'code',
        'type',
        'value',
        'quantity',
        'start_time',
        'end_time',
        'limit',
        'is_active',
        'object_ids',
        'object_type',
        'description',
    ];

    // Sử dụng $casts để tự động chuyển đổi object_ids từ JSON
    protected $casts = [
        'object_ids' => 'array',

    ];

    public function usages()
    {
        return $this->hasMany(VoucherUsage::class);
    }
}
