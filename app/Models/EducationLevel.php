<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EducationLevel extends Model
{
    use HasFactory;

    protected $table = 'education_levels';
    
    protected $fillable = [
        'name',
    ];

    /**
     * Get the candidate educations associated with this education level
     */
    public function candidateEducations()
    {
        // Relasi menggunakan id
        return $this->hasMany(CandidatesEducations::class, 'education_level_id');
    }
}