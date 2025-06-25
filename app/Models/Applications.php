<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Applications extends Model
{
    protected $fillable = [
        'user_id',
        'vacancies_id', // Tambahkan field ini jika belum ada
        'vacancies_period_id',
        'status_id', // Changed from selection_id to status_id
        'resume_path',
        'cover_letter_path'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vacancyPeriod(): BelongsTo
    {
        return $this->belongsTo(VacancyPeriods::class);
    }

    public function vacancy(): BelongsTo
    {
        return $this->belongsTo(Vacancies::class, 'vacancies_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Statuses::class, 'status_id');
    }
}
