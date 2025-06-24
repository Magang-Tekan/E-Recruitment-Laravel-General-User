<?php

namespace Database\Seeders;

use App\Models\Periods;
use App\Models\Vacancies;
use Illuminate\Database\Seeder;

class PeriodsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some vacancies to associate with the periods
        $vacancies = Vacancies::all();
        
        if ($vacancies->isEmpty()) {
            $this->command->info('No vacancies found. Skipping period seeding.');
            return;
        }

        // Create or update periods
        $periods = [];
        
        $periodsData = [
            [
                'id' => 1,
                'name' => 'Q1 2025 Recruitment',
                'description' => 'First quarter recruitment campaign',
                'start_time' => '2025-01-01 00:00:00',
                'end_time' => '2025-03-31 23:59:59',
            ],
            [
                'id' => 2,
                'name' => 'Q2 2025 Recruitment',
                'description' => 'Second quarter recruitment campaign',
                'start_time' => '2025-04-01 00:00:00',
                'end_time' => '2025-06-30 23:59:59',
            ],
            [
                'id' => 3,
                'name' => 'Q3 2025 Recruitment',
                'description' => 'Third quarter recruitment campaign',
                'start_time' => '2025-07-01 00:00:00',
                'end_time' => '2025-09-30 23:59:59',
            ],
            [
                'id' => 4,
                'name' => 'Q4 2025 Recruitment',
                'description' => 'Fourth quarter recruitment campaign',
                'start_time' => '2025-10-01 00:00:00',
                'end_time' => '2025-12-31 23:59:59',
            ],
        ];

        foreach ($periodsData as $periodData) {
            $period = Periods::updateOrCreate(
                ['id' => $periodData['id']],
                $periodData
            );
            $periods[] = $period;
        }

        // Associate periods with vacancies
        foreach ($vacancies as $index => $vacancy) {
            // Clear existing period associations
            $vacancy->periods()->detach();
            
            if ($index === 0) {
                // First vacancy - Q1 and Q3
                $vacancy->periods()->attach([$periods[0]->id, $periods[2]->id]);
            } elseif ($index === 1) {
                // Second vacancy - Q2 and Q4
                $vacancy->periods()->attach([$periods[1]->id, $periods[3]->id]);
            } else {
                // Random periods for remaining vacancies
                $availablePeriods = collect($periods)->pluck('id')->toArray();
                shuffle($availablePeriods);
                $selectedPeriods = array_slice($availablePeriods, 0, rand(1, 2));
                $vacancy->periods()->attach($selectedPeriods);
            }
        }

        $this->command->info('Periods seeded successfully!');
    }
}