<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Applications extends Model
{
    protected $fillable = [
        'user_id',
        'vacancy_period_id',
        'resume_path',
        'cover_letter_path',
        'status_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vacancyPeriod(): BelongsTo
    {
        return $this->belongsTo(VacancyPeriods::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class);
    }
}
