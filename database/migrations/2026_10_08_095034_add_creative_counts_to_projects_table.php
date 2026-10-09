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
        Schema::table('projects', function (Blueprint $table) {
            $table->integer('total_banners')->default(0)->after('banner_reel');
            $table->integer('completed_banners')->default(0)->after('total_banners');
            $table->integer('total_reels')->default(0)->after('completed_banners');
            $table->integer('completed_reels')->default(0)->after('total_reels');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['total_banners', 'completed_banners', 'total_reels', 'completed_reels']);
        });
    }
};
