<?php

use App\Models\BookingTour;
use App\Models\Tour;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('refund_tours', function (Blueprint $table) {
            $table->json('customer_ids')->nullable();
            $table->dropForeignIdFor(Tour::class);
            $table->dropColumn('tour_id');
            $table->foreignIdFor(BookingTour::class)->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('refund_tours', function (Blueprint $table) {
            $table->dropColumn('customer_ids');
            $table->foreignIdFor(Tour::class)->nullable()->constrained();
            $table->dropForeignIdFor(BookingTour::class);
            $table->dropColumn('booking_tour_id');
        });
    }
};
