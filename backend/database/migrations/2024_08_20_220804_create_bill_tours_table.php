<?php

use App\Models\Bill;
use App\Models\Tour;
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
        Schema::create('bill_tours', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Bill::class)->constrained();
            $table->foreignIdFor(Tour::class)->constrained();
            $table->json('customer_ids');
            $table->double('price', 15, 2);
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bill_tours');
    }
};
