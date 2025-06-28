<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Applications extends Model
{
    protected $fillable = [
        'user_id',
        'vacancy_period_id', // Perbaiki nama field sesuai database
        'status_id',
        'resume_path',
        'cover_letter_path'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vacancyPeriod(): BelongsTo
    {
        return $this->belongsTo(VacancyPeriods::class, 'vacancy_period_id');
    }

    public function vacancy()
    {
        // Relasi melalui vacancyPeriod - gunakan method ini untuk mendapatkan vacancy
        return $this->vacancyPeriod()->with('vacancy');
    }

    // Method helper untuk mendapatkan vacancy secara langsung
    public function getVacancyAttribute()
    {
        return $this->vacancyPeriod ? $this->vacancyPeriod->vacancy : null;
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Statuses::class, 'status_id');
    }

    public function applicationHistory(): HasMany
    {
        return $this->hasMany(ApplicationHistory::class, 'application_id');
    }
}
