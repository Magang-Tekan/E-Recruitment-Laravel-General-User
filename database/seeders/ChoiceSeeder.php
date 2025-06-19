<?php

namespace Database\Seeders;

use App\Models\Question;
use App\Models\Choice;
use App\Models\Assessment;
use Illuminate\Database\Seeder;

class ChoiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Dapatkan assessments dengan tipe multiple_choice dan questionnaire
        $assessments = Assessment::whereIn('test_type', ['multiple_choice', 'questionnaire'])->pluck('id');
        
        // Dapatkan pertanyaan yang terkait dengan assessment tersebut
        $questions = Question::whereIn('assessment_id', $assessments)->get();

        $choiceCount = 0;

        foreach ($questions as $question) {
            // Cari assessment dari pertanyaan
            $assessment = Assessment::find($question->assessment_id);
            $isMultipleChoice = $assessment && $assessment->test_type === 'multiple_choice';
            
            // Hanya proses pertanyaan yang memiliki options
            if (!empty($question->options) && is_array($question->options)) {
                // Tentukan jawaban benar secara acak untuk multiple_choice
                $correctIndex = $isMultipleChoice ? rand(0, count($question->options) - 1) : null;

                // Buat choice untuk setiap option
                foreach ($question->options as $index => $optionText) {
                    Choice::create([
                        'question_id' => $question->id,
                        'choice' => $optionText,
                        'is_correct' => ($isMultipleChoice && $index === $correctIndex)
                    ]);
                    $choiceCount++;
                }
            }
        }

        $this->command->info("Berhasil menambahkan $choiceCount pilihan jawaban untuk pertanyaan multiple choice dan questionnaire.");
    }
}