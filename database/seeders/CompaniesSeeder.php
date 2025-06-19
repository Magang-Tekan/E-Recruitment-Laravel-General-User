<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;

class CompaniesSeeder extends Seeder
{
    public function run(): void
    {
        Company::create([
            'name' => 'PT MITRA KARYA ANALITIKA',
            'description' => 'Perusahaan teknologi yang berfokus pada analisis data dan solusi TI.',
            'logo' => 'logo-mka.png',
        ]);
        Company::create([
            'name' => 'PT AUTENTIK KARYA ANALITIKA',
            'description' => 'Perusahaan teknologi yang berfokus pada pengembangan software.',
            'logo' => 'logo-mka.png',
        ]);
    }
}
