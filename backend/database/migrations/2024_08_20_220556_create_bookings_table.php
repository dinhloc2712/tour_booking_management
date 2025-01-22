<?php

use App\Models\Booking;
use App\Models\Branch;
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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('staff_id');
            $table->bigInteger('booker_id');
            $table->foreign('staff_id')->references('id')->on('users');
            $table->foreign('booker_id')->references('id')->on('users');
            $table->foreignIdFor(Branch::class)->constrained();
            $table->datetime('checkin_time');
            $table->double('deposit', 15, 2)->nullable();
            $table->string('status_payment', 20)->default(Booking::STATUS_PAYMENT_UNPAID);
            $table->string('status_touring', 20)->default(Booking::STATUS_TOURING_WAITING);
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
