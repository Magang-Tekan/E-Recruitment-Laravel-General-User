<?php
namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\ApplicationHistory;
use App\Models\Candidate;
use App\Models\CandidatesProfiles;
use App\Models\CandidatesEducations;
use App\Models\CandidatesWorkExperiences;
use App\Models\UserWorkExperiences;
use App\Models\WorkExperience;
use App\Models\CandidatesOrganizations;
use App\Models\CandidatesAchievements;
use App\Models\CandidatesSocialMedia;
use App\Models\CandidatesSkills;
use App\Models\CandidatesCourses;
use App\Models\CandidatesCertifications;
use App\Models\CandidatesLanguages;
use App\Models\CandidateCV;
use Illuminate\Http\Request; // Tambahkan import ini
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use App\Models\Applications; 
use App\Models\Job;
use App\Models\Statuses;
use App\Enums\CandidatesStage;
use App\Models\Assessment;
use App\Models\Question;
use App\Models\UserAnswer;

class CandidateController extends Controller
{
    public function checkApplicationDataCompleteness()
{
    try {
        $userId = Auth::id();
        
        // Debug log untuk memastikan pengecekan berjalan
        \Log::info('Checking application data completeness for user:', ['user_id' => $userId]);

        // Koleksi data untuk pengecekan
        $profile = CandidatesProfiles::where('user_id', $userId)->first();
        $education = CandidatesEducations::where('user_id', $userId)->first();
        $skills = CandidatesSkills::where('user_id', $userId)->get();

        \Log::info('Found profile data:', ['exists' => (bool)$profile]);
        \Log::info('Found education data:', ['exists' => (bool)$education]);
        \Log::info('Found skills count:', ['count' => $skills->count()]);

        $completeness = [
            'profile' => false,
            'education' => false,
            'skills' => false,
            'work_experience' => false,
            'organization' => false,
            'achievements' => false,
            'social_media' => false,
            'additional_data' => true
        ];

        // Gunakan logika yang konsisten dengan checkDataCompleteness
        // Check Profile Data
        $completeness['profile'] = $profile && 
            !empty($profile->phone_number) && 
            !empty($profile->address) && 
            !empty($profile->date_of_birth);

        // Check Education - cukup ada data pendidikan
        $completeness['education'] = (bool)$education;

        // Check Skills - minimal 1 skill
        $completeness['skills'] = $skills->count() > 0;

        // Optional checks
        $completeness['work_experience'] = CandidatesWorkExperiences::where('user_id', $userId)->exists();
        $completeness['organization'] = CandidatesOrganizations::where('user_id', $userId)->exists();
        $completeness['achievements'] = CandidatesAchievements::where('user_id', $userId)->exists();
        $completeness['social_media'] = CandidatesSocialMedia::where('user_id', $userId)->exists();

        // Overall completeness berdasarkan data wajib saja
        $completeness['overall_complete'] = 
            $completeness['profile'] && 
            $completeness['education'] && 
            $completeness['skills'];

        \Log::info('Final completeness status:', $completeness);

        return response()->json([
            'success' => true,
            'completeness' => $completeness
        ]);

    } catch (\Exception $e) {
        \Log::error('Error checking application completeness:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Error checking completeness: ' . $e->getMessage()
        ], 500);
    }
}
    public function index()
    {
        $user = Auth::user();
        $education = CandidatesEducations::where('user_id', $user->id)->first();

        // Definisikan array gender secara langsung sesuai dengan yang ada di model CandidatesProfiles
        $genders = [
            ['value' => 'male', 'label' => 'Pria'],
            ['value' => 'female', 'label' => 'Wanita']
        ];

        return Inertia::render('PersonalData', [
            'education' => $education,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            // Gunakan array gender langsung tanpa mapping
            'genders' => $genders
        ]);
    }

    /**
     * Display the profile page.
     */
    public function profile()
    {
        $user = Auth::user();
        $profile = CandidatesProfiles::where('user_id', $user->id)->first();
        $education = CandidatesEducations::where('user_id', $user->id)->first();

        // Format profile data jika ada
        $profileData = $profile ? $profile->toArray() : null;

        // Log data untuk debugging
        \Log::info('Profile data being sent to frontend:', ['profile' => $profileData]);

        return Inertia::render('PersonalData', [
            'profile' => $profileData,
            'education' => $education,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'genders' => [
                ['value' => 'Pria', 'label' => 'Pria'],
                ['value' => 'Wanita', 'label' => 'Perempuan']
            ]
        ]);
    }

    public function storeDataPribadi(Request $request)
    {
        try {
            $validated = $request->validate([
                'no_ektp' => 'required|string|max:16',
                'gender' => 'required|in:male,female',
                'phone_number' => 'required|string',
                'npwp' => 'nullable|string',
                'about_me' => 'required|string',
                'place_of_birth' => 'required|string',
                'date_of_birth' => 'required|date',
                'address' => 'required|string',
                'province' => 'required|string',
                'city' => 'required|string',
                'district' => 'required|string',
                'village' => 'required|string',
                'rt' => 'required|string',
                'rw' => 'required|string',
            ], [
                'no_ektp.required' => 'No. E-KTP harus diisi',
                'no_ektp.max' => 'No. E-KTP maksimal 16 karakter',
                'gender.required' => 'Gender harus dipilih',
                'gender.in' => 'Gender tidak valid',
                'phone_number.required' => 'No. telepon harus diisi',
                'about_me.required' => 'Tentang saya harus diisi',
                'place_of_birth.required' => 'Tempat lahir harus diisi',
                'date_of_birth.required' => 'Tanggal lahir harus diisi',
                'address.required' => 'Alamat harus diisi',
                'province.required' => 'Provinsi harus diisi',
                'city.required' => 'Kota harus diisi',
                'district.required' => 'Kecamatan harus diisi',
                'village.required' => 'Kelurahan/Desa harus diisi',
                'rt.required' => 'RT harus diisi',
                'rw.required' => 'RW harus diisi',
            ]);

            $result = CandidatesProfiles::updateOrCreate(
                ['user_id' => Auth::id()],
                $validated
            );

            // Return JSON response for AJAX requests
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Data berhasil disimpan!',
                    'data' => $result
                ]);
            }

            // Return redirect for non-AJAX requests
            return back()->with('flash', [
                'type' => 'success',
                'message' => 'Data berhasil disimpan!'
            ]);

        } catch (ValidationException $e) {
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $e->errors()
                ], 422);
            }

            return back()->withErrors($e->errors());

        } catch (\Exception $e) {
            \Log::error('Error saving profile data: ' . $e->getMessage());

            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat menyimpan data'
                ], 500);
            }

            return back()->with('flash', [
                'type' => 'error',
                'message' => 'Terjadi kesalahan saat menyimpan data'
            ]);
        }
    }

    public function show()
    {
        return Inertia::render('admin/candidates/candidate-list');
    }

    public function showEducationForm()
    {
        $user = Auth::user();
        $education = CandidatesEducations::where('user_id', $user->id)->first();

        return Inertia::render('DataPribadiForm', [
            'profile' => [
                'education' => $education
            ],
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    public function education()
    {
        $education = CandidatesEducations::where('user_id', Auth::id())->first();

        return Inertia::render('Education/Form', [
            'education' => $education
        ]);
    }

    public function storeEducation(Request $request)
    {
        try {
            \Log::info('Storing education data. Request:', $request->all());

            $validated = $request->validate([
                'education_level' => 'required|string',
                'faculty' => 'required|string',
                'major_id' => 'required|exists:master_majors,id',
                'institution_name' => 'required|string',
                'gpa' => 'required|numeric|between:0,4',
                'year_in' => 'required|integer',
                'year_out' => 'nullable|integer'
            ]);

            \Log::info('Validated data:', $validated);

            // Ubah dari updateOrCreate menjadi create
            $education = CandidatesEducations::create([
                'user_id' => Auth::id(),
                ...$validated
            ]);

            // Get fresh data with major
            $education->refresh();
            $major = \App\Models\MasterMajor::find($education->major_id);

            $responseData = [
                'id' => $education->id,
                'education_level' => $education->education_level,
                'faculty' => $education->faculty,
                'major_id' => (string)$education->major_id,
                'major' => $major ? $major->name : null,
                'institution_name' => $education->institution_name,
                'gpa' => $education->gpa,
                'year_in' => $education->year_in,
                'year_out' => $education->year_out
            ];

            \Log::info('Education stored successfully:', $responseData);

            return response()->json([
                'success' => true,
                'message' => 'Data pendidikan berhasil disimpan',
                'data' => $responseData
            ]);

        } catch (\Exception $e) {
            \Log::error('Error storing education data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error storing education data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getEducation()
    {
        try {
            \Log::info('Getting education data for user: ' . Auth::id());

            $education = CandidatesEducations::where('user_id', Auth::id())->first();

            if (!$education) {
                \Log::info('No education data found');
                return response()->json(null);
            }

            // Get major data
            $major = \App\Models\MasterMajor::find($education->major_id);

            $educationData = [
                'id' => $education->id,
                'education_level' => $education->education_level,
                'faculty' => $education->faculty,
                'major_id' => (string)$education->major_id,
                'major' => $major ? $major->name : null,
                'institution_name' => $education->institution_name,
                'gpa' => $education->gpa,
                'year_in' => $education->year_in,
                'year_out' => $education->year_out
            ];

            \Log::info('Education data retrieved:', $educationData);

            return response()->json($educationData);

        } catch (\Exception $e) {
            \Log::error('Error getting education data: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error getting education data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllWorkExperiences()
    {
        $experiences = CandidatesWorkExperiences::where('user_id', Auth::id())->get();
        return response()->json($experiences);
    }

    public function getWorkExperiences()
    {
        $userId = Auth::id();
        $workExperiences = CandidatesWorkExperiences::where('user_id', $userId)->get();

        return response()->json($workExperiences);
    }

    public function indexWorkExperiences()
    {
        $workExperiences = CandidatesWorkExperiences::where('user_id', Auth::id())->get();
        return response()->json($workExperiences);
    }

    public function showWorkExperience($id)
    {
        $workExperience = CandidatesWorkExperiences::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return response()->json($workExperience);
    }

    public function storeWorkExperience(Request $request)
    {
        $validated = $request->validate([
            'job_title' => 'required|string|max:255',
            'employment_status' => 'required|string|max:255',
            'job_description' => 'required|string|min:10', // Ubah dari 100 menjadi 10
            'is_current_job' => 'required|boolean',
            'start_month' => 'required|integer|min:1|max:12',
            'start_year' => 'required|integer|min:1900|max:' . date('Y'),
            'end_month' => 'nullable|integer|min:1|max:12',
            'end_year' => 'nullable|integer|min:1900|max:' . date('Y'),
        ]);

        $validated['user_id'] = Auth::id();

        $workExperience = CandidatesWorkExperiences::create($validated);

        return response()->json([
            'message' => 'Data berhasil disimpan!',
            'data' => $workExperience,
        ], 201);
    }

    public function updateWorkExperience(Request $request, $id)
    {
        $workExperience = CandidatesWorkExperiences::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'job_title' => 'required|string|max:255',
            'employment_status' => 'required|string|max:255',
            'job_description' => 'required|string|min:10', // Ubah dari 100 menjadi 10
            'is_current_job' => 'required|boolean',
            'start_month' => 'required|integer|min:1|max:12',
            'start_year' => 'required|integer|min:1900|max:' . date('Y'),
            'end_month' => 'nullable|integer|min:1|max:12',
            'end_year' => 'nullable|integer|min:1900|max:' . date('Y'),
        ]);

        $workExperience->update($validated);

        return response()->json([
            'message' => 'Data berhasil diperbarui!',
            'data' => $workExperience,
        ], 200);
    }

    public function deleteWorkExperience($id)
    {
        $workExperience = CandidatesWorkExperiences::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $workExperience->delete();

        return response()->json([
            'message' => 'Data berhasil dihapus!',
        ]);
    }

    public function getWorkExperience($id)
    {
        $experience = CandidatesWorkExperiences::where('id', $id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        return response()->json($experience);
    }

    public function editWorkExperience($id)
    {
        $workExperience = CandidatesWorkExperiences::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('EditPengalamanKerjaForm', [
            'experienceData' => $workExperience,
        ]);
    }

    public function indexOrganizations()
    {
        $organizations = CandidatesOrganizations::where('user_id', Auth::id())->get();
        return response()->json($organizations);
    }

    public function storeOrganization(Request $request)
    {
        try {
            $validated = $request->validate([
                'organization_name' => 'required|string|max:255',
                'position' => 'required|string|max:255',
                'description' => 'required|string|min:10',
                'is_active' => 'required|boolean',
                'start_month' => 'required|string',
                'start_year' => 'required|integer|min:1900|max:' . date('Y'),
                'end_month' => 'nullable|required_if:is_active,false|string',
                'end_year' => 'nullable|required_if:is_active,false|integer|min:1900|max:' . date('Y'),
            ], [
                'organization_name.required' => 'Nama organisasi harus diisi',
                'position.required' => 'Posisi harus diisi',
                'description.required' => 'Deskripsi harus diisi',
                'description.min' => 'Deskripsi minimal 10 karakter',
                'start_month.required' => 'Bulan masuk harus dipilih',
                'start_year.required' => 'Tahun masuk harus diisi',
                'end_month.required_if' => 'Bulan keluar harus dipilih jika tidak aktif',
                'end_year.required_if' => 'Tahun keluar harus dipilih jika tidak aktif',
            ]);

            $validated['user_id'] = Auth::id();

            $organization = CandidatesOrganizations::create($validated);

            return response()->json([
                'message' => 'Data berhasil disimpan!',
                'data' => $organization
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error saving organization: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateOrganization(Request $request, $id)
    {
        $organization = CandidatesOrganizations::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'organization_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'description' => 'required|string|min:10',
            'is_active' => 'required|boolean',
            'start_year' => 'required|integer|min:1900|max:' . date('Y'),
            'end_year' => 'nullable|integer|min:1900|max:' . date('Y'),
        ]);

        $organization->update($validated);

        return response()->json([
            'message' => 'Data berhasil diperbarui!',
            'data' => $organization,
        ], 200);
    }

    public function deleteOrganization($id)
    {
        try {
            $organization = CandidatesOrganizations::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $organization->delete();

            return response()->json([
                'success' => true,
                'message' => 'Organisasi berhasil dihapus!'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting organization: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus organisasi'
            ], 500);
        }
    }

    public function storeAchievement(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'level' => 'required|string|in:Internasional,Nasional,Regional,Lokal',
                'month' => 'required|string|in:Januari,Februari,Maret,April,Mei,Juni,Juli,Agustus,September,Oktober,November,Desember',
                'year' => 'required|string',
                'description' => 'required|string|min:10',
                'certificate_file' => 'required|file|mimes:pdf,jpg,jpeg,doc,docx|max:500',
                'supporting_file' => 'nullable|file|mimes:pdf,jpg,jpeg,doc,docx|max:500',
            ], [
                'title.required' => 'Nama kompetisi harus diisi',
                'title.max' => 'Nama kompetisi maksimal 255 karakter',
                'level.required' => 'Skala kompetisi harus dipilih',
                'level.in' => 'Skala kompetisi tidak valid',
                'month.required' => 'Bulan harus dipilih',
                'month.in' => 'Bulan tidak valid',
                'year.required' => 'Tahun harus dipilih',
                'description.required' => 'Deskripsi harus diisi',
                'description.min' => 'Deskripsi minimal 10 karakter',
                'certificate_file.required' => 'File sertifikat harus diupload',
                'certificate_file.mimes' => 'Format file sertifikat harus pdf, jpg, jpeg, doc, atau docx',
                'certificate_file.max' => 'Ukuran file sertifikat maksimal 500KB',
                'supporting_file.mimes' => 'Format file pendukung harus pdf, jpg, jpeg, doc, atau docx',
                'supporting_file.max' => 'Ukuran file pendukung maksimal 500KB',
            ]);

            // Store the files
            if ($request->hasFile('certificate_file')) {
                $certificatePath = $request->file('certificate_file')->store('achievements', 'public');
                $validated['certificate_file'] = $certificatePath;
            }

            if ($request->hasFile('supporting_file')) {
                $supportingPath = $request->file('supporting_file')->store('achievements', 'public');
                $validated['supporting_file'] = $supportingPath;
            }

            $achievement = CandidatesAchievements::create([
                'user_id' => auth()->id(),
                'title' => $validated['title'],
                'level' => $validated['level'],
                'month' => $validated['month'],
                'year' => $validated['year'],
                'description' => $validated['description'],
                'certificate_file' => $validated['certificate_file'] ?? null,
                'supporting_file' => $validated['supporting_file'] ?? null,
            ]);

            return response()->json([
                'message' => 'Data berhasil disimpan!',
                'data' => $achievement
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error saving achievement: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyimpan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateAchievement(Request $request, $id)
    {
        try {
            $achievement = CandidatesAchievements::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'level' => 'required|string|in:Internasional,Nasional,Regional,Lokal',
                'month' => 'required|string',
                'year' => 'required|string',
                'description' => 'required|string|min:10',
                'certificate_file' => 'nullable|file|mimes:pdf,jpg,jpeg,doc,docx|max:500',
                'supporting_file' => 'nullable|file|mimes:pdf,jpg,jpeg,doc,docx|max:500',
            ]);

            if ($request->hasFile('certificate_file')) {
                // Delete old file
                if ($achievement->certificate_file) {
                    Storage::disk('public')->delete($achievement->certificate_file);
                }
                $certificatePath = $request->file('certificate_file')->store('achievements', 'public');
                $validated['certificate_file'] = $certificatePath;
            }

            if ($request->hasFile('supporting_file')) {
                // Delete old file
                if ($achievement->supporting_file) {
                    Storage::disk('public')->delete($achievement->supporting_file);
                }
                $supportingPath = $request->file('supporting_file')->store('achievements', 'public');
                $validated['supporting_file'] = $supportingPath;
            }

            $achievement->update($validated);

            return response()->json([
                'message' => 'Data berhasil diperbarui!',
                'data' => $achievement
            ]);

        } catch (\Exception $e) {
            \Log::error('Error updating achievement: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan saat memperbarui data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function indexAchievements()
    {
        try {
            $achievements = CandidatesAchievements::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $achievements
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching achievements: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengambil data prestasi'
            ], 500);
        }
    }

    public function showAchievement($id)
    {
        try {
            $achievement = CandidatesAchievements::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            return response()->json([
                'status' => 'success',
                'data' => $achievement
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak ditemukan'
            ], 404);
        }
    }

    public function indexSocialMedia()
    {
        $socialMedia = CandidatesSocialMedia::where('user_id', auth()->id())->get();

        return response()->json([
            'status' => 'success',
            'data' => $socialMedia
        ]);
    }

    public function storeSocialMedia(Request $request)
    {
        $validated = $request->validate([
            'platform_name' => 'required|string',
            'url' => 'required|url'
        ]);

        $validated['user_id'] = auth()->id();

        CandidatesSocialMedia::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Social media berhasil ditambahkan'
        ]);
    }

    public function updateSocialMedia(Request $request, $id)
    {
        $validated = $request->validate([
            'platform_name' => 'required|string',
            'url' => 'required|url'
        ]);

        $socialMedia = CandidatesSocialMedia::where('id', $id)->where('user_id', auth()->id())->firstOrFail();
        $socialMedia->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Social media berhasil diperbarui'
        ]);
    }

    public function deleteSocialMedia($id)
    {
        try {
            // Cari data social media berdasarkan ID dan user_id (untuk keamanan)
            $socialMedia = CandidatesSocialMedia::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $socialMedia->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Social media berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting social media: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus social media'
            ], 500);
        }
    }



    public function checkDataCompleteness()
    {
        try {
            $userId = Auth::id();
            
            $completeness = [
                'profile' => false,
                'education' => false,
                'skills' => false,
                'work_experience' => false,
                'achievements' => false,
                'overall_complete' => false
            ];

            // Check Profile Data
            $profile = CandidatesProfiles::where('user_id', $userId)->first();
            $completeness['profile'] = $profile && 
                $profile->phone_number && 
                $profile->address && 
                $profile->date_of_birth;

            // Check Education
            $education = CandidatesEducations::where('user_id', $userId)->first();
            $completeness['education'] = (bool) $education;

            // Check Skills - Changed from Skills to CandidatesSkills
            $skillsCount = CandidatesSkills::where('user_id', $userId)->count();
            $completeness['skills'] = $skillsCount > 0;

            // Check Work Experience
            $workExpCount = CandidatesWorkExperiences::where('user_id', $userId)->count();
            $completeness['work_experience'] = $workExpCount > 0;

            // Check Achievements
            $achievementCount = CandidatesAchievements::where('user_id', $userId)->count();
            $completeness['achievements'] = $achievementCount > 0;

            // Check if overall data is complete (required fields only)
            $completeness['overall_complete'] = 
                $completeness['profile'] && 
                $completeness['education'] && 
                $completeness['skills'];

            // Check existing CV
            $existingCV = CandidateCV::where('user_id', $userId)
                ->where('is_active', true)
                ->first();

            $cvData = null;
            if ($existingCV) {
                $cvData = [
                    'id' => $existingCV->id,
                    'filename' => $existingCV->cv_filename,
                    'created_at' => $existingCV->created_at->format('Y-m-d H:i:s'),
                    'download_count' => $existingCV->download_count
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'completeness' => $completeness,
                    'has_existing_cv' => (bool) $existingCV,
                    'existing_cv' => $cvData
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error checking data completeness: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal memeriksa kelengkapan data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function generateCV()
    {
        try {
            $userId = Auth::id();
            $user = Auth::user();

            \Log::info('Starting CV generation for user: ' . $userId);

            // Validate user data completeness
            $this->validateUserDataForCV($userId);

            // Get all required data
            $profile = CandidatesProfiles::where('user_id', $userId)->firstOrFail();

            $educations = CandidatesEducations::where('user_id', $userId)
                ->orderBy('year_in', 'desc')
                ->get();

            // Map educations with majors
            $educations = $educations->map(function($education) {
                $major = \App\Models\MasterMajor::find($education->major_id);
                $education->major = $major ? $major->name : null;
                return $education;
            });

            $workExperiences = CandidatesWorkExperiences::where('user_id', $userId)
                ->orderBy('start_year', 'desc')
                ->orderBy('start_month', 'desc')
                ->get();

            $organizations = CandidatesOrganizations::where('user_id', $userId)
                ->orderBy('start_year', 'desc')
                ->get();

            $achievements = CandidatesAchievements::where('user_id', $userId)->get();

            $skills = CandidatesSkills::where('user_id', $userId)->get();

            // Get additional data
            $courses = CandidatesCourses::where('user_id', $userId)->get();
            $certifications = CandidatesCertifications::where('user_id', $userId)->get();
            $languages = CandidatesLanguages::where('user_id', $userId)->get();

            $data = [
                'user' => $user,
                'profile' => $profile,
                'educations' => $educations,
                'workExperiences' => $workExperiences,
                'organizations' => $organizations,
                'achievements' => $achievements,
                'skills' => $skills,
                'courses' => $courses,
                'certifications' => $certifications,
                'languages' => $languages
            ];

            \Log::info('Generating PDF with data:', ['userId' => $userId]);

            // Create PDF
            $pdf = PDF::loadView('cv.template', $data);
            $pdf->setPaper('a4', 'portrait');

            // Create a unique filename
            $filename = 'CV_' . $user->name . '_' . date('Y-m-d_His') . '.pdf';
            $sanitized_filename = str_replace(' ', '_', $filename);

            // Define storage path
            $path = 'cv/' . $userId;
            $fullPath = $path . '/' . $sanitized_filename;

            // Ensure the directory exists
            Storage::disk('public')->makeDirectory($path);

            // Save PDF to storage
            Storage::disk('public')->put($fullPath, $pdf->output());

            \Log::info('PDF file generated and saved', ['path' => $fullPath]);

            // Save to database
            $cvRecord = CandidateCV::create([
                'user_id' => $userId,
                'cv_filename' => $sanitized_filename,
                'cv_path' => $fullPath,
                'file_size' => Storage::disk('public')->size($fullPath),
                'is_active' => true,
                'download_count' => 0
            ]);

            // Mark previous CVs as inactive
            CandidateCV::where('user_id', $userId)
                ->where('id', '!=', $cvRecord->id)
                ->update(['is_active' => false]);

            // Return response with download URL
            return response()->json([
                'success' => true,
                'message' => 'CV berhasil digenerate!',
                'data' => [
                    'id' => $cvRecord->id,
                    'filename' => $sanitized_filename,
                    'download_url' => url('/candidate/cv/download/' . $cvRecord->id),
                    'created_at' => $cvRecord->created_at->format('Y-m-d H:i:s')
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error generating CV: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal generate CV: ' . $e->getMessage()
            ], 500);
        }
    }

    // Tambahkan helper method untuk format file size
    private function formatBytes($size, $precision = 2)
    {
        $base = log($size, 1024);
        $suffixes = array('', 'KB', 'MB', 'GB', 'TB');
        return round(pow(1024, $base - floor($base)), $precision) .' '. $suffixes[floor($base)];
    }

    public function downloadCV($id = null)
    {
        try {
            $userId = Auth::id();

            if ($id) {
                // Download specific CV by ID
                $cv = CandidateCV::where('id', $id)
                                 ->where('user_id', $userId)
                                 ->firstOrFail();
            } else {
                // Download latest active CV
                $cv = CandidateCV::where('user_id', $userId)
                                 ->where('is_active', true)
                                 ->first();

                if (!$cv) {
                    return response()->json(['error' => 'CV not found'], 404);
                }
            }

            // Check if file exists
            if (!Storage::disk('public')->exists($cv->cv_path)) {
                return response()->json(['error' => 'CV file not found'], 404);
            }

            // Update download count
            $cv->increment('download_count');
            $cv->update(['last_downloaded_at' => now()]);

            // Return file download
            return Storage::disk('public')->download($cv->cv_path, $cv->cv_filename);

        } catch (\Exception $e) {
            \Log::error('Download CV error: ' . $e->getMessage());
            return response()->json(['error' => 'Download failed'], 500);
        }
    }

    public function listUserCVs()
    {
        try {
            $userId = Auth::id();
            $cvs = CandidateCV::where('user_id', $userId)
                          ->orderBy('created_at', 'desc')
                          ->get();

            return response()->json([
                'success' => true,
                'data' => $cvs
            ]);

        } catch (\Exception $e) {
            \Log::error('Error listing CVs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar CV'
            ], 500);
        }
    }

    public function deleteCV($id)
    {
        try {
            $userId = Auth::id();
            $cv = CandidateCV::where('id', $id)
                         ->where('user_id', $userId)
                         ->firstOrFail();

            // Delete file from storage
            if (Storage::disk('public')->exists($cv->cv_path)) {
                Storage::disk('public')->delete($cv->cv_path);
            }

            // Delete record from database
            $cv->delete();

            return response()->json([
                'success' => true,
                'message' => 'CV berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error deleting CV: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus CV'
            ], 500);
        }
    }

    private function validateUserDataForCV($userId)
    {
        $errors = [];

        // Cek data pribadi
        $profile = CandidatesProfiles::where('user_id', $userId)->first();
        if (!$profile) {
            $errors[] = 'Data pribadi belum dilengkapi';
        } else {
            if (!$profile->phone_number) $errors[] = 'Nomor telepon belum diisi';
            if (!$profile->address) $errors[] = 'Alamat belum diisi';
            if (!$profile->date_of_birth) $errors[] = 'Tanggal lahir belum diisi';
        }

        // Update education validation to check for at least one education
        $educationCount = CandidatesEducations::where('user_id', $userId)->count();
        if ($educationCount === 0) {
            $errors[] = 'Data pendidikan belum dilengkapi';
        }

        // Cek minimal ada 1 skill
        $skillsCount = CandidatesSkills::where('user_id', $userId)->count();
        if ($skillsCount == 0) {
            $errors[] = 'Minimal harus menambahkan 1 skill/kemampuan';
        }

        if (!empty($errors)) {
            throw new \Exception('Data belum lengkap untuk generate CV: ' . implode(', ', $errors));
        }
    }

    // Method untuk test PDF generation
    public function testPDF()
    {
        try {
            \Log::info('Testing PDF generation');

            $html = '<h1>Test PDF</h1><p>This is a test PDF generation at ' . now() . '</p>';
            $pdf = Pdf::loadHTML($html);
            $content = $pdf->output();

            \Log::info('Test PDF generated successfully', ['size' => strlen($content)]);

            return response($content, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="test_' . date('Y-m-d_H-i-s') . '.pdf"',
                'Content-Length' => strlen($content)
            ]);

        } catch (\Exception $e) {
            \Log::error('Test PDF generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function indexSkills()
    {
        try {
            // Change from Skills to CandidatesSkills
            $skills = CandidatesSkills::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $skills
            ]);
        } catch (\Exception $e) {
            \Log::error('Error fetching skills: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data skills'
            ], 500);
        }
    }

    public function storeSkill(Request $request)
    {
        try {
            $validated = $request->validate([
                'skill_name' => 'required|string|max:255',
                'certificate_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:2048',
            ], [
                'skill_name.required' => 'Nama skill harus diisi',
                'skill_name.max' => 'Nama skill maksimal 255 karakter',
                'certificate_file.mimes' => 'Format file harus pdf, jpg, jpeg, png, doc, atau docx',
                'certificate_file.max' => 'Ukuran file maksimal 2MB',
            ]);

            $data = [
                'user_id' => Auth::id(),
                'skill_name' => $validated['skill_name']
            ];

            if ($request->hasFile('certificate_file')) {
                $file = $request->file('certificate_file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('skills/certificates', $filename, 'public');
                $data['certificate_file'] = $path;
            }

            \Log::info('Creating skill with data:', $data);

            $skill = CandidatesSkills::create($data);

            \Log::info('Skill created:', $skill->toArray());

            return response()->json([
                'success' => true,
                'message' => 'Skill berhasil disimpan!',
                'data' => $skill
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error storing skill:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan skill: ' . $e->getMessage()
            ], 500);
        }
}

public function updateSkill(Request $request, $id)
{
    try {
        // Change from Skills to CandidatesSkills
        $skill = CandidatesSkills::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'skill_name' => 'required|string|max:255',
            'certificate_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:2048',
        ], [
            'skill_name.required' => 'Nama skill harus diisi',
            'skill_name.max' => 'Nama skill maksimal 255 karakter',
            'certificate_file.mimes' => 'Format file harus pdf, jpg, jpeg, png, doc, atau docx',
            'certificate_file.max' => 'Ukuran file maksimal 2MB',
        ]);

        $data = [
            'skill_name' => $validated['skill_name'],
        ];

        // Handle file upload jika ada
        if ($request->hasFile('certificate_file')) {
            // Delete old file if exists
            if ($skill->certificate_file) {
                Storage::disk('public')->delete($skill->certificate_file);
            }

            $file = $request->file('certificate_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('skills/certificates', $filename, 'public');
            $data['certificate_file'] = $path;
        }

        $skill->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Skill berhasil diperbarui!',
            'data' => $skill
        ]);

    } catch (\Exception $e) {
        \Log::error('Error updating skill: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal memperbarui skill'
        ], 500);
    }
}

public function deleteSkill($id)
{
    try {
        $skill = CandidatesSkills::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Delete file if exists
        if ($skill->certificate_file) {
            Storage::disk('public')->delete($skill->certificate_file);
        }

        $skill->delete();

        return response()->json([
            'success' => true,
            'message' => 'Skill berhasil dihapus!'
        ]);

    } catch (\Exception $e) {
        \Log::error('Error deleting skill: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal menghapus skill'
        ], 500);
    }
}

// Methods

public function indexLanguages()
{
    try {
        $languages = CandidatesLanguages::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $languages
        ]);
    } catch (\Exception $e) {
        \Log::error('Error fetching languages: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal mengambil data bahasa'
        ], 500);
    }
}

