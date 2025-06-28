<?php

namespace App\Http\Controllers;

use App\Models\Applications;
use App\Models\ApplicationHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ApplicationHistoryController extends Controller
{
    public function index()
    {
        try {
            Log::info('Starting application history index');

            // Ambil data aplikasi user yang sedang login dengan relasi yang diperlukan
            $applications = Applications::where('user_id', Auth::id())
                ->with([
                    'vacancyPeriod.vacancy:id,title,location,vacancy_type_id,company_id',
                    'vacancyPeriod.vacancy.company:id,name',
                    'vacancyPeriod.vacancy.vacancyType:id,name',
                    'status:id,name,description,stage'
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            Log::info('Applications loaded', ['count' => $applications->count()]);

            if ($applications->isEmpty()) {
                Log::info('No applications found for user', [
                    'user_id' => Auth::id()
                ]);

                return Inertia::render('candidate/application-history', [
                    'applications' => []
                ]);
            }

            // Format data untuk frontend dengan data dari application_history
            $formattedApplications = $applications->map(function ($application) {
                try {
                    Log::info('Processing application', ['id' => $application->id]);

                    $vacancy = $application->vacancyPeriod ? $application->vacancyPeriod->vacancy : null;
                    $status = $application->status;

                    // Ambil application history terbaru untuk aplikasi ini
                    $latestHistory = ApplicationHistory::where('application_id', $application->id)
                        ->with(['adminReviewer:id,name', 'interviewer:id,name'])
                        ->orderBy('processed_at', 'desc')
                        ->first();

                    Log::info('Application data processed', [
                        'id' => $application->id,
                        'has_vacancy' => isset($vacancy),
                        'has_status' => isset($status),
                        'has_history' => isset($latestHistory),
                        'history_stage' => $latestHistory ? $latestHistory->stage : null
                    ]);

                    // Fallback jika tidak ada data vacancy
                    if (!$vacancy && $application->vacancy_period_id) {
                        try {
                            $vacancyPeriod = \App\Models\VacancyPeriods::with(['vacancy.company', 'vacancy.vacancyType'])
                                            ->find($application->vacancy_period_id);
                            $vacancy = $vacancyPeriod ? $vacancyPeriod->vacancy : null;
                        } catch (\Exception $e) {
                            Log::error('Error fetching vacancy data: ' . $e->getMessage());
                        }
                    }

                    // Menentukan status dan warna berdasarkan application history
                    $currentStage = 'Administrative Selection';
                    $statusColor = '#1a73e8'; // Default blue
                    $stageInfo = '';

                    if ($latestHistory) {
                        $currentStage = $this->getStageDisplayName($latestHistory->stage);
                        $statusColor = $this->getStageColor($latestHistory->stage, $latestHistory->is_qualified);

                        // Tambahkan informasi tambahan berdasarkan stage
                        $stageInfo = $this->getStageInfo($latestHistory);
                    } elseif ($status) {
                        $currentStage = $status->name;
                        if ($status->stage == 'REJECTED') {
                            $statusColor = '#dc3545';
                        } elseif ($status->stage == 'ACCEPTED') {
                            $statusColor = '#28a745';
                        } elseif ($status->stage == 'INTERVIEW') {
                            $statusColor = '#fd7e14';
                        }
                    }

                    return [
                        'id' => $application->id,
                        'status_id' => $status ? $status->id : 1,
                        'status_name' => $currentStage,
                        'status_color' => $statusColor,
                        'stage_info' => $stageInfo,
                        'job' => [
                            'id' => $vacancy ? $vacancy->id : null,
                            'title' => $vacancy ? $vacancy->title : 'Tidak tersedia',
                            'company' => $vacancy && $vacancy->company ? $vacancy->company->name : 'Perusahaan tidak tersedia',
                            'location' => $vacancy ? $vacancy->location : 'Lokasi tidak tersedia',
                            'type' => $vacancy && $vacancy->vacancyType ? $vacancy->vacancyType->name : 'Full Time'
                        ],
                        'applied_at' => $application->created_at ? $application->created_at->format('Y-m-d') : date('Y-m-d'),
                        'updated_at' => $application->updated_at ? $application->updated_at->format('Y-m-d') : date('Y-m-d'),
                        // Tambahkan informasi dari application history
                        'current_score' => $latestHistory ? $this->getCurrentScore($latestHistory) : null,
                        'last_processed' => $latestHistory ? $latestHistory->processed_at->format('Y-m-d') : null,
                        'reviewer' => $latestHistory && $latestHistory->adminReviewer ? $latestHistory->adminReviewer->name : null
                    ];
                } catch (\Exception $e) {
                    Log::error('Error processing application', [
                        'application_id' => $application->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    throw $e; // Re-throw to be caught by outer try-catch
                }
            });

            Log::info('Application history loaded successfully', [
                'count' => count($formattedApplications)
            ]);

            return Inertia::render('candidate/application-history', [
                'applications' => $formattedApplications
            ]);

        } catch (\Exception $e) {
            Log::error('Error in application history: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('candidate/application-history', [
                'applications' => [],
                'error' => 'Terjadi kesalahan: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Check if vacancy relationship exists in the application model
     * For debugging purposes
     */
    public function checkRelationships()
    {
        try {
            $application = Applications::with(['vacancy', 'status'])->first();

            return response()->json([
                'success' => true,
                'has_vacancy_relation' => method_exists($application, 'vacancy'),
                'has_status_relation' => method_exists($application, 'status'),
                'application' => $application
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }

    // Untuk endpoint AJAX jika diperlukan
    public function getApplications()
    {
        try {
            // Ambil data aplikasi user yang sedang login
            $applications = Applications::where('user_id', Auth::id())
                ->with([
                    'vacancyPeriod.vacancy:id,title,location,vacancy_type_id,company_id',
                    'vacancyPeriod.vacancy.company:id,name',
                    'vacancyPeriod.vacancy.vacancyType:id,name',
                    'status:id,name,description,stage'
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            // Format data seperti fungsi index
            $formattedApplications = $applications->map(function ($application) {
                $vacancy = $application->vacancyPeriod ? $application->vacancyPeriod->vacancy : null;
                $selection = $application->selection;

                return [
                    'id' => $application->id,
                    'job' => [
                        'id' => $vacancy ? $vacancy->id : null,
                        'title' => $vacancy ? $vacancy->title : 'Tidak tersedia',
                        'company' => $vacancy && $vacancy->company ? $vacancy->company->name : 'Perusahaan tidak tersedia',
                        'location' => $vacancy ? $vacancy->location : 'Lokasi tidak tersedia',
                        'type' => $vacancy && $vacancy->vacancyType ? $vacancy->vacancyType->name : 'Tipe tidak tersedia'
                    ],
                    'status' => [
                        'id' => $selection ? $selection->id : null,
                        'name' => $selection ? $selection->name : 'Status tidak tersedia',
                        'description' => $selection ? $selection->description : '',
                        'stage' => $selection ? $selection->stage : null
                    ],
                    'applied_at' => $application->created_at ? $application->created_at->toDateString() : now()->toDateString(),
                    'updated_at' => $application->updated_at ? $application->updated_at->toDateString() : now()->toDateString(),
                ];
            })->filter()->values();

            // Return JSON untuk AJAX
            return response()->json([
                'applications' => $formattedApplications
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show detailed application status
     */
    public function applicationStatus($id)
    {
        try {
            // Check application exists and belongs to current user
            $application = Applications::where('id', $id)
                ->where('user_id', Auth::id())
                ->with([
                    'vacancy:id,title,location,vacancy_type_id,company_id,requirements,benefits,job_description',
                    'vacancy.company:id,name',
                    'vacancy.vacancyType:id,name',
                    'vacancy.department:id,name',
                    'status:id,name,description,stage',
                    // Include additional relations as needed
                    'user:id,name,email'
                ])
                ->firstOrFail();

            // Get application stages and status
            $selectionStages = \App\Models\Statuses::orderBy('id', 'asc')->get();

            // Get application history
            $applicationHistory = \App\Models\ApplicationHistory::where('application_id', $id)
                ->with(['status:id,name'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Format data for frontend
            $applicationData = [
                'id' => $application->id,
                'user' => $application->user ? [
                    'name' => $application->user->name,
                    'email' => $application->user->email
                ] : null,
                'job' => [
                    'id' => $application->vacancy->id,
                    'title' => $application->vacancy->title,
                    'company' => $application->vacancy->company ? $application->vacancy->company->name : 'Unknown',
                    'department' => $application->vacancy->department ? $application->vacancy->department->name : null,
                    'location' => $application->vacancy->location,
                    'type' => $application->vacancy->vacancyType ? $application->vacancy->vacancyType->name : 'Full Time',
                    'requirements' => $this->safeJsonDecode($application->vacancy->requirements),
                    'benefits' => $this->safeJsonDecode($application->vacancy->benefits),
                    'description' => $application->vacancy->job_description
                ],
                'current_stage' => [
                    'id' => $application->status_id,
                    'name' => $application->status ? $application->status->name : 'Administrasi',
                    'description' => $application->status ? $application->status->description : null,
                ],
                'stages' => $selectionStages->map(function ($stage) use ($application) {
                    return [
                        'id' => $stage->id,
                        'name' => $stage->name,
                        'description' => $stage->description,
                        'is_current' => $stage->id === $application->status_id,
                        'is_completed' => $stage->id < $application->status_id,
                        'is_future' => $stage->id > $application->status_id
                    ];
                }),
                'history' => $applicationHistory->map(function ($history) {
                    return [
                        'id' => $history->id,
                        'stage' => $history->status ? $history->status->name : 'Unknown',
                        'notes' => $history->notes,
                        'status' => $history->status,
                        'date' => $history->created_at ? $history->created_at->format('Y-m-d H:i:s') : null,
                    ];
                }),
                'applied_at' => $application->created_at ? $application->created_at->format('d M Y') : null,
                'updated_at' => $application->updated_at ? $application->updated_at->format('d M Y') : null,
            ];

            // Log data for debugging
            \Log::info('Showing application status', [
                'application_id' => $id,
                'user_id' => Auth::id(),
            ]);

            // Render the status page with application data
            return Inertia::render('candidate/status-candidate', [
                'application' => $applicationData
            ]);

        } catch (\Exception $e) {
            \Log::error('Error showing application status: ' . $e->getMessage(), [
                'application_id' => $id,
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);

            // Redirect back with error message
            return redirect()->route('candidate.application-history')
                ->with('error', 'Gagal menampilkan detail lamaran: ' . $e->getMessage());
        }
    }

    /**
     * Di method yang menampilkan halaman candidate-status
     */
    public function showStatus($applicationId)
    {
        $user = Auth::user();
        $application = Applications::where('id', $applicationId)
            ->where('user_id', $user->id)
            ->with(['job', 'job.company'])
            ->firstOrFail();

        // Ambil data assessment yang terkait dengan aplikasi ini
        $applicationHistory = \App\Models\ApplicationHistory::where('application_id', $applicationId)
            ->where('assessments_id', '!=', null)
            ->first();

        $assessmentId = $applicationHistory ? $applicationHistory->assessments_id : null;

        // Siapkan data untuk halaman status
        $data = [
            'application' => [
                'id' => $application->id,
                'job_title' => $application->job->title,
                'company_name' => $application->job->company->name,
                'status' => $application->status,
                'applied_date' => $application->created_at->format('d M Y'),
                'assessment_id' => $assessmentId, // Teruskan ID assessment
            ],
            'user' => [
                'name' => $user->name,
                'profile_image' => $user->candidateProfile ? asset('storage/' . $user->candidateProfile->profile_image) : null,
            ]
        ];

        return Inertia::render('candidate/candidate-status', $data);
    }

    /**
     * Helper methods
     */
    private function getStageDisplayName($stage)
    {
        $stageNames = [
            'administrative_selection' => 'Administrative Selection',
            'psychological_test' => 'Psychological Test',
            'interview' => 'Interview',
            'accepted' => 'Accepted',
            'rejected' => 'Rejected'
        ];

        return $stageNames[$stage] ?? $stage;
    }

    private function getStageColor($stage, $isQualified = null)
    {
        if ($stage === 'rejected' || $isQualified === false) {
            return '#dc3545'; // Red
        }

        if ($stage === 'accepted' || $isQualified === true) {
            return '#28a745'; // Green
        }

        switch ($stage) {
            case 'administrative_selection':
                return '#1a73e8'; // Blue
            case 'psychological_test':
                return '#fd7e14'; // Orange
            case 'interview':
                return '#6f42c1'; // Purple
            default:
                return '#6c757d'; // Gray
        }
    }

    private function getStageInfo($history)
    {
        if ($history->is_qualified === false) {
            return 'Tidak lulus seleksi';
        }

        if ($history->is_qualified === true) {
            return 'Lulus seleksi';
        }

        switch ($history->stage) {
            case 'administrative_selection':
                return 'Sedang dalam proses review dokumen';
            case 'psychological_test':
                return $history->test_scheduled_at ? 'Tes terjadwal' : 'Menunggu jadwal tes';
            case 'interview':
                return $history->interview_scheduled_at ? 'Interview terjadwal' : 'Menunggu jadwal interview';
            default:
                return 'Dalam proses';
        }
    }

    private function getCurrentScore($history)
    {
        switch ($history->stage) {
            case 'administrative_selection':
                return $history->admin_score;
            case 'psychological_test':
                return $history->test_score;
            case 'interview':
                return $history->interview_score;
            default:
                return null;
        }
    }

    /**
     * Safely decode JSON or return an array depending on input type
     * @param mixed $value The value to decode
     * @return array The decoded array or empty array on error
     */
    private function safeJsonDecode($value)
    {
        if (empty($value)) {
            return [];
        }

        if (is_array($value)) {
            return $value;
        }

        try {
            $decoded = json_decode($value, true);
            return (is_array($decoded) && json_last_error() === JSON_ERROR_NONE) ? $decoded : [];
        } catch (\Exception $e) {
            \Log::warning('JSON decode failed: ' . $e->getMessage());
            return [];
        }
    }
}
