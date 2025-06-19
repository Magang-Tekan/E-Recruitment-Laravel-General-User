<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\CandidatesStage;

class CreateApplicationHistoryTable extends Migration
{
    public function up()
    {
        Schema::create('application_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->onDelete('cascade');
            
            // Stage tracking
            $table->enum('stage', CandidatesStage::values())->default(CandidatesStage::ADMINISTRATIVE_SELECTION->value);
            $table->timestamp('processed_at');
            
            // Administrative Selection
            $table->decimal('admin_score', 5, 2)->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamp('admin_reviewed_at')->nullable();
            $table->foreignId('admin_reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            
            // Assessment/Psychotest
            $table->decimal('test_score', 5, 2)->nullable();
            $table->text('test_notes')->nullable();
            $table->timestamp('test_scheduled_at')->nullable();
            $table->timestamp('test_completed_at')->nullable();
            
            // Interview
            $table->decimal('interview_score', 5, 2)->nullable();
            $table->text('interview_notes')->nullable();
            $table->timestamp('interview_scheduled_at')->nullable();
            $table->timestamp('interview_completed_at')->nullable();
            $table->foreignId('interviewer_id')->nullable()->constrained('users')->onDelete('set null');
            
            // Status and Decision
            $table->boolean('is_qualified')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('decision_made_at')->nullable();
            $table->foreignId('decision_made_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
            
            // Add indexes for performance
            $table->index(['application_id', 'stage']);
            $table->index(['test_scheduled_at']);
            $table->index(['interview_scheduled_at']);
            $table->index(['processed_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('application_history');
    }
}