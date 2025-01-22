<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;
     const TYPE_BUS = "bus";
     const TYPE_HOTEL = "hotel";
     const TYPE_MOTO = "moto";
     const TYPE_KHAC = "khac";
    protected $fillable = [
        'name',
        'price',
        'type',
        'description',
        'is_active',


    ] ;
    public function tours()
{
    return $this->belongsToMany(Tour::class, 'tour_service')
                ->withPivot('price','is_active');

}

    public function billService(){
        $this->hasMany(BillService::class);
    }

    public function refundService(){
        $this->hasMany(refundService::class);
    }

}
