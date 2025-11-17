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
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class JobsController extends Controller
{
    public function index()
    {
        try {
            // Ambil semua lowongan aktif dengan relasi
            $jobs = Vacancies::with(['company', 'department', 'vacancyType', 'major', 'majors'])
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

                // Get major names (support multiple majors)
                $majorName = null;
                $majorNames = [];
                $majorIds = [];
                
                // Get majors from many-to-many relationship
                if ($job->majors && $job->majors->isNotEmpty()) {
                    $majorNames = $job->majors->pluck('name')->toArray();
                    $majorIds = $job->majors->pluck('id')->toArray();
                    $majorName = implode(', ', $majorNames); // For backward compatibility
                } elseif ($job->major_id) {
                    // Fallback to single major_id for backward compatibility
                    $major = MasterMajor::find($job->major_id);
                    $majorName = $major ? $major->name : null;
                    if ($majorName) {
                        $majorNames = [$majorName];
                        $majorIds = [$job->major_id];
                    }
                }

                // Format requirements and benefits with improved parsing
                $requirements = $this->parseJobData($job->requirements);
                $benefits = $this->parseJobData($job->benefits);

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
                    'major_id' => $job->major_id, // For backward compatibility
                    'major_name' => $majorName, // For backward compatibility (comma-separated if multiple)
                    'major_names' => $majorNames, // Array of major names
                    'major_ids' => $majorIds, // Array of major IDs
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

                    // Filter lowongan yang sesuai dengan jurusan user (check against all majors)
                    $matchedJobs = $formattedJobs->filter(function($job) use ($userMajorId) {
                        // Check if user's major matches any of the vacancy's majors
                        if (isset($job['major_ids']) && is_array($job['major_ids'])) {
                            return in_array($userMajorId, $job['major_ids']);
                        }
                        // Fallback to single major_id for backward compatibility
                        return isset($job['major_id']) && $job['major_id'] == $userMajorId;
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

            return Inertia::render('candidate/jobs/job-hiring', [
                'jobs' => $formattedJobs,
                'recommendations' => $recommendations,
                'companies' => $companies,
                'footerCompanies' => $footerCompanies,
                'contacts' => $contacts,
                'candidateMajor' => $candidateMajor
            ]);

        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan saat memuat lowongan pekerjaan. Silakan coba lagi.');
        }
    }

    /**
     * Handle job application
     */
    public function apply($id)
    {
        try {
            // Verifikasi bahwa vacancy masih tersedia
            $vacancy = Vacancies::findOrFail($id);

            // Verifikasi user sudah login
            $user = Auth::user();
            if (!$user) {
                return redirect('/login')->with('flash', [
                    'type' => 'error',
                    'message' => 'Anda harus login terlebih dahulu.'
                ]);
            }

            // Cek kelengkapan profil
            $profileCheck = $this->checkProfileComplete($user);

            if (!$profileCheck['is_complete']) {
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

                return redirect()->back()->with('flash', [
                    'type' => 'error',
                    'message' => $message
                ]);
            }

            // HAPUS VALIDASI PERIODE REGISTRASI - Biarkan semua user apply ke periode aktif
            // VALIDASI: Cek apakah candidate sudah pernah apply di periode yang sama (untuk lowongan apapun)
            $samePeriodsVacancyIds = DB::table('vacancy_periods')
                ->where('period_id', $currentVacancyPeriod->period_id)
                ->pluck('id')
                ->toArray();

            // Cek apakah user sudah pernah apply ke lowongan yang sama (termasuk yang di-reject)
            $existingApplicationToSameVacancy = Applications::where('user_id', $user->id)
                ->where('vacancy_period_id', $currentVacancyPeriod->vacancy_period_id)
                ->with(['status'])
                ->first();

            if ($existingApplicationToSameVacancy) {
                $applicationStatus = $existingApplicationToSameVacancy->status;
                return redirect()->back()->with('error', 'Anda sudah pernah melamar lowongan pekerjaan ini sebelumnya.');
            }

            // Cek apakah user sudah pernah apply ke salah satu vacancy di periode yang sama
            // TAPI hanya yang belum di-reject
            $existingApplicationInPeriod = Applications::where('user_id', $user->id)
                ->whereIn('vacancy_period_id', $samePeriodsVacancyIds)
                ->with(['vacancyPeriod.vacancy:id,title', 'status'])
                ->whereHas('status', function($query) {
                    $query->where('stage', '!=', \App\Enums\CandidatesStage::REJECTED->value);
                })
                ->first();

            if ($existingApplicationInPeriod) {
                $appliedVacancy = $existingApplicationInPeriod->vacancyPeriod->vacancy;
                $applicationStatus = $existingApplicationInPeriod->status;

                // This check is now handled above, so we can remove this condition
                // and just handle the case where they applied to a different vacancy in the same period
                // Sudah apply ke lowongan lain di periode yang sama
                return redirect()->back()->with('error', "Anda sudah pernah melamar lowongan '{$appliedVacancy->title}' pada periode {$currentVacancyPeriod->period_name}. Setiap kandidat hanya dapat melamar satu lowongan per periode rekrutmen.");
            }

            // VALIDASI JENJANG PENDIDIKAN: Cek apakah jenjang pendidikan candidate memenuhi syarat
            $educationValidation = $this->validateCandidateEducation($user, $vacancy);
            if (!$educationValidation['is_valid']) {
                return redirect()->back()->with('error', $educationValidation['message']);
            }

            // Ambil data status dari tabel statuses
            $status = DB::table('statuses')->where('name', 'Administrative Selection')->first();
            if (!$status) {
                return redirect()->back()->with('error', 'Sistem rekrutmen belum siap. Silakan coba lagi nanti.');
            }

            // Simpan data aplikasi baru
            DB::beginTransaction();
            try {
                // Buat aplikasi baru menggunakan vacancy_period_id
                $application = Applications::create([
                    'user_id' => $user->id,
                    'vacancy_period_id' => $currentVacancyPeriod->vacancy_period_id,
                    'status_id' => $status->id,
                ]);

                // Buat entry pertama di application_history untuk tracking
                ApplicationHistory::create([
                    'application_id' => $application->id,
                    'status_id' => $status->id,
                    'processed_at' => now(),
                    'is_active' => true,
                    'notes' => "Lamaran dikirim pada " . now()->format('d M Y H:i') . " untuk periode {$currentVacancyPeriod->period_name}",
                ]);

                DB::commit();

                return redirect('/candidate/application-history')->with('success', "Lamaran berhasil dikirim untuk periode {$currentVacancyPeriod->period_name}! Anda dapat melihat status lamaran pada menu \"Lamaran\".");

            } catch (\Exception $e) {
                DB::rollBack();
                return redirect()->back()->with('error', 'Terjadi kesalahan saat mengirim lamaran. Silakan coba lagi.');
            }

        } catch (\Exception $e) {

            return redirect()->back()->with('error', 'Terjadi kesalahan sistem. Silakan coba lagi.');
        }
    }

    public function show()
    {
        return Inertia::render('candidate/chats/candidate-chat');
    }

    public function detail($id)
    {
        $vacancy = Vacancies::with('company')->findOrFail($id);

        // Mengambil informasi major (support multiple majors)
        $majorName = null;
        $majorNames = [];
        
        // Get majors from many-to-many relationship
        $vacancyMajors = $vacancy->majors()->get();
        if ($vacancyMajors->isNotEmpty()) {
            $majorNames = $vacancyMajors->pluck('name')->toArray();
            $majorName = implode(', ', $majorNames); // For backward compatibility
        } elseif ($vacancy->major_id) {
            // Fallback to single major_id for backward compatibility
            $major = MasterMajor::find($vacancy->major_id);
            $majorName = $major ? $major->name : null;
            if ($majorName) {
                $majorNames = [$majorName];
            }
        }

        // Parse requirements & benefits data with proper handling for nested JSON
        $requirements = $this->parseJobData($vacancy->requirements);
        $benefits = $this->parseJobData($vacancy->benefits);

        // Get user's major if authenticated - check ALL educations
        $userMajor = null;
        $isMajorMatched = false;
        $educationMatched = false;
        $userEducation = null;
        $requiredEducation = 'S1'; // Default for testing

        if (Auth::check()) {
            // Get ALL educations, not just the first one
            $educations = CandidatesEducations::with(['educationLevel', 'major'])
                ->where('user_id', Auth::id())
                ->get();

            // Get vacancy major IDs - use pluck directly from relationship for consistency
            $vacancyMajorIds = [];
            if ($vacancyMajors->isNotEmpty()) {
                $vacancyMajorIds = $vacancyMajors->pluck('id')->toArray();
            } elseif ($vacancy->major_id) {
                $vacancyMajorIds = [$vacancy->major_id];
            }
            
            // Also get from relationship directly as fallback
            if (empty($vacancyMajorIds)) {
                $vacancyMajorsFallback = $vacancy->majors()->get();
                if ($vacancyMajorsFallback->isNotEmpty()) {
                    $vacancyMajorIds = $vacancyMajorsFallback->pluck('id')->toArray();
                } elseif ($vacancy->major_id) {
                    $vacancyMajorIds = [$vacancy->major_id];
                }
            }

            // Check if ANY education has a major that matches vacancy majors
            if ($educations->isNotEmpty() && !empty($vacancyMajorIds)) {
                foreach ($educations as $education) {
                    if ($education->major_id && in_array($education->major_id, $vacancyMajorIds)) {
                        $isMajorMatched = true;
                        $userMajor = $education->major_id; // Use the matched major
                        $userEducation = $education->educationLevel ? $education->educationLevel->name : null;
                        break; // Found a match, no need to continue
                    }
                }
                
                // If no match found yet, use the first education for display purposes
                if (!$isMajorMatched && $educations->isNotEmpty()) {
                    $firstEducation = $educations->first();
                    $userMajor = $firstEducation->major_id;
                    $userEducation = $firstEducation->educationLevel ? $firstEducation->educationLevel->name : null;
                }
            } elseif ($educations->isNotEmpty()) {
                // No major requirement, just use first education for display
                $firstEducation = $educations->first();
                $userMajor = $firstEducation->major_id;
                $userEducation = $firstEducation->educationLevel ? $firstEducation->educationLevel->name : null;
                $isMajorMatched = true; // No major requirement means it's always matched
            }

            if ($educations->isNotEmpty()) {

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
                'major_id' => $vacancy->major_id, // For backward compatibility
                'major_name' => $majorName, // For backward compatibility (comma-separated if multiple)
                'major_names' => $majorNames, // Array of major names
                'major_ids' => $vacancyMajors->isNotEmpty() 
                    ? $vacancyMajors->pluck('id')->toArray() 
                    : ($vacancy->major_id ? [$vacancy->major_id] : []), // Array of major IDs
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
            $jobs = Vacancies::with(['company', 'department', 'majors'])
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

                    // Filter lowongan yang sesuai dengan jurusan user (check against all majors)
                    $matchedJobs = $jobs->filter(function($job) use ($userMajorId) {
                        // Check if user's major matches any of the vacancy's majors
                        if ($job->majors && $job->majors->isNotEmpty()) {
                            $vacancyMajorIds = $job->majors->pluck('id')->toArray();
                            return in_array($userMajorId, $vacancyMajorIds);
                        }
                        // Fallback to single major_id for backward compatibility
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
            return redirect()->back()->with('error', 'Terjadi kesalahan. Silakan coba lagi.');
        }
    }

    // applicationHistory method has been removed and replaced with a dedicated ApplicationHistoryController

    /**
     * Parse job data that might be stored as nested JSON
     * 
     * @param mixed $data
     * @return array
     */
    private function parseJobData($data)
    {
        if (is_array($data)) {
            // If it's an array with a single JSON string element
            if (count($data) === 1 && is_string($data[0])) {
                $decoded = json_decode($data[0], true);
                return is_array($decoded) ? $decoded : [];
            }
            // If it's already a proper array
            return $data;
        }
        
        if (is_string($data)) {
            $decoded = json_decode($data, true);
            return is_array($decoded) ? $decoded : [];
        }
        
        return [];
    }

    /**
     * Metode untuk memvalidasi jenjang pendidikan kandidat dengan persyaratan lowongan
     *
     * @param string $candidateEducation Jenjang pendidikan kandidat
     * @param string $requiredEducation Jenjang pendidikan minimal yang dibutuhkan
     * @return bool True jika pendidikan kandidat memenuhi syarat, false jika tidak
     */
    private function validateEducationLevel($candidateEducation, $requiredEducation)
    {
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
            'D4' => 5,
            'DIPLOMA 4' => 5,
            'S1' => 6,
            'SARJANA' => 6,
            'S2' => 7,
            'MAGISTER' => 7,
            'S3' => 8,
            'DOKTOR' => 8
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

        // Handle D4 mapping
        if (strpos($candidateEducation, 'D4/S1') !== false || strpos($candidateEducation, 'D-4') !== false || $candidateEducation === 'D4') {
            $mappedCandidate = 'D4/S1';
        }
        if (strpos($requiredEducation, 'D4/S1') !== false || strpos($requiredEducation, 'D-4') !== false || $requiredEducation === 'D4') {
            $mappedRequired = 'D4/S1';
        }

        if (strpos($candidateEducation, 'SARJANA') !== false || strpos($candidateEducation, 'S-1') !== false || $candidateEducation === 'S1') {
            $mappedCandidate = 'S1';
        }
        if (strpos($requiredEducation, 'SARJANA') !== false || strpos($requiredEducation, 'S-1') !== false || $requiredEducation === 'S1') {
            $mappedRequired = 'S1';
        }

        // If education level not in our defined levels, reject
        if (!isset($educationLevels[$mappedCandidate]) || !isset($educationLevels[$mappedRequired])) {
            return false;
        }

        // Compare education levels
        $result = $educationLevels[$mappedCandidate] >= $educationLevels[$mappedRequired];

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
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function confirmData($job_id = null)
    {
        // Verifikasi user sudah login
        $user = Auth::user();
        if (!$user) {
            // Always redirect to login for unauthenticated users
            return redirect('/login')->with('error', 'Silakan login terlebih dahulu');
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

            // Cek apakah user sudah pernah apply (TAPI hanya yang belum di-reject)
            // Pertama, cari vacancy_period_id yang aktif
            $currentVacancyPeriod = DB::table('vacancy_periods')
                ->join('periods', 'vacancy_periods.period_id', '=', 'periods.id')
                ->where('vacancy_periods.vacancy_id', $id)
                ->where('periods.start_time', '<=', now())
                ->where('periods.end_time', '>=', now())
                ->select('vacancy_periods.id as vacancy_period_id')
                ->first();

            if (!$currentVacancyPeriod) {
                return redirect()->back()->with('error', 'Periode perekrutan untuk lowongan ini tidak aktif.');
            }

            $existingApplication = Applications::where('user_id', $user->id)
                ->where('vacancy_period_id', $currentVacancyPeriod->vacancy_period_id)
                ->whereHas('status', function($query) {
                    $query->where('stage', '!=', \App\Enums\CandidatesStage::REJECTED->value);
                })
                ->first();

            if ($existingApplication) {
                return redirect()->back()->with('error', 'Anda sudah melamar pekerjaan ini');
            }

            // VALIDASI JENJANG PENDIDIKAN: Cek apakah jenjang pendidikan candidate memenuhi syarat
            $educationValidation = $this->validateCandidateEducation($user, $vacancy);
            if (!$educationValidation['is_valid']) {
                return redirect()->back()->with('error', $educationValidation['message']);
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
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
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
                return redirect()->back()->with('error', $educationValidation['message']);
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

            // Ambil vacancy_period_id yang aktif
            $currentVacancyPeriod = DB::table('vacancy_periods')
                ->join('periods', 'vacancy_periods.period_id', '=', 'periods.id')
                ->where('vacancy_periods.vacancy_id', $id)
                ->where('periods.start_time', '<=', now())
                ->where('periods.end_time', '>=', now())
                ->select('vacancy_periods.id as vacancy_period_id', 'periods.name as period_name')
                ->first();

            if (!$currentVacancyPeriod) {
                throw new \Exception('Periode perekrutan untuk lowongan ini tidak aktif.');
            }

            // Buat aplikasi baru
            $application = Applications::create([
                'user_id' => $user->id,
                'vacancy_period_id' => $currentVacancyPeriod->vacancy_period_id,
                'status_id' => $status->id,
            ]);

            // Buat history aplikasi
            ApplicationHistory::create([
                'application_id' => $application->id,
                'status_id' => $status->id,
                'processed_at' => now(),
                'is_active' => true,
                'notes' => "Lamaran dikirim pada " . now()->format('d M Y H:i') . " untuk periode {$currentVacancyPeriod->period_name}",
            ]);

            DB::commit();

            // Return Inertia redirect with flash message
            return redirect('/candidate/application-history')->with('flash', [
                'type' => 'success',
                'message' => "Lamaran berhasil dikirim untuk periode {$currentVacancyPeriod->period_name}! Anda dapat melihat status lamaran pada menu \"Lamaran\"."
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Validate candidate education level against vacancy requirements
     */
    private function validateCandidateEducation($user, $vacancy)
    {
        try {
            // Get ALL candidate's educations with educationLevel and major relations
            $educations = CandidatesEducations::with(['educationLevel', 'major'])
                ->where('user_id', $user->id)
                ->get();

            if ($educations->isEmpty()) {
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
                    'candidate_education' => null,
                    'required_education' => null
                ];
            }

            // Get vacancy's required majors (many-to-many)
            $vacancyMajorsCollection = $vacancy->majors()->get();
            $vacancyMajors = $vacancyMajorsCollection->isNotEmpty() 
                ? $vacancyMajorsCollection->pluck('id')->toArray() 
                : [];
            
            // If no majors in many-to-many, check if there's a single major_id (backward compatibility)
            if (empty($vacancyMajors) && $vacancy->major_id) {
                $vacancyMajors = [$vacancy->major_id];
            }

            // Define education hierarchy (from lowest to highest)
            $educationLevels = [
                'SMA/SMK' => 1,
                'SMA' => 1,
                'SMK' => 1,
                'D3' => 2,
                'D4/S1' => 3,
                'S2' => 4,
                'S3' => 5,
            ];

            $requiredEducationName = $requiredEducationLevel->name;
            
            // Normalize required education name
            $normalizedRequired = $requiredEducationName;
            if ($requiredEducationName === 'SMA' || $requiredEducationName === 'SMK') {
                $normalizedRequired = 'SMA/SMK';
            }

            // Check if required education level exists in our hierarchy
            if (!isset($educationLevels[$normalizedRequired])) {
                return [
                    'is_valid' => false,
                    'message' => "Persyaratan pendidikan ({$requiredEducationName}) tidak dikenali.",
                    'candidate_education' => null,
                    'required_education' => $requiredEducationName
                ];
            }

            $requiredLevel = $educationLevels[$normalizedRequired];
            $hasValidEducationLevel = false;
            $hasValidMajor = false;
            $matchedEducation = null;
            $matchedMajor = null;

            // Check ALL educations - find if any education meets the requirements
            // First, check for perfect matches (both education level AND major match)
            foreach ($educations as $education) {
                if (!$education->educationLevel) {
                    continue;
                }

                $candidateEducationName = $education->educationLevel->name;
                
                // Normalize candidate education name
                $normalizedCandidate = $candidateEducationName;
                if ($candidateEducationName === 'SMA' || $candidateEducationName === 'SMK') {
                    $normalizedCandidate = 'SMA/SMK';
                }

                // Check if education level exists in our hierarchy
                if (!isset($educationLevels[$normalizedCandidate])) {
                    continue;
                }

                $candidateLevel = $educationLevels[$normalizedCandidate];

                // Check if education level meets requirement
                if ($candidateLevel >= $requiredLevel) {
                    $hasValidEducationLevel = true;
                    
                    // If vacancy has major requirements, check if this education's major matches
                    if (!empty($vacancyMajors)) {
                        if ($education->major_id && in_array($education->major_id, $vacancyMajors)) {
                            // Perfect match: both education level AND major match
                            $hasValidMajor = true;
                            $matchedEducation = $education;
                            $matchedMajor = $education->major;
                            break; // Found matching education with matching major
                        }
                    } else {
                        // No major requirement, so education level match is sufficient
                        $hasValidMajor = true;
                        $matchedEducation = $education;
                        break;
                    }
                }
            }
            
            // If no perfect match found but we have major requirements, 
            // check if any education has matching major (for better error message)
            if (!$hasValidMajor && !empty($vacancyMajors) && !$hasValidEducationLevel) {
                foreach ($educations as $education) {
                    if ($education->major_id && in_array($education->major_id, $vacancyMajors)) {
                        // Found major match but education level might not be sufficient
                        // This helps us provide better error message
                        $matchedEducation = $education;
                        $matchedMajor = $education->major;
                        break;
                    }
                }
            }

            // Determine validation result
            $isValid = false;
            $message = '';

            if (empty($vacancyMajors)) {
                // No major requirement, only check education level
                $isValid = $hasValidEducationLevel;
                if ($isValid) {
                    $message = 'Jenjang pendidikan memenuhi syarat.';
                } else {
                    $message = "Tidak ada jenjang pendidikan Anda yang memenuhi persyaratan minimal ({$requiredEducationName}) untuk lowongan ini.";
                }
            } else {
                // Has major requirement, need both education level AND major match
                $isValid = $hasValidEducationLevel && $hasValidMajor;
                
                if (!$hasValidEducationLevel) {
                    $message = "Tidak ada jenjang pendidikan Anda yang memenuhi persyaratan minimal ({$requiredEducationName}) untuk lowongan ini.";
                } elseif (!$hasValidMajor) {
                    $majorNames = MasterMajor::whereIn('id', $vacancyMajors)->pluck('name')->toArray();
                    $majorList = implode(', ', $majorNames);
                    $message = "Jenjang pendidikan Anda memenuhi syarat, namun major/jurusan Anda tidak sesuai dengan persyaratan lowongan. Major yang dibutuhkan: {$majorList}.";
                } else {
                    $message = 'Jenjang pendidikan dan major/jurusan Anda memenuhi syarat.';
                }
            }

            return [
                'is_valid' => $isValid,
                'message' => $message,
                'candidate_education' => $matchedEducation ? $matchedEducation->educationLevel->name : null,
                'required_education' => $requiredEducationName
            ];

        } catch (\Exception $e) {
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

                // RULE BARU:
                // 1. User yang mendaftar di periode yang sama atau setelahnya bisa apply
                // 2. User yang mendaftar sebelum periode dimulai juga bisa apply
                // 3. Hanya blokir jika user mendaftar di periode yang lebih lama dan sudah lewat

                if ($userRegistrationPeriod) {
                    // Jika user mendaftar di periode yang sama dengan lowongan, boleh apply
                    if ($userRegistrationPeriod->id == $currentVacancyPeriod->period_id) {
                      }
                    // Jika user mendaftar di periode setelah periode lowongan, boleh apply
                    else if ($userRegistrationPeriod->id > $currentVacancyPeriod->period_id) {
                    }
                    // Jika user mendaftar di periode sebelum periode lowongan, boleh apply
                    else if ($userRegistrationPeriod->id < $currentVacancyPeriod->period_id) {
                    }
                } else {
                    // Jika tidak ada periode yang cocok dengan tanggal registrasi user
                    // Cek apakah user mendaftar sebelum periode pertama atau setelah periode terakhir
                    $firstPeriod = DB::table('periods')->orderBy('start_time', 'asc')->first();
                    $lastPeriod = DB::table('periods')->orderBy('end_time', 'desc')->first();

                    if ($userRegistrationDate < $firstPeriod->start_time) {
                    } else if ($userRegistrationDate > $lastPeriod->end_time) {
                    } else {
                        // User mendaftar di gap antar periode - tetap boleh apply
                    }
                }
            }

            // 3. Cek existing application dengan query yang lebih spesifik
            // TAPI hanya yang belum di-reject
            $existingApplication = DB::table('applications')
                ->join('vacancy_periods', 'applications.vacancy_period_id', '=', 'vacancy_periods.id')
                ->join('vacancies', 'vacancy_periods.vacancy_id', '=', 'vacancies.id')
                ->join('statuses', 'applications.status_id', '=', 'statuses.id')
                ->where('applications.user_id', $userId)
                ->where('vacancy_periods.period_id', $currentVacancyPeriod->period_id)
                ->where('statuses.stage', '!=', \App\Enums\CandidatesStage::REJECTED->value)
                ->select(
                    'applications.id',
                    'vacancies.id as vacancy_id',
                    'vacancies.title',
                    'statuses.name as status_name',
                    'statuses.stage as status_stage'
                )
                ->first();

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
            return [
                'can_apply' => false,
                'message' => 'Terjadi kesalahan saat memeriksa status lamaran.',
                'status' => 'error'
            ];
        }
    }
}
