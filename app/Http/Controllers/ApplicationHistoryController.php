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

            // Format data untuk frontend dengan data dari application_history
            $formattedApplications = $applications->map(function ($application) {
                try {
                    Log::info('Processing application', ['id' => $application->id]);

                    $vacancy = $application->vacancyPeriod ? $application->vacancyPeriod->vacancy : null;
                    $status = $application->status;

                    // Ambil application history terbaru untuk aplikasi ini
                    $latestHistory = ApplicationHistory::where('application_id', $application->id)
                        ->with(['status:id,name,stage', 'reviewer:id,name'])
                        ->orderBy('processed_at', 'desc')
                        ->first();

                    Log::info('Application data processed', [
                        'id' => $application->id,
                        'has_vacancy' => isset($vacancy),
                        'has_status' => isset($status),
                        'has_history' => isset($latestHistory),
                        'history_stage' => $latestHistory && $latestHistory->status ? $latestHistory->status->stage : null
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
                        $historyStatus = $latestHistory->status;
                        $currentStage = $historyStatus ? $this->getStageDisplayName($historyStatus->stage) : 'Administrative Selection';
                        $statusColor = $historyStatus ? $this->getStageColor($historyStatus->stage, null) : '#1a73e8';

                        // Tambahkan informasi tambahan berdasarkan stage
                        $stageInfo = $historyStatus ? $this->getStageInfo($historyStatus) : '';
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
                        'current_score' => $latestHistory ? $latestHistory->score : null,
                        'last_processed' => $latestHistory ? $latestHistory->processed_at->format('Y-m-d') : null,
                        'reviewer' => $latestHistory && $latestHistory->reviewer ? $latestHistory->reviewer->name : null
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
                'applications' => $formattedApplications,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in application history: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('candidate/application-history', [
                'applications' => [],
                'error' => 'Terjadi kesalahan saat memuat data riwayat lamaran.'
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
            $user = Auth::user();

            if (!$user) {
                return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu');
            }

            // Verifikasi aplikasi milik user ini
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
                ->where('user_id', $user->id)
                ->first();

            if (!$application) {
                return redirect('/candidate/application-history')
                    ->with('error', 'Data aplikasi tidak ditemukan');
            }

            // Ambil data lowongan
            $vacancy = Vacancies::with('company', 'vacancyType')->find($application->vacancies_id);

            if (!$vacancy) {
                return redirect('/candidate/application-history')
                    ->with('error', 'Data lowongan tidak ditemukan');
            }

            // Ambil semua history aplikasi
            $applicationHistories = ApplicationHistory::where('application_id', $id)
                ->orderBy('created_at', 'desc')
                ->get();

            if ($applicationHistories->isEmpty()) {
                return redirect('/candidate/application-history')
                    ->with('error', 'Riwayat aplikasi tidak ditemukan');
            }

            $formattedHistories = [];
            foreach ($applicationHistories as $history) {
                // Ambil data status
                $status = DB::table('selection')->find($history->status_id);
                if (!$status) continue;

                $formattedHistories[] = [
                    'id' => $history->id,
                    'status_id' => $history->status_id,
                    'status_name' => $status->name,
                    'status_color' => $this->getStageColor($status->stage, null),
                    'is_qualified' => $history->is_qualified,
                    'created_at' => $history->created_at->format('Y-m-d H:i:s'),
                    'notes' => $history->notes ?? '',
                ];
            }

            // Format data aplikasi untuk tampilan
            $formattedApplication = [
                'id' => $application->id,
                'status_id' => $application->status_id,
                'job' => [
                    'id' => $vacancy->id,
                    'title' => $vacancy->title,
                    'company' => $vacancy->company ? $vacancy->company->name : 'Unknown',
                    'location' => $vacancy->location ?: 'Location not specified',
                    'type' => $vacancy->vacancyType ? $vacancy->vacancyType->name : 'Unknown',
                ],
                'applied_at' => $application->created_at->format('Y-m-d H:i:s'),
                'histories' => $formattedHistories,
            ];

            return Inertia::render('candidate/application-status', [
                'application' => $formattedApplication,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error in application status: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return redirect('/candidate/application-history')
                ->with('error', 'Terjadi kesalahan saat memuat data status aplikasi.');
        }
    }

    /**
     * Helper methods
     */
    private function getStageDisplayName($stage)
    {
        // Convert enum to string if needed
        $stageValue = is_object($stage) ? $stage->value : $stage;

        $stageNames = [
            'administrative_selection' => 'Administrative Selection',
            'psychological_test' => 'Psychological Test',
            'interview' => 'Interview',
            'accepted' => 'Accepted',
            'rejected' => 'Rejected'
        ];

        return $stageNames[$stageValue] ?? $stageValue;
    }

    private function getStageColor($stage, $isQualified = null)
    {
        // Convert enum to string if needed
        $stageValue = is_object($stage) ? $stage->value : $stage;

        if ($stageValue === 'rejected' || $isQualified === false) {
            return '#dc3545'; // Red
        }

        if ($stageValue === 'accepted' || $isQualified === true) {
            return '#28a745'; // Green
        }

        switch ($stageValue) {
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

    private function getStageInfo($status)
    {
        // Since we don't have is_qualified column in database,
        // we'll use the status stage to determine info
        $stageValue = is_object($status->stage) ? $status->stage->value : $status->stage;

        switch ($stageValue) {
            case 'administrative_selection':
                return 'Sedang dalam proses review dokumen';
            case 'psychological_test':
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
