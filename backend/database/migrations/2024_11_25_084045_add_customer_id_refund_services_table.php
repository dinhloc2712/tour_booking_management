<?php

use App\Models\BookingTourServiceUser;
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
        Schema::table('refund_services', function (Blueprint $table) {
            $table->bigInteger('customer_id')->nullable();
            $table->foreign('customer_id')->references('id')->on('users');
            $table->dropForeignIdFor(Service::class);
            $table->dropColumn('service_id');
            $table->foreignIdFor(BookingTourServiceUser::class)->nullable()->constrained();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('refund_services', function (Blueprint $table) {
            $table->dropForeign('bill_services_customer_id_foreign');
            $table->dropColumn('customer_id');
            $table->foreignIdFor(Service::class)->nullable()->constrained();
            $table->dropForeignIdFor(BookingTourServiceUser::class);
            $table->dropColumn('booking_tour_service_user_id');
        });
    }
};
