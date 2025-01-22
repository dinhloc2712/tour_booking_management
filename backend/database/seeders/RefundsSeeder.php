<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class RefundsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy danh sách bill_id từ bảng bills
        $billIds = DB::table('bills')->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            DB::table('refunds')->insert([
                'bill_id' => $faker->randomElement($billIds), // Chọn bill_id ngẫu nhiên
                'total_amount' => $faker->randomFloat(2, 1000, 5000000), // Tổng số tiền hoàn trả ngẫu nhiên từ 10.00 đến 500.00
                'refund_reason' => $faker->sentence, // Lý do hoàn trả ngẫu nhiên
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
