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
        Schema::table('bill_tours', function (Blueprint $table) {
            $table->dropForeign(['tour_id']);
            $table->bigInteger('tour_id')->nullable()->change();
            
            $table->foreign('tour_id')
                ->references('id')
                ->on('tours')
                ->onDelete('set null');
            $table->string('name_tour', 255);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bill_tours', function (Blueprint $table) {
            $table->dropForeign(['tour_id']);
            
            // Thêm ràng buộc khóa ngoại cũ (giả sử là RESTRICT)
            $table->foreign('tour_id')
                ->references('id')
                ->on('tours');
            $table->dropColumn('name_tour');
        });
    }
};