public function storeLanguage(Request $request)
{
    try {
        $validated = $request->validate([
            'language_name' => 'required|string|max:255',
            'proficiency_level' => 'nullable|string|in:Beginner,Intermediate,Advanced,Native',
            'certificate_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:2048'
        ], [
            'language_name.required' => 'Nama bahasa harus diisi',
            'language_name.max' => 'Nama bahasa maksimal 255 karakter',
            'proficiency_level.in' => 'Level kemahiran tidak valid',
            'certificate_file.mimes' => 'Format file harus pdf, jpg, jpeg, png, doc, atau docx',
            'certificate_file.max' => 'Ukuran file maksimal 2MB'
        ]);

        $data = [
            'user_id' => Auth::id(),
            'language_name' => $validated['language_name'],
            'proficiency_level' => $validated['proficiency_level'] ?? null
        ];

        if ($request->hasFile('certificate_file')) {
            $file = $request->file('certificate_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('languages/certificates', $filename, 'public');
            $data['certificate_file'] = $path;
        }

        $language = CandidatesLanguages::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Bahasa berhasil disimpan!',
            'data' => $language
        ], 201);

    } catch (\Exception $e) {
        \Log::error('Error storing language: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal menyimpan bahasa'
        ], 500);
    }
}

public function updateLanguage(Request $request, $id)
{
    try {
        $language = CandidatesLanguages::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'language_name' => 'required|string|max:255',
            'proficiency_level' => 'nullable|string|in:Beginner,Intermediate,Advanced,Native',
            'certificate_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:2048'
        ]);

        $data = [
            'language_name' => $validated['language_name'],
            'proficiency_level' => $validated['proficiency_level'] ?? null
        ];

        if ($request->hasFile('certificate_file')) {
            // Delete old file if exists
            if ($language->certificate_file) {
                Storage::disk('public')->delete($language->certificate_file);
            }

            $file = $request->file('certificate_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('languages/certificates', $filename, 'public');
            $data['certificate_file'] = $path;
        }

        $language->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Bahasa berhasil diperbarui!',
            'data' => $language
        ]);

    } catch (\Exception $e) {
        \Log::error('Error updating language: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal memperbarui bahasa'
        ], 500);
    }
}

