<?php

namespace App\Http\Controllers;

use App\Models\QuestionPacks;
use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AssessmentController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'test_type' => 'required|string|in:multiple_choice,essay,technical',
                'duration' => 'required|string|regex:/^\d+:[0-5][0-9]$/', // Format: H:MM
                'questions' => 'required|array|min:1',
                'questions.*.question' => 'required|string|min:5',
                'questions.*.options' => 'required|array|min:2',
                'questions.*.options.*' => 'nullable|string|distinct',
                'questions.*.correct_answer' => 'nullable|integer',
            ]);

            DB::beginTransaction();

            $questionPack = QuestionPacks::create([
                'pack_name' => $validated['title'],
                'description' => $validated['description'],
                'test_type' => $validated['test_type'],
                'duration' => $validated['duration'],
                'user_id' => auth()->id(),
                'status' => 'active',
            ]);

            foreach ($validated['questions'] as $questionData) {
                $options = array_values(array_filter($questionData['options']));

                if (count($options) >= 2) {
                    $questionAttributes = [
                        'question_text' => $questionData['question'],
                        'question_type' => 'multiple_choice',
                        'options' => $options,
                    ];

                    if (isset($questionData['correct_answer'])) {
                        $questionAttributes['correct_answer'] = $questionData['correct_answer'];
                    }

                    $question = Question::create($questionAttributes);

                    // Attach the question to the question pack
                    $questionPack->questions()->attach($question->id);
                }
            }

            DB::commit();

            return redirect()->route('admin.questions.info')
                ->with('success', 'Question Pack created successfully with '.count($validated['questions']).' questions');
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();

            return redirect()->back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating question pack: '.$e->getMessage());

            return redirect()->back()->withInput()
                ->with('error', 'Failed to save question pack: '.$e->getMessage());
        }
    }
}
