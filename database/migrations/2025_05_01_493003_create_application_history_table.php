<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicationHistoryTable extends Migration
{
    public function up()
    {
        Schema::create('application_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->onDelete('cascade');
            $table->foreignId('status_id')->constrained('statuses')->onDelete('cascade');
            
            // Simple timestamp fields without any foreign key constraints
            $table->timestamp('processed_at')->nullable()->index();
            $table->text('resource_url')->nullable();
            
            $table->decimal('score', 5, 2)->nullable();
            $table->text('notes')->nullable();
            
            // Simple timestamp field without foreign key constraint
            $table->timestamp('scheduled_at')->nullable()->index();
            $table->timestamp('completed_at')->nullable();
            
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Index for foreign keys
            $table->index(['application_id', 'status_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('application_history');
    }
}