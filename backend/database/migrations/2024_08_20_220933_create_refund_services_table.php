<?php

use App\Models\Refund;
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
        Schema::create('refund_services', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Refund::class)->constrained();
            $table->foreignIdFor(Service::class)->constrained();
            $table->integer('quantity');
            $table->double('unit', 4, 2);
            $table->double('amount', 15, 2)->default(0.00);
            $table->text('refund_reason');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refund_services');
    }
};
