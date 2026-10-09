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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'monthly_target')) {
                $table->decimal('monthly_target', 12, 2)->default(0)->nullable();
            }
            if (!Schema::hasColumn('users', 'monthly_achieved')) {
                $table->decimal('monthly_achieved', 12, 2)->default(0)->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'monthly_target')) {
                $table->dropColumn('monthly_target');
            }
            if (Schema::hasColumn('users', 'monthly_achieved')) {
                $table->dropColumn('monthly_achieved');
            }
        });
    }
};
