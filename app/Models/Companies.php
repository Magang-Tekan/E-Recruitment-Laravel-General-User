<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Companies extends Model
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
     * Get all vacancies for the company
     */
    public function vacancies(): HasMany
    {
        return $this->hasMany(Vacancies::class);
    }

    /**
     * Get the company logo URL
     */
    public function getLogoUrl(): string
    {
        if (!$this->logo) {
            return asset('images/default-company-logo.png');
        }
        return asset('storage/' . $this->logo);
    }

    /**
     * Get formatted phone number
     */
    public function getFormattedPhone(): ?string
    {
        return $this->phone ? preg_replace('/[^0-9+]/', '', $this->phone) : null;
    }
}