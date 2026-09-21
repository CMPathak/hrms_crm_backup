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
        Schema::create('logo_registrations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->string('application_no')->nullable();
            $table->string('brand_name')->nullable();
            $table->string('type')->nullable(); // e.g., Wordmark, Symbol
            $table->string('status')->default('Pending');
            $table->date('applied_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logo_registrations');
    }
};
