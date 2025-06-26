<?php

namespace Database\Seeders;

use App\Models\Applications;
use App\Models\User;
use App\Models\VacancyPeriods;
use Illuminate\Database\Seeder;

class ApplicationsSeeder extends Seeder
{
    public function run(): void
    {
        // Get required data
        $users = User::where('role', 'candidate')->take(5)->get();
        $vacancyPeriods = VacancyPeriods::all();

        if ($users->isEmpty() || $vacancyPeriods->isEmpty()) {
            $this->command->error('Missing required data. Please seed users and vacancy periods first.');
            return;
        }

        foreach ($users as $user) {
            // Each user applies to 1-2 vacancies
            $selectedVacancyPeriods = $vacancyPeriods->random(rand(1, 2));

            foreach ($selectedVacancyPeriods as $vacancyPeriod) {
                Applications::create([
                    'user_id' => $user->id,
                    'vacancies_id' => $vacancyPeriod->vacancy_id, // Include vacancies_id reference
                    'vacancy_period_id' => $vacancyPeriod->id,
                    'resume_path' => 'resumes/user_' . $user->id . '_resume.pdf',
                    'cover_letter_path' => 'cover_letters/user_' . $user->id . '_cover.pdf',
                    'status_id' => 1, // Assuming 1 is 'Applied' or initial status
                ]);
            }
        }

        $this->command->info('Applications seeded successfully.');
    }
}
