<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DebtAgentService extends Model
{
    use HasFactory;
    const STATUS_PAYMENT_IN_DEBT = 'in debt';
    const STATUS_PAYMENT_PAID = 'paid';

    protected $guarded = ['not'];

    public function saleAgent(){
        return $this->belongsTo(SaleAgent::class);
    }

    public function debtDetails(){
        return $this->hasMany(DebtDetail::class);
    }
}
