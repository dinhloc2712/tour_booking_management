<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class AgentBookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {       
        $faker = Faker::create();

        // Lấy danh sách sale_agent_id từ bảng sale_agents
        $saleAgentIds = DB::table('sale_agents')->pluck('id')->toArray();

        // Lấy danh sách booking_id từ bảng bookings
        $bookingIds = DB::table('bookings')->pluck('id')->toArray();

        foreach (range(1, 3) as $index) {
            DB::table('agent_booking')->insert([
                'sale_agent_id' => $faker->randomElement($saleAgentIds), // Chọn sale_agent_id ngẫu nhiên
                'booking_id' => $faker->randomElement($bookingIds), // Chọn booking_id ngẫu nhiên
                'status' => $faker->boolean, // Trạng thái ngẫu nhiên
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
