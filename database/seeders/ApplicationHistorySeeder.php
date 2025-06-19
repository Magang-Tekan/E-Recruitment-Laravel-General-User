<?php

namespace Database\Seeders;

use App\Enums\CandidatesStage;
use App\Models\Applications;
use App\Models\ApplicationHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ApplicationHistorySeeder extends Seeder
{
    public function run(): void
    {
        // Get necessary data
        $applications = Applications::all();
        $admins = User::whereIn('role', ['super_admin', 'hr', 'head_hr'])->get();

        if ($applications->isEmpty()) {
            $this->command->error('No applications found. Please run ApplicationsSeeder first.');
            return;
        }

        if ($admins->isEmpty()) {
            $this->command->error('No admin users found. Please run SuperAdminSeeder first.');
            return;
        }

        foreach ($applications as $application) {
            $appliedAt = Carbon::now()->subDays(rand(60, 90));
            
            // Distribute stages realistically
            $stageDistribution = rand(1, 100);
            
            if ($stageDistribution <= 35) {
                // 35% - Still in administrative review
                $currentStage = CandidatesStage::ADMINISTRATIVE_SELECTION;
                $adminScore = rand(60, 85);
            } elseif ($stageDistribution <= 55) {
                // 20% - Moved to psychological test
                $currentStage = CandidatesStage::PSYCHOTEST;  // Changed from ASSESSMENT
                $adminScore = rand(75, 95);
                $testScore = rand(65, 90);
            } elseif ($stageDistribution <= 70) {
                // 15% - Moved to interview
                $currentStage = CandidatesStage::INTERVIEW;
                $adminScore = rand(80, 95);
                $testScore = rand(70, 95);
                $interviewScore = rand(70, 90);
            } else {
                // 30% - Rejected at various stages
                $rejectionStage = rand(1, 3);
                $currentStage = CandidatesStage::REJECTED;
                
                if ($rejectionStage == 1) {
                    $adminScore = rand(30, 65);
                } elseif ($rejectionStage == 2) {
                    $adminScore = rand(70, 80);
                    $testScore = rand(30, 60);
                } else {
                    $adminScore = rand(75, 85);
                    $testScore = rand(70, 85);
                    $interviewScore = rand(30, 65);
                }
            }

            // Create Administrative Selection History
            $this->createStageHistory(
                $application,
                CandidatesStage::ADMINISTRATIVE_SELECTION,
                $admins->random(),
                $appliedAt,
                $adminScore,
                $this->getAdminNotes($adminScore)
            );

            // Create Psychological Test History if applicable
            if (isset($testScore)) {
                $this->createStageHistory(
                    $application,
                    CandidatesStage::PSYCHOTEST,  // Changed from ASSESSMENT
                    $admins->random(),
                    $appliedAt->copy()->addDays(rand(5, 10)),
                    $testScore,
                    $this->getTestNotes($testScore)
                );
            }

            // Create Interview History if applicable
            if (isset($interviewScore)) {
                $this->createStageHistory(
                    $application,
                    CandidatesStage::INTERVIEW,
                    $admins->random(),
                    $appliedAt->copy()->addDays(rand(15, 20)),
                    $interviewScore,
                    $this->getInterviewNotes($interviewScore)
                );
            }
        }

        $this->command->info('Application history seeded successfully with realistic data.');
    }

    private function createStageHistory($application, $stage, $admin, $date, $score, $notes)
    {
        ApplicationHistory::create([
            'application_id' => $application->id,
            'stage' => $stage,
            'processed_at' => $date,
            'admin_score' => $score,
            'admin_notes' => $notes,
            'admin_reviewed_at' => $date->copy()->addHours(rand(1, 48)),
            'admin_reviewed_by' => $admin->id,
            'is_qualified' => $score >= 70
        ]);
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
}
