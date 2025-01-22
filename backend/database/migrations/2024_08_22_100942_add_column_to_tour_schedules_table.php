<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Tour;


return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tour_schedules', function (Blueprint $table) {
            $table->foreignIdFor(Tour::class)->constrained();
            $table->string('title', 100);
            $table->text('detail');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_schedules', function (Blueprint $table) {
            $table->dropColumn('tour_id');
            $table->dropColumn('title');
            $table->dropColumn('detail');
        });
    }
};
