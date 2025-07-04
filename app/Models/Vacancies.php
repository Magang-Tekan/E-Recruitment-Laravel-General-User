<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vacancies extends Model
{
    use HasFactory;

    // Explicitly set the table name to ensure consistency
    protected $table = 'vacancies';

    protected $fillable = [
        'user_id',
        'company_id',
        'title',
        'job_description',
        'department_id',
        'major_id',
        'vacancy_type_id',
        'location',
        'salary',
        'requirements',
        'benefits',
        'question_pack_id',
        'education_level_id' // Tambahan sesuai migrasi
    ];

    protected $casts = [
        'requirements' => 'array',
        'benefits' => 'array',
    ];

    /**
     * Get the user who created this vacancy.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the company associated with this vacancy.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the department associated with this vacancy.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id'); // Sesuai dengan migrasi
    }

    /**
     * Get the major associated with this vacancy.
     */
    public function major(): BelongsTo
    {
        return $this->belongsTo(MasterMajor::class, 'major_id');
    }

    /**
     * Get the vacancy type associated with this vacancy.
     */
    public function vacancyType(): BelongsTo
    {
        return $this->belongsTo(VacancyType::class, 'vacancy_type_id');
    }

    /**
     * Get the question pack associated with this vacancy.
     */
    public function questionPack(): BelongsTo
    {
        return $this->belongsTo(QuestionPack::class, 'question_pack_id');
    }

    /**
     * Get the education level associated with this vacancy.
     */
    public function educationLevel(): BelongsTo
    {
        return $this->belongsTo(EducationLevel::class, 'education_level_id');
    }

    /**
     * Get the applications for this vacancy.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Applications::class, 'vacancy_id');
    }

    /**
     * The periods that belong to the vacancy.
     */
    public function periods(): BelongsToMany
    {
        return $this->belongsToMany(Periods::class, 'vacancy_periods', 'vacancy_id', 'period_id')
                    ->withTimestamps();
    }
}
