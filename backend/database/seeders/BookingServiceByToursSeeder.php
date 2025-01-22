<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class BookingServiceByToursSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy danh sách booking_tour_id từ bảng booking_tours
        $bookingTourIds = DB::table('booking_tours')->pluck('id')->toArray();

        // Lấy danh sách service_id từ bảng services
        $serviceIds = DB::table('services')->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            DB::table('booking_service_by_tours')->insert([
                'booking_tour_id' => $faker->randomElement($bookingTourIds), // Chọn booking_tour_id ngẫu nhiên
                'service_id' => $faker->randomElement($serviceIds), // Chọn service_id ngẫu nhiên
                'name_service' => $faker->name,
                'quantity' => $faker->numberBetween(1, 10), // Số lượng ngẫu nhiên từ 1 đến 10
                'unit' => $faker->randomFloat(2, 10, 1000), // Đơn giá ngẫu nhiên từ 10.00 đến 1000.00
                'note' => $faker->optional()->sentence, // Ghi chú giả hoặc null
                'status' => $faker->randomElement(['waiting', 'completed', 'cancelled']), // Trạng thái ngẫu nhiên
                'created_at' => now(),
                'updated_at' => now(),
                'start_time' => now(),
                'end_time' => now()->addHours(2)
            ]);
        }
    }
}
