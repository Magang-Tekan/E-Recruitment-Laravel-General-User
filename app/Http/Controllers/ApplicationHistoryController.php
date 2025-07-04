<?php

namespace App\Http\Controllers;

use App\Models\Applications;
use App\Models\ApplicationHistory;
use App\Models\Vacancies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

            // Format data untuk frontend
            $formattedApplications = $applications->map(function ($application) {
                try {
                    Log::info('Processing application', ['id' => $application->id]);

                    $vacancy = null;
                    $company = null;
                    $vacancyType = null;

                    // Safe access to vacancy data
                    if ($application->vacancyPeriod && $application->vacancyPeriod->vacancy) {
                        $vacancy = $application->vacancyPeriod->vacancy;
                        $company = $vacancy->company;
                        $vacancyType = $vacancy->vacancyType;
                    }

                    // Safe access to status
                    $currentStatus = $application->status;
                    $currentStage = $currentStatus ? $currentStatus->name : 'Status tidak diketahui';
                    $statusColor = $currentStatus ? $this->getStageColor($currentStatus->stage) : '#6c757d';
                    $stageInfo = $currentStatus ? $this->getStageInfo($currentStatus) : 'Dalam proses';

                    // Get matching history for additional data
                    $matchingHistory = null;
                    if ($application->status_id) {
                        $matchingHistory = ApplicationHistory::where('application_id', $application->id)
                            ->where('status_id', $application->status_id)
                            ->with(['reviewer:id,name'])
                            ->first();
                    }

                    // Fallback to active or latest history
                    if (!$matchingHistory) {
                        $matchingHistory = ApplicationHistory::where('application_id', $application->id)
                            ->where('is_active', true)
                            ->with(['reviewer:id,name'])
                            ->first();

                        if (!$matchingHistory) {
                            $matchingHistory = ApplicationHistory::where('application_id', $application->id)
                                ->with(['reviewer:id,name'])
                                ->orderBy('created_at', 'desc')
                                ->first();
                        }
                    }

                    Log::info('Application data processed', [
                        'id' => $application->id,
                        'current_status_id' => $application->status_id,
                        'current_status_name' => $currentStage,
                        'has_vacancy' => !is_null($vacancy),
                        'has_matching_history' => !is_null($matchingHistory),
                    ]);

                    // Format sesuai dengan frontend application-history.tsx
                    return [
                        'id' => $application->id,
                        'status_id' => $application->status_id,
                        'status_name' => $currentStage,
                        'status_color' => $statusColor,
                        'stage_info' => $stageInfo,
                        'job' => [
                            'id' => $vacancy ? $vacancy->id : null,
                            'title' => $vacancy ? $vacancy->title : 'Tidak tersedia',
                            'company' => $company ? $company->name : 'Perusahaan tidak tersedia',
                            'location' => $vacancy ? $vacancy->location : 'Lokasi tidak tersedia',
                            'type' => $vacancyType ? $vacancyType->name : 'Full Time'
                        ],
                        'applied_at' => $application->created_at ? $application->created_at->format('Y-m-d') : date('Y-m-d'),
                        'updated_at' => $application->updated_at ? $application->updated_at->format('Y-m-d') : date('Y-m-d'),
                        'current_score' => $matchingHistory ? $matchingHistory->score : null,
                        'last_processed' => $matchingHistory && $matchingHistory->processed_at ?
                                          $matchingHistory->processed_at->format('Y-m-d') :
                                          ($application->updated_at ? $application->updated_at->format('Y-m-d') : date('Y-m-d')),
                        'reviewer' => $matchingHistory && $matchingHistory->reviewer ?
                                    $matchingHistory->reviewer->name : null,
                        'notes' => $matchingHistory ? $matchingHistory->notes : null,
                        'is_qualified' => $currentStatus &&
                                        ($currentStatus->stage === 'accepted' ||
                                         ($matchingHistory && $matchingHistory->score && $matchingHistory->score >= 70)),
                        'history' => [
                            'id' => $matchingHistory ? $matchingHistory->id : null,
                            'is_qualified' => $matchingHistory ?
                                            ($currentStatus && $currentStatus->stage === 'accepted' ||
                                             ($matchingHistory->score && $matchingHistory->score >= 70)) : null,
                            'created_at' => $matchingHistory ? $matchingHistory->created_at->format('Y-m-d H:i:s') : null,
                        ]
                    ];
                } catch (\Exception $e) {
                    Log::error('Error processing application', [
                        'application_id' => $application->id ?? 'unknown',
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    
                    // Return fallback data instead of throwing
                    return [
                        'id' => $application->id ?? 0,
                        'status_id' => $application->status_id ?? 0,
                        'status_name' => 'Error loading status',
                        'status_color' => '#dc3545',
                        'stage_info' => 'Error loading data',
                        'job' => [
                            'id' => null,
                            'title' => 'Error loading job',
                            'company' => 'Error loading company',
                            'location' => 'Error loading location',
                            'type' => 'Error loading type'
                        ],
                        'applied_at' => date('Y-m-d'),
                        'updated_at' => date('Y-m-d'),
                        'current_score' => null,
                        'last_processed' => date('Y-m-d'),
                        'reviewer' => null,
                        'notes' => null,
                        'is_qualified' => false,
                        'history' => [
                            'id' => null,
                            'is_qualified' => null,
                            'created_at' => null,
                        ]
                    ];
                }
            })->filter(function($app) {
                // Filter out any null applications
                return !is_null($app);
            })->values();

            Log::info('Application history loaded successfully', [
                'count' => count($formattedApplications)
            ]);

            return Inertia::render('candidate/application-history', [
                'applications' => $formattedApplications->toArray(),
                'error' => null
            ]);

        } catch (\Exception $e) {
            Log::error('Error in application history index: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('candidate/application-history', [
                'applications' => [],
                'error' => 'Terjadi kesalahan saat memuat data riwayat lamaran. Silakan coba lagi.'
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
            Log::info('ApplicationStatus accessed', [
                'application_id' => $id,
                'user_id' => Auth::id()
            ]);

            // Validate input
            if (!$id || !is_numeric($id)) {
                return redirect()->route('candidate.application-history')
                    ->with('error', 'ID aplikasi tidak valid');
            }

            $user = Auth::user();
            if (!$user) {
                return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu');
            }

            // Find application with safe error handling
            $application = Applications::where('id', $id)
                ->where('user_id', Auth::id())
                ->with([
                    'vacancyPeriod.vacancy:id,title,location,vacancy_type_id,company_id,requirements,benefits,job_description',
                    'vacancyPeriod.vacancy.company:id,name',
                    'vacancyPeriod.vacancy.vacancyType:id,name',
                    'status:id,name,description,stage'
                ])
                ->first();

            if (!$application) {
                Log::warning('Application not found', [
                    'application_id' => $id,
                    'user_id' => Auth::id()
                ]);
                
                return redirect()->route('candidate.application-history')
                    ->with('error', 'Data aplikasi tidak ditemukan');
            }

            // Safe access to vacancy data
            $vacancy = null;
            if ($application->vacancyPeriod && $application->vacancyPeriod->vacancy) {
                $vacancy = $application->vacancyPeriod->vacancy;
            }

            if (!$vacancy) {
                return redirect()->route('candidate.application-history')
                    ->with('error', 'Data lowongan tidak ditemukan');
            }

            // Get application histories
            $applicationHistories = ApplicationHistory::where('application_id', $id)
                ->with(['status:id,name,description,stage', 'reviewer:id,name'])
                ->orderBy('processed_at', 'asc')
                ->get();

            // Format histories
            $formattedHistories = $applicationHistories->map(function ($history) use ($application) {
                $status = $history->status;
                $isCurrentActive = ($history->status_id == $application->status_id);

                return [
                    'id' => $history->id,
                    'status_id' => $history->status_id,
                    'status_name' => $status ? $status->name : 'Unknown Status',
                    'status_color' => $status ? $this->getStageColor($status->stage) : '#6c757d',
                    'stage' => $status ? $status->stage : null,
                    'score' => $history->score,
                    'notes' => $history->notes,
                    'scheduled_at' => $this->formatDateSafely($history->scheduled_at, 'Y-m-d H:i:s'),
                    'completed_at' => $this->formatDateSafely($history->completed_at, 'Y-m-d H:i:s'),
                    'processed_at' => $history->processed_at ? 
                        $history->processed_at->format('Y-m-d H:i:s') : 
                        ($history->created_at ? $history->created_at->format('Y-m-d H:i:s') : null),
                    'reviewed_by' => $history->reviewer ? $history->reviewer->name : null,
                    'reviewed_at' => $history->reviewed_at ? $history->reviewed_at->format('Y-m-d H:i:s') : null,
                    'is_active' => $isCurrentActive,
                    'created_at' => $history->created_at ? $history->created_at->format('Y-m-d H:i:s') : null,
                    'is_qualified' => $status && ($status->stage === 'accepted' || ($history->score && $history->score >= 70)),
                ];
            })->toArray();

            // Get current status info
            $currentStatus = $application->status;
            $currentStage = $currentStatus ? $currentStatus->name : 'Status tidak diketahui';
            $statusColor = $currentStatus ? $this->getStageColor($currentStatus->stage) : '#6c757d';

            // Get matching history for additional data
            $matchingHistory = ApplicationHistory::where('application_id', $application->id)
                ->where('status_id', $application->status_id)
                ->with(['reviewer:id,name'])
                ->first();

            if (!$matchingHistory) {
                $matchingHistory = ApplicationHistory::where('application_id', $application->id)
                    ->where('is_active', true)
                    ->with(['reviewer:id,name'])
                    ->first();
            }

            // Format application data
            $formattedApplication = [
                'id' => $application->id,
                'status_id' => $application->status_id,
                'status_name' => $currentStage,
                'status_color' => $statusColor,
                'current_score' => $matchingHistory ? $matchingHistory->score : null,
                'current_reviewer' => $matchingHistory && $matchingHistory->reviewer ? 
                    $matchingHistory->reviewer->name : null,
                'job' => [
                    'id' => $vacancy->id,
                    'title' => $vacancy->title,
                    'company' => $vacancy->company ? $vacancy->company->name : 'Unknown',
                    'location' => $vacancy->location ?: 'Location not specified',
                    'type' => $vacancy->vacancyType ? $vacancy->vacancyType->name : 'Unknown',
                ],
                'applied_at' => $application->created_at ? $application->created_at->format('Y-m-d H:i:s') : null,
                'histories' => $formattedHistories,
            ];

            return Inertia::render('candidate/status-candidate', [
                'application' => $formattedApplication,
            ]);

        } catch (\Exception $e) {
            Log::error('Error in application status: ' . $e->getMessage(), [
                'application_id' => $id,
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('candidate.application-history')
                ->with('error', 'Terjadi kesalahan saat memuat data status aplikasi.');
        }
    }

    /**
     * Helper methods
     */
    private function getStageColor($stage)
    {
        if (!$stage) return '#6c757d';
        
        $stageValue = is_object($stage) ? $stage->value : $stage;

        switch ($stageValue) {
            case 'rejected':
                return '#dc3545'; // Red
            case 'accepted':
                return '#28a745'; // Green
            case 'administrative_selection':
                return '#1a73e8'; // Blue
            case 'psychological_test':
            case 'psychotest':
                return '#fd7e14'; // Orange
            case 'interview':
                return '#6f42c1'; // Purple
            default:
                return '#6c757d'; // Gray
        }
    }

    private function getStageInfo($status)
    {
        if (!$status || !$status->stage) return 'Dalam proses';
        
        $stageValue = is_object($status->stage) ? $status->stage->value : $status->stage;

        switch ($stageValue) {
            case 'administrative_selection':
                return 'Sedang dalam proses review dokumen';
            case 'psychological_test':
            case 'psychotest':
                return 'Tahap tes psikologi';
            case 'interview':
                return 'Tahap interview';
            case 'accepted':
                return 'Diterima';
            case 'rejected':
                return 'Tidak lulus seleksi';
            default:
                return 'Dalam proses';
        }
    }

    private function formatDateSafely($date, $format)
    {
        if (empty($date)) {
            return null;
        }

        try {
            return \Carbon\Carbon::parse($date)->format($format);
        } catch (\Exception $e) {
            Log::warning('Date formatting failed: ' . $e->getMessage());
            return null;
        }
    }
}
