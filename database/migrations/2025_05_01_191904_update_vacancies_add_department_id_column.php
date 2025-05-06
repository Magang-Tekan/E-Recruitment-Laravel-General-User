<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vacancies', function (Blueprint $table) {
            // Hapus kolom string 'department' jika ada
            if (Schema::hasColumn('vacancies', 'department')) {
                $table->dropColumn('department');
            }

            // Tambahkan kolom foreign key 'department_id' tanpa after()
            if (!Schema::hasColumn('vacancies', 'department_id')) {
                $table->foreignId('department_id')
                    ->nullable()
                    ->constrained()
                    ->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('vacancies', function (Blueprint $table) {
            // Hapus foreign key dan kolom 'department_id' jika ada
            if (Schema::hasColumn('vacancies', 'department_id')) {
                $table->dropForeign(['department_id']);
                $table->dropColumn('department_id');
            }

            // Tambahkan kembali kolom string 'department' (tanpa after)
            if (!Schema::hasColumn('vacancies', 'department')) {
                $table->string('department')->nullable();
            }
        });
    }
};
