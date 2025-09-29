<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CandidatesEducations;
use App\Models\User;
use App\Models\MasterMajor;
use App\Models\EducationLevel;
use App\Enums\UserRole;

class CandidatesEducationSeeder extends Seeder
{
    public function run(): void
    {
        $candidates = User::where('role', UserRole::CANDIDATE)->get();
        $majors = MasterMajor::all();
        $educationLevels = EducationLevel::all();

        if ($educationLevels->isEmpty()) {
            // Jika tabel education_levels kosong, buat data dasar
            $educationLevels = collect([
                EducationLevel::create(['name' => 'SMA/SMK']),
                EducationLevel::create(['name' => 'D3']),
                EducationLevel::create(['name' => 'S1']),
                EducationLevel::create(['name' => 'S2']),
                EducationLevel::create(['name' => 'S3'])
            ]);
        }

        // Array nama institusi untuk seeder
        $institutions = [
            'Universitas Indonesia',
            'Institut Teknologi Bandung',
            'Universitas Gadjah Mada',
            'Institut Teknologi Sepuluh Nopember',
            'Universitas Airlangga',
            'Universitas Brawijaya',
            'Universitas Diponegoro',
            'Universitas Sebelas Maret',
            'Institut Pertanian Bogor',
            'Universitas Padjadjaran'
        ];

        foreach ($candidates as $candidate) {
            if ($majors->isNotEmpty() && $educationLevels->isNotEmpty()) {
                // Data khusus untuk userbiasa
                if ($candidate->email === 'userbiasa@gmail.com') {
                    // Cari S1 Teknik Informatika
                    $s1Level = $educationLevels->where('name', 'S1')->first();
                    $informatikaMajor = $majors->where('name', 'Teknik Informatika')->first();
                    
                    if (!$informatikaMajor) {
                        // Jika tidak ada Teknik Informatika, ambil major pertama
                        $informatikaMajor = $majors->first();
                    }
                    
                    CandidatesEducations::updateOrCreate(
                        ['user_id' => $candidate->id],
                        [
                            'education_level_id' => $s1Level ? $s1Level->id : $educationLevels->random()->id,
                            'faculty' => 'Fakultas Teknik',
                            'major_id' => $informatikaMajor->id,
                            'institution_name' => 'Universitas Indonesia',
                            'gpa' => 3.75,
                            'year_in' => 2018,
                            'year_out' => 2022,
                        ]
                    );
                } else {
                    // Data random untuk user lainnya
                    $randomEducationLevel = $educationLevels->random();
                    
                    CandidatesEducations::updateOrCreate(
                        ['user_id' => $candidate->id],
                        [
                            'education_level_id' => $randomEducationLevel->id, // Gunakan education_level_id
                            'faculty' => collect(['Teknik', 'Ekonomi', 'Hukum', 'Kedokteran', 'MIPA'])->random(),
                            'major_id' => $majors->random()->id,
                            'institution_name' => collect($institutions)->random(),
                            'gpa' => round(rand(250, 400) / 100, 2), // GPA antara 2.50 - 4.00
                            'year_in' => rand(2015, 2020),
                            'year_out' => rand(2019, 2024),
                        ]
                    );
                }
            }
        }
    }
}
