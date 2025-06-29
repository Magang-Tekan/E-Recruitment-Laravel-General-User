<?php

namespace Database\Seeders;

use App\Enums\CandidatesStage;
use App\Models\Applications;
use App\Models\ApplicationHistory;
use App\Models\Statuses;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ApplicationHistorySeeder extends Seeder
{
    public function run(): void
    {
        // Check if data already exists
        if (ApplicationHistory::count() > 0) {
            $this->command->info('Application history data already exists. Skipping seeder.');
            return;
        }

        // Get necessary data
        $applications = Applications::all();
        $admins = User::whereIn('role', ['super_admin', 'hr', 'head_hr'])->get();

        $this->command->info('Mencari status di database...');

        // Dapatkan semua status berdasarkan enum CandidatesStage
        $adminStatus = Statuses::where('stage', CandidatesStage::ADMINISTRATIVE_SELECTION->value)->first();
        $psychoTestStatus = Statuses::where('stage', CandidatesStage::PSYCHOTEST->value)->first();
        $interviewStatus = Statuses::where('stage', CandidatesStage::INTERVIEW->value)->first();
        $acceptedStatus = Statuses::where('stage', CandidatesStage::ACCEPTED->value)->first();
        $rejectedStatus = Statuses::where('stage', CandidatesStage::REJECTED->value)->first();

        // Debugging info
        $this->command->info("Status yang ditemukan:");
        $this->command->info("- Admin: " . ($adminStatus ? $adminStatus->name : 'TIDAK DITEMUKAN'));
        $this->command->info("- Psiko: " . ($psychoTestStatus ? $psychoTestStatus->name : 'TIDAK DITEMUKAN'));
        $this->command->info("- Interview: " . ($interviewStatus ? $interviewStatus->name : 'TIDAK DITEMUKAN'));
        $this->command->info("- Accepted: " . ($acceptedStatus ? $acceptedStatus->name : 'TIDAK DITEMUKAN'));
        $this->command->info("- Rejected: " . ($rejectedStatus ? $rejectedStatus->name : 'TIDAK DITEMUKAN'));

        // Validasi status yang dibutuhkan
        if (!$adminStatus || !$psychoTestStatus || !$interviewStatus || !$acceptedStatus || !$rejectedStatus) {
            $this->command->error('Beberapa status tidak ditemukan. Jalankan migrasi statuses_table terlebih dahulu.');
            return;
        }

        if ($applications->isEmpty()) {
            $this->command->error('No applications found. Please run ApplicationsSeeder first.');
            return;
        }

        if ($admins->isEmpty()) {
            $this->command->error('No admin users found. Please run SuperAdminSeeder first.');
            return;
        }

        // Mendapatkan aplikasi milik user 1 dan 2
        $specialApplications = Applications::whereIn('user_id', [1, 2])->get();

        if ($specialApplications->isEmpty()) {
            $this->command->warn('Tidak menemukan aplikasi untuk user 1 dan 2. Pastikan data aplikasi sudah dibuat.');
        } else {
            $this->command->info('Ditemukan ' . $specialApplications->count() . ' aplikasi untuk user 1 dan 2.');
        }

        // Proses khusus untuk user 1 dan 2 (lengkap semua tahap)
        foreach ($specialApplications as $application) {
            $startDate = Carbon::now()->subDays(90); // 3 bulan yang lalu
            $admin = $admins->first(); // Gunakan admin pertama untuk konsistensi

            // User 1 diterima, User 2 ditolak di tahap terakhir
            $isAccepted = $application->user_id === 1;

            $this->command->info('Membuat riwayat lengkap untuk aplikasi #' . $application->id . ' (User ID: ' . $application->user_id . ')');

            // 1. Tahap Administrasi
            $adminDate = $startDate->copy();
            $this->createStageHistory(
                $application,
                $adminStatus,
                $admin,
                $adminDate,
                rand(80, 95),
                $this->getAdminNotes(85),
                false // Not active
            );

            // 2. Tahap Psikotes
            $psychoDate = $adminDate->copy()->addDays(7);
            $this->createStageHistory(
                $application,
                $psychoTestStatus,
                $admin,
                $psychoDate,
                rand(80, 95),
                $this->getTestNotes(85),
                false // Not active
            );

            // 3. Tahap Interview (keduanya - HR dan User)
            $interviewDate = $psychoDate->copy()->addDays(7);
            $this->createStageHistory(
                $application,
                $interviewStatus,
                $admin,
                $interviewDate,
                rand(80, 95),
                $this->getInterviewNotes(85),
                false // Not active
            );

            // 4. Tahap Final: Accepted/Rejected (This is the active stage)
            $finalDate = $interviewDate->copy()->addDays(7);
            if ($isAccepted) {
                // User 1: Accepted
                $this->createStageHistory(
                    $application,
                    $acceptedStatus,
                    $admin,
                    $finalDate,
                    95,
                    "Kandidat telah menerima penawaran dan akan mulai bekerja pada " . $finalDate->copy()->addDays(14)->format('d M Y'),
                    true // This is active
                );
            } else {
                // User 2: Rejected
                $this->createStageHistory(
                    $application,
                    $rejectedStatus,
                    $admin,
                    $finalDate,
                    60,
                    "Setelah pertimbangan menyeluruh, perusahaan memilih kandidat lain yang lebih sesuai.",
                    true // This is active
                );
            }
        }

        // Proses aplikasi lainnya secara acak
        $otherApplications = $applications->whereNotIn('id', $specialApplications->pluck('id'));

        $this->command->info('Memproses ' . $otherApplications->count() . ' aplikasi lainnya secara acak.');

        foreach ($otherApplications as $application) {
            $appliedAt = Carbon::now()->subDays(rand(60, 90));
            $admin = $admins->random();

            // Distribute stages realistically
            $stageDistribution = rand(1, 100);

            if ($stageDistribution <= 35) {
                // 35% - Still in administrative review
                $currentStatus = $adminStatus;
                $score = rand(60, 85);
            } elseif ($stageDistribution <= 55) {
                // 20% - Moved to psychological test
                $currentStatus = $psychoTestStatus;
                $score = rand(65, 90);
            } elseif ($stageDistribution <= 70) {
                // 15% - Moved to interview
                $currentStatus = $interviewStatus;
                $score = rand(70, 90);
            } else {
                // 30% - Accepted or Rejected
                $currentStatus = rand(0, 1) ? $acceptedStatus : $rejectedStatus;
                $score = $currentStatus->id == $rejectedStatus->id ? rand(30, 65) : rand(80, 95);
            }

            // Create Administrative Selection History
            $this->createStageHistory(
                $application,
                $adminStatus,
                $admin,
                $appliedAt,
                rand(60, 85),
                $this->getAdminNotes(rand(60, 85))
            );

            // Create Psychological Test History if applicable
            if ($currentStatus->id >= $psychoTestStatus->id) {
                $this->createStageHistory(
                    $application,
                    $psychoTestStatus,
                    $admin,
                    $appliedAt->copy()->addDays(rand(5, 10)),
                    rand(65, 90),
                    $this->getTestNotes(rand(65, 90))
                );
            }

            // Create Interview History if applicable
            if ($currentStatus->id >= $interviewStatus->id) {
                $this->createStageHistory(
                    $application,
                    $interviewStatus,
                    $admin,
                    $appliedAt->copy()->addDays(rand(12, 18)),
                    rand(70, 90),
                    $this->getInterviewNotes(rand(70, 90))
                );
            }

            // If rejected, add rejection history
            if ($currentStatus->id == $rejectedStatus->id) {
                $this->createStageHistory(
                    $application,
                    $rejectedStatus,
                    $admin,
                    $appliedAt->copy()->addDays(rand(20, 30)),
                    rand(30, 65),
                    "Kandidat tidak memenuhi kriteria yang dibutuhkan",
                    false,
                    $this->getRejectionReason()
                );
            }

            // If accepted, add acceptance history
            if ($currentStatus->id == $acceptedStatus->id) {
                $this->createStageHistory(
                    $application,
                    $acceptedStatus,
                    $admin,
                    $appliedAt->copy()->addDays(rand(20, 30)),
                    rand(80, 95),
                    "Kandidat diterima untuk bergabung dengan perusahaan",
                    true
                );
            }
        }

        $this->command->info('Application history seeded successfully with user 1 and 2 having complete stages.');
    }

    private function createStageHistory($application, $status, $admin, $date, $score, $notes, $isActive = true, $rejectionReason = null)
    {
        // Validasi parameter untuk menghindari null reference
        if (!$application || !$status || !$admin) {
            $this->command->error('Invalid parameters for createStageHistory:');
            $this->command->error('- Application: ' . ($application ? 'OK' : 'NULL'));
            $this->command->error('- Status: ' . ($status ? 'OK' : 'NULL'));
            $this->command->error('- Admin: ' . ($admin ? 'OK' : 'NULL'));
            return;
        }

        try {
            // If this is going to be the active stage, deactivate all other stages for this application
            if ($isActive) {
                ApplicationHistory::where('application_id', $application->id)
                    ->update(['is_active' => false]);
            }

            // Use rejection reason in notes if provided, otherwise use the notes parameter
            $finalNotes = $rejectionReason !== null ? $rejectionReason : $notes;

            ApplicationHistory::create([
                'application_id' => $application->id,
                'status_id' => $status->id,
                'processed_at' => $date,
                'score' => $score,
                'notes' => $finalNotes,
                'scheduled_at' => $date->copy()->subDays(rand(1, 3)),
                'completed_at' => $date,
                'reviewed_by' => $admin->id,
                'reviewed_at' => $date->copy()->addHours(rand(1, 24)),
                'is_active' => $isActive
            ]);
        } catch (\Exception $e) {
            $this->command->error('Error creating history: ' . $e->getMessage());
        }
    }

    private function getAdminNotes($score)
    {
        if ($score >= 85) {
            return fake()->randomElement([
                'Dokumen lengkap dan sesuai persyaratan. Latar belakang pendidikan sangat relevan.',
                'Kualifikasi sangat baik. Pengalaman kerja sesuai dengan posisi yang dilamar.',
                'CV terstruktur dengan baik. Pengalaman dan skill sangat menarik.'
            ]);
        } elseif ($score >= 70) {
            return fake()->randomElement([
                'Kualifikasi cukup baik. Beberapa pengalaman relevan dengan posisi.',
                'Dokumen lengkap. Perlu explorasi lebih lanjut mengenai technical skills.',
                'Background pendidikan sesuai. Pengalaman kerja masih terbatas.'
            ]);
        } else {
            return fake()->randomElement([
                'Kualifikasi tidak memenuhi minimum requirement untuk posisi ini.',
                'Dokumen tidak lengkap dan pengalaman tidak relevan.',
                'Background pendidikan tidak sesuai dengan job specification.'
            ]);
        }
    }

    private function getTestNotes($score)
    {
        if ($score >= 85) {
            return fake()->randomElement([
                'Hasil psikotes sangat baik. Skor IQ dan kepribadian sesuai dengan posisi.',
                'Kemampuan logika dan analisis excellent. Personality type cocok dengan team.',
                'Test results menunjukkan kandidat memiliki potensi yang baik.'
            ]);
        } elseif ($score >= 70) {
            return fake()->randomElement([
                'Hasil psikotes cukup baik. Beberapa area masih perlu improvement.',
                'Skor IQ dalam range normal. Personality assessment menunjukkan hasil positif.',
                'Test results acceptable. Cocok untuk posisi entry to mid level.'
            ]);
        } else {
            return fake()->randomElement([
                'Hasil psikotes tidak memenuhi standar minimum perusahaan.',
                'Skor IQ dan personality assessment di bawah cut-off point.',
                'Test performance sangat mengecewakan. Tidak cocok untuk posisi ini.'
            ]);
        }
    }

    private function getInterviewNotes($score)
    {
        if ($score >= 85) {
            return fake()->randomElement([
                'Wawancara menunjukkan performa yang sangat baik. Komunikasi dan pengetahuan mendalam.',
                'Kandidat menunjukkan sikap yang sangat positif dan profesional selama wawancara.',
                'Kemampuan menjawab pertanyaan dengan tepat dan percaya diri.'
            ]);
        } elseif ($score >= 70) {
            return fake()->randomElement([
                'Wawancara berjalan dengan baik. Beberapa jawaban memerlukan klarifikasi lebih lanjut.',
                'Kandidat menunjukkan potensi, namun masih perlu pengembangan di beberapa area.',
                'Komunikasi baik, tetapi perlu peningkatan dalam beberapa aspek teknis.'
            ]);
        } else {
            return fake()->randomElement([
                'Wawancara tidak memuaskan. Banyak pertanyaan yang dijawab tidak relevan.',
                'Kandidat tidak menunjukkan minat atau pengetahuan yang cukup tentang posisi ini.',
                'Perlu banyak perbaikan dalam hal komunikasi dan pemahaman materi.'
            ]);
        }
    }

    private function getRejectionReason()
    {
        return fake()->randomElement([
            'Tidak memenuhi kualifikasi minimum yang dibutuhkan.',
            'Kurangnya pengalaman yang relevan dengan posisi.',
            'Hasil tes psikologi tidak sesuai dengan karakter yang dibutuhkan.',
            'Kandidat menunjukkan performa yang kurang baik dalam wawancara.',
            'Ekspektasi gaji lebih tinggi dari anggaran yang tersedia.',
            'Kandidat lain memiliki kualifikasi yang lebih baik.',
            'Hasil background check tidak memenuhi standar perusahaan.'
        ]);
    }
}
