<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class DebtAgentServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Lấy danh sách sale_agent_id từ bảng sale_agents
        $saleAgentIds = DB::table('sale_agents')->pluck('id')->toArray();

        foreach (range(1, 10) as $index) {
            DB::table('debt_agent_services')->insert([
                'sale_agent_id' => $faker->randomElement($saleAgentIds), // Chọn sale_agent_id ngẫu nhiên
                'revenue' => $faker->randomFloat(2, 1000, 100000000), // Tạo doanh thu giả từ 1,000.00 đến 50,000.00
                'paid_amount' => $faker->randomFloat(2, 0, 100000000), // Tạo số tiền đã thanh toán giả từ 0.00 đến 10,000.00
                'note' => $faker->optional()->sentence, // Ghi chú giả hoặc null
                'status_debt' => $faker->randomElement(['unpaid', 'paid', 'partial']), // Trạng thái nợ giả
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
