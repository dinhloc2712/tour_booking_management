<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class BillsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy danh sách booking_id từ bảng bookings
        $bookingIds = DB::table('bookings')->pluck('id')->toArray();

        // Lấy danh sách staff_id và customer_id từ bảng users
        $userIds = DB::table('users')->pluck('id')->toArray();

        // Lấy danh sách voucher_id từ bảng vouchers
        $voucherIds = DB::table('vouchers')->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            DB::table('bills')->insert([
                'booking_id' => $faker->randomElement($bookingIds), // Chọn booking_id ngẫu nhiên
                'staff_id' => $faker->randomElement($userIds), // Chọn staff_id ngẫu nhiên
                'customer_id' => $faker->randomElement($userIds), // Chọn customer_id ngẫu nhiên
                'quantity_customer' => 1,
                'voucher_id' => $faker->optional()->randomElement($voucherIds), // Chọn voucher_id ngẫu nhiên hoặc null
                'code_voucher' => $faker->optional()->word, // Mã voucher ngẫu nhiên hoặc null
                'value_voucher' => $faker->optional()->randomFloat(2, 1000, 1000000), // Giá trị voucher ngẫu nhiên hoặc null
                'deposit' => $faker->optional()->randomFloat(2, 1000, 10000000), // Tiền đặt cọc ngẫu nhiên hoặc null
                'total_amount' => $faker->randomFloat(2, 1000, 200000000), // Tổng số tiền ngẫu nhiên từ 100.00 đến 2000.00
                'type' => $faker->randomElement(['normal', 'special']), // Loại hóa đơn ngẫu nhiên
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
