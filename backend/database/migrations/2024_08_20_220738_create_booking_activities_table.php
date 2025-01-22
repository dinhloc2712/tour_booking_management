<?php

use App\Models\BookingTour;
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
        Schema::create('booking_activities', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('parent_activity_id')->nullable();
            $table->foreign('parent_activity_id')->references('id')->on('booking_activities');
            $table->foreignIdFor(BookingTour::class)->constrained();
            $table->bigInteger('staff_id');
            $table->foreign('staff_id')->references('id')->on('users');
            $table->string('name_staff', 100);
            $table->json('customer_ids');
            $table->string('name', 100)->comment('tên hành động');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_activities');
    }
};
