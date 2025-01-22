<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class UserDetailsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        $userIds = DB::table('users')->pluck('id')->toArray();

        foreach(range(1, 10) as $index){
            DB::table('user_details')->insert([
                'user_id'=>$faker->randomElement($userIds),
                'birthday'=>$faker->dateTimeBetween('-30 years', '-18 years')->format('Y-m-d'),
                'address'=>$faker->address,
                'phone'=>$faker->phoneNumber,
                'phone_relative'=>$faker->phoneNumber,
                'passport'=>strtoupper($faker->bothify('??########')),
                'created_at'=>now(),
                'updated_at'=>now(),
            ]);
            
        }
    }
}
