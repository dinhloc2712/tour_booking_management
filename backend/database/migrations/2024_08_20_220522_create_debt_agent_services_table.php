<?php

use App\Models\DebtAgentService;
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
        Schema::create('debt_agent_services', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(SaleAgent::class)->constrained();
            $table->double('revenue', 15, 2)->default(0.00);
            $table->double('paid_amount', 15, 2)->default(0.00);
            $table->text('note')->nullable();
            $table->string('status_debt')->default(DebtAgentService::STATUS_PAYMENT_IN_DEBT);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debt_agent_services');
    }
};
