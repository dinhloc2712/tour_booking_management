<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    use HasFactory;

    protected $guarded = ['all'];

    protected $casts = [
        'created_at' => 'datetime:Y-m-d H:i:s', // Định dạng ngày giờ khi truy xuất
    ];

    public function bill(){
        return $this->belongsTo(Bill::class);
    }

    public function refundTour(){
        return $this->hasMany(RefundTour::class);
    }

    public function refundService(){
        return $this->hasMany(RefundService::class);
    }

    public function customer()
    {
        return $this->hasOneThrough(
            User::class,
            Bill::class,
            'id',          // Foreign key ở bảng bills
            'id',          // Foreign key ở bảng User
            'bill_id',     // Local key ở bảng refunds
            'customer_id'  // Local key ở bảng bills
        );
    }

    public function staff()
    {
        return $this->hasOneThrough(
            User::class,
            Bill::class,
            'id',          // Foreign key ở bảng bills
            'id',          // Foreign key ở bảng users
            'bill_id',     // Local key ở bảng refunds
            'staff_id'  // Local key ở bảng bills
        );
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class, 'bill_id', 'bill_id');
    }
}
