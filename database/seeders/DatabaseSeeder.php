<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Core data - hapus DatabaseSeeder dari sini
            UserSeeder::class,
            SuperAdminSeeder::class,
            
            // Company related
            CompaniesSeeder::class,
            DepartmentsSeeder::class,
            ContactsSeeder::class,
            
            // Vacancy related
            VacanciesTypesSeeder::class,
            VacanciesSeeder::class,
            PeriodsSeeder::class,
           
            
            
            // Candidate related
            CandidatesAchievementsSeeder::class,
            CandidatesEducationSeeder::class,
            CandidatesOrganizationsSeeder::class,
            CandidatesProfilesSeeder::class,
            CandidatesSocialMediaSeeder::class,
            CandidatesWorkExperiencesSeeder::class,
            
            // Application related
            ApplicationsSeeder::class,
            ApplicationHistorySeeder::class,
            
            // Question related
            QuestionPackSeeder::class,
            QuestionSeeder::class,
            
            // Master data
            MasterMajorSeeder::class,
        ]);
    }
}
