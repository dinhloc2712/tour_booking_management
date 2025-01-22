<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class DebtDetailsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy danh sách debt_agent_service_id từ bảng debt_agent_services
        $debtAgentServiceIds = DB::table('debt_agent_services')->pluck('id')->toArray();

        // Lấy danh sách service_id từ bảng services
        $serviceIds = DB::table('services')->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            DB::table('debt_details')->insert([
                'debt_agent_service_id' => $faker->randomElement($debtAgentServiceIds), // Chọn debt_agent_service_id ngẫu nhiên
                'service_id' => $faker->randomElement($serviceIds), // Chọn service_id ngẫu nhiên
                'name_service' => $faker->unique()->word . ' Service', // Tạo tên dịch vụ duy nhất
                'price' => $faker->randomFloat(2, 100, 50000000), // Tạo giá giả từ 100.00 đến 5000.00
                'quantity' => $faker->numberBetween(1, 100), // Tạo số lượng giả từ 1 đến 100
                'unit' => $faker->optional()->randomFloat(2, 1, 10), // Tạo đơn vị giả từ 1.00 đến 10.00 hoặc null
                'note' => $faker->optional()->sentence, // Ghi chú giả hoặc null
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
