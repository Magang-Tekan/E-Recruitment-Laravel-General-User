<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCandidatesLanguagesTable extends Migration
{
    public function up()
    {
        Schema::create('candidates_languages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('language_name');
            $table->string('certificate_file')->nullable(); // kolom untuk upload file sertifikat
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('candidates_languages');
    }
}
