<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model  // Changed from Departement to Department
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function vacancies()
    {
        return $this->hasMany(Vacancies::class, 'department_id');
    }
}