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
        Schema::table('tour_service', function (Blueprint $table) {
            $table->dropForeign(['tour_id']);

            $table->foreign('tour_id')
                ->references('id')
                ->on('tours')
                ->onDelete('CASCADE');
            $table->dropForeign(['service_id']);

            $table->foreign('service_id')
                ->references('id')
                ->on('services')
                ->onDelete('CASCADE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_service', function (Blueprint $table) {
            $table->dropForeign(['tour_id']);

            // Thêm ràng buộc khóa ngoại cũ (giả sử là RESTRICT)
            $table->foreign('tour_id')
                ->references('id')
                ->on('tours');
        });
    }
};
