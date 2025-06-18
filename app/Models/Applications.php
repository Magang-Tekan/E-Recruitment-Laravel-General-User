<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Applications extends Model
{
    protected $fillable = [
        'user_id',
        'vacancies_period_id',
        'resume_path',
        'cover_letter_path',
    ];

    /**
     * Relasi ke user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke lowongan
     */
    public function vacancyPeriod()
    {
        return $this->belongsTo(VacanciesPeriods::class, 'vacancies_period_id');
    }

    /**
     * Relasi ke lowongan (alias)
     */
    public function job()
    {
        return $this->belongsTo(Vacancies::class, 'vacancies_id');
    }

    /**
     * Relasi ke riwayat aplikasi - untuk mendapatkan informasi seleksi
     */
    public function history()
    {
        return $this->hasMany(ApplicationsHistory::class, 'application_id');
    }

    /**
     * Method untuk mendapatkan seleksi terbaru
     */
    public function currentSelection()
    {
        return $this->history()->latest()->first()?->selection;
    }
}
