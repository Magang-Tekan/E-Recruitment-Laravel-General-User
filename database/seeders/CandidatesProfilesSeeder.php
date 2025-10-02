<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\CandidatesProfiles;
use Carbon\Carbon;
use App\Enums\UserRole;

class CandidatesProfilesSeeder extends Seeder
{
    public function run(): void
    {
        $candidates = User::where('role', UserRole::CANDIDATE)->get();

        foreach ($candidates as $user) {
            // Data khusus untuk userbiasa
            if ($user->email === 'userbiasa@gmail.com') {
                CandidatesProfiles::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'no_ektp' => $user->no_ektp,
                        'gender' => 'male',
                        'phone_number' => '081234567890',
                        'npwp' => '123456789012345',
                        'about_me' => 'Saya adalah seorang profesional yang berpengalaman dalam bidang teknologi informasi. Memiliki passion yang tinggi dalam pengembangan software dan selalu berusaha memberikan yang terbaik dalam setiap proyek yang dikerjakan.',
                        'place_of_birth' => 'Jakarta',
                        'date_of_birth' => '1995-05-15',
                        'address' => 'Jl. Sudirman No. 123, RT 01/RW 05',
                        'province' => 'DKI Jakarta',
                        'city' => 'Jakarta Pusat',
                        'district' => 'Menteng',
                        'village' => 'Menteng',
                        'rt' => '01',
                        'rw' => '05',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            } else {
                // Data random untuk user lainnya
                CandidatesProfiles::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'no_ektp' => $user->no_ektp,
                        'gender' => rand(0, 1) ? 'male' : 'female', // Langsung gunakan string
                        'phone_number' => '08' . rand(1000000000, 9999999999),
                        'npwp' => rand(0, 1) ? '1234567890' . rand(100, 999) : null,
                        'about_me' => 'Saya seorang kandidat yang berdedikasi.',
                        'place_of_birth' => 'Jakarta',
                        'date_of_birth' => Carbon::now()->subYears(rand(20, 30))->format('Y-m-d'),
                        'address' => 'Jl. Contoh No. ' . rand(1, 100),
                        'province' => 'DKI Jakarta',
                        'city' => 'Jakarta Selatan',
                        'district' => 'Kebayoran Baru',
                        'village' => 'Gandaria Utara',
                        'rt' => str_pad(rand(1, 10), 2, '0', STR_PAD_LEFT),
                        'rw' => str_pad(rand(1, 10), 2, '0', STR_PAD_LEFT),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }
}
