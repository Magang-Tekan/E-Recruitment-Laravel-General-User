<?php

namespace App\Http\Controllers;

use App\Models\CandidatesProfiles;
use App\Models\CandidatesEducations;
use App\Models\Skills;
use App\Models\CandidatesWorkExperiences;
use App\Models\CandidatesAchievements;
use App\Models\CandidatesOrganizations;
use App\Models\CandidatesSocialMedia;
use App\Models\CandidatesAdditionalData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CandidateController extends Controller
{
    public function checkApplicationDataCompleteness()
{
    $userId = Auth::id();

    $completeness = [
        'profile' => false,
        'education' => false,
        'skills' => false,
        'work_experience' => false,
        'organization' => false,
        'achievements' => false,
        'social_media' => false,
        'additional_data' => false,
        'overall_complete' => false
    ];

    // Data Pribadi
    $profile = CandidatesProfiles::where('user_id', $userId)->first();
    $completeness['profile'] = $profile && $profile->phone_number && $profile->address && $profile->date_of_birth;

    // Pendidikan
    $education = CandidatesEducations::where('user_id', $userId)->first();
    $completeness['education'] = (bool) $education;

    // Skill
    $skillsCount = Skills::where('user_id', $userId)->count();
    $completeness['skills'] = $skillsCount > 0;

    // Pengalaman Kerja
    $completeness['work_experience'] = CandidatesWorkExperiences::where('user_id', $userId)->exists();

    // Organisasi
    $completeness['organization'] = CandidatesOrganizations::where('user_id', $userId)->exists();

    // Prestasi
    $completeness['achievements'] = CandidatesAchievements::where('user_id', $userId)->exists();

    // Social Media
    $completeness['social_media'] = CandidatesSocialMedia::where('user_id', $userId)->exists();

    // Data Tambahan
    $completeness['additional_data'] = CandidatesAdditionalData::where('user_id', $userId)->exists();

    // Kelengkapan total minimal 3
    $completeness['overall_complete'] = $completeness['profile'] &&
                                        $completeness['education'] &&
                                        $completeness['skills'];

    return response()->json($completeness);
}
    public function index()
    {
        $user = Auth::user();

        return Inertia::render('candidate/candidate-dashboard', [
            'users' => $user,
        ]);
    }

    public function profile()
    {
        $user = Auth::user();
        $profile = CandidatesProfiles::where('user_id', $user->id)->first();
        
        if ($profile) {
            $profile->date_of_birth = date('Y-m-d', strtotime($profile->date_of_birth));
        }

        return Inertia::render('DataPribadiForm', [
            'profile' => $profile,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    public function storeDataPribadi(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'no_ektp' => 'required|string|max:16',
                'gender' => 'required|in:male,female',
                'phone_number' => 'required|string',
                'npwp' => 'nullable|string',
                'about_me' => 'required|string|min:200',
                'place_of_birth' => 'required|string',
                'date_of_birth' => 'required|date',
                'address' => 'required|string',
                'province' => 'required|string',
                'city' => 'required|string',
                'district' => 'required|string',
                'village' => 'required|string',
                'rt' => 'required|string',
                'rw' => 'required|string',
            ]);

            $user = Auth::user();
            
            // Update or create the profile
            $profile = CandidatesProfiles::updateOrCreate(
                ['user_id' => $user->id],
                $validated
            );

            DB::commit();

            // Return with both success message and updated profile
            return redirect()->back()->with([
                'success' => 'Data pribadi berhasil disimpan',
                'profile' => $profile
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error saving profile: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan data');
        }
    }

    public function show()
    {
        return Inertia::render('admin/candidates/candidate-list');
    }
}
