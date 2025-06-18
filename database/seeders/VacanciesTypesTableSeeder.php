<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VacanciesTypesTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('vacancies_types')->delete();

        DB::table('vacancies_types')->insert([
            [
                'id' => 1,
                'name' => 'Full Time',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 2,
                'name' => 'Internship',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
