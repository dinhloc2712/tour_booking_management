<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class ToursSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        foreach(range(1,10) as $index){
            DB::table('tours')->insert([
                'name' => $faker->name,
                'price_min'=> $faker->randomFloat(2, 1000, 10000000),
                'price_max'=> $faker->randomFloat(2, 1000, 10000000),
                'image' => $faker->imageUrl(640, 480, 'tourism', true, 'Faker'), // Tạo URL ảnh giả
                'quantity' => $faker->numberBetween(1, 100), // Tạo số lượng giả
                'is_active' => $faker->boolean,
                'description' => $faker->sentence,
            ]);
        }
    }
}
