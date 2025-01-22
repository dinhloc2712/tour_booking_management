<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\HistoryService;
class BookingServiceByTour extends Model
{
    use HasFactory;
    const STATUS_CANCEL = 'cancel'; // Đã hủy
    const STATUS_WAITING = 'waiting'; // Chờ xác nhận
    const STATUS_IN_PROGRESS = 'in_progress'; // Đang sử dụng
    const STATUS_ENDED = 'ended'; // Đã kết thúc
    protected $table = 'booking_service_by_tours';
    protected $guarded = ['not']; // Cho phép tất cả trừ not

    protected $casts = [
        'customer_ids' => 'array',
    ];
 protected static function boot()
    {
        parent::boot();

        static::updating(function ($model) {
           
            $original = $model->getOriginal();
            $changes = $model->getDirty();

            
            HistoryService::log(
                'booking_service_by_tours',
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

    public function saleAgent()
    {
        return $this->belongsTo(SaleAgent::class, 'sale_agent_id');
    }
    
}
