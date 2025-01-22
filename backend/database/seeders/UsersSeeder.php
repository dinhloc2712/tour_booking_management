<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;


class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fake = Faker::create();

        $branchIds = DB::table('branches')->pluck('id')->toArray();
        DB::table('users')->insert([
            'branch_id'=>$fake->randomElement($branchIds),
            'fullname' => 'admin General',
            'password' => Hash::make('12345678'),
            'email' => 'admingeneral@gmail.com',
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach(range(1,10) as $index){
            DB::table('users')->insert([
                'branch_id' =>$fake->randomElement($branchIds),
                'fullname' =>$fake->word,
                'password' => bcrypt('password'),
                'email' => $fake->unique()->safeEmail(),
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