public function deleteLanguage($id)
{
    try {
        $language = CandidatesLanguages::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Delete certificate file if exists
        if ($language->certificate_file) {
            Storage::disk('public')->delete($language->certificate_file);
        }

        $language->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bahasa berhasil dihapus!'
        ]);

    } catch (\Exception $e) {
        \Log::error('Error deleting language: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal menghapus bahasa'
        ], 500);
    }
}

// Methods untuk Courses
public function indexCourses()
{
    try {
        $courses = CandidatesCourses::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $courses
        ]);
    } catch (\Exception $e) {
        \Log::error('Error fetching courses: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal mengambil data kursus'
        ], 500);
    }
}

public function storeCourse(Request $request)
{
    try {
        $validated = $request->validate([
            'course_name' => 'required|string|max:255',
            'institution' => 'nullable|string|max:255',
            'completion_date' => 'nullable|date',
            'certificate_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:2048',
        ]);

        $data = [
            'user_id' => Auth::id(),
            'course_name' => $validated['course_name'],
            'institution' => $validated['institution'] ?? null,
            'completion_date' => $validated['completion_date'] ?? null,
        ];

        if ($request->hasFile('certificate_file')) {
            $file = $request->file('certificate_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('courses/certificates', $filename, 'public');
            $data['certificate_file'] = $path;
        }

        $course = CandidatesCourses::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Kursus berhasil disimpan!',
            'data' => $course
        ], 201);

    } catch (\Exception $e) {
        \Log::error('Error storing course: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal menyimpan kursus'
        ], 500);
    }
}

