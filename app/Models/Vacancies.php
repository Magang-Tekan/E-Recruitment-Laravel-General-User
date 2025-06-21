<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vacancies extends Model
{
    use HasFactory;
    
    // Explicitly set the table name to ensure consistency
    protected $table = 'vacancies';
    
    protected $fillable = [
        'user_id',
        'company_id',
        'title',
        'department_id',
        'major_id',
        'vacancy_type_id',
        'location',
        'salary',
        'requirements',
        'benefits',
        'question_pack_id'
    ];
    
    protected $casts = [
        'requirements' => 'array',
        'benefits' => 'array',
    ];
    
    /**
     * Get the periods associated with this vacancy.
     */
    public function periods()
    {
        return $this->belongsToMany(Periods::class, 'vacancy_periods', 'vacancy_id', 'period_id')
                    ->withTimestamps();
    }

    /**
     * Get the company associated with this vacancy.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }
    
    /**
     * Get the question pack associated with this vacancy.
     */
    public function questionPack()
    {
        return $this->belongsTo(QuestionPack::class);
    }
    
    /**
     * Get the applicants associated with this vacancy through the vacancy_period table.
     */
    public function applicants()
    {
        return $this->hasManyThrough(
            Applicant::class,
            VacancyPeriods::class,
            'vacancy_id', // Foreign key on vacancy_periods table
            'vacancy_period_id', // Foreign key on applicants table
            'id', // Local key on vacancies table
            'id' // Local key on vacancy_periods table
        );
    }

    /**
     * Get the user who created this vacancy.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Get the department associated with this vacancy.
     */
    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
    
    /**
     * Get the major associated with this vacancy.
     */
    public function major()
    {
        return $this->belongsTo(MasterMajor::class, 'major_id');
    }
    
    /**
     * Get the vacancy type associated with this vacancy.
     */
    public function vacancyType()
    {
        return $this->belongsTo(VacancyType::class, 'vacancy_type_id');
    }
    
    /**
     * Get the active end time from periods
     */
    public function getActiveEndTimeAttribute()
    {
        $periodWithEndTime = $this->periods()
            ->orderBy('end_time', 'desc')  // Changed to match migration column name
            ->first();

        return $periodWithEndTime ? $periodWithEndTime->end_time : null;  // Changed to match migration column name
    }

    /**
     * Check if the vacancy is expired
     */
    public function isExpired()
    {
        $endTime = $this->getActiveEndTimeAttribute();
        return $endTime ? now()->gt($endTime) : true;
    }
}