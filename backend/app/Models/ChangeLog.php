<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChangeLog extends Model
{
    protected $fillable = [
        'model_name',
        'record_id',
        'changed_data',
        'changed_by',
    ];

    protected $casts = [
        'changed_data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}

