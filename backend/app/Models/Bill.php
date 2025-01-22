<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    use HasFactory;
    const TYPE_NORMAL = 'normal';
    const TYPE_BILL_RED = 'bill_red';

    protected $guarded = ['not'];

    protected $casts = [
        'created_at' => 'datetime:Y-m-d H:i:s', // Định dạng ngày giờ khi truy xuất
    ];

    public function Booking(){
        return $this->belongsTo(Booking::class);
    }

    public function staff(){
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function customer(){
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function voucherUsages()
    {
        return $this->morphMany(VoucherUsage::class, 'usable');
    }

    public function billTours(){
        return $this->hasMany(BillTour::class);
    }

    public function billServices(){
        return $this->hasMany(BillService::class);
    }

    public function refunds(){
        return $this->hasMany(Refund::class);
    }

    public function payments(){
        return $this->hasOne(Payment::class);
    }
}
