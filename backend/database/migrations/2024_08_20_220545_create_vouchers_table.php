<?php

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
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('object_type', 20)->nullable();
            $table->json('object_ids')->nullable();
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->string('type', 20)->default(Voucher::TYPE_MONEY);
            $table->double('value', 15, 2)->default(0.00);
            $table->double('limit', 15, 2)->nullable();
            $table->integer('quantity');
            $table->datetime('start_time');
            $table->datetime('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
