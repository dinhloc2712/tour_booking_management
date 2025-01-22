<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tour extends Model
{
    use HasFactory;

    protected $fillable = [
        "branch_id",
        "name",
        "price_min",
        "price_max",
        "image",
        "quantity",
        "description",
        "is_active",

    ];

    public function services()
    {
        return $this->belongsToMany(Service::class, 'tour_service')
            ->withPivot('price', 'is_active');

    }

    // Định nghĩa mối quan hệ một đến nhiều với bảng TourSchedule
    public function tourSchedules()
    {
        return $this->hasMany(TourSchedule::class);
    }
    public function tourGallery()
    {
        return $this->hasMany(TourGallery::class); // quan hệ 1 nhiều mô hình
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function bookingTours(){
        return $this->hasMany(BookingTour::class);
    }
}
