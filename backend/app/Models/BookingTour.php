<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\HistoryService;
class BookingTour extends Model
{
    use HasFactory;

    const STATUS_CANCEL = 'cancel'; // Đã hủy
    const STATUS_WAITING = 'waiting'; // Chờ xác nhận
    const STATUS_IS_MOVING = 'is_moving'; // Đang di chuyển
    const STATUS_ENDED = 'ended'; // Đã kết thúc
    protected $guarded = ['not'];
    protected $casts = [
        'customer_ids' => 'array'
    ];
 protected static function boot()
    {
        parent::boot();

        static::updating(function ($model) {
 
            $original = $model->getOriginal();
            $changes = $model->getDirty();

          
            HistoryService::log(
                'booking_tours',
                $model->id,
                $original,
                $changes,
                auth()->id() 
            );
        });
    }
    public function services()
{
    return $this->belongsToMany(Service::class, 'booking_service_by_tours', 'booking_tour_id', 'service_id');
}

public function userservices()
{
    return $this->belongsToMany(Service::class, 'booking_tour_service_users', 'booking_tour_id', 'service_id');
}
public function bookingServices()
{
    return $this->hasMany(BookingServiceByTour::class);
}
    public function bookingServiceByTours()
    {
        return $this->hasMany(BookingServiceByTour::class);
    }

    public function tour()
    {
        return $this->belongsTo(Tour::class);
    }

    public function bookingActivities()
    {
        return $this->hasMany(BookingActivity::class, 'booking_tour_id');
    }

    public function bookingTourServiceUsers()
    {
        return $this->hasMany(BookingTourServiceUser::class);
    }

    public function bookingActivitsss()
    {
        return $this->hasMany(BookingActivity::class,'booking_tour_id', 'id');
    }

    public function billTours(){
        return $this->hasMany(BillTour::class);
    }

    public function refundTours(){
        return $this->hasMany(RefundTour::class);
    }
    

    

    

    
}
