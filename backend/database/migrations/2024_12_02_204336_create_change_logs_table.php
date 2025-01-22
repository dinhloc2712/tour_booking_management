<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChangeLogsTable extends Migration
{
    public function up()
    {
        Schema::create('change_logs', function (Blueprint $table) {
            $table->id();
            $table->string('model_name'); // Tên bảng bị thay đổi
            $table->unsignedBigInteger('record_id'); // ID của bản ghi bị thay đổi
            $table->json('changed_data'); // JSON lưu thông tin thay đổi
            $table->unsignedBigInteger('changed_by')->nullable(); // ID user thay đổi (nullable nếu không có)
            $table->timestamps(); // created_at, updated_at
        });
    }

    public function down()
    {
        Schema::dropIfExists('change_logs');
    }
}

