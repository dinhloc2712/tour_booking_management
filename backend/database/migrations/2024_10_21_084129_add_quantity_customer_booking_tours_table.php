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
        Schema::table('booking_tours', function (Blueprint $table) {
            $table->unsignedInteger('quantity_customer')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_tours', function (Blueprint $table) {
            $table->dropColumn('quantity_customer');
        });
    }
};
