<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class VouchersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        foreach (range(1, 10) as $index) {
            DB::table('vouchers')->insert([
                'code' => strtoupper($faker->unique()->lexify('??????')), // Tạo mã voucher duy nhất, gồm 6 ký tự ngẫu nhiên
                'description' => $faker->optional()->sentence, // Mô tả giả hoặc null
                'type' => $faker->randomElement(['money', 'percent']), // Loại voucher ngẫu nhiên
                'value' => $faker->randomFloat(2, 1, 1000000), // Giá trị giảm giả từ 10.00 đến 1000.00
                'limit' => $faker->optional()->randomFloat(2, 100, 10000), // Giới hạn giảm giá giả hoặc null
                'quantity' => $faker->numberBetween(1, 100), // Số lượng voucher ngẫu nhiên từ 1 đến 100
                'start_time' => $faker->dateTimeBetween('-1 month', 'now'), // Thời gian bắt đầu ngẫu nhiên từ 1 tháng trước đến hiện tại
                'end_time' => $faker->dateTimeBetween('now', '+1 month'), // Thời gian kết thúc ngẫu nhiên từ hiện tại đến 1 tháng sau
                'is_active' => $faker->boolean, // Trạng thái kích hoạt ngẫu nhiên
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
