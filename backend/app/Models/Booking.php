<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\SaleAgent;
use ReflectionClass;
use App\Services\HistoryService;
class Booking extends Model
{
    use HasFactory;

    const STATUS_PAYMENT_UNPAID = 'unpaid';

    const STATUS_PAYMENT_PAID = 'paid';

    const STATUS_PAYMENT_DEPOSIT = 'deposit';

    const STATUS_TOURING_WAITING = 'waiting';

    const STATUS_CANCEL = 'cancel';

    const STATUS_TOURING_CHECKED_IN = 'checked_in';

    const STATUS_TOURING_CHECKED_OUT = 'checked_out';

    const STATUS_AGENT_NO = 'no_agent';
    
    const STATUS_AGENT_YES = 'agent';

    const STATUS_AGENT_UNPAID = 'unpaid';

    const STATUS_AGENT_PAID = 'paid';

    // public $fillable = [
    //     'staff_id',
    //     'booker_id',
    //     'checkin_time',
    //     'deposit',
    //     'status_payment',
    //     'status_touring',
    //     'note',
    //     'tour'
        
    // ];

    
    protected $guarded = ['not']; // Cho phép tất cả trừ not

    protected $casts = [
        'customer_ids' => 'array',
    ];
    protected static function boot()
    {
        parent::boot();

        static::updating(function ($model) {
            // Lấy dữ liệu trước và sau khi cập nhật
            $original = $model->getOriginal();
            $changes = $model->getDirty();

            // Ghi log
            HistoryService::log(
                'bookings',
                $model->id,
                $original,
                $changes,
                auth()->id() 
            );
        });
    }
    

    

    public function saleAgent()
    {
        return $this->belongsTo(SaleAgent::class);
    }

    public function staff()
    {
        return $this->belongsTo(User::class,'staff_id');
    }
    public function booker()
    {
        return $this->belongsTo(User::class,'booker_id');
    }
    public function bookingTours()
    {
        return $this->hasMany(BookingTour::class);
    }

    
    public function tuors()
    {
        return $this->hasMany(BookingTour::class);
    }


    public function bookingTourServices()
    {
        return $this->hasMany(BookingServiceByTour::class, 'booking_tour_id');
    }
    
    public function bookingServiceByTours()
    {
        return $this->hasManyThrough(
            BookingServiceByTour::class,
            BookingTour::class,
            'booking_id',       
            'booking_tour_id',   
            'id',                
            'id'                 
        );
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

    public function bills(){
        return $this->hasMany(Bill::class);
    }

}
