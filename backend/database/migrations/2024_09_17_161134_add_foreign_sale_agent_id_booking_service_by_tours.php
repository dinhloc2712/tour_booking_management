<?php

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
        Schema::table('booking_service_by_tours', function (Blueprint $table) {
            $table->foreignIdFor(SaleAgent::class)->nullable()->constrained();
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_service_by_tours', function (Blueprint $table) {
            $table->dropForeignIdFor(SaleAgent::class);
            
        });
    }
};
