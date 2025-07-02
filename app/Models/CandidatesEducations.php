<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CandidatesEducations extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'user_id',
        'education_level_id', // Ubah dari education_level menjadi education_level_id
        'faculty',
        'major_id',
        'institution_name',
        'gpa',
        'year_in',
        'year_out'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function major()
    {
        return $this->belongsTo(MasterMajor::class, 'major_id');
    }
    
    public function educationLevel()
    {
        // Ubah relasi menggunakan id
        return $this->belongsTo(EducationLevel::class, 'education_level_id');
    }
}
