<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RefundTour extends Model
{
    use HasFactory;

    protected $guarded = [''];

    protected $casts = [
        'created_at' => 'datetime:Y-m-d H:i:s', // Định dạng ngày giờ khi truy xuất
        'customer_ids' => 'array',
    ];

    public function refund(){
        return $this->belongsTo(Refund::class);
    }

    public function tour(){
        return $this->belongsTo(Tour::class);
    }
}
