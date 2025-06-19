<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ApplicationsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('applications')->insert([
            [
                // Corrected column name to match migration: vacancies_period_id (singular)
                'user_id' => 2,
                'vacancies_period_id' => 2,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
            [
                // Corrected column name to match migration: vacancies_period_id (singular)
                'user_id' => 3,
                'vacancies_period_id' => 2,
                'created_at' => Carbon::now()->subDays(1),
                'updated_at' => Carbon::now()->subDays(1),
            ],
        ]);
    }
}
