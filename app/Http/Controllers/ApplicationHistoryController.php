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
            // Ambil data aplikasi user yang sedang login
            $applications = Applications::where('user_id', Auth::id())
                ->with([
                    'vacancy:id,title,location,vacancy_type_id,company_id',
                    'vacancy.company:id,name',
                    'vacancy.vacancyType:id,name',
                    'status:id,name,description,stage'
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            // Check if we have applications
            if ($applications->isEmpty()) {
                Log::info('No applications found for user', [
                    'user_id' => Auth::id()
                ]);

                return Inertia::render('candidate/application-history', [
                    'applications' => []
                ]);
            }

            // Format data untuk frontend
            $formattedApplications = $applications->map(function ($application) {
                $vacancy = $application->vacancy;
                $status = $application->status;

                // Log for debugging
                Log::info('Application data', [
                    'id' => $application->id,
                    'has_vacancy' => isset($vacancy),
                    'has_status' => isset($status)
                ]);

                // Jika tidak ada data vacancy, coba ambil dari vacancies_id
                if (!$vacancy && $application->vacancies_id) {
                    try {
                        $vacancy = \App\Models\Vacancies::with(['company', 'vacancyType'])
                                    ->find($application->vacancies_id);
                    } catch (\Exception $e) {
                        Log::error('Error fetching vacancy data: ' . $e->getMessage());
                    }
                }

                // Menentukan warna status
                $statusColor = '#1a73e8'; // Default blue
                if ($status) {
                    if ($status->stage == 'REJECTED') {
                        $statusColor = '#dc3545'; // Red for rejected
                    } else if ($status->stage == 'ACCEPTED') {
                        $statusColor = '#28a745'; // Green for accepted
                    } else if ($status->stage == 'INTERVIEW') {
                        $statusColor = '#fd7e14'; // Orange for interview
                    }
                }

                return [
                    'id' => $application->id,
                    'status_id' => $status ? $status->id : 1,
                    'status_name' => $status ? $status->name : 'Administrative Selection',
                    'status_color' => $statusColor,
                    'job' => [
                        'id' => $vacancy ? $vacancy->id : null,
                        'title' => $vacancy ? $vacancy->title : 'Tidak tersedia',
                        'company' => $vacancy && $vacancy->company ? $vacancy->company->name : 'Perusahaan tidak tersedia',
                        'location' => $vacancy ? $vacancy->location : 'Lokasi tidak tersedia',
                        'type' => $vacancy && $vacancy->vacancyType ? $vacancy->vacancyType->name : 'Full Time'
                    ],
                    'applied_at' => $application->created_at ? $application->created_at->format('Y-m-d') : date('Y-m-d'),
                    'updated_at' => $application->updated_at ? $application->updated_at->format('Y-m-d') : date('Y-m-d')
                ];
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
                    'vacancy:id,title,location,vacancy_type_id,company_id',
                    'vacancy.company:id,name',
                    'vacancy.vacancyType:id,name',
                    'status:id,name,description,stage'
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            // Format data seperti fungsi index
            $formattedApplications = $applications->map(function ($application) {
                $vacancy = $application->vacancy;
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
