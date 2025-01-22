<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VoucherUsage extends Model
{
    use HasFactory;
    public $table = 'voucher_usage';
    public $timestamps = false;
    protected $fillable = [
        'voucher_id',
        'usable_id',
        'usable_type',
        'time_usage',
    ];

}
