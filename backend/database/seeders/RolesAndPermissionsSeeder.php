<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $permissions = [
            'create tour', 'edit tour', 'view tour',
            'view branch', 'create branch', 'edit branch',
            'view service', 'create service', 'edit service',
            'create staff', 'edit staff', 'view staff',
            'view agent', 'create agent', 'edit agent',
            'view group chat', 'create group chat', 'edit group chat',
            'view chat', 'create chat', 'edit chat',
            'view booking',
            'view booking_active',
            'view booking_checkout',
            'create booking',
            'view debt',
            'edit booking',
            'edit booking tour',
            'edit booking service',
            'booking activity',
            'view customer',
            'edit customer',
            'view statistical',
            'view statistical day',
            'payment',
            'refund'
        ];

        foreach($permissions as $permission){
            if (!Permission::where('name', $permission)->exists()) {
                Permission::create(['name' => $permission]);
            }         
        }

        $roles = [
            'customer'=>[],
            'admin'=>Permission::all()->pluck('name')->toArray(),
            'admin_branch'=>['create tour', 'edit tour', 'view tour','view service', 'create service', 'edit service'
                       ,'view service','view agent','view booking_active', 'view booking',
                       'create staff', 'edit staff', 'view staff',
                       'view group chat', 'create group chat', 'edit group chat',
                        'view chat', 'create chat', 'edit chat',
                        'view statistical day','view booking_checkout','create booking','edit booking','edit booking tour',
                        'edit booking service','booking activity','view customer','edit customer','view statistical','payment','refund'],
            'accountant'=>['view statistical','view statistical day','view debt', 'view staff',
                        'view group chat','view chat', 'create chat', 'edit chat'],
            'sale'=>['view tour','view branch','view service','view agent','create booking','view group chat', 'view chat', 'create chat', 'edit chat', 'view booking',
                    'view booking_active','booking activity', 'edit booking','view staff', 'edit booking tour', 'edit booking service', 'edit customer' ,'view customer'],
            'receptionist'=>['view tour','view branch','view service','view agent','create booking', 'view staff',
                            'view group chat', 'view chat', 'create chat', 'edit chat', 'view booking',
                            'view booking_active','booking activity', 'edit booking service', 'payment', 'refund', 'view statistical day'],
            'guide'=>['view staff','view booking_active','booking activity', 'view group chat', 'view chat', 'create chat', 'edit chat', 'view booking']
        ];

        foreach($roles as $role => $rolePermissions){
            $createRole = Role::firstOrCreate(['name'=>$role]);

            if(!empty($rolePermissions)){ 
                $createRole->givePermissionTo($rolePermissions);
            }
        }

        $user = User::where('fullname', 'admin General')->first();
        $user->assignRole('admin');
    }
}
