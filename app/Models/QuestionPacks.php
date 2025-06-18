<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class QuestionPacks extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'pack_name',
        'description',
        'test_type',
        'duration',
        'user_id',
        'status'
    ];

    /**
     * Get the user that created the question pack.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the questions that belong to this question pack.
     */
    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(Question::class, 'pack_question')
                    ->withTimestamps();
    }

    /**
     * Scope a query to only include active question packs.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
