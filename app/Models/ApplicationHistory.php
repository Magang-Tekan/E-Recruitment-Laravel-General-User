<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\CandidatesStage;

class ApplicationHistory extends Model
{
    protected $table = 'application_history';

    protected $fillable = [
        'application_id',
        'stage',
        'processed_at',
        'admin_score',
        'admin_notes',
        'admin_reviewed_at',
        'admin_reviewed_by',
        'test_score',
        'test_notes',
        'test_scheduled_at',
        'test_completed_at',
        'interview_score',
        'interview_notes',
        'interview_scheduled_at',
        'interview_completed_at',
        'interviewer_id',
        'is_qualified',
        'rejection_reason',
        'reviewed_by',
        'decision_made_at',
        'decision_made_by'
    ];

    protected $casts = [
        'stage' => CandidatesStage::class,
        'processed_at' => 'datetime',
        'admin_reviewed_at' => 'datetime',
        'test_scheduled_at' => 'datetime',
        'test_completed_at' => 'datetime',
        'interview_scheduled_at' => 'datetime',
        'interview_completed_at' => 'datetime',
        'decision_made_at' => 'datetime',
        'is_qualified' => 'boolean',
        'admin_score' => 'decimal:2',
        'test_score' => 'decimal:2',
        'interview_score' => 'decimal:2'
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Applications::class);
    }

    public function adminReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_reviewed_by');
    }

    public function interviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'interviewer_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function decisionMaker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decision_made_by');
    }
}