public function updateCourse(Request $request, $id)
{
    try {
        $course = CandidatesCourses::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'course_name' => 'required|string|max:255',
            'certificate_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:2048',
        ], [
            'course_name.required' => 'Nama kursus harus diisi',
            'course_name.max' => 'Nama kursus maksimal 255 karakter',
            'certificate_file.mimes' => 'Format file harus pdf, jpg, jpeg, png, doc, atau docx',
            'certificate_file.max' => 'Ukuran file maksimal 2MB',
        ]);

        $data = [
            'course_name' => $validated['course_name'],
        ];

        if ($request->hasFile('certificate_file')) {
            // Delete old file if exists
            if ($course->certificate_file) {
                Storage::disk('public')->delete($course->certificate_file);
            }

            $file = $request->file('certificate_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('courses/certificates', $filename, 'public');
            $data['certificate_file'] = $path;
        }

        $course->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Kursus berhasil diperbarui!',
            'data' => $course
        ]);

    } catch (\Exception $e) {
        \Log::error('Error updating course: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal memperbarui kursus'
        ], 500);
    }
}

// Tambahkan metode untuk menghapus kursus
public function deleteCourse($id)
{
    try {
        $course = CandidatesCourses::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Delete file if exists
        if ($course->certificate_file) {
            Storage::disk('public')->delete($course->certificate_file);
        }

        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kursus berhasil dihapus!'
        ]);

    } catch (\Exception $e) {
        \Log::error('Error deleting course: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal menghapus kursus'
        ], 500);
    }
}

