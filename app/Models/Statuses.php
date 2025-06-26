<?php

namespace App\Models;

use App\Enums\CandidatesStage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Statuses extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'code',
        'description',
        'stage',
        'is_active'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'stage' => CandidatesStage::class,
        'is_active' => 'boolean',
    ];

    /**
     * Get the applications associated with this status.
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Applications::class, 'status_id');
    }

    /**
     * Get application histories for this status.
     */
    public function applicationHistories(): HasMany
    {
        return $this->hasMany(ApplicationHistory::class, 'status_id');
    }

    /**
     * Scope a query to only include active statuses.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by stage.
     */
    public function scopeByStage($query, CandidatesStage $stage)
    {
        return $query->where('stage', $stage);
    }
}
