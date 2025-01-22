<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class BillToursSeeder extends Seeder
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

        foreach (range(1, 10) as $index) {
            DB::table('bill_tours')->insert([
                'bill_id' => $faker->randomElement($billIds), // Chọn bill_id ngẫu nhiên
                'tour_id' => $faker->randomElement($tourIds), // Chọn tour_id ngẫu nhiên
                'customer_ids' => json_encode($faker->randomElements(range(1, 100), $faker->numberBetween(1, 5))), // Danh sách ID khách hàng ngẫu nhiên
                'name_tour' => $faker->name,
                'price' => $faker->randomFloat(2, 1000, 20000000), // Giá của tour ngẫu nhiên từ 100.00 đến 2000.00
                'note' => $faker->optional()->sentence, // Ghi chú ngẫu nhiên hoặc null
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
