<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateApplicationsTable extends Migration
{
    public function up()
    {
        // Hapus tabel jika sudah ada
        Schema::dropIfExists('applications');

        // Buat tabel tanpa kolom selection_id
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('vacancies_period_id')->constrained('vacancies_periods')->onDelete('cascade');
            $table->string('resume_path')->nullable();
            $table->string('cover_letter_path')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('applications');
    }
}
