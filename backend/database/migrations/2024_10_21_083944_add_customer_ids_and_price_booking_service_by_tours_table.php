<?php

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
        Schema::table('booking_service_by_tours', function (Blueprint $table) {
            $table->json('customer_ids')->nullable();
            $table->unsignedDouble('price', 15, 2)->default(0.00);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_service_by_tours', function (Blueprint $table) {
            $table->dropColumn('customer_ids');
            $table->dropColumn('price');
        });
    }
};
