<?php

use App\Models\DebtAgentService;
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
        Schema::create('debt_details', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(DebtAgentService::class)->constrained();
            $table->foreignIdFor(Service::class)->constrained();
            $table->string('name_service', 250)->unique();
            $table->double('price', 15, 2)->default(0.00);
            $table->integer('quantity');
            $table->double('unit', 10, 2)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debt_details');
    }
};
