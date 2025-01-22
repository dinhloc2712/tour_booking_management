<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class BookingToursSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy danh sách booking_id từ bảng bookings
        $bookingIds = DB::table('bookings')->pluck('id')->toArray();

        // Lấy danh sách tour_id từ bảng tours
        $tourIds = DB::table('tours')->pluck('id')->toArray();

        // Lấy danh sách voucher_id từ bảng vouchers
        $voucherIds = DB::table('vouchers')->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            DB::table('booking_tours')->insert([
                'booking_id' => $faker->randomElement($bookingIds), // Chọn booking_id ngẫu nhiên
                'tour_id' => $faker->randomElement($tourIds), // Chọn tour_id ngẫu nhiên
                'voucher_id' => $faker->optional()->randomElement($voucherIds), // Chọn voucher_id ngẫu nhiên hoặc null
                'customer_ids' => json_encode($faker->randomElements(range(1, 100), $faker->numberBetween(1, 5))), // Danh sách ID khách hàng ngẫu nhiên
                'code_voucher' => $faker->optional()->lexify('VC????'), // Mã voucher ngẫu nhiên hoặc null
                'value_voucher' => $faker->optional()->randomFloat(2, 10, 1000000), // Giá trị voucher ngẫu nhiên hoặc null
                'name_tour' => $faker->name,
                'start_time' => $faker->dateTimeBetween('-1 month', '+1 month'), // Thời gian bắt đầu ngẫu nhiên
                'end_time' => $faker->dateTimeBetween('+1 month', '+2 months'), // Thời gian kết thúc ngẫu nhiên
                'price' => $faker->randomFloat(2, 500, 1000000), // Giá tour ngẫu nhiên từ 500.00 đến 5000.00
                'note' => $faker->optional()->sentence, // Ghi chú giả hoặc null
                'status' => $faker->randomElement(['waiting', 'confirmed', 'cancelled']), // Trạng thái booking ngẫu nhiên
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
