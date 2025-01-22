<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        "user_id",
        "birthday",
        "address",
        "phone",
        "phone_relative",
        "passport",
        'quantity_voucher'
    ];
    public function users(){
        return $this->belongsTo(User::class);
    }
}
