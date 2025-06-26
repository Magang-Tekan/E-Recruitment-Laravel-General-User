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
            
            // Mengubah referensi dari 'selection' ke 'statuses'
            $table->foreignId('status_id')->constrained('statuses')->onDelete('cascade');
            $table->timestamp('processed_at')->nullable();
            
            // Kolom score dan notes yang disederhanakan (tidak lagi dibagi per tahap)
            $table->decimal('score', 5, 2)->nullable();
            $table->text('notes')->nullable();
            
            // Jadwal dan penyelesaian yang disederhanakan
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            
            // Review disederhanakan
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            
            // Mengubah is_qualified menjadi is_active
            $table->boolean('is_active')->default(true);
            
            // Hapus kolom rejection_reason karena redundant dengan notes
            // $table->text('rejection_reason')->nullable();
            
            // Kolom timestamps standar
            $table->timestamps();
            
            // Indexing untuk performa
            $table->index(['application_id', 'status_id']);
            $table->index(['scheduled_at']);
            $table->index(['processed_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('application_history');
    }
}