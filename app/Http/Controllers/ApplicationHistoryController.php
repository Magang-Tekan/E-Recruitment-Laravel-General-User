<?php

namespace App\Http\Controllers;

use App\Models\Applications;
use App\Models\ApplicationHistory;
use App\Models\Vacancies;
use App\Models\QuestionPack;
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
                    'vacancyPeriod.vacancy:id,title,location,vacancy_type_id,company_id,psychotest_name',
                    'vacancyPeriod.vacancy.company:id,name',
                    'vacancyPeriod.vacancy.vacancyType:id,name',
                    'status:id,name,description,stage' // PRIMARY: Status dari tabel applications
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

            // Format data untuk frontend - PRIMARY data dari applications, SECONDARY dari application_history
            $formattedApplications = $applications->map(function ($application) {
                try {
                    Log::info('Processing application', ['id' => $application->id]);

                    $vacancy = $application->vacancyPeriod ? $application->vacancyPeriod->vacancy : null;

                    // PRIMARY: Gunakan status dari applications table sebagai current status
                    $currentStatus = $application->status;
                    
                    // Use psychotest_name from vacancy if this is a psychological test
                    $currentStage = $currentStatus ? $currentStatus->name : 'Status tidak diketahui';
                    if ($currentStatus && 
                        (stripos($currentStatus->name, 'psychological') !== false || 
                         stripos($currentStatus->name, 'psikologi') !== false || 
                         stripos($currentStatus->name, 'psikotes') !== false) && 
                        $vacancy && $vacancy->psychotest_name) {
                        $currentStage = $vacancy->psychotest_name;
                        
                        Log::info('Using psychotest_name for status', [
                            'application_id' => $application->id,
                            'original_status' => $currentStatus->name,
                            'psychotest_name' => $vacancy->psychotest_name,
                            'final_stage' => $currentStage
                        ]);
                    }
                    
                    $statusColor = $currentStatus ? $this->getStageColor($currentStatus->stage, null) : '#6c757d';
                    $stageInfo = $currentStatus ? $this->getStageInfo($currentStatus) : 'Dalam proses';

                    // SECONDARY: Cari application history yang match dengan current status untuk data tambahan
                    $matchingHistory = ApplicationHistory::where('application_id', $application->id)
                        ->where('status_id', $application->status_id) // Match dengan current status
                        ->with(['reviewer:id,name'])
                        ->first();

                    // Jika tidak ada yang match, ambil active history atau yang terbaru
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
                        'has_vacancy' => isset($vacancy),
                        'has_matching_history' => isset($matchingHistory),
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

                    // Format sesuai dengan frontend application-history.tsx
                    return [
                        'id' => $application->id,
                        'status_id' => $application->status_id, // Dari applications table
                        'status_name' => $currentStage, // Dari applications.status
                        'status_color' => $statusColor, // Berdasarkan applications.status
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

                        // Data tambahan dari application_history (jika ada)
                        'current_score' => $matchingHistory ? $matchingHistory->score : null,
                        'last_processed' => $matchingHistory && $matchingHistory->processed_at ?
                                          $matchingHistory->processed_at->format('Y-m-d') :
                                          $application->updated_at->format('Y-m-d'),
                        'reviewer' => $matchingHistory && $matchingHistory->reviewer ?
                                    $matchingHistory->reviewer->name : null,
                        'notes' => $matchingHistory ? $matchingHistory->notes : null,
                        'resource_url' => $matchingHistory ? $matchingHistory->resource_url : null, // Interview URL atau meeting link

                        // Flag untuk frontend
                        'is_qualified' => $currentStatus &&
                                        ($currentStatus->stage === 'accepted' ||
                                         ($matchingHistory && $matchingHistory->score && $matchingHistory->score >= 70)),

                        // History info untuk kompatibilitas dengan frontend lama
                        'history' => [
                            'id' => $matchingHistory ? $matchingHistory->id : null,
                            'is_qualified' => $matchingHistory ?
                                            ($currentStatus->stage === 'accepted' ||
                                             ($matchingHistory->score && $matchingHistory->score >= 70)) : null,
                            'created_at' => $matchingHistory ? $matchingHistory->created_at->format('Y-m-d H:i:s') : null,
                        ]
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

            // Get companies data
            $companies = \App\Models\Company::select('id', 'name', 'description')->get();
            
            // Get footer companies
            $footerCompanies = \App\Models\Company::select('id', 'name')->get();
            
            // Get contact data
            $contacts = \App\Models\Contacts::first();

            return Inertia::render('candidate/application-history', [
                'applications' => $formattedApplications,
                'companies' => $companies,
                'footerCompanies' => $footerCompanies,
                'contacts' => $contacts,
                'error' => null
            ]);

        } catch (\Exception $e) {
            Log::error('Error in application history: ' . $e->getMessage());

            return Inertia::render('candidate/application-history', [
                'applications' => [],
                'companies' => [],
                'footerCompanies' => [],
                'contacts' => null,
                'error' => 'Terjadi kesalahan saat memuat data.'
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
                'user_id' => Auth::id(),
                'is_authenticated' => Auth::check()
            ]);

            $user = Auth::user();

            if (!$user) {
                Log::warning('User not authenticated for application status', [
                    'application_id' => $id
                ]);
                return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu');
            }

            // Verifikasi aplikasi milik user ini
            $application = Applications::where('id', $id)
                ->where('user_id', Auth::id())
                ->with([
                    'vacancyPeriod.vacancy:id,title,location,vacancy_type_id,company_id,requirements,benefits,job_description,psychotest_name',
                    'vacancyPeriod.vacancy.company:id,name',
                    'vacancyPeriod.vacancy.vacancyType:id,name',
                    'status:id,name,description,stage'
                ])
                ->first();

            if (!$application) {
                Log::warning('Application not found or not owned by user', [
                    'application_id' => $id,
                    'user_id' => Auth::id()
                ]);
                return redirect('/candidate/application-history')
                    ->with('error', 'Data aplikasi tidak ditemukan');
            }

            Log::info('Application found', [
                'application_id' => $application->id,
                'user_id' => $application->user_id,
                'status_id' => $application->status_id
            ]);

            // Ambil data lowongan dari relasi
            $vacancy = $application->vacancyPeriod ? $application->vacancyPeriod->vacancy : null;

            if (!$vacancy) {
                return redirect('/candidate/application-history')
                    ->with('error', 'Data lowongan tidak ditemukan');
            }

            // Ambil semua history aplikasi dengan relasi lengkap - SINKRON dengan index method
            $applicationHistories = ApplicationHistory::where('application_id', $id)
                ->with(['status:id,name,description,stage', 'reviewer:id,name'])
                ->orderBy('processed_at', 'asc') // Ubah ke ASC untuk timeline yang benar
                ->get();

            // PRIMARY: Gunakan status dari applications table seperti di index method
            $currentStatus = $application->status;
            $currentStage = $currentStatus ? $currentStatus->name : 'Status tidak diketahui';
            
            // Use psychotest_name from vacancy if this is a psychological test (SINKRON dengan index method)
            if ($currentStatus && 
                (stripos($currentStatus->name, 'psychological') !== false || 
                 stripos($currentStatus->name, 'psikologi') !== false || 
                 stripos($currentStatus->name, 'psikotes') !== false) && 
                $vacancy && $vacancy->psychotest_name) {
                $currentStage = $vacancy->psychotest_name;
                
                Log::info('Using psychotest_name for applicationStatus', [
                    'application_id' => $application->id,
                    'original_status' => $currentStatus->name,
                    'psychotest_name' => $vacancy->psychotest_name,
                    'final_stage' => $currentStage
                ]);
            }
            
            $statusColor = $currentStatus ? $this->getStageColor($currentStatus->stage, null) : '#6c757d';

            // SECONDARY: Cari application history yang match dengan current status untuk data tambahan
            $matchingHistory = ApplicationHistory::where('application_id', $application->id)
                ->where('status_id', $application->status_id) // Match dengan current status
                ->with(['reviewer:id,name'])
                ->first();

            // Jika tidak ada yang match, ambil active history atau yang terbaru
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

            Log::info('Application histories found', [
                'application_id' => $id,
                'count' => $applicationHistories->count(),
                'histories' => $applicationHistories->toArray()
            ]);

            // Format histories dengan semua detail - SINKRON dengan logika index
            $formattedHistories = $applicationHistories->map(function ($history) use ($application, $vacancy) {
                $status = $history->status;

                // Tentukan apakah ini adalah current active status berdasarkan applications.status_id
                $isCurrentActive = ($history->status_id == $application->status_id);

                // Use psychotest_name from vacancy if this is a psychological test
                $statusName = $status ? $status->name : 'Unknown Status';
                if ($status && 
                    (stripos($status->name, 'psychological') !== false || 
                     stripos($status->name, 'psikologi') !== false || 
                     stripos($status->name, 'psikotes') !== false) && 
                    $vacancy && $vacancy->psychotest_name) {
                    $statusName = $vacancy->psychotest_name;
                }

                return [
                    'id' => $history->id,
                    'status_id' => $history->status_id,
                    'status_name' => $statusName, // Gunakan psychotest_name jika tersedia
                    'status_color' => $status ? $this->getStageColor($status->stage, null) : '#6c757d', // Sama dengan index
                    'stage' => $status ? $status->stage : null,
                    'score' => $history->score,
                    'notes' => $history->notes,
                    'resource_url' => $history->resource_url, // Interview URL atau meeting link
                    'scheduled_at' => $this->formatDateSafely($history->scheduled_at ?? null, 'Y-m-d H:i:s'),
                    'completed_at' => $this->formatDateSafely($history->completed_at ?? null, 'Y-m-d H:i:s'),
                    'processed_at' => $history->processed_at ? $history->processed_at->format('Y-m-d H:i:s') : $history->created_at->format('Y-m-d H:i:s'),
                    'reviewed_by' => $history->reviewer ? $history->reviewer->name : null,
                    'reviewed_at' => $history->reviewed_at ? $history->reviewed_at->format('Y-m-d H:i:s') : null,
                    'is_active' => $isCurrentActive, // Berdasarkan applications.status_id, bukan history.is_active
                    'created_at' => $history->created_at->format('Y-m-d H:i:s'),
                    // Add helper flags for frontend - SINKRON dengan index
                    'is_qualified' => $status && ($status->stage === 'accepted' || ($history->score && $history->score >= 70)),
                ];
            })->toArray();

            // PRIMARY: Gunakan status dari applications table seperti di index method
            // CATATAN: $currentStage sudah didefinisikan dengan logic psychotest_name di atas (line 340-350)
            // Jangan redefinisi ulang di sini untuk mempertahankan psychotest_name
            $statusColor = $currentStatus ? $this->getStageColor($currentStatus->stage, null) : '#6c757d';

            // SECONDARY: Cari application history yang match dengan current status untuk data tambahan
            $matchingHistory = ApplicationHistory::where('application_id', $application->id)
                ->where('status_id', $application->status_id) // Match dengan current status
                ->with(['reviewer:id,name'])
                ->first();

            // Jika tidak ada yang match, ambil active history atau yang terbaru
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

            // Get psychotest scheduling information
            $psychotestScheduling = null;
            
            // Cek apakah ada history dengan status psychological test (aktif atau tidak)
            $hasPsychoTest = ApplicationHistory::where('application_id', $application->id)
                ->whereHas('status', function ($query) {
                    $query->where('stage', 'psychological_test');
                })
                ->exists();
            
            Log::info('Checking psychotest scheduling', [
                'application_id' => $application->id,
                'current_status' => $currentStatus ? $currentStatus->stage : null,
                'has_psycho_test' => $hasPsychoTest
            ]);
            
            // Kirim scheduling jika status saat ini adalah psychological_test ATAU pernah ada history psychological test
            if (($currentStatus && $currentStatus->stage === 'psychological_test') || $hasPsychoTest) {
                // PERBAIKAN: Gunakan logic yang sama seperti di CandidateController
                $questionPack = \App\Models\QuestionPack::where('pack_name', 'Technical Assessment')
                    ->orWhere('test_type', 'Technical')
                    ->first();
                
                if (!$questionPack) {
                    $questionPack = \App\Models\QuestionPack::where('test_type', 'psychotest')
                        ->orWhere('pack_name', 'like', '%psikotes%')
                        ->orWhere('pack_name', 'like', '%psychological%')
                        ->orWhere('pack_name', 'like', '%kepribadian%')
                        ->first();
                }
                
                if (!$questionPack) {
                    $questionPack = \App\Models\QuestionPack::where('pack_name', 'General Assessment')
                        ->orWhere('test_type', 'general')
                        ->first();
                }
                
                // Fallback: ambil question pack pertama yang ada
                if (!$questionPack) {
                    $questionPack = \App\Models\QuestionPack::first();
                }
                
                Log::info('Question pack found', [
                    'pack_name' => $questionPack ? $questionPack->pack_name : null,
                    'opens_at' => $questionPack ? $questionPack->opens_at : null,
                    'closes_at' => $questionPack ? $questionPack->closes_at : null,
                ]);
                
                if ($questionPack) {
                    $now = now();
                    $opensAt = $questionPack->opens_at ? \Carbon\Carbon::parse($questionPack->opens_at) : null;
                    $closesAt = $questionPack->closes_at ? \Carbon\Carbon::parse($questionPack->closes_at) : null;
                    
                    $psychotestScheduling = [
                        'opens_at' => $questionPack->opens_at,
                        'closes_at' => $questionPack->closes_at,
                        'duration_minutes' => $questionPack->duration,
                        'is_available' => $opensAt && $closesAt ? $now->between($opensAt, $closesAt) : false,
                        'is_upcoming' => $opensAt ? $now->lt($opensAt) : false,
                        'is_expired' => $closesAt ? $now->gt($closesAt) : false,
                        'time_until_start' => $opensAt && $now->lt($opensAt) ? $now->diffForHumans($opensAt, true) : null,
                        'time_until_end' => $closesAt && $now->lt($closesAt) ? $now->diffForHumans($closesAt, true) : null,
                        'formatted_opens_at' => $opensAt ? $opensAt->format('d M Y H:i') : null,
                        'formatted_closes_at' => $closesAt ? $closesAt->format('d M Y H:i') : null,
                    ];
                    
                    Log::info('Psychotest scheduling created', $psychotestScheduling);
                }
            }

            // Format data aplikasi untuk tampilan - SINKRON dengan index
            $formattedApplication = [
                'id' => $application->id,
                'status_id' => $application->status_id, // PRIMARY: dari applications table
                'status_name' => $currentStage, // PRIMARY: dari applications.status
                'status_color' => $statusColor, // PRIMARY: berdasarkan applications.status
                'current_score' => $matchingHistory ? $matchingHistory->score : null, // SECONDARY: dari application_history
                'current_reviewer' => $matchingHistory && $matchingHistory->reviewer ? $matchingHistory->reviewer->name : null, // SECONDARY
                'psychotest_scheduling' => $psychotestScheduling, // NEW: scheduling information
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

            Log::info('Formatted application data', [
                'application' => $formattedApplication
            ]);

            return Inertia::render('candidate/status-candidate', [
                'application' => $formattedApplication,
            ]);

        } catch (\Exception $e) {
            // Log::error('Error in application status: ' . $e->getMessage(), [
            //     'application_id' => $id,
            //     'trace' => $e->getTraceAsString()
            // ]);

            return redirect('/candidate/application-history')
                ->with('error', 'Terjadi kesalahan saat memuat data status aplikasi.');
        }
    }

    /**
     * Helper methods - SINKRONISASI UNTUK KEDUA METHOD
     */
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
            Log::warning('JSON decode failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Format date safely with a fallback to current date
     * @param mixed $date The date to format
     * @param string $format The format string
     * @return string The formatted date or current date if null
     */
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
