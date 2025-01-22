<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class PaymentsSeeder extends Seeder
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
            DB::table('payments')->insert([
                'bill_id' => $faker->randomElement($billIds), // Chọn bill_id ngẫu nhiên
                'amount' => $faker->randomFloat(2, 1000, 100000000), // Số tiền thanh toán ngẫu nhiên từ 50.00 đến 2000.00
                'type' => $faker->randomElement(['cash', 'credit_card', 'bank_transfer']), // Loại thanh toán ngẫu nhiên
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
