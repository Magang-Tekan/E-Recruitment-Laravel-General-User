<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::dropIfExists('applications');

        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('vacancy_period_id')->constrained('vacancy_periods')->onDelete('cascade');
            $table->foreignId('status_id')->constrained('statuses')->onDelete('restrict');
            $table->string('resume_path')->nullable();
            $table->string('cover_letter_path')->nullable();
            $table->timestamps();

            // Add indexes for better performance
            $table->index(['user_id', 'vacancy_period_id']);
            $table->index('status_id');
            
            // Prevent duplicate applications
            $table->unique(['user_id', 'vacancy_period_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('applications');
    }
};