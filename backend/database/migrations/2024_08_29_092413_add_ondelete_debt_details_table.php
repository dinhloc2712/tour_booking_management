<?php

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
        Schema::table('debt_details', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->bigInteger('service_id')->nullable()->change();

            $table->foreign('service_id')
                ->references('id')
                ->on('services')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('debt_details', function (Blueprint $table) {
            $table->dropForeign(['service_id']);

            // Thêm ràng buộc khóa ngoại cũ (giả sử là RESTRICT)
            $table->foreign('service_id')
                ->references('id')
                ->on('services');
        });
    }
};
