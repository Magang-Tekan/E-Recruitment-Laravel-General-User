<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class ApplicationHistorySeeder extends Seeder
{
    public function run(): void
    {
        // Get necessary data
        $applications = DB::table('applications')->take(2)->get();
        $selections = DB::table('selection')->get();

        // Ganti referensi assessments menjadi question_packs
        $questionPacks = DB::table('question_packs')->get();

        $interviews = [];
        if (Schema::hasTable('interviews')) {
            $interviews = DB::table('interviews')->get();
        }

        $users = DB::table('users')->where('role', 'hr')->orWhere('role', 'Admin')->get();

        // Check if we have the required data
        if ($applications->count() < 2 || $selections->count() < 1 ||
            $questionPacks->count() < 1 || $users->count() < 1) {
            echo "Data tidak cukup untuk seeding application history.\n";
            echo "Applications: " . $applications->count() . " (need 2)\n";
            echo "Selections: " . $selections->count() . " (need 1)\n";
            echo "Question Packs: " . $questionPacks->count() . " (need 1)\n";

            if (!empty($interviews)) {
                echo "Interviews: " . count($interviews) . " (need 1)\n";
            }

            echo "Users (HR/Admin): " . $users->count() . " (need 1)\n";
            return;
        }

        // Find selection IDs by name
        $administrationId = $selections->where('name', 'Administrasi')->first()->id ?? 1;
        $psikotestId = $selections->where('name', 'Psikotest')->first()->id ?? 2;
        $wawancaraId = $selections->where('name', 'Wawancara')->first()->id ?? 3;

        // Reviewer ID (HR personnel)
        $reviewerId = $users->first()->id ?? 1;

        // Application 1: Failed at psikotest stage
        DB::table('application_history')->insert([
            // Administration stage (completed & qualified)
            [
                'application_id' => $applications[0]->id,
                'selection_id' => $administrationId,
                // Ganti kolom assessments_id dengan question_pack_id (jika ada)
                'question_pack_id' => null, // Tidak menggunakan question pack pada tahap administrasi
                'interviews_id' => null,
                'reviewed_by' => $reviewerId,
                'is_qualified' => true,
                'created_at' => Carbon::now()->subDays(10),
                'updated_at' => Carbon::now()->subDays(8),
            ],
            // Psikotest stage (completed & not qualified)
            [
                'application_id' => $applications[0]->id,
                'selection_id' => $psikotestId,
                // Ganti dengan question_pack_id
                'question_pack_id' => $questionPacks->first()->id,
                'interviews_id' => null,
                'reviewed_by' => $reviewerId,
                'is_qualified' => false,
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(6),
            ]
        ]);

        // Application 2: Still in administration stage
        DB::table('application_history')->insert([
            [
                'application_id' => $applications[1]->id,
                'selection_id' => $administrationId,
                // Ganti dengan question_pack_id
                'question_pack_id' => null,
                'interviews_id' => null,
                'reviewed_by' => null, // not yet reviewed
                'is_qualified' => null, // pending review
                'created_at' => Carbon::now()->subDays(3),
                'updated_at' => Carbon::now()->subDays(3),
            ]
        ]);

        echo "Berhasil menambahkan data riwayat aplikasi.\n";
    }
}
