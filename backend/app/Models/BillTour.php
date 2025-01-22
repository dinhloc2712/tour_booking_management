<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillTour extends Model
{
    use HasFactory;

    protected $guarded = ['not'];
    protected $casts = [
        'customer_ids' => 'array',
        'created_at' => 'datetime:Y-m-d H:i:s',
    ];

    public function bill(){
        return $this->belongsTo(Bill::class);
    }

    public function tour(){
        return $this->belongsTo(Tour::class);
    }
    
}
