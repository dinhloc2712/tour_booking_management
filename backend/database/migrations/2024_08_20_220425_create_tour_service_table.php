<?php

use App\Models\Tour;
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
        Schema::create('tour_service', function (Blueprint $table) {
            $table->foreignIdFor(Tour::class)->constrained();
            $table->foreignIdFor(Service::class)->constrained();
            $table->double('price', 15, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->primary(['tour_id', 'service_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tour_service');
    }
};