// Methods untuk Certifications
public function indexCertifications()
{
    try {
        $certifications = CandidatesCertifications::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $certifications
        ]);
    } catch (\Exception $e) {
        \Log::error('Error fetching certifications: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal mengambil data sertifikasi'
        ], 500);
    }
}

public function storeCertification(Request $request)
{
    try {
        $validated = $request->validate([
            'certification_name' => 'required|string|max:255',
            'issuing_organization' => 'nullable|string|max:255',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'certificate_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:2048',
        ]);

        $data = [
            'user_id' => Auth::id(),
            'certification_name' => $validated['certification_name'],
            'issuing_organization' => $validated['issuing_organization'] ?? null,
            'issue_date' => $validated['issue_date'] ?? null,
            'expiry_date' => $validated['expiry_date'] ?? null,
        ];

        if ($request->hasFile('certificate_file')) {
            $file = $request->file('certificate_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('certifications/certificates', $filename, 'public');
            $data['certificate_file'] = $path;
        }

        $certification = CandidatesCertifications::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Sertifikasi berhasil disimpan!',
            'data' => $certification
        ], 201);

    } catch (\Exception $e) {
        \Log::error('Error storing certification: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal menyimpan sertifikasi'
        ], 500);
    }
}

public function updateCertification(Request $request, $id)
{
    try {
        $certification = CandidatesCertifications::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'certification_name' => 'required|string|max:255',
            'issuing_organization' => 'nullable|string|max:255',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'certificate_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:2048',
        ]);

        $data = [
            'certification_name' => $validated['certification_name'],
            'issuing_organization' => $validated['issuing_organization'] ?? null,
            'issue_date' => $validated['issue_date'] ?? null,
            'expiry_date' => $validated['expiry_date'] ?? null,
        ];

        if ($request->hasFile('certificate_file')) {
            // Delete old file if exists
            if ($certification->certificate_file) {
                Storage::disk('public')->delete($certification->certificate_file);
            }

            $file = $request->file('certificate_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('certifications/certificates', $filename, 'public');
            $data['certificate_file'] = $path;
        }

        $certification->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Sertifikasi berhasil diperbarui!',
            'data' => $certification
        ]);

    } catch (\Exception $e) {
        \Log::error('Error updating certification: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal memperbarui sertifikasi'
        ], 500);
    }
}


