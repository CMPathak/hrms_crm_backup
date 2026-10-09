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
        Schema::table('sales_followups', function (Blueprint $table) {
            if (!Schema::hasColumn('sales_followups', 'company_name')) {
                $table->string('company_name')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('sales_followups', 'owner_name')) {
                $table->string('owner_name')->nullable()->after('company_name');
            }
            if (!Schema::hasColumn('sales_followups', 'client_email')) {
                $table->string('client_email')->nullable()->after('client_name');
            }
            if (!Schema::hasColumn('sales_followups', 'client_contact')) {
                $table->string('client_contact')->nullable()->after('client_email');
            }
            if (!Schema::hasColumn('sales_followups', 'client_address')) {
                $table->text('client_address')->nullable()->after('client_contact');
            }
            if (!Schema::hasColumn('sales_followups', 'meeting_date')) {
                $table->date('meeting_date')->nullable()->after('next_followup_date');
            }
            if (!Schema::hasColumn('sales_followups', 'meeting_time')) {
                $table->time('meeting_time')->nullable()->after('meeting_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales_followups', function (Blueprint $table) {
            $columns = ['company_name', 'owner_name', 'client_email', 'client_contact', 'client_address', 'meeting_date', 'meeting_time'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('sales_followups', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
