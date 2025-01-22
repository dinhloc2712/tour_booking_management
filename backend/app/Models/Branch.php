<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use PhpParser\Node\Stmt\Break_;

class Branch extends Model
{
    use HasFactory;
    const TYPE_GENERAL = 'general';
    const TYPE_SUB = 'sub';

    protected $fillable = [
        'id',
        'name',
        'type',
        'created_at',
        'updated_at'
    ];

    public function tours()
    {
        return $this->hasMany(Tour::class);
    }

    public function user()
    {
        return $this->hasMany(User::class);
    }
}
