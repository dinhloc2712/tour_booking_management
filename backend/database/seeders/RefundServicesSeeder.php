<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class RefundServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy danh sách refund_id từ bảng refunds
        $refundIds = DB::table('refunds')->pluck('id')->toArray();

        // Lấy danh sách service_id từ bảng services
        $serviceIds = DB::table('services')->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            DB::table('refund_services')->insert([
                'refund_id' => $faker->randomElement($refundIds), // Chọn refund_id ngẫu nhiên
                'service_id' => $faker->randomElement($serviceIds), // Chọn service_id ngẫu nhiên
                'name_service' => $faker->name,
                'quantity' => $faker->numberBetween(1, 10), // Số lượng dịch vụ hoàn trả ngẫu nhiên từ 1 đến 10
                'unit' => $faker->randomFloat(2, 1, 100), // Đơn vị dịch vụ ngẫu nhiên từ 1.00 đến 100.00
                'amount' => $faker->randomFloat(2, 1000, 5000000), // Số tiền hoàn trả ngẫu nhiên từ 10.00 đến 500.00
                'refund_reason' => $faker->sentence, // Lý do hoàn trả ngẫu nhiên
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
