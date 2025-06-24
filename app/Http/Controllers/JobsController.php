<?php

namespace App\Http\Controllers;

use App\Enums\CandidatesStage;
use App\Models\Candidate;
use App\Models\Vacancies;
use App\Models\Applications;
use App\Models\CandidatesEducations;
use App\Models\MasterMajor;
use App\Models\CandidatesProfile;
use App\Models\CandidatesProfiles;
use App\Models\JobApplication; // Add this import
use App\Models\Selections;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JobsController extends Controller
{
    public function index()
    {
        try {
            // Ambil semua lowongan aktif dengan relasi
            $jobs = Vacancies::with(['company', 'department', 'vacancyType', 'major'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Transform job data to match expected format
            $formattedJobs = $jobs->map(function($job) {
                // Ambil deadline dari periods
                $period = DB::table('periods')
                    ->join('vacancy_periods', 'periods.id', '=', 'vacancy_periods.period_id')
                    ->where('vacancy_periods.vacancy_id', $job->id)
                    ->orderBy('periods.end_time', 'desc')
                    ->first();

                // Get major name if exists
                $majorName = null;
                if ($job->major_id) {
                    $major = MasterMajor::find($job->major_id);
                    $majorName = $major ? $major->name : null;
                }

                // Format requirements and benefits
                $requirements = is_array($job->requirements) ? $job->requirements : json_decode($job->requirements ?: '[]');
                $benefits = is_array($job->benefits) ? $job->benefits : json_decode($job->benefits ?: '[]');

                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'company' => [
                        'name' => $job->company ? $job->company->name : 'Unknown',
                        'id' => $job->company ? $job->company->id : null
                    ],
                    'description' => $job->job_description ? $job->job_description : 'No description available',
                    'location' => $job->location,
                    'type' => $job->vacancyType ? $job->vacancyType->name : 'Unknown',
                    'department' => $job->department ? $job->department->name : 'Unknown',
                    'deadline' => $period ? $period->end_time : 'Open',
                    'requirements' => $requirements,
                    'benefits' => $benefits,
                    'salary' => $job->salary,
                    'major_id' => $job->major_id,
                    'major_name' => $majorName,
                    'created_at' => $job->created_at ? $job->created_at->format('Y-m-d H:i:s') : null,
                    'updated_at' => $job->updated_at ? $job->updated_at->format('Y-m-d H:i:s') : null
                ];
            });

            $userMajorId = null;
            $recommendations = [];
            $candidateMajor = null;
            $userEducation = null;

            // Jika user sudah login, tampilkan rekomendasi berdasarkan jurusan
            if (Auth::check()) {
                $education = CandidatesEducations::where('user_id', Auth::id())->first();
                if ($education) {
                    $userMajorId = $education->major_id;
                    $userEducation = $education->education_level;

                    // Ambil major name
                    if ($userMajorId) {
                        $major = MasterMajor::find($userMajorId);
                        $candidateMajor = $major ? $major->name : null;
                    }

                    // Filter lowongan yang sesuai dengan jurusan user
                    $matchedJobs = $formattedJobs->filter(function($job) use ($userMajorId) {
                        return $job['major_id'] == $userMajorId;
                    })->values();

                    // Buat rekomendasi dengan score
                    foreach ($matchedJobs as $job) {
                        $recommendations[] = [
                            'vacancy' => $job,
                            'score' => 100 // Perfect match score
                        ];
                    }
                }
            }

            // Data perusahaan untuk filter
            $companies = DB::table('companies')->pluck('name')->toArray();

            // Periksa apakah profile kandidat sudah lengkap
            $profileComplete = $this->checkProfileComplete(Auth::user());

            Log::info('Jobs data loaded successfully', [
                'job_count' => count($formattedJobs),
                'recommendation_count' => count($recommendations)
            ]);

            return Inertia::render('candidate/jobs/job-hiring', [
                'jobs' => $formattedJobs,
                'recommendations' => $recommendations,
                'companies' => $companies,
                'candidateMajor' => $candidateMajor,
                'userEducation' => $userEducation,
                'profileComplete' => $profileComplete
            ]);
        } catch (\Exception $e) {
            Log::error('Error in job-hiring: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return back()->with('error', 'Terjadi kesalahan saat memuat lowongan pekerjaan. Silakan coba lagi.');
        }
    }

    public function apply(Request $request, $id)
    {
        try {
            // Check if profile is complete
            $profileComplete = $this->checkProfileComplete(Auth::user());

            if (!$profileComplete['complete']) {
                return response()->json([
                    'success' => false,
                    'message' => $profileComplete['message'],
                    'redirect' => route('candidate.profile')
                ], 422);
            }

            // Proses aplikasi jika data sudah lengkap
            $userId = Auth::id();

            // Get vacancy details
            $vacancy = Vacancies::findOrFail($id);

            // Get active vacancy period for this vacancy
            $vacancyPeriod = DB::table('vacancy_periods')
                ->join('periods', 'vacancy_periods.period_id', '=', 'periods.id')
                ->where('vacancy_periods.vacancy_id', $id)
                ->where('periods.end_time', '>=', now())
                ->orderBy('periods.end_time', 'asc')
                ->select('vacancy_periods.id')
                ->first();

            if (!$vacancyPeriod) {
                return response()->json([
                    'success' => false,
                    'message' => 'Periode rekrutasi untuk lowongan ini telah berakhir.',
                ], 422);
            }

            // Check if user has already applied
            $existingApplication = Applications::where('user_id', $userId)
                ->where('vacancy_period_id', $vacancyPeriod->id)
                ->first();

            if ($existingApplication) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah pernah melamar pekerjaan ini.',
                    'redirect' => route('candidate.application-history')
                ], 422);
            }

            // Get default status (usually "Applied")
            $initialStatus = DB::table('statuses')->where('name', 'Applied')->first();
            if (!$initialStatus) {
                $initialStatusId = DB::table('statuses')->insertGetId([
                    'name' => 'Applied',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $initialStatusId = $initialStatus->id;
            }

            // Get candidate CV
            $candidateCV = DB::table('candidates_cv')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->first();

            $resumePath = $candidateCV ? $candidateCV->file_path : null;

            // Create new application
            $application = Applications::create([
                'user_id' => $userId,
                'vacancy_period_id' => $vacancyPeriod->id,
                'status_id' => $initialStatusId,
                'resume_path' => $resumePath,
                'cover_letter_path' => null, // Could be added in the future
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Create initial application history entry
            DB::table('application_history')->insert([
                'application_id' => $application->id,
                'stage' => 'administrative_selection',
                'processed_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Lamaran berhasil dikirim! Silakan pantau status lamaran Anda di halaman Riwayat Lamaran.',
                'redirect' => route('candidate.application-history')
            ]);

        } catch (\Exception $e) {
            Log::error('Error applying for job: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat melamar pekerjaan: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show()
    {
        return Inertia::render('candidate/chats/candidate-chat');
    }

    public function detail($id)
    {
        $vacancy = Vacancies::with('company')->findOrFail($id);

        // Mengambil informasi major
        $majorName = null;
        if ($vacancy->major_id) {
            $major = MasterMajor::find($vacancy->major_id);
            $majorName = $major ? $major->name : null;
        }

        // Convert requirements & benefits to array if they are JSON strings
        $requirements = is_string($vacancy->requirements)
            ? json_decode($vacancy->requirements)
            : $vacancy->requirements;

        $benefits = is_string($vacancy->benefits)
            ? json_decode($vacancy->benefits)
            : $vacancy->benefits;

        // Get user's major if authenticated
        $userMajor = null;
        $isMajorMatched = false;
        $educationMatched = false;
        $userEducation = null;
        $requiredEducation = 'S1'; // Default for testing

        if (Auth::check()) {
            $education = CandidatesEducations::where('user_id', Auth::id())->first();
            if ($education) {
                $userMajor = $education->major_id;
                $userEducation = $education->education_level;

                // Cek kesesuaian jurusan
                $isMajorMatched = ($vacancy->major_id == $userMajor);

                // Find minimum education requirement
                if (is_array($requirements)) {
                    // Check for structured fields
                    if (isset($requirements['min_education'])) {
                        $requiredEducation = $requirements['min_education'];
                    } else if (isset($requirements['minimum_education'])) {
                        $requiredEducation = $requirements['minimum_education'];
                    } else if (isset($requirements['pendidikan_minimal'])) {
                        $requiredEducation = $requirements['pendidikan_minimal'];
                    } else {
                        // Try to extract from requirements text
                        foreach ($requirements as $req) {
                            if (is_string($req) &&
                                (stripos($req, 'pendidikan minimal') !== false ||
                                 stripos($req, 'minimum pendidikan') !== false) &&
                                (stripos($req, 'S1') !== false ||
                                 stripos($req, 'S2') !== false ||
                                 stripos($req, 'S3') !== false ||
                                 stripos($req, 'D3') !== false ||
                                 stripos($req, 'SMA') !== false ||
                                 stripos($req, 'SMK') !== false ||
                                 stripos($req, 'SMP') !== false ||
                                 stripos($req, 'SD') !== false)) {

                                if (stripos($req, 'S3') !== false) $requiredEducation = 'S3';
                                else if (stripos($req, 'S2') !== false) $requiredEducation = 'S2';
                                else if (stripos($req, 'S1') !== false) $requiredEducation = 'S1';
                                else if (stripos($req, 'D3') !== false) $requiredEducation = 'D3';
                                else if (stripos($req, 'SMA') !== false || stripos($req, 'SMK') !== false) $requiredEducation = 'SMA/SMK';
                                else if (stripos($req, 'SMP') !== false) $requiredEducation = 'SMP';
                                else if (stripos($req, 'SD') !== false) $requiredEducation = 'SD';
                                break;
                            }
                        }
                    }
                }

                // Check education match
                $educationMatched = $this->validateEducationLevel($userEducation, $requiredEducation);

                \Log::info('Education check in detail page', [
                    'user_education' => $userEducation,
                    'required_education' => $requiredEducation,
                    'is_matched' => $educationMatched
                ]);
            }
        }

        return Inertia::render('candidate/detail-job/detail-job', [
            'job' => [
                'id' => $vacancy->id,
                'title' => $vacancy->title,
                'company' => $vacancy->company,
                'job_description' => $vacancy->job_description,
                'requirements' => $requirements,
                'benefits' => $benefits,
                'major_id' => $vacancy->major_id,
                'major_name' => $majorName,
                'required_education' => $requiredEducation,
            ],
            'userMajor' => $userMajor,
            'isMajorMatched' => $isMajorMatched,
            'userEducation' => $userEducation,
            'educationMatched' => $educationMatched
        ]);
    }

    public function jobHiring(Request $request)
    {
        try {
            // Ambil semua lowongan aktif (tanpa join kompleks dulu)
            $jobs = Vacancies::with(['company', 'department'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Add education requirements to all jobs
            $jobs = $this->addEducationRequirements($jobs);

            // Tambahkan data tipe pekerjaan dari relasi
            foreach ($jobs as $job) {
                // Tambahkan tipe dari relasi yang benar
                $jobType = DB::table('job_types')->find($job->type_id);
                $job->type = $jobType ? $jobType->name : 'Unknown';

                // Tambahkan deadline dari periods
                $period = DB::table('periods')
                    ->join('vacancies_periods', 'periods.id', '=', 'vacancies_periods.period_id')
                    ->where('vacancies_periods.vacancy_id', $job->id)
                    ->first();

                // Tambahkan deadline ke objek job
                $job->deadline = $period ? $period->end_time : 'Open';

                // Tambahkan deskripsi
                $job->description = $job->job_description ?: 'No description available';
            }

            $userMajorId = null;
            $recommendations = [];
            $candidateMajor = null;

            // Jika user sudah login, tampilkan rekomendasi berdasarkan jurusan
            if (Auth::check()) {
                $education = CandidatesEducations::where('user_id', Auth::id())->first();
                if ($education) {
                    $userMajorId = $education->major_id;

                    // Ambil major name
                    if ($userMajorId) {
                        $major = MasterMajor::find($userMajorId);
                        $candidateMajor = $major ? $major->name : null;
                    }

                    // Filter lowongan yang sesuai dengan jurusan user
                    $matchedJobs = $jobs->filter(function($job) use ($userMajorId) {
                        return $job->major_id == $userMajorId;
                    });

                    // Buat rekomendasi dengan score
                    foreach ($matchedJobs as $job) {
                        $score = 100; // Default score untuk perfect match

                        $recommendations[] = [
                            'vacancy' => $job,
                            'score' => $score
                        ];
                    }
                }
            }

            // Data perusahaan untuk filter
            $companies = DB::table('companies')->pluck('name')->toArray();

            return Inertia::render('candidate/jobs/job-hiring', [
                'jobs' => $jobs,
                'recommendations' => $recommendations,
                'companies' => $companies,
                'candidateMajor' => $candidateMajor
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in job-hiring: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Terjadi kesalahan. Silakan coba lagi.');
        }
    }

    // applicationHistory method has been removed and replaced with a dedicated ApplicationHistoryController

    /**
     * Metode untuk memvalidasi jenjang pendidikan kandidat dengan persyaratan lowongan
     *
     * @param string $candidateEducation Jenjang pendidikan kandidat
     * @param string $requiredEducation Jenjang pendidikan minimal yang dibutuhkan
     * @return bool True jika pendidikan kandidat memenuhi syarat, false jika tidak
     */
    private function validateEducationLevel($candidateEducation, $requiredEducation)
    {
        // Log the input values
        \Log::info('Validating education level', [
            'candidate_education_raw' => $candidateEducation,
            'required_education_raw' => $requiredEducation
        ]);

        // Normalize education input (case and formatting)
        $candidateEducation = trim(strtoupper($candidateEducation));
        $requiredEducation = trim(strtoupper($requiredEducation));

        // Define education hierarchy (from lowest to highest)
        $educationLevels = [
            'SD' => 1,
            'SMP' => 2,
            'SMA' => 3,
            'SMK' => 3,
            'SMA/SMK' => 3,
            'D3' => 4,
            'DIPLOMA' => 4,
            'DIPLOMA 3' => 4,
            'S1' => 5,
            'SARJANA' => 5,
            'S2' => 6,
            'MAGISTER' => 6,
            'S3' => 7,
            'DOKTOR' => 7
        ];

        // Handle special case for 'SMA/SMK'
        if ($candidateEducation === 'SMA' || $candidateEducation === 'SMK') {
            $candidateEducation = 'SMA/SMK';
        }

        // Handle special cases for required education
        if ($requiredEducation === 'SMA' || $requiredEducation === 'SMK') {
            $requiredEducation = 'SMA/SMK';
        }

        // Map similar education names to standardized values
        $mappedCandidate = $candidateEducation;
        $mappedRequired = $requiredEducation;

        // Custom mapping logic for non-standard formats
        if (strpos($candidateEducation, 'DIPLOMA') !== false || strpos($candidateEducation, 'D-3') !== false || $candidateEducation === 'D3') {
            $mappedCandidate = 'D3';
        }
        if (strpos($requiredEducation, 'DIPLOMA') !== false || strpos($requiredEducation, 'D-3') !== false || $requiredEducation === 'D3') {
            $mappedRequired = 'D3';
        }

        if (strpos($candidateEducation, 'SARJANA') !== false || strpos($candidateEducation, 'S-1') !== false || $candidateEducation === 'S1') {
            $mappedCandidate = 'S1';
        }
        if (strpos($requiredEducation, 'SARJANA') !== false || strpos($requiredEducation, 'S-1') !== false || $requiredEducation === 'S1') {
            $mappedRequired = 'S1';
        }

        // Log the mapped values
        \Log::info('Mapped education values', [
            'mapped_candidate' => $mappedCandidate,
            'mapped_required' => $mappedRequired
        ]);

        // If education level not in our defined levels, reject
        if (!isset($educationLevels[$mappedCandidate]) || !isset($educationLevels[$mappedRequired])) {
            \Log::warning('Education level not recognized', [
                'candidate_education' => $mappedCandidate,
                'required_education' => $mappedRequired,
                'valid_levels' => array_keys($educationLevels)
            ]);
            return false;
        }

        // Compare education levels
        $result = $educationLevels[$mappedCandidate] >= $educationLevels[$mappedRequired];

        \Log::info('Education comparison result', [
            'candidate_level' => $educationLevels[$mappedCandidate],
            'required_level' => $educationLevels[$mappedRequired],
            'comparison_result' => $result ? 'passed' : 'failed'
        ]);

        return $result;
    }

    /**
     * Helper function to add education requirements to job entries for display in listings
     *
     * @param \Illuminate\Database\Eloquent\Collection $jobs Collection of job entries
     * @return \Illuminate\Database\Eloquent\Collection Modified jobs with education requirements
     */
    private function addEducationRequirements($jobs)
    {
        foreach ($jobs as $job) {
            $requirements = $job->requirements;

            // Process requirements to find education level
            $minEducation = null;

            if (is_string($requirements)) {
                $requirements = json_decode($requirements, true);
            }

            if (is_array($requirements)) {
                // Check for structured fields
                if (isset($requirements['min_education'])) {
                    $minEducation = $requirements['min_education'];
                } else if (isset($requirements['minimum_education'])) {
                    $minEducation = $requirements['minimum_education'];
                } else if (isset($requirements['pendidikan_minimal'])) {
                    $minEducation = $requirements['pendidikan_minimal'];
                } else {
                    // Try to extract from requirements text
                    foreach ($requirements as $req) {
                        if (is_string($req) &&
                            (stripos($req, 'pendidikan minimal') !== false ||
                             stripos($req, 'minimum pendidikan') !== false) &&
                            (stripos($req, 'S1') !== false ||
                             stripos($req, 'S2') !== false ||
                             stripos($req, 'S3') !== false ||
                             stripos($req, 'D3') !== false ||
                             stripos($req, 'SMA') !== false ||
                             stripos($req, 'SMK') !== false)) {

                            if (stripos($req, 'S3') !== false) $minEducation = 'S3';
                            else if (stripos($req, 'S2') !== false) $minEducation = 'S2';
                            else if (stripos($req, 'S1') !== false) $minEducation = 'S1';
                            else if (stripos($req, 'D3') !== false) $minEducation = 'D3';
                            else if (stripos($req, 'SMA') !== false || stripos($req, 'SMK') !== false) $minEducation = 'SMA/SMK';
                            break;
                        }
                    }
                }
            }

            // For demo purposes, assign a default if not found
            if (!$minEducation) {
                $minEducation = 'S1';
            }

            $job->min_education = $minEducation;
        }

        return $jobs;
    }

    // Metode tambahan untuk memeriksa kelengkapan profil
    private function checkProfileComplete($user)
    {
        $profile = \App\Models\CandidatesProfiles::where('user_id', $user->id)->first();

        if (
            !$profile ||
            empty($user->name) ||
            empty($user->email) ||
            empty($profile->phone_number)
        ) {
            return [
                'complete' => false,
                'message' => 'Nama, email, dan nomor telepon wajib diisi.'
            ];
        }

        if (empty($profile->address)) {
            return [
                'complete' => false,
                'message' => 'Alamat wajib diisi.'
            ];
        }

        // Cek pendidikan
        $education = CandidatesEducations::where('user_id', $user->id)->first();
        if (
            !$education ||
            empty($education->institution) ||
            empty($education->major_id) ||
            empty($education->year_graduated)
        ) {
            return [
                'complete' => false,
                'message' => 'Data pendidikan belum lengkap.'
            ];
        }

        // Cek CV
        $hasCV = \Storage::disk('public')->exists('cv/'.$user->id.'.pdf');
        if (!$hasCV) {
            return [
                'complete' => false,
                'message' => 'CV belum diupload.'
            ];
        }

        return [
            'complete' => true,
            'message' => 'Data profil lengkap.'
        ];
    }
}
