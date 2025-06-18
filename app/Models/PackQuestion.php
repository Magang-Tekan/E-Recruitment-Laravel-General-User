<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackQuestion extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'pack_question';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'question_pack_id',
        'question_id',
    ];

    /**
     * Get the question pack that owns the relationship.
     */
    public function questionPack(): BelongsTo
    {
        return $this->belongsTo(QuestionPacks::class);
    }

    /**
     * Get the question that belongs to the relationship.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
