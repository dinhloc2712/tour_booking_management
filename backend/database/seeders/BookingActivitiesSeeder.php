<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class BookingActivitiesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy danh sách booking_tour_id từ bảng booking_tours
        $bookingTourIds = DB::table('booking_tours')->pluck('id')->toArray();

        // Lấy danh sách staff_id từ bảng users
        $staffIds = DB::table('users')->pluck('id')->toArray();

        // Lấy danh sách booking_activity_id từ bảng booking_activities để tạo cấu trúc phân cấp
        $parentActivityIds = DB::table('booking_activities')->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            DB::table('booking_activities')->insert([
                'parent_activity_id' => $faker->optional()->randomElement($parentActivityIds), // Chọn parent_activity_id ngẫu nhiên hoặc null
                'booking_tour_id' => $faker->randomElement($bookingTourIds), // Chọn booking_tour_id ngẫu nhiên
                'staff_id' => $faker->randomElement($staffIds), // Chọn staff_id ngẫu nhiên
                'name_staff' => $faker->name, // Tên nhân viên
                'customer_ids' => json_encode($faker->randomElements(range(1, 100), $faker->numberBetween(1, 5))), // Danh sách ID khách hàng ngẫu nhiên
                'name' => $faker->word, // Tên hoạt động ngẫu nhiên
                'note' => $faker->optional()->sentence, // Ghi chú giả hoặc null
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

    }
}
