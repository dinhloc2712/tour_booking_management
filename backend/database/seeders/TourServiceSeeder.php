<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class TourServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy danh sách tour_id từ bảng tours
        $tourIds = DB::table('tours')->pluck('id')->toArray();

        // Lấy danh sách service_id từ bảng services
        $serviceIds = DB::table('services')->pluck('id')->toArray();

        foreach (range(1, 3) as $index) {
            DB::table('tour_service')->insert([
                'tour_id' => $faker->randomElement($tourIds), // Chọn tour_id ngẫu nhiên
                'service_id' => $faker->randomElement($serviceIds), // Chọn service_id ngẫu nhiên
                'price' => $faker->randomFloat(2, 1000, 10000000), // Tạo giá giả từ 10.00 đến 1000.00
                'is_active' => $faker->boolean, // Trạng thái kích hoạt ngẫu nhiên (true/false)
            ]);
        }
    }
}
