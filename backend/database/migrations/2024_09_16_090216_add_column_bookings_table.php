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
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignIdFor(SaleAgent::class)->nullable()->constrained();
            $table->string("status_agent")->default(Booking::STATUS_AGENT_NO);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeignIdFor(SaleAgent::class);
            $table->dropColumn('status_agent');
        });
    }
};
