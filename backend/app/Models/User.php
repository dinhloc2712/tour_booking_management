<?php

namespace App\Models;


// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Permission\Models\Permission;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */

    const TYPE_CUSTOMER = 'customer';
    const TYPE_ADMIN = 'admin';
    const TYPE_ADMIN_BRANCH = 'admin_branch';
    const TYPE_ACCOUNTANT = 'accountant';
    const TYPE_SALE = 'sale';
    const TYPE_RECEPTIONIST = 'receptionist';
    const TYPE_GUIDE = 'guide';
    protected $fillable = [
        'id',
        'branch_id',
        'fullname',
        'password',
        'email',
        'avatar',
        'created_at',
        'updated_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function userDetail(){
        return $this->hasOne(UserDetail::class);
    }

    public function branch(){
        return $this->belongsTo(Branch::class);
    }

    public function billsAsStaff(){
        return $this->hasMany(Bill::class, 'staff_id');
    }

    public function billsAsCustomer(){
        return $this->hasMany(Bill::class, 'customer_id');
    }

    public function canAccessConversation($conversationId)
    {
        // Giả sử bạn có bảng 'conversation_user' để lưu thông tin người dùng tham gia cuộc hội thoại
        return $this->conversations()->where('conversation_id', $conversationId)->exists();
    }

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'conversation_users');
    }

    public function bookingsTourServiceUser(){
        return $this->hasMany(BookingTourServiceUser::class);
    }
}
