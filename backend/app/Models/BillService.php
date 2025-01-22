<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillService extends Model
{
    use HasFactory;

    protected $guarded = ['not'];

    protected $casts = [
        'created_at' => 'datetime:Y-m-d H:i:s', // Định dạng ngày giờ khi truy xuất
    ];

    public function bill(){
        return $this->belongsTo(Bill::class);
    }

    public function service(){
        return $this->belongsTo(Service::class);
    }

    public function tour(){
        return $this->belongsTo(Tour::class);
    }

    public function saleAgent(){
        return $this->belongsTo(SaleAgent::class);
    }

}
