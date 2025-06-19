<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CandidatesCV extends Model
{
    use HasFactory;

    protected $table = 'candidates_cvs';

    protected $fillable = [
        'user_id',
        'cv_filename',
        'cv_path',
        'download_count',
        'last_downloaded_at',
        'cv_data_snapshot',
        'is_active',
    ];

    protected $casts = [
        'download_count' => 'integer',
        'last_downloaded_at' => 'datetime',
        'is_active' => 'boolean',
        'cv_data_snapshot' => 'array', // If storing JSON data
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the CV
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Increment download count and update last downloaded timestamp
     */
    public function recordDownload(): bool
    {
        return $this->update([
            'download_count' => $this->download_count + 1,
            'last_downloaded_at' => now(),
        ]);
    }

    /**
     * Get the storage path for the CV file
     */
    public function getStoragePath(): string
    {
        return storage_path('app/public/' . $this->cv_path);
    }

    /**
     * Get the public URL for the CV file
     */
    public function getPublicUrl(): string
    {
        return asset('storage/' . $this->cv_path);
    }
}