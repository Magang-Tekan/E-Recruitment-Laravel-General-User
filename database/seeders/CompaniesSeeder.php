<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;
use Illuminate\Support\Facades\Schema;

class CompaniesSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        
        Company::truncate();

        Company::create([
            'name' => 'PT MITRA KARYA ANALITIKA',
            'description' => 'Bergerak dibidang Distribusi Kebutuhan Laboratorium, Cleanroom, Water and Waste Water Treatment Plant.',
            'logo' => 'companies/mitra-logo.png',
            'email' => 'mitra@example.com',
            'phone' => '081807700111',
            'address' => 'Jl. Klipang Ruko Amsterdam No.9E, Sendangmulyo'
        ]);

        Company::create([
            'name' => 'PT AUTENTIK KARYA ANALITIKA',
            'description' => 'Adalah perusahaan teknologi pintar yang senantiasa berkomitmen untuk memberikan dan meningkatkan kepuasan pelanggan',
            'logo' => 'companies/autentik-logo.png',
            'email' => 'autentik.info@gmail.com',
            'phone' => '082137384029',
            'address' => 'Jl. Klipang Ruko Amsterdam No.9E, Sendangmulyo'
        ]);

        Schema::enableForeignKeyConstraints();
    }
}
