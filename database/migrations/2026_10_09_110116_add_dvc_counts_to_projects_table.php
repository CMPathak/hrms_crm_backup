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
            if (!Schema::hasColumn('projects', 'total_dvc')) {
                $table->integer('total_dvc')->default(0)->after('completed_reels');
            }
            if (!Schema::hasColumn('projects', 'completed_dvc')) {
                $table->integer('completed_dvc')->default(0)->after('total_dvc');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'total_dvc')) {
                $table->dropColumn('total_dvc');
            }
            if (Schema::hasColumn('projects', 'completed_dvc')) {
                $table->dropColumn('completed_dvc');
            }
        });
    }
};