public function jobRecommendations()
{
    $user = Auth::user();

    // Ambil pendidikan terakhir user
    $education = \App\Models\CandidatesEducations::where('user_id', $user->id)
        ->orderByDesc('year_out')
        ->first();

    $majorId = $education?->major_id;

    $jobs = [];
    if ($majorId) {
        $jobs = \App\Models\Job::with('company')
            ->where('major_id', $majorId)
            ->get();
    }

    $recommendations = collect($jobs)->map(function ($job) {
        return [
            'vacancy' => [
                'id' => $job->id,
                'title' => $job->title,
                'company' => [
                    'name' => $job->company->name ?? '-'
                ],
                'description' => $job->description ?? '-',
                'location' => $job->location ?? '-',
                'type' => $job->type ?? '-',
                'deadline' => $job->deadline ?? '-',
                'department' => $job->department ?? '-',
            ],
            'score' => 100,
        ];
    })->values();

    return response()->json([
        'recommendations' => $recommendations,
    ]);
}

public function getProfileImage()
{
    try {
        $userId = Auth::id();
        $profile = CandidatesProfiles::where('user_id', $userId)->first();

        if ($profile && $profile->profile_image) {
            // Generate public URL for the image
            $imageUrl = asset('storage/' . $profile->profile_image);

            return response()->json([
                'success' => true,
                'image' => $imageUrl
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No profile image found'
        ]);

    } catch (\Exception $e) {
        \Log::error('Error getting profile image: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Error getting profile image'
        ], 500);
    }
}

public function uploadProfileImage(Request $request)
{
    try {
        $validated = $request->validate([
            'profile_image' => 'required|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        $userId = Auth::id();
        $profile = CandidatesProfiles::where('user_id', $userId)->first();

        if (!$profile) {
            $profile = CandidatesProfiles::create(['user_id' => $userId]);
        }

        // Delete old image if exists
        if ($profile->profile_image) {
            Storage::disk('public')->delete($profile->profile_image);
        }

        // Pastikan direktori profile-images ada
        Storage::disk('public')->makeDirectory('profile-images');

        // Store new image
        $file = $request->file('profile_image');
        $filename = time() . '_' . $userId . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('profile-images', $filename, 'public');

        // Update kolom profile_image sesuai dengan skema database
        $profile->update(['profile_image' => $path]);

        // Generate public URL for the image
        $imageUrl = asset('storage/' . $path);

        return response()->json([
            'success' => true,
            'message' => 'Profile image uploaded successfully',
            'image_url' => $imageUrl
        ]);

    } catch (\Exception $e) {
        \Log::error('Error uploading profile image: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Error uploading profile image: ' . $e->getMessage()
        ], 500);
    }
}
public function getAllEducations()
{
    try {
        $educations = CandidatesEducations::where('user_id', Auth::id())
            ->orderBy('year_in', 'desc')
            ->get();

        // Join dengan master_majors untuk mendapatkan nama jurusan
        $educations = $educations->map(function($education) {
            $major = \App\Models\MasterMajor::find($education->major_id);
            return [
                'id' => $education->id,
                'education_level' => $education->education_level,
                'faculty' => $education->faculty,
                'major_id' => $education->major_id,
                'major' => $major ? $major->name : null,
                'institution_name' => $education->institution_name,
                'gpa' => $education->gpa,
                'year_in' => $education->year_in,
                'year_out' => $education->year_out
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $educations
        ]);
    } catch (\Exception $e) {
        \Log::error('Error fetching educations: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Gagal mengambil data pendidikan'
        ], 500);
    }
}

public function deleteEducation($id)
{
    try {
        $education = CandidatesEducations::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $education->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data pendidikan berhasil dihapus'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Gagal menghapus data pendidikan'
        ], 500);
    }
}

