<?php

namespace App\Http\Controllers;

use App\Models\Applications;
use App\Models\ApplicationsHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ApplicationHistoryController extends Controller
{
    public function index()
    {
        try {
            // Ambil data aplikasi user yang sedang login
            $applications = Applications::where('user_id', Auth::id())
                ->with([
                    'vacancy:id,title,location,type_id,company_id',
                    'vacancy.company:id,name',
                    'vacancy.jobType:id,name',
                    'selection:id,name,description' // Changed from status to selection
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            // Format data untuk frontend
            $formattedApplications = $applications->map(function ($application) {
                $vacancy = $application->vacancy;
                $selection = $application->selection; // Changed from status to selection

                // Handle jika vacancy null
                if (!$vacancy) {
                    \Log::warning('Vacancy not found for application ID: ' . $application->id);
                    return null;
                }

                return [
                    'id' => $application->id,
                    'status_id' => $application->selection_id ?? 1, // Changed from status_id to selection_id
                    'status_name' => $selection ? $selection->name : 'Administrasi', // Changed default from Pending to Administrasi
                    'status_color' => '#1a73e8', // Use a default color since selection may not have a color field
                    'job' => [
                        'id' => $vacancy->id,
                        'title' => $vacancy->title,
                        'company' => $vacancy->company ? $vacancy->company->name : 'Unknown',
                        'location' => $vacancy->location,
                        'type' => $vacancy->jobType ? $vacancy->jobType->name : 'Full Time',
                    ],
                    'applied_at' => $application->created_at ? $application->created_at->toDateString() : now()->toDateString(),
                    'updated_at' => $application->updated_at ? $application->updated_at->toDateString() : now()->toDateString(),
                ];
            })->filter()->values(); // Filter nulls and reindex

            // Debugging
            \Log::info('Returning applications data', [
                'count' => $formattedApplications->count(),
                'data' => $formattedApplications
            ]);

            // Render dengan data
            return Inertia::render('candidate/application-history', [
                'applications' => $formattedApplications
            ]);

        } catch (\Exception $e) {
            \Log::error('Error fetching application history: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('candidate/application-history', [
                'applications' => [],
                'error' => 'Terjadi kesalahan: ' . $e->getMessage()
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
                    'vacancy:id,title,location,type_id,company_id',
                    'vacancy.company:id,name',
                    'vacancy.jobType:id,name',
                    'selection:id,name,description' // Changed from status to selection
                ])
                ->orderBy('created_at', 'desc')
                ->get();

            // Format data seperti fungsi index
            $formattedApplications = $applications->map(function ($application) {
                $vacancy = $application->vacancy;
                $selection = $application->selection; // Changed from status to selection

                // Handle jika vacancy null
                if (!$vacancy) {
                    \Log::warning('Vacancy not found for application ID: ' . $application->id);
                    return null;
                }

                return [
                    'id' => $application->id,
                    'status_id' => $application->selection_id ?? 1, // Changed from status_id to selection_id
                    'status_name' => $selection ? $selection->name : 'Administrasi', // Changed default from Pending to Administrasi
                    'status_color' => '#1a73e8', // Use a default color since selection may not have a color field
                    'job' => [
                        'id' => $vacancy->id,
                        'title' => $vacancy->title,
                        'company' => $vacancy->company ? $vacancy->company->name : 'Unknown',
                        'location' => $vacancy->location,
                        'type' => $vacancy->jobType ? $vacancy->jobType->name : 'Full Time',
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
                    'vacancy:id,title,location,type_id,company_id,requirements,benefits,job_description',
                    'vacancy.company:id,name',
                    'vacancy.jobType:id,name',
                    'vacancy.department:id,name',
                    'selection:id,name,description',
                    // Include additional relations as needed
                    'user:id,name,email'
                ])
                ->firstOrFail();

            // Get application stages and status
            $selectionStages = \App\Models\Selections::orderBy('id', 'asc')->get();

            // Get application history
            $applicationHistory = \App\Models\ApplicationsHistory::where('application_id', $id)
                ->with(['selection:id,name'])
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
                    'type' => $application->vacancy->jobType ? $application->vacancy->jobType->name : 'Full Time',
                    'requirements' => $this->safeJsonDecode($application->vacancy->requirements),
                    'benefits' => $this->safeJsonDecode($application->vacancy->benefits),
                    'description' => $application->vacancy->job_description
                ],
                'current_stage' => [
                    'id' => $application->selection_id,
                    'name' => $application->selection ? $application->selection->name : 'Administrasi',
                    'description' => $application->selection ? $application->selection->description : null,
                ],
                'stages' => $selectionStages->map(function ($stage) use ($application) {
                    return [
                        'id' => $stage->id,
                        'name' => $stage->name,
                        'description' => $stage->description,
                        'is_current' => $stage->id === $application->selection_id,
                        'is_completed' => $stage->id < $application->selection_id,
                        'is_future' => $stage->id > $application->selection_id
                    ];
                }),
                'history' => $applicationHistory->map(function ($history) {
                    return [
                        'id' => $history->id,
                        'stage' => $history->selection ? $history->selection->name : 'Unknown',
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
        $applicationHistory = ApplicationsHistory::where('application_id', $applicationId)
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
