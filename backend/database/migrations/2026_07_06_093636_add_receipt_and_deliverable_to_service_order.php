<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_order', function (Blueprint $table) {
            // Receipt (payment proof)
            $table->string('receipt_path')->nullable()->after('details');
            $table->enum('receipt_status', ['pending', 'approved', 'rejected'])->nullable()->after('receipt_path');
            $table->text('receipt_note')->nullable()->after('receipt_status'); // admin rejection reason

            // Deliverable (final files)
            $table->string('deliverable_path')->nullable()->after('receipt_note');
        });
    }

    public function down(): void
    {
        Schema::table('service_order', function (Blueprint $table) {
            $table->dropColumn(['receipt_path', 'receipt_status', 'receipt_note', 'deliverable_path']);
        });
    }
};