public function updateEducation(Request $request, $id)
{
    try {
        \Log::info('Updating education data. Request:', $request->all());

        $education = CandidatesEducations::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'education_level' => 'required|string',
            'faculty' => 'required|string',
            'major_id' => 'required|exists:master_majors,id',
            'institution_name' => 'required|string',
            'gpa' => 'required|numeric|between:0,4',
            'year_in' => 'required|integer',
            'year_out' => 'nullable|integer'
        ]);

        \Log::info('Validated data for education update:', $validated);

        // Update education record
        $education->update($validated);
        $education->refresh();

        // Get major data to include in the response
        $major = \App\Models\MasterMajor::find($education->major_id);

        $responseData = [
            'id' => $education->id,
            'education_level' => $education->education_level,
            'faculty' => $education->faculty,
            'major_id' => (string)$education->major_id,
            'major' => $major ? $major->name : null,
            'institution_name' => $education->institution_name,
            'gpa' => $education->gpa,
            'year_in' => $education->year_in,
            'year_out' => $education->year_out
        ];

        \Log::info('Education updated successfully:', $responseData);

        return response()->json([
            'success' => true,
            'message' => 'Data pendidikan berhasil diperbarui',
            'data' => $responseData
        ]);

    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('Validation error updating education: ' . json_encode($e->errors()));
        return response()->json([
            'success' => false,
            'message' => 'Validasi gagal',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Log::error('Error updating education data: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Error updating education data: ' . $e->getMessage()
        ], 500);
    }
}

/**
 * Get candidate profile data for API requests
 */
public function getProfile()
{
    try {
        $userId = Auth::id();
        $user = Auth::user();
        $profile = CandidatesProfiles::where('user_id', $userId)->first();

        // Add image URL if profile exists and has an image
        if ($profile && $profile->profile_image) {
            $profile->image_url = asset('storage/' . $profile->profile_image);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'profile' => $profile
        ]);

    } catch (\Exception $e) {
        \Log::error('Error getting profile data: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Error retrieving profile data'
        ], 500);
    }
}
public function deleteAchievement($id)
{
    try {
        $achievement = CandidatesAchievements::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Hapus file sertifikat jika ada
        if ($achievement->certificate_file) {
            Storage::disk('public')->delete($achievement->certificate_file);
        }
        
        // Hapus file pendukung jika ada
        if ($achievement->supporting_file) {
            Storage::disk('public')->delete($achievement->supporting_file);
        }

        $achievement->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Prestasi berhasil dihapus!'
        ]);

    } catch (\Exception $e) {
        \Log::error('Error deleting achievement: ' . $e->getMessage());
        return response()->json([
            'status' => 'error',
            'message' => 'Gagal menghapus prestasi'
        ], 500);
    }
}

/**
 * Menampilkan halaman konfirmasi data sebelum melamar
 */
public function showConfirmData($job_id = null)
{
    // Dapatkan status kelengkapan data
    $completenessData = $this->checkApplicationDataCompleteness();
    $completeness = json_decode($completenessData->getContent(), true);
    
    return Inertia::render('candidate/confirm-data', [
        'completeness' => $completeness['completeness'],
        'job_id' => $job_id,
        'flash' => [
            'warning' => 'Mohon lengkapi data yang diperlukan sebelum melamar pekerjaan'
        ]
    ]);
}

public function showPsychotest($application_id = null)
{
    try {
        // Aktifkan debugging untuk melihat error yang mungkin terjadi
        \Log::info('ShowPsychotest called with application_id: ' . $application_id);
        
        // Mendapatkan user yang sedang login
        $user = Auth::user();

        // Jika tidak ada application_id, cari aplikasi user yang sedang dalam tahap psikotes
        if (!$application_id) {
            // Cari aplikasi user yang sedang dalam tahap psikotes
            $application = Applications::where('user_id', $user->id)
                ->whereHas('applicationHistories', function ($query) {
                    $query->where('is_active', true)
                        ->whereHas('status', function ($q) {
                            $q->where('stage', \App\Enums\CandidatesStage::PSYCHOTEST->value)
                                ->orWhere('name', 'like', '%Psiko%')
                                ->orWhere('name', 'like', '%Psychological%');
                        });
                })
                ->first();

            if ($application) {
                $application_id = $application->id;
            } else {
                \Log::warning('No active psychotest found for user: ' . $user->id);
                return redirect()->route('candidate.application-history')
                    ->with('error', 'Anda tidak memiliki tes psikotes yang aktif saat ini.');
            }
        }

        // Validasi application_id (apakah ini milik user yang login & dalam tahap psikotes)
        $application = Applications::where('id', $application_id)
            ->where('user_id', $user->id)
            ->first();

        if (!$application) {
            \Log::warning('Application not found or not owned by user: ' . $user->id . ', application_id: ' . $application_id);
            return redirect()->route('candidate.application-history')
                ->with('error', 'Data aplikasi tidak ditemukan atau bukan milik Anda.');
        }

        // Cek apakah aplikasi ini sedang dalam tahap psikotes
        $activePsychoTest = ApplicationHistory::where('application_id', $application->id)
            ->where('is_active', true)
            ->whereHas('status', function ($query) {
                $query->where('stage', \App\Enums\CandidatesStage::PSYCHOTEST->value)
                    ->orWhere('name', 'like', '%Psiko%')
                    ->orWhere('name', 'like', '%Psychological%');
            })
            ->first();

        if (!$activePsychoTest) {
            \Log::warning('No active psychotest stage for application_id: ' . $application_id);
            return redirect()->route('candidate.application-history')
                ->with('error', 'Aplikasi ini tidak sedang dalam tahap psikotes.');
        }

        // Debug info untuk membantu troubleshooting
        \Log::info('Active psychotest record found', [
            'application_id' => $application->id,
                       'completed_at' => $activePsychoTest->completed_at,
            'is_active' => $activePsychoTest->is_active,
            'status_id' => $activePsychoTest->status_id
        ]);

        // Cek apakah psikotes sudah dikerjakan
        if ($activePsychoTest->completed_at) {
            \Log::info('Psychotest already completed for application_id: ' . $application_id);
            return redirect()->route('candidate.application-status', ['id' => $application->id])
                ->with('warning', 'Anda sudah mengerjakan tes psikotes untuk aplikasi ini.');
        }

        // Ambil QuestionPack untuk psikotes (atau gunakan dummy data jika tidak ada)
        $questions = $this->getDummyPsychotestQuestions();
        
        // Setup data tes dari application history
        $assessment = [
            'id' => $application->id,
            'question_pack_id' => 0, // Dummy ID
            'title' => 'Tes Psikotes Kepribadian dan Logika',
            'description' => 'Pilih jawaban yang paling sesuai dengan diri Anda. Tidak ada jawaban benar atau salah. Jawablah dengan jujur dan spontan.',
            'duration' => 60 // 60 menit
        ];

        \Log::info('Rendering candidate-psychotest view');
        return Inertia::render('candidate/tests/candidate-psychotest', [
            'assessment' => $assessment,
            'questions' => $questions,
            'userAnswers' => [] // Kosong karena belum pernah dikerjakan
        ]);

    } catch (\Exception $e) {
        \Log::error('Error in showPsychotest: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString()
        ]);
        
        return redirect()->route('candidate.application-history')
            ->with('error', 'Terjadi kesalahan saat memuat tes psikotes: ' . $e->getMessage());
    }
}

