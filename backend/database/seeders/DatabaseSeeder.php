<?php

namespace Database\Seeders;
use Illuminate\Support\Facades\DB;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\SaleAgent;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([
            // BranchesSeeder::class,
            UsersSeeder::class,
            UserDetailsSeeder::class,
            // ToursSeeder::class,
            // TourGalleriesSeeder::class,
            // TourSchedulesSeeder::class,
            // ServicesSeeder::class,
            // TourServiceSeeder::class,
            // SaleAgentsSeeder::class,
            // DebtAgentServicesSeeder::class,
            // DebtDetailsSeeder::class,
            // VouchersSeeder::class,
            // BookingsSeeder::class,
            // BookingToursSeeder::class,
            // BookingServiceByToursSeeder::class,
            // BookingActivitiesSeeder::class,
            // AgentBookingSeeder::class,
            // BillsSeeder::class,
            // BillToursSeeder::class,
            // BillServicesSeeder::class,
            // PaymentsSeeder::class,
            // RefundsSeeder::class,
            // RefundServicesSeeder::class,
            // RefundToursSeeder::class,
            RolesAndPermissionsSeeder::class
        ]);
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

    }
}
