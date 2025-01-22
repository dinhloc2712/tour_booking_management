<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use ReflectionClass;

class SaleAgent extends Model
{
    use HasFactory;

    const TYPE_TOUR = 'tour';

    const TYPE_TOUR_ONL = 'tour_onl';
    

    const TYPE_BUS = 'bus';

    const TYPE_HOTEL = 'hotel';

    const TYPE_MOTO = 'moto';

    const TYPE_KHAC = 'khac';


    public $fillable = [
        'name',
        'email',
        'phone',
        'type',
        'address',
        'is_active',
        'updated_at',
        'created_at',

    ];

    public static function getConstants()
    {
        $reflection = new ReflectionClass(__CLASS__);
        $constants = $reflection->getConstants();
        return array_filter($constants, function ($key) {
            return strpos($key, 'TYPE_') === 0;
        }, ARRAY_FILTER_USE_KEY);
        // return $reflection->getConstants();
    }
}
