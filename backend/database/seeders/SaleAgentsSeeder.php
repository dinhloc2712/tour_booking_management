<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class SaleAgentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        foreach (range(1, 10) as $index) {
            DB::table('sale_agents')->insert([
                'name' => $faker->unique()->company, // Tạo tên đại lý bán hàng duy nhất
                'type' => $faker->randomElement(['Tour', 'Hotel', 'Transport']), // Loại đại lý ngẫu nhiên
                'email' => $faker->unique()->safeEmail(), // Email giả duy nhất hoặc null
                'phone' => $faker->phoneNumber, // Số điện thoại giả hoặc null
                'address' => $faker->address, // Địa chỉ giả hoặc null
                'is_active' => $faker->boolean, // Trạng thái kích hoạt ngẫu nhiên
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
