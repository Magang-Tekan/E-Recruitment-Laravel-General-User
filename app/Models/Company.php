<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo',
        'description',
        'email',
        'phone',
        'address'
    ];

    /**
     * Get the company logo URL
     */
    public function getLogoUrl()
    {
        if (!$this->logo) {
            return asset('images/default-company-logo.png');
        }
        return asset('storage/' . $this->logo);
    }
}