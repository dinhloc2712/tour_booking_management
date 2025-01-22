<?php

use App\Models\Bill;
use App\Models\Booking;
use App\Models\Voucher;
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
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Booking::class)->constrained();
            $table->bigInteger('staff_id');
            $table->bigInteger('customer_id');
            $table->foreign('staff_id')->references('id')->on('users');
            $table->foreign('customer_id')->references('id')->on('users');
            $table->foreignIdFor(Voucher::class)->nullable()->constrained();
            $table->string('code_voucher', 50)->nullable();
            $table->double('value_voucher', 15, 2)->nullable();
            $table->double('deposit', 15, 2)->nullable();
            $table->double('total_amount'. 15, 2);
            $table->string('type', 30)->default(Bill::TYPE_NORMAL);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
