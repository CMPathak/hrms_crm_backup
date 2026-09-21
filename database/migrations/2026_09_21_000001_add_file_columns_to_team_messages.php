<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('team_messages', function (Blueprint $table) {
            $table->string('file_path')->nullable()->after('message');
            $table->string('file_name')->nullable()->after('file_path');
            $table->string('file_type')->nullable()->after('file_name'); // 'image' or 'pdf'
        });
    }

    public function down(): void
    {
        Schema::table('team_messages', function (Blueprint $table) {
            $table->dropColumn(['file_path', 'file_name', 'file_type']);
        });
    }
};
