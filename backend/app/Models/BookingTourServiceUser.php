<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use ReflectionClass;
use App\Services\HistoryService;
class BookingTourServiceUser extends Model
{
    use HasFactory;
    const STATUS_CANCEL = 'cancel';
    const STATUS_WAITING = 'waiting';
    const STATUS_In_PROGRESS = 'in_progress';
    const STATUS_ENDED = 'ended';

    protected $table = 'booking_tour_service_users';

    protected $guarded = ['not']; // Cho phép tất cả trừ not
 protected static function boot()
    {
        parent::boot();

        static::updating(function ($model) {
            
            $original = $model->getOriginal();
            $changes = $model->getDirty();

          
            HistoryService::log(
                'booking_tour_service_users',
                $model->id,
                $original,
                $changes,
                auth()->id() 
            );
        });
    }

    public function bookingTour()
    {
        return $this->belongsTo(BookingTour::class, 'booking_tour_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public static function getConstants()
    {
        $reflection = new ReflectionClass(__CLASS__);
        $constants = $reflection->getConstants();
        return array_filter($constants, function ($key) {
            return strpos($key, 'STATUS_') === 0;
        }, ARRAY_FILTER_USE_KEY);
        // return $reflection->getConstants();
    }
}
