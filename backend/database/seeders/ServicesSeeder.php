<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class ServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        foreach (range(1, 10) as $index) {
            DB::table('services')->insert([
                'name' => $faker->unique()->word . ' Service', // Tên dịch vụ phải là duy nhất
                'price' => $faker->randomFloat(2, 1000, 10000000), // Tạo giá giả từ 10.00 đến 1000.00
                'description' => $faker->optional()->paragraph, // Mô tả giả, có thể null
                'is_active' => $faker->boolean, // Trạng thái kích hoạt ngẫu nhiên (true/false)
                'type'  => 'Bus',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
