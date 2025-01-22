<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class BookingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy danh sách user_id từ bảng users
        $userIds = DB::table('users')->pluck('id')->toArray();

        // Lấy danh sách branch_id từ bảng branches
        $branchIds = DB::table('branches')->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            DB::table('bookings')->insert([
                'staff_id' => $faker->randomElement($userIds), // Chọn staff_id ngẫu nhiên
                'booker_id' => $faker->randomElement($userIds), // Chọn booker_id ngẫu nhiên
                'branch_id' => $faker->randomElement($branchIds), // Chọn branch_id ngẫu nhiên
                'checkin_time' => $faker->dateTimeBetween('-1 month', '+1 month'), // Thời gian check-in ngẫu nhiên
                'deposit' => $faker->optional()->randomFloat(2, 100, 100000000), // Số tiền đặt cọc ngẫu nhiên hoặc null
                'status_payment' => $faker->randomElement(['unpaid', 'paid', 'partial']), // Trạng thái thanh toán ngẫu nhiên
                'status_touring' => $faker->randomElement(['waiting', 'in_progress', 'completed']), // Trạng thái touring ngẫu nhiên
                'note' => $faker->optional()->sentence, // Ghi chú giả hoặc null
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
