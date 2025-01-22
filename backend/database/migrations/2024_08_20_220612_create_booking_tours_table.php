<?php

use App\Models\Booking;
use App\Models\BookingTour;
use App\Models\Tour;
use App\Models\Voucher;
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
        Schema::create('booking_tours', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Booking::class)->constrained();
            $table->foreignIdFor(Tour::class)->constrained();
            $table->foreignIdFor(Voucher::class)->constrained();
            $table->json('customer_ids');
            $table->string('code_voucher', 50)->nullable();
            $table->double('value_voucher', 15, 2)->nullable();
            $table->datetime('start_time');
            $table->datetime('end_time');
            $table->double('price', 15, 2)->default(0.00);
            $table->text('note')->nullable();
            $table->string('status', 30)->default(BookingTour::STATUS_WAITING);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_tours');
    }
};
