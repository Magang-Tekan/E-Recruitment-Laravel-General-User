<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('education_levels', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // SMK/SMA, D3, S1, S2, S3
            $table->timestamps();
        });
        
        // Menambahkan data default untuk education levels
        DB::table('education_levels')->insert([
            ['name' => 'SMA/SMK', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'D3', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'S1', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'S2', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'S3', 'created_at' => now(), 'updated_at' => now()]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('education_levels');
    }
};