<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class BillServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy danh sách bill_id từ bảng bills
        $billIds = DB::table('bills')->pluck('id')->toArray();

        // Lấy danh sách tour_id từ bảng tours
        $tourIds = DB::table('tours')->pluck('id')->toArray();

        // Lấy danh sách service_id từ bảng services
        $serviceIds = DB::table('services')->pluck('id')->toArray();

        // Lấy danh sách sale_agent_id từ bảng sale_agents
        $saleAgentIds = DB::table('sale_agents')->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            DB::table('bill_services')->insert([
                'bill_id' => $faker->randomElement($billIds), // Chọn bill_id ngẫu nhiên
                'tour_id' => $faker->randomElement($tourIds), // Chọn tour_id ngẫu nhiên
                'service_id' => $faker->randomElement($serviceIds), // Chọn service_id ngẫu nhiên
                'name_service' => $faker->name,
                'sale_agent_id' => $faker->optional()->randomElement($saleAgentIds), // Chọn sale_agent_id ngẫu nhiên hoặc null
                'quantity' => $faker->numberBetween(1, 10), // Số lượng dịch vụ ngẫu nhiên từ 1 đến 10
                'unit' => $faker->optional()->randomFloat(2, 0, 100), // Đơn vị của dịch vụ ngẫu nhiên hoặc null
                'price' => $faker->randomFloat(2, 1000, 5000000), // Giá của dịch vụ ngẫu nhiên từ 10.00 đến 500.00
                'note' => $faker->optional()->sentence, // Ghi chú ngẫu nhiên hoặc null
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