// Method untuk mendapatkan soal dummy jika tidak ada di database
private function getDummyPsychotestQuestions()
{
    return [
        [
            'id' => 1,
            'question' => 'Saya lebih suka menghabiskan waktu:',
            'question_type' => 'multiple_choice',
            'options' => [
                ['id' => 1, 'text' => 'Bersama orang banyak dalam situasi sosial'],
                ['id' => 2, 'text' => 'Sendiri atau dengan sedikit teman dekat'],
                ['id' => 3, 'text' => 'Kombinasi keduanya, tergantung suasana hati']
            ]
        ],
        [
            'id' => 2,
            'question' => 'Ketika menghadapi masalah, saya cenderung:',
            'question_type' => 'multiple_choice',
            'options' => [
                ['id' => 4, 'text' => 'Mengandalkan fakta dan data'],
                ['id' => 5, 'text' => 'Mempertimbangkan perasaan dan nilai-nilai'],
                ['id' => 6, 'text' => 'Kombinasi analisis dan intuisi']
            ]
        ],
        // Tambahkan 3 pertanyaan lagi
        [
            'id' => 3,
            'question' => 'Dalam pekerjaan, saya lebih menikmati:',
            'question_type' => 'multiple_choice',
            'options' => [
                ['id' => 7, 'text' => 'Menciptakan ide dan konsep baru'],
                ['id' => 8, 'text' => 'Menerapkan solusi praktis untuk masalah nyata'],
                ['id' => 9, 'text' => 'Menganalisis situasi dan menemukan pola']
            ]
        ],
        [
            'id' => 4,
            'question' => 'Saya lebih suka lingkungan kerja yang:',
            'question_type' => 'multiple_choice',
            'options' => [
                ['id' => 10, 'text' => 'Terstruktur dengan aturan dan prosedur jelas'],
                ['id' => 11, 'text' => 'Fleksibel dengan ruang untuk improvisasi'],
                ['id' => 12, 'text' => 'Seimbang antara keteraturan dan fleksibilitas']
            ]
        ],
        [
            'id' => 5,
            'question' => 'Ketika bekerja dalam tim, saya biasanya:',
            'question_type' => 'multiple_choice',
            'options' => [
                ['id' => 13, 'text' => 'Mengambil peran kepemimpinan'],
                ['id' => 14, 'text' => 'Memberikan ide dan mendukung tim'],
                ['id' => 15, 'text' => 'Fokus menyelesaikan tugas individual']
            ]
        ],
    ];
}

public function submitPsychotest(Request $request)
{
    try {
        \Log::info('Received psychotest submission', [
            'application_id' => $request->input('application_id'),
            'answers_count' => is_array($request->input('answers')) ? count($request->input('answers')) : 'not array',
            'user_id' => auth()->id()
        ]);
        
        $application_id = $request->input('application_id');
        $answers = $request->input('answers', []);
        
        // Validasi data
        if (!$application_id) {
            return response()->json([
                'success' => false,
                'message' => 'Application ID tidak ditemukan'
            ], 422);
        }
        
        // Cari aplikasi
        $application = \App\Models\Applications::where('id', $application_id)
            ->where('user_id', auth()->id())
            ->first();
        
        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Aplikasi tidak ditemukan atau bukan milik Anda'
            ], 404);
        }
        
        // Cari history psikotes aktif
        $psychotestHistory = \App\Models\ApplicationHistory::where('application_id', $application_id)
            ->where('is_active', true)
            ->whereHas('status', function ($query) {
                $query->where('stage', \App\Enums\CandidatesStage::PSYCHOTEST->value)
                    ->orWhere('name', 'like', '%Psiko%')
                    ->orWhere('name', 'like', '%Psychological%');
            })
            ->first();
        
        if (!$psychotestHistory) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada tes psikotes aktif untuk aplikasi ini'
            ], 404);
        }
        
        // PERBAIKAN: Hanya update completed_at untuk menandakan kandidat sudah selesai test
        // JANGAN set reviewed_by di sini - ini harus diisi oleh admin saat mengevaluasi
        $psychotestHistory->completed_at = now();
        $psychotestHistory->notes = 'Tes psikotes telah dikerjakan oleh kandidat pada ' . now()->format('Y-m-d H:i') . '. Menunggu evaluasi dari tim rekrutmen.';
        
        // Pastikan field ini TIDAK diisi saat kandidat submit
        // $psychotestHistory->processed_at = now();  // HAPUS - ini untuk admin saat proses evaluasi
        // $psychotestHistory->score = 80;           // HAPUS - ini untuk admin saat proses evaluasi 
        // $psychotestHistory->reviewed_by = "SuperAdmin"; // HAPUS - ini untuk admin saat proses evaluasi
        // $psychotestHistory->reviewed_at = now();       // HAPUS - ini untuk admin saat proses evaluasi
        
        $psychotestHistory->save();
        
        // Simpan jawaban ke tabel terpisah untuk evaluasi admin
        try {
            DB::beginTransaction();
            
            // Simpan jawaban ke tabel user_answers
            foreach ($answers as $questionId => $choiceId) {
                \App\Models\UserAnswer::create([
                    'user_id' => auth()->id(),
                    'question_id' => $questionId,
                    'choice_id' => $choiceId
                ]);
            }
            
            // Simpan backup jawaban dalam JSON juga untuk keamanan data
            $backupAnswersFile = 'psychotest_answers/user_' . auth()->id() . '_app_' . $application_id . '_' . date('Ymd_His') . '.json';
            \Storage::disk('local')->put($backupAnswersFile, json_encode([
                'user_id' => auth()->id(),
                'application_id' => $application_id,
                'answers' => $answers,
                'submitted_at' => now()->format('Y-m-d H:i:s')
            ]));
            
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::warning('Gagal menyimpan jawaban psikotes: ' . $e->getMessage());
            // Tidak mengganggu proses submit - aplikasi tetap dianggap selesai
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Tes psikotes berhasil diselesaikan. Tim rekrutmen akan segera mengevaluasi hasil tes Anda.',
            'redirect_url' => route('candidate.application.status', ['id' => $application_id])
        ]);
        
    } catch (\Exception $e) {
        \Log::error('Error in submitPsychotest: ' . $e->getMessage(), [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Terjadi kesalahan pada server: ' . $e->getMessage()
        ], 500);
    }
}

public function applicationStatus($id)
{
    try {
        $application = Applications::with([
            'applicationHistories' => function($query) {
                $query->with('status');
                // Pastikan completed_at terbawa
            }
        ])
        ->where('id', $id)
        ->where('user_id', Auth::id())
        ->firstOrFail();

        return Inertia::render('candidate/status-candidate', [
            'application' => $application
        ]);
    } catch (\Exception $e) {
        return redirect()->route('candidate.application-history')
            ->with('error', 'Aplikasi tidak ditemukan');
    }
}
}