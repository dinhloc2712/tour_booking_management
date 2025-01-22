<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class RefundToursSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy danh sách refund_id từ bảng refunds
        $refundIds = DB::table('refunds')->pluck('id')->toArray();

        // Lấy danh sách tour_id từ bảng tours
        $tourIds = DB::table('tours')->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            DB::table('refund_tours')->insert([
                'refund_id' => $faker->randomElement($refundIds), // Chọn refund_id ngẫu nhiên
                'tour_id' => $faker->randomElement($tourIds), // Chọn tour_id ngẫu nhiên
                'name_tour' => $faker->name,
                'amount' => $faker->randomFloat(2, 1000, 5000000), // Số tiền hoàn trả ngẫu nhiên từ 5.00 đến 500.00
                'refund_reason' => $faker->sentence, // Lý do hoàn trả ngẫu nhiên
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
