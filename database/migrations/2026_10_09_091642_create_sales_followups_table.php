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
        if (!Schema::hasTable('sales_followups')) {
            Schema::create('sales_followups', function (Blueprint $table) {
                $table->id();
                $table->integer('user_id');
                $table->string('client_name');
                $table->date('followup_date');
                $table->enum('status', ['Interested', 'Not Interested', 'Call Back', 'Deal Closed', 'No Answer'])->default('Call Back');
                $table->text('remarks')->nullable();
                $table->date('next_followup_date')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_followups');
    }
};
