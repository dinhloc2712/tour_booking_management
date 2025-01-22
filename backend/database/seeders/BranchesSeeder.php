<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;


class BranchesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $Faker = Faker::create();

        foreach(range(1,5) as $index){
            DB::table('branches')->insert([
                'name'=>$Faker->name,
                'type'=>$Faker->randomElement(['sub', 'general']),
                'created_at'=>now(),
                'updated_at'=>now()
            ]);
        }
    }
}
