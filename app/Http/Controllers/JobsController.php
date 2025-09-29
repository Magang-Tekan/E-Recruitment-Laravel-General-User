<?php

namespace App\Http\Controllers;

use App\Enums\CandidatesStage;
use App\Models\Candidate;
use App\Models\Vacancies;
use App\Models\Applications;
use App\Models\ApplicationHistory;
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
            if (Auth::check()) {
                $profileComplete = $this->checkProfileComplete(Auth::user());
            } else {
                $profileComplete = ['is_complete' => false, 'message' => 'User belum login'];
            }

            // Get companies data
            $companies = \App\Models\Company::select('id', 'name', 'description')->get();

            // Get footer companies
            $footerCompanies = \App\Models\Company::select('id', 'name')->get();

            // Get contact data
            $contacts = \App\Models\Contacts::first();

            Log::info('Jobs data loaded successfully', [
                'job_count' => count($formattedJobs),
                'recommendation_count' => count($recommendations)
            ]);

            return Inertia::render('candidate/jobs/job-hiring', [
                'jobs' => $formattedJobs,
                'recommendations' => $recommendations,
                'companies' => $companies,
                'footerCompanies' => $footerCompanies,
                'contacts' => $contacts,
                'candidateMajor' => $candidateMajor
            ]);

        } catch (\Exception $e) {
            Log::error('Error in job-hiring: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return back()->with('error', 'Terjadi kesalahan saat memuat lowongan pekerjaan. Silakan coba lagi.');
        }
    }

    /**
     * Handle job application
     */
    public function apply($id)
    {
        try {
            Log::info('Starting apply process', ['vacancy_id' => $id, 'user_id' => Auth::id()]);

            // Verifikasi bahwa vacancy masih tersedia
            $vacancy = Vacancies::findOrFail($id);
            Log::info('Vacancy found', ['vacancy_title' => $vacancy->title]);

            // Verifikasi user sudah login
            $user = Auth::user();
            if (!$user) {
                Log::warning('User not authenticated');
                return redirect('/login')->with('flash', [
                    'type' => 'error',
                    'message' => 'Anda harus login terlebih dahulu.'
                ]);
            }

            Log::info('User authenticated', ['user_id' => $user->id]);

            // Cek kelengkapan profil
            $profileCheck = $this->checkProfileComplete($user);
            Log::info('Profile check result', $profileCheck);

            if (!$profileCheck['is_complete']) {
                Log::warning('Profile incomplete', ['message' => $profileCheck['message']]);
                return redirect("/candidate/confirm-data/{$id}")->with('flash', [
                    'type' => 'warning',
                    'message' => $profileCheck['message']
                ]);
            }

            // Cek apakah vacancy memiliki periode yang valid
            $currentVacancyPeriod = DB::table('vacancy_periods')
                ->join('periods', 'vacancy_periods.period_id', '=', 'periods.id')
                ->where('vacancy_periods.vacancy_id', $id)
                ->where('periods.start_time', '<=', now())
                ->where('periods.end_time', '>=', now())
                ->select(
                    'vacancy_periods.id as vacancy_period_id',
                    'vacancy_periods.period_id',
                    'periods.name as period_name',
                    'periods.start_time',
                    'periods.end_time'
                )
                ->first();

            if (!$currentVacancyPeriod) {
                // Cek apakah ada periode yang akan datang
                $futurePeriod = DB::table('vacancy_periods')
                    ->join('periods', 'vacancy_periods.period_id', '=', 'periods.id')
                    ->where('vacancy_periods.vacancy_id', $id)
                    ->where('periods.start_time', '>', now())
                    ->orderBy('periods.start_time', 'asc')
                    ->select('periods.start_time', 'periods.name')
                    ->first();

                $message = $futurePeriod
                    ? "Periode perekrutan untuk lowongan ini belum dimulai. Periode {$futurePeriod->name} akan dimulai pada " . date('d M Y H:i', strtotime($futurePeriod->start_time))
                    : 'Periode perekrutan untuk lowongan ini tidak aktif atau telah berakhir.';

                Log::warning('No active period found for vacancy', [
                    'vacancy_id' => $id,
                    'future_period' => $futurePeriod
                ]);

                return redirect()->back()->with('flash', [
                    'type' => 'error',
                    'message' => $message
                ]);
            }

            Log::info('Active period found', [
                'vacancy_period_id' => $currentVacancyPeriod->vacancy_period_id,
                'period_id' => $currentVacancyPeriod->period_id,
                'period_name' => $currentVacancyPeriod->period_name
            ]);

            // HAPUS VALIDASI PERIODE REGISTRASI - Biarkan semua user apply ke periode aktif
            Log::info('Allowing application to active period regardless of registration date', [
                'user_registration' => $user->created_at,
                'period_start' => $currentVacancyPeriod->start_time,
                'period_name' => $currentVacancyPeriod->period_name
            ]);

            // VALIDASI: Cek apakah candidate sudah pernah apply di periode yang sama (untuk lowongan apapun)
            $samePeriodsVacancyIds = DB::table('vacancy_periods')
                ->where('period_id', $currentVacancyPeriod->period_id)
                ->pluck('id')
                ->toArray();

            // Cek apakah user sudah pernah apply ke salah satu vacancy di periode yang sama
            $existingApplicationInPeriod = Applications::where('user_id', $user->id)
                ->whereIn('vacancy_period_id', $samePeriodsVacancyIds)
                ->with('vacancyPeriod.vacancy:id,title')
                ->first();

            if ($existingApplicationInPeriod) {
                $appliedVacancy = $existingApplicationInPeriod->vacancyPeriod->vacancy;

                if ($appliedVacancy->id == $id) {
                    // Sudah apply ke lowongan yang sama
                    Log::warning('User already applied to this vacancy', ['application_id' => $existingApplicationInPeriod->id]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Anda sudah pernah melamar lowongan pekerjaan ini sebelumnya.',
                        'redirect' => '/candidate/application-history'
                    ], 422);
                } else {
                    // Sudah apply ke lowongan lain di periode yang sama
                    Log::warning('User already applied to another vacancy in the same period', [
                        'existing_application_id' => $existingApplicationInPeriod->id,
                        'existing_vacancy_title' => $appliedVacancy->title,
                        'current_vacancy_id' => $id,
                        'period_name' => $currentVacancyPeriod->period_name
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => "Anda sudah pernah melamar lowongan '{$appliedVacancy->title}' pada periode {$currentVacancyPeriod->period_name}. Setiap kandidat hanya dapat melamar satu lowongan per periode rekrutmen.",
                        'redirect' => '/candidate/application-history'
                    ], 422);
                }
            }

            // VALIDASI JENJANG PENDIDIKAN: Cek apakah jenjang pendidikan candidate memenuhi syarat
            $educationValidation = $this->validateCandidateEducation($user, $vacancy);
            if (!$educationValidation['is_valid']) {
                Log::warning('Candidate education does not meet requirements', [
                    'user_id' => $user->id,
                    'vacancy_id' => $id,
                    'candidate_education' => $educationValidation['candidate_education'],
                    'required_education' => $educationValidation['required_education']
                ]);
                return response()->json([
                    'success' => false,
                    'message' => $educationValidation['message'],
                    'redirect' => '/candidate/application-history'
                ], 422);
            }

            // Ambil data status dari tabel statuses
            $status = DB::table('statuses')->where('name', 'Administrative Selection')->first();
            if (!$status) {
                Log::error('Administrative Selection status not found');
                return response()->json([
                    'success' => false,
                    'message' => 'Sistem rekrutmen belum siap. Silakan coba lagi nanti.'
                ], 500);
            }

            Log::info('Status found', ['status_id' => $status->id]);

            // Simpan data aplikasi baru
            DB::beginTransaction();
            try {
                // Buat aplikasi baru menggunakan vacancy_period_id
                $application = Applications::create([
                    'user_id' => $user->id,
                    'vacancy_period_id' => $currentVacancyPeriod->vacancy_period_id,
                    'status_id' => $status->id,
                ]);

                Log::info('Application created', ['application_id' => $application->id]);

                // Buat entry pertama di application_history untuk tracking
                ApplicationHistory::create([
                    'application_id' => $application->id,
                    'status_id' => $status->id,
                    'processed_at' => now(),
                    'is_active' => true,
                    'notes' => "Lamaran dikirim pada " . now()->format('d M Y H:i') . " untuk periode {$currentVacancyPeriod->period_name}",
                ]);

                Log::info('Application history created');

                DB::commit();

                Log::info('Application created successfully', [
                    'user_id' => $user->id,
                    'vacancy_id' => $id,
                    'vacancy_period_id' => $currentVacancyPeriod->vacancy_period_id,
                    'period_name' => $currentVacancyPeriod->period_name
                ]);

                return response()->json([
                    'success' => true,
                    'message' => "Lamaran berhasil dikirim untuk periode {$currentVacancyPeriod->period_name}! Anda dapat melihat status lamaran pada menu \"Lamaran\".",
                    'redirect' => '/candidate/application-history'
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error saat menyimpan aplikasi: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat mengirim lamaran. Silakan coba lagi.'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error saat apply lowongan: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem. Silakan coba lagi.'
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
            $education = CandidatesEducations::with('educationLevel')
                ->where('user_id', Auth::id())
                ->first();

            if ($education) {
                $userMajor = $education->major_id;
                $userEducation = $education->educationLevel ? $education->educationLevel->name : null;

                // Check major match
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
                        // Try to extract from requirements text - IMPROVED LOGIC (consistent with validateCandidateEducation)
                        foreach ($requirements as $req) {
                            if (is_string($req)) {
                                // Check for various education patterns
                                if (stripos($req, 'S3') !== false || stripos($req, 'Doktor') !== false) {
                                    $requiredEducation = 'S3';
                                    break;
                                } elseif (stripos($req, 'S2') !== false || stripos($req, 'Magister') !== false || stripos($req, 'Master') !== false) {
                                    $requiredEducation = 'S2';
                                    break;
                                } elseif (stripos($req, 'S1') !== false || stripos($req, 'Sarjana') !== false || stripos($req, 'Lulusan S1') !== false) {
                                    $requiredEducation = 'S1';
                                    break;
                                } elseif (stripos($req, 'D3') !== false || stripos($req, 'Diploma') !== false) {
                                    $requiredEducation = 'D3';
                                    break;
                                } elseif (stripos($req, 'SMA') !== false || stripos($req, 'SMK') !== false) {
                                    $requiredEducation = 'SMA/SMK';
                                    break;
                                }
                            }
                        }
                    }
                }

                // Check education match using the education level name
                if ($userEducation) {
                    $educationMatched = $this->validateEducationLevel($userEducation, $requiredEducation);

                    Log::info('Education check in detail page', [
                        'user_education' => $userEducation,
                        'required_education' => $requiredEducation,
                        'is_matched' => $educationMatched
                    ]);
                }
            }
        }

        // Cek status aplikasi user untuk periode ini
        $applicationStatus = null;
        $canApply = true;
        $applicationMessage = '';

        if (Auth::check()) {
            $applicationStatus = $this->checkApplicationStatus(Auth::id(), $id);
            $canApply = $applicationStatus['can_apply'];
            $applicationMessage = $applicationStatus['message'];

            // Jika bisa apply berdasarkan periode, cek juga validasi pendidikan
            if ($canApply) {
                $user = Auth::user();
                $educationValidation = $this->validateCandidateEducation($user, $vacancy);
                if (!$educationValidation['is_valid']) {
                    $canApply = false;
                    $applicationMessage = $educationValidation['message'];
                }
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
            'educationMatched' => $educationMatched,
            'canApply' => $canApply,
            'applicationMessage' => $applicationMessage
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
            Log::error('Error in job-hiring: ' . $e->getMessage());
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
        Log::info('Validating education level', [
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
        Log::info('Mapped education values', [
            'mapped_candidate' => $mappedCandidate,
            'mapped_required' => $mappedRequired
        ]);

        // If education level not in our defined levels, reject
        if (!isset($educationLevels[$mappedCandidate]) || !isset($educationLevels[$mappedRequired])) {
            Log::warning('Education level not recognized', [
                'candidate_education' => $mappedCandidate,
                'required_education' => $mappedRequired,
                'valid_levels' => array_keys($educationLevels)
            ]);
            return false;
        }

        // Compare education levels
        $result = $educationLevels[$mappedCandidate] >= $educationLevels[$mappedRequired];

        Log::info('Education comparison result', [
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

    // Metode untuk memeriksa kelengkapan profil
    private function checkProfileComplete($user)
    {
        if (!$user) {
            return [
                'is_complete' => false,
                'profile_complete' => false,
                'education_complete' => false,
                'skills_complete' => false,
                'work_experience_complete' => false,
                'organization_complete' => false,
                'achievements_complete' => false,
                'social_media_complete' => false,
                'additional_data_complete' => false,
                'message' => 'User tidak ditemukan.'
            ];
        }

        $profile = \App\Models\CandidatesProfiles::where('user_id', $user->id)->first();

        // Cek data pribadi
        $profileComplete = false;
        if (
            $profile &&
            !empty($user->name) &&
            !empty($user->email) &&
            !empty($profile->phone_number) &&
            !empty($profile->address)
        ) {
            $profileComplete = true;
        }

        // Cek pendidikan
        $education = CandidatesEducations::where('user_id', $user->id)->first();
        $educationComplete = false;
        if (
            $education &&
            !empty($education->institution_name) &&
            !empty($education->major_id) &&
            !empty($education->year_out)
        ) {
            $educationComplete = true;
        }

        // Cek skills/kemampuan (anggap lengkap jika profil dan pendidikan lengkap)
        $skillsComplete = $profileComplete && $educationComplete;

        // Cek pengalaman kerja (opsional)
        $workExperienceComplete = true;

        // Cek organisasi (opsional)
        $organizationComplete = true;

        // Cek prestasi (opsional)
        $achievementsComplete = true;

        // Cek social media (opsional)
        $socialMediaComplete = true;

        // Cek data tambahan (opsional)
        $additionalDataComplete = true;

        // Wajib: profile dan education harus lengkap
        $isComplete = $profileComplete && $educationComplete && $skillsComplete;

        $message = $isComplete ?
            'Data profil lengkap.' :
            'Harap lengkapi profil Anda terlebih dahulu untuk melamar pekerjaan.';

        // Log profile completeness for debugging
        Log::info('Profile completeness check result', [
            'user_id' => $user->id,
            'is_complete' => $isComplete,
            'profile' => $profileComplete,
            'education' => $educationComplete,
            'skills' => $skillsComplete,
        ]);

        return [
            'is_complete' => $isComplete,
            'profile_complete' => $profileComplete,
            'education_complete' => $educationComplete,
            'skills_complete' => $skillsComplete,
            'work_experience_complete' => $workExperienceComplete,
            'organization_complete' => $organizationComplete,
            'achievements_complete' => $achievementsComplete,
            'social_media_complete' => $socialMediaComplete,
            'additional_data_complete' => $additionalDataComplete,
            'message' => $message,
            'overall_complete' => $isComplete // added for consistency with frontend
        ];
    }

    /**
     * Halaman konfirmasi data sebelum melamar
     *
     * @param string|null $job_id
     * @return \Inertia\Response
     */
    public function confirmData($job_id = null)
    {
        // Verifikasi user sudah login
        $user = Auth::user();
        if (!$user) {
            // For AJAX requests, return JSON response
            if (request()->ajax() || request()->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Silakan login terlebih dahulu',
                    'redirect' => '/login'
                ], 401);
            }

            // For regular requests, render confirm data page with error
            return \Inertia\Inertia::render('candidate/confirm-data', [
                'error' => 'Silakan login terlebih dahulu',
                'completeness' => [
                    'profile' => false,
                    'education' => false,
                    'skills' => false,
                    'work_experience' => false,
                    'organization' => false,
                    'achievements' => false,
                    'social_media' => false,
                    'additional_data' => false,
                    'overall_complete' => false
                ]
            ]);
        }

        // Cek kelengkapan profil
        $profileCheck = $this->checkProfileComplete($user);

        // Jika job_id ada, verifikasi lowongan ada
        $vacancyExists = false;
        if ($job_id) {
            $vacancy = Vacancies::find($job_id);
            if ($vacancy) {
                $vacancyExists = true;
            }
        }

        return Inertia::render('candidate/confirm-data', [
            'completeness' => [
                'profile' => $profileCheck['profile_complete'] ?? false,
                'education' => $profileCheck['education_complete'] ?? false,
                'skills' => $profileCheck['skills_complete'] ?? false,
                'work_experience' => $profileCheck['work_experience_complete'] ?? false,
                'organization' => $profileCheck['organization_complete'] ?? false,
                'achievements' => $profileCheck['achievements_complete'] ?? false,
                'social_media' => $profileCheck['social_media_complete'] ?? false,
                'additional_data' => $profileCheck['additional_data_complete'] ?? false,
                'overall_complete' => $profileCheck['is_complete'] ?? false,
            ],
            'job_id' => $vacancyExists ? $job_id : null
        ]);
    }

    /**
     * Endpoint JSON untuk memeriksa kelengkapan profil
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkProfileCompleteEndpoint()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'isComplete' => false,
                'message' => 'User tidak ditemukan'
            ]);
        }

        $profileCheck = $this->checkProfileComplete($user);

        return response()->json([
            'isComplete' => $profileCheck['is_complete'],
            'overall_complete' => $profileCheck['is_complete'],
            'profile' => $profileCheck['profile_complete'],
            'education' => $profileCheck['education_complete'],
            'skills' => $profileCheck['skills_complete'],
            'work_experience' => $profileCheck['work_experience_complete'],
            'organization' => $profileCheck['organization_complete'],
            'achievements' => $profileCheck['achievements_complete'],
            'social_media' => $profileCheck['social_media_complete'],
            'additional_data' => $profileCheck['additional_data_complete'],
            'message' => $profileCheck['message']
        ]);
    }

    /**
     * Handle job application dari halaman detail pekerjaan
     */
    public function applyJob($id)
    {
        try {
            $user = Auth::user();
            // Validasi vacancy exists
            $vacancy = Vacancies::findOrFail($id);

            // Cek apakah user sudah pernah apply
            $existingApplication = Applications::where('user_id', $user->id)
                ->where('vacancies_id', $id)
                ->first();

            if ($existingApplication) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah melamar pekerjaan ini',
                    'redirect' => '/candidate/application-history'
                ]);
            }

            // VALIDASI JENJANG PENDIDIKAN: Cek apakah jenjang pendidikan candidate memenuhi syarat
            $educationValidation = $this->validateCandidateEducation($user, $vacancy);
            if (!$educationValidation['is_valid']) {
                Log::warning('Candidate education does not meet requirements in applyJob', [
                    'user_id' => $user->id,
                    'vacancy_id' => $id,
                    'candidate_education' => $educationValidation['candidate_education'],
                    'required_education' => $educationValidation['required_education']
                ]);
                return response()->json([
                    'success' => false,
                    'message' => $educationValidation['message'],
                    'redirect' => '/candidate/application-history'
                ], 422);
            }

            // Cek kelengkapan data profil secara langsung
            $candidateController = new CandidateController();
            $completenessResponse = $candidateController->checkApplicationDataCompleteness();
            $completenessData = json_decode($completenessResponse->getContent(), true);

            // Jika data sudah lengkap, langsung proses aplikasi
            if ($completenessData['success'] && $completenessData['completeness']['overall_complete']) {
                return $this->processJobApplication($id);
            }

            // Jika data belum lengkap, redirect ke halaman confirm-data
            return redirect("/candidate/confirm-data/{$id}")->with('flash', [
                'type' => 'warning',
                'message' => 'Harap lengkapi data profil Anda terlebih dahulu'
            ]);

        } catch (\Exception $e) {
            Log::error('Error in applyJob: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Proses aplikasi pekerjaan setelah data lengkap
     */
    public function processJobApplication($id)
    {
        try {
            $user = Auth::user();
            $vacancy = Vacancies::findOrFail($id);

            // VALIDASI JENJANG PENDIDIKAN: Double check sebelum proses aplikasi final
            $educationValidation = $this->validateCandidateEducation($user, $vacancy);
            if (!$educationValidation['is_valid']) {
                Log::warning('Candidate education validation failed in processJobApplication', [
                    'user_id' => $user->id,
                    'vacancy_id' => $id,
                    'candidate_education' => $educationValidation['candidate_education'],
                    'required_education' => $educationValidation['required_education']
                ]);
                return response()->json([
                    'success' => false,
                    'message' => $educationValidation['message'],
                    'redirect' => '/candidate/application-history'
                ], 422);
            }

            DB::beginTransaction();

            // Get first status (biasanya Administratif)
            $status = DB::table('statuses')
                ->where('name', 'like', '%Administratif%')
                ->orWhere('name', 'like', '%Admin%')
                ->first();

            if (!$status) {
                $status = DB::table('statuses')->first(); // Ambil status pertama
            }

            // Buat aplikasi baru
            $application = Applications::create([
                'user_id' => $user->id,
                'vacancies_id' => $id,
                'status_id' => $status->id,
            ]);

            // Buat history aplikasi
            DB::table('application_history')->insert([
                'application_id' => $application->id,
                'status_id' => $status->id,
                'processed_at' => now(),
                'is_active' => true,
                'notes' => 'Lamaran dikirim pada ' . now()->format('d M Y H:i'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            // Return Inertia redirect with flash message
            return redirect('/candidate/application-history')->with('flash', [
                'type' => 'success',
                'message' => 'Lamaran berhasil dikirim untuk periode Q3 2025 Recruitment! Anda dapat melihat status lamaran pada menu "Lamaran".'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in processJobApplication: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate candidate education level against vacancy requirements
     */
    private function validateCandidateEducation($user, $vacancy)
    {
        try {
            // Get candidate's education with educationLevel relation
            $education = CandidatesEducations::with('educationLevel')
                ->where('user_id', $user->id)
                ->first();

            if (!$education) {
                return [
                    'is_valid' => false,
                    'message' => 'Data pendidikan tidak ditemukan. Harap lengkapi data pendidikan Anda terlebih dahulu.',
                    'candidate_education' => null,
                    'required_education' => null
                ];
            }

            // Get vacancy's required education level with relation
            $requiredEducationLevel = $vacancy->educationLevel;

            if (!$requiredEducationLevel) {
                return [
                    'is_valid' => false,
                    'message' => 'Persyaratan pendidikan untuk lowongan ini tidak valid.',
                    'candidate_education' => $education->educationLevel->name ?? null,
                    'required_education' => null
                ];
            }

            // Define education hierarchy (from lowest to highest)
            $educationLevels = [
                'SMA/SMK' => 1,
                'SMA' => 1,
                'SMK' => 1,
                'D3' => 2,
                'S1' => 3,
                'S2' => 4,
                'S3' => 5
            ];

            $candidateEducationName = $education->educationLevel->name;
            $requiredEducationName = $requiredEducationLevel->name;

            // Normalize education names
            $normalizedCandidate = $candidateEducationName;
            $normalizedRequired = $requiredEducationName;

            // Handle SMA/SMK variations
            if ($candidateEducationName === 'SMA' || $candidateEducationName === 'SMK') {
                $normalizedCandidate = 'SMA/SMK';
            }
            if ($requiredEducationName === 'SMA' || $requiredEducationName === 'SMK') {
                $normalizedRequired = 'SMA/SMK';
            }

            // Check if education levels exist in our hierarchy
            if (!isset($educationLevels[$normalizedCandidate])) {
                Log::error('Unknown candidate education level', [
                    'candidate_education' => $candidateEducationName,
                    'normalized' => $normalizedCandidate
                ]);
                return [
                    'is_valid' => false,
                    'message' => "Jenjang pendidikan kandidat ({$candidateEducationName}) tidak dikenali.",
                    'candidate_education' => $candidateEducationName,
                    'required_education' => $requiredEducationName
                ];
            }

            if (!isset($educationLevels[$normalizedRequired])) {
                Log::error('Unknown required education level', [
                    'required_education' => $requiredEducationName,
                    'normalized' => $normalizedRequired
                ]);
                return [
                    'is_valid' => false,
                    'message' => "Persyaratan pendidikan ({$requiredEducationName}) tidak dikenali.",
                    'candidate_education' => $candidateEducationName,
                    'required_education' => $requiredEducationName
                ];
            }

            // Compare education levels using the hierarchy
            $isValid = $educationLevels[$normalizedCandidate] >= $educationLevels[$normalizedRequired];

            $message = $isValid
                ? 'Jenjang pendidikan memenuhi syarat.'
                : "Jenjang pendidikan Anda ({$candidateEducationName}) tidak memenuhi persyaratan minimal ({$requiredEducationName}) untuk lowongan ini.";

            Log::info('Education validation result', [
                'user_id' => $user->id,
                'candidate_education_id' => $education->education_level_id,
                'required_education_id' => $vacancy->education_level_id,
                'candidate_education_name' => $candidateEducationName,
                'required_education_name' => $requiredEducationName,
                'normalized_candidate' => $normalizedCandidate,
                'normalized_required' => $normalizedRequired,
                'candidate_level' => $educationLevels[$normalizedCandidate],
                'required_level' => $educationLevels[$normalizedRequired],
                'is_valid' => $isValid
            ]);

            return [
                'is_valid' => $isValid,
                'message' => $message,
                'candidate_education' => $candidateEducationName,
                'required_education' => $requiredEducationName
            ];

        } catch (\Exception $e) {
            Log::error('Error validating candidate education: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'vacancy_id' => $vacancy->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'is_valid' => false,
                'message' => 'Terjadi kesalahan saat memvalidasi jenjang pendidikan.',
                'candidate_education' => null,
                'required_education' => null
            ];
        }
    }

    /**
     * Check application status for a user and vacancy
     */
    private function checkApplicationStatus($userId, $vacancyId)
    {
        try {
            // Debug log
            Log::info('Checking application status', [
                'user_id' => $userId,
                'vacancy_id' => $vacancyId
            ]);

            // 1. Cek periode aktif untuk lowongan
            $currentVacancyPeriod = DB::table('vacancy_periods')
                ->join('periods', 'vacancy_periods.period_id', '=', 'periods.id')
                ->where('vacancy_periods.vacancy_id', $vacancyId)
                ->where('periods.start_time', '<=', now())
                ->where('periods.end_time', '>=', now())
                ->select(
                    'vacancy_periods.id as vacancy_period_id',
                    'periods.id as period_id',
                    'periods.name as period_name',
                    'periods.start_time',
                    'periods.end_time'
                )
                ->first();

            if (!$currentVacancyPeriod) {
                // Cek apakah ada periode yang akan datang
                $futurePeriod = DB::table('vacancy_periods')
                    ->join('periods', 'vacancy_periods.period_id', '=', 'periods.id')
                    ->where('vacancy_periods.vacancy_id', $vacancyId)
                    ->where('periods.start_time', '>', now())
                    ->orderBy('periods.start_time', 'asc')
                    ->select('periods.start_time', 'periods.name')
                    ->first();

                $message = $futurePeriod
                    ? "Periode perekrutan untuk lowongan ini belum dimulai. Periode {$futurePeriod->name} akan dimulai pada " . date('d M Y H:i', strtotime($futurePeriod->start_time))
                    : 'Periode perekrutan untuk lowongan ini tidak aktif atau telah berakhir.';

                Log::warning('No active period found', [
                    'vacancy_id' => $vacancyId,
                    'future_period' => $futurePeriod
                ]);

                return [
                    'can_apply' => false,
                    'message' => $message,
                    'status' => 'inactive_period'
                ];
            }

            // 2. LOGIC BARU: Cek apakah user dapat apply berdasarkan periode registrasi
            $user = \App\Models\User::find($userId);
            if ($user) {
                $userRegistrationDate = $user->created_at;
                $periodStartDate = $currentVacancyPeriod->start_time;

                // Tentukan periode registrasi user berdasarkan tanggal daftar
                $userRegistrationPeriod = DB::table('periods')
                    ->where('start_time', '<=', $userRegistrationDate)
                    ->where('end_time', '>=', $userRegistrationDate)
                    ->first();

                Log::info('User and period analysis', [
                    'user_registration' => $userRegistrationDate,
                    'current_period_start' => $periodStartDate,
                    'current_period_id' => $currentVacancyPeriod->period_id,
                    'current_period_name' => $currentVacancyPeriod->period_name,
                    'user_registration_period' => $userRegistrationPeriod ? $userRegistrationPeriod->id : 'no_period_found'
                ]);

                // RULE BARU:
                // 1. User yang mendaftar di periode yang sama atau setelahnya bisa apply
                // 2. User yang mendaftar sebelum periode dimulai juga bisa apply
                // 3. Hanya blokir jika user mendaftar di periode yang lebih lama dan sudah lewat

                if ($userRegistrationPeriod) {
                    // Jika user mendaftar di periode yang sama dengan lowongan, boleh apply
                    if ($userRegistrationPeriod->id == $currentVacancyPeriod->period_id) {
                        Log::info('User registered in same period as vacancy - allowing application');
                      }
                    // Jika user mendaftar di periode setelah periode lowongan, boleh apply
                    else if ($userRegistrationPeriod->id > $currentVacancyPeriod->period_id) {
                        Log::info('User registered in later period - allowing application');
                    }
                    // Jika user mendaftar di periode sebelum periode lowongan, boleh apply
                    else if ($userRegistrationPeriod->id < $currentVacancyPeriod->period_id) {
                        Log::info('User registered in earlier period - allowing application');
                    }
                } else {
                    // Jika tidak ada periode yang cocok dengan tanggal registrasi user
                    // Cek apakah user mendaftar sebelum periode pertama atau setelah periode terakhir
                    $firstPeriod = DB::table('periods')->orderBy('start_time', 'asc')->first();
                    $lastPeriod = DB::table('periods')->orderBy('end_time', 'desc')->first();

                    if ($userRegistrationDate < $firstPeriod->start_time) {
                        Log::info('User registered before any period - allowing application');
                    } else if ($userRegistrationDate > $lastPeriod->end_time) {
                        Log::info('User registered after all periods - allowing application to current period');
                    } else {
                        // User mendaftar di gap antar periode - tetap boleh apply
                        Log::info('User registered in gap between periods - allowing application');
                    }
                }

                // Log untuk debugging
                Log::info('User registration validation passed', [
                    'user_registration' => $userRegistrationDate,
                    'period_start' => $periodStartDate,
                    'period_name' => $currentVacancyPeriod->period_name,
                    'can_apply_based_on_registration' => true
                ]);
            }

            // 3. Cek existing application dengan query yang lebih spesifik
            $existingApplication = DB::table('applications')
                ->join('vacancy_periods', 'applications.vacancy_period_id', '=', 'vacancy_periods.id')
                ->join('vacancies', 'vacancy_periods.vacancy_id', '=', 'vacancies.id')
                ->where('applications.user_id', $userId)
                ->where('vacancy_periods.period_id', $currentVacancyPeriod->period_id)
                ->select(
                    'applications.id',
                    'vacancies.id as vacancy_id',
                    'vacancies.title'
                )
                ->first();

            // Debug log untuk existing application
            Log::info('Existing application check result', [
                'existing_application' => $existingApplication,
                'current_period_id' => $currentVacancyPeriod->period_id,
                'period_name' => $currentVacancyPeriod->period_name
            ]);

            if ($existingApplication) {
                $message = $existingApplication->vacancy_id == $vacancyId
                    ? 'Anda sudah melamar untuk lowongan ini.'
                    : "Anda sudah melamar untuk lowongan '{$existingApplication->title}' pada periode {$currentVacancyPeriod->period_name}. Setiap kandidat hanya dapat melamar satu lowongan per periode rekrutmen.";

                return [
                    'can_apply' => false,
                    'message' => $message,
                    'status' => 'already_applied',
                    'existing_application' => [
                        'id' => $existingApplication->id,
                        'vacancy_title' => $existingApplication->title
                    ]
                ];
            }

            // 4. Jika semua validasi lolos
            return [
                'can_apply' => true,
                'message' => "Anda dapat melamar lowongan ini untuk periode {$currentVacancyPeriod->period_name}.",
                'status' => 'can_apply',
                'vacancy_period_id' => $currentVacancyPeriod->vacancy_period_id,
                'period_name' => $currentVacancyPeriod->period_name
            ];

        } catch (\Exception $e) {
            Log::error('Error checking application status: ' . $e->getMessage(), [
                'user_id' => $userId,
                'vacancy_id' => $vacancyId,
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'can_apply' => false,
                'message' => 'Terjadi kesalahan saat memeriksa status lamaran.',
                'status' => 'error'
            ];
        }
    }
}
