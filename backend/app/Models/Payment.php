<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;
    const TYPE_CASH = 'cash';
    const TYPE_BANKING = 'banking';

    protected $guarded = ['not'];

    public function bill(){
        return $this->belongsTo(Bill::class);
    }
}
