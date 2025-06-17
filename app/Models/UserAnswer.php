<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAnswer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'question_id',
        'choice_id'
    ];

    /**
     * Get the user that owns the answer.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the question that owns the answer.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Get the choice that the user selected.
     */
    public function choice(): BelongsTo
    {
        return $this->belongsTo(Choice::class);
    }

    /**
     * Check if the answer is correct.
     *
     * @return bool
     */
    public function isCorrect(): bool
    {
        return $this->choice && $this->choice->is_correct;
    }
    
    /**
     * Get the user's score for a specific assessment.
     *
     * @param int $userId
     * @param int $assessmentId
     * @return int
     */
    public static function getUserScore(int $userId, int $assessmentId): int
    {
        // Get all answers for this user and assessment
        $answers = static::whereHas('question', function($query) use ($assessmentId) {
            $query->where('assessment_id', $assessmentId);
        })
        ->where('user_id', $userId)
        ->with('choice')
        ->get();
        
        // Count correct answers
        $correctAnswers = $answers->filter(function($answer) {
            return $answer->isCorrect();
        })->count();
        
        return $correctAnswers;
    }
}