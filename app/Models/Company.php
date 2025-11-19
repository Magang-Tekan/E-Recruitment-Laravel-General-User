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
        'address',
        'website',
        'featured',
        'display_order'
    ];

    /**
     * Get the company logo URL
     * Format: https://admin.rekruitmen.tekna.id/storage/company-logos/${filename}
     */
    public function getLogoUrl()
    {
        if (!$this->logo) {
            return asset('images/default-company-logo.png');
        }
        
        // Extract filename from path (e.g., 'companies/mitra-logo.png' -> 'mitra-logo.png')
        $filename = basename($this->logo);
        
        // Get domain - using hardcoded domain for now
        $domain = "https://admin.rekruitmen.tekna.id";
        
        // Return absolute URL in format: https://admin.rekruitmen.tekna.id/storage/company-logos/${filename}
        return $domain . '/storage/company-logos/' . $filename;
    }
}