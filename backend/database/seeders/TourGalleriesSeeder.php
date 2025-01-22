<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class TourGalleriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        $tourIds = DB::table('tours')->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            DB::table('tour_galleries')->insert([
                'tour_id' => $faker->randomElement($tourIds),
                'image' => $faker->imageUrl(800, 600, 'nature', true, 'TourGallery'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
