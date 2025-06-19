<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Companies;
use App\Models\Department;
use App\Models\MasterMajor;
use App\Models\Vacancies;
use App\Models\VacanciesTypes;
use App\Models\User;
use App\Enums\UserRole;
use Carbon\Carbon;

class JobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('role', UserRole::HR->value)->first();
        if (!$user) {
            echo "GAGAL: Tidak ada user dengan role HR. Gunakan VacanciesSeeder sebagai gantinya.\n";
            return;
        }

        $departments = Department::pluck('id', 'name');
        if (!isset($departments['IT'])) {
            echo "GAGAL: Department IT tidak ditemukan. Gunakan VacanciesSeeder sebagai gantinya.\n";
            return;
        }

        $companyMKA = Companies::where('name', 'PT MITRA KARYA ANALITIKA')->first();
        $companyAKA = Companies::where('name', 'PT AUTENTIK KARYA ANALITIKA')->first();

        $majorTI = MasterMajor::where('name', 'Teknik Informatika')->first();
        $majorManajemen = MasterMajor::where('name', 'Manajemen')->first();
        $majorAkuntansi = MasterMajor::where('name', 'Akuntansi')->first();

        // Ambil salah satu jenis lowongan
        $jobType = VacanciesTypes::first();
        if (!$jobType) {
            echo "GAGAL: Tidak ada tipe lowongan. Gunakan VacanciesSeeder sebagai gantinya.\n";
            return;
        }

        // Cek semua referensi wajib ada
        if (!$companyMKA || !$companyAKA || !$majorTI || !$majorManajemen || !$majorAkuntansi) {
            echo "GAGAL: Pastikan data companies dan master_majors sudah ada sebelum menjalankan JobSeeder.\n";
            return;
        }

        $jobs = [
            [
                'title' => 'SOFTWARE ENGINEER',
                'department_id' => $departments['IT'],
                'company_id' => $companyMKA->id,
                'type_id' => $jobType->id,
                'location' => 'Semarang',
                'major_id' => $majorTI->id,
                'requirements' => [
                    'Pendidikan minimal S1 Teknik Informatika',
                    'Menguasai pemrograman PHP, JavaScript',
                    'Pengalaman minimal 2 tahun'
                ],
                'job_description' => 'Mengembangkan dan memelihara aplikasi web',
                'benefits' => ['BPJS', 'Gaji di atas UMR', 'WFH Option'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'BACKEND DEVELOPER',
                'department_id' => $departments['IT'],
                'company_id' => $companyAKA->id,
                'type_id' => $jobType->id,
                'location' => 'Jakarta',
                'major_id' => $majorTI->id,
                'requirements' => [
                    'Pendidikan minimal S1 Teknik Informatika',
                    'Menguasai Laravel, MySQL',
                    'Pengalaman minimal 1 tahun'
                ],
                'job_description' => 'Mengembangkan dan memelihara backend aplikasi',
                'benefits' => ['BPJS', 'Gaji di atas UMR', 'Training'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'FRONTEND DEVELOPER',
                'department_id' => $departments['IT'],
                'company_id' => $companyMKA->id,
                'type_id' => $jobType->id,
                'location' => 'Semarang',
                'major_id' => $majorTI->id,
                'requirements' => [
                    'Pendidikan minimal S1 Teknik Informatika',
                    'Menguasai React, Tailwind CSS',
                    'Pengalaman minimal 1 tahun'
                ],
                'job_description' => 'Mengembangkan dan memelihara frontend aplikasi',
                'benefits' => ['BPJS', 'Gaji di atas UMR', 'WFH Option'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'MANAJEMEN TRAINEE',
                'department_id' => isset($departments['Management']) ? $departments['Management'] : $departments['HR'],
                'company_id' => $companyAKA->id,
                'type_id' => $jobType->id,
                'location' => 'Jakarta',
                'major_id' => $majorManajemen->id,
                'requirements' => [
                    'Pendidikan minimal S1 Manajemen',
                    'IPK minimal 3.00',
                    'Fresh graduate dipersilahkan'
                ],
                'job_description' => 'Belajar dan berkontribusi dalam divisi manajemen',
                'benefits' => ['BPJS', 'Gaji UMR', 'Training'],
                'user_id' => $user->id,
            ],
            [
                'title' => 'STAFF ADMINISTRASI',
                'department_id' => isset($departments['Administration']) ? $departments['Administration'] : $departments['HR'],
                'company_id' => $companyMKA->id,
                'type_id' => $jobType->id,
                'location' => 'Semarang',
                'major_id' => $majorManajemen->id,
                'requirements' => [
                    'Pendidikan minimal D3/S1 Manajemen/Administrasi',
                    'Pengalaman minimal 1 tahun',
                    'Menguasai MS Office'
                ],
                'job_description' => 'Mengelola administrasi kantor dan dokumentasi',
                'benefits' => ['BPJS', 'Gaji UMR', 'Tunjangan Hari Raya'],
                'user_id' => $user->id,
            ],
        ];

        // Insert data ke tabel vacancies
        foreach ($jobs as $job) {
            Vacancies::create($job);
        }

        echo "Berhasil menambahkan " . count($jobs) . " data lowongan pekerjaan.\n";
    }
}
