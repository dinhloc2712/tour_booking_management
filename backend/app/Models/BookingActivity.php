<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use ReflectionClass;

class BookingActivity extends Model
{
    use HasFactory;

    // const NAME_BOOKING = 'booking'; // Đặt tour

    const NAME_CHECKIN = 'checkin'; // Checkin

    // const NAME_BILL = 'bill'; // Tính tiền

    const NAME_PAID = 'paid'; // Đã thanh toán

    const NAME_ON_BUS = 'on_bus'; // Lên xe bus

    const NAME_ARRIVED = 'arrived'; // Tới nơi đi tour

    const NAME_START_TOUR = 'start_tour'; // Bắt đầu trải nghiệm tour

    const NAME_COMPLETE_TOUR = 'complete_tour'; // Hoàn thành tour

    const NAME_CANCEL = 'cancel'; // hủy tour
    //... còn nữa

    protected $guarded = ['not']; // Cho phép tất cả trừ not

    protected $casts = [
        'customer_ids' => 'array',
    ];

    public function parent()
    {
        return $this->belongsTo(BookingActivity::class, 'parent_activity_id');
    }

    public function children()
    {
        return $this->hasMany(BookingActivity::class, 'parent_activity_id');
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function bookingTour()
    {
        return $this->belongsTo(BookingTour::class, 'booking_tour_id');
    }


    public static function getConstants()
    {
        $reflection = new ReflectionClass(__CLASS__);
        $constants = $reflection->getConstants();
        return array_filter($constants, function ($key) {
            return strpos($key, 'NAME_') === 0;
        }, ARRAY_FILTER_USE_KEY);
        // return $reflection->getConstants();
    }
}
