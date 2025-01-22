<?php

use App\Models\BookingTour;
use App\Models\BookingTourServiceUser;
use App\Models\SaleAgent;
use App\Models\Service;
use App\Models\User;
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
        Schema::create('booking_tour_service_users', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(BookingTour::class)->constrained();
            $table->foreignIdFor(Service::class)->constrained();
            $table->integer('quantity');
            $table->double('unit', 4,2);
            $table->text('note')->nullable();
            $table->datetime('start_time');
            $table->datetime('end_time');
            $table->foreignIdFor(User::class)->constrained();
            $table->unsignedDouble('price', 15, 2)->default(0.00);
            $table->foreignIdFor(SaleAgent::class)->nullable()->constrained();
            $table->string('status', 20)->default(BookingTourServiceUser::STATUS_WAITING);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_tour_service_users');
    }
};
