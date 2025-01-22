<?php

use App\Models\Booking;
use App\Models\SaleAgent;
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
        Schema::create('agent_booking', function (Blueprint $table) {
            $table->foreignIdFor(SaleAgent::class)->constrained();
            $table->foreignIdFor(Booking::class)->constrained();

            $table->boolean('status')->default(false);
            $table->primary(['sale_agent_id', 'booking_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_booking');
    }
};
