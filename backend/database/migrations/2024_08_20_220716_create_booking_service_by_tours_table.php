<?php

use App\Models\BookingServiceByTour;
use App\Models\BookingTour;
use App\Models\Service;
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
        Schema::create('booking_service_by_tours', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(BookingTour::class)->constrained();
            $table->foreignIdFor(Service::class)->constrained();
            $table->integer('quantity');
            $table->double('unit', 4,2);
            $table->text('note')->nullable();
            $table->string('status', 20)->default(BookingServiceByTour::STATUS_WAITING);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_service_by_tours');
    }
};
