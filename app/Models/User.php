<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Models\Applications;
use App\Models\CandidatesEducations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = ['no_ektp', 'name', 'email', 'password', 'role'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = ['password', 'remember_token'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'password' => 'hashed', 'role' => UserRole::class];
    }

    public function candidate()
    {
        return $this->hasMany(Applications::class, 'user_id');
    }

    public function isProfileComplete()
    {
        // Periksa data pribadi
        if (empty($this->name) ||
            empty($this->email) ||
            empty($this->phone_number) ||
            empty($this->address)) {
            return false;
        }

        // Periksa data pendidikan
        $education = CandidatesEducations::where('user_id', $this->id)->first();
        if (!$education ||
            empty($education->institution) ||
            empty($education->major_id) ||
            empty($education->year_graduated)) {
            return false;
        }

        // Periksa data lainnya jika ada
        // Contoh: apakah CV sudah diupload?
        $hasCV = Storage::disk('public')->exists('cv/'.$this->id.'.pdf');
        if (!$hasCV) {
            return false;
        }

        return true;
    }
}
