<?php

namespace App\Http\Controllers;

use App\Models\Applications;
use App\Models\ApplicationHistory;
use App\Models\Vacancies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ApplicationHistoryController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return redirect()->route('login')->with('error', 'Silakan login terlebih dahulu');
            }
            
            // Ambil data aplikasi dari user yang sedang login
            $applications = Applications::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
                
            $formattedApplications = [];
            
            foreach ($applications as $app) {
                // Ambil data lowongan
                $vacancy = Vacancies::with('company', 'vacancyType')->find($app->vacancies_id);
                if (!$vacancy) continue;
                
                // Ambil history terbaru untuk aplikasi ini
                $latestHistory = ApplicationHistory::where('application_id', $app->id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                
                if (!$latestHistory) continue;
                
                // Ambil data status dari tabel selection
                $status = DB::table('selection')->find($app->status_id);
                if (!$status) continue;
                
                // Map status color berdasarkan nama status
                $statusColor = $this->getStatusColor($status->name);
                
                // Format data untuk frontend
                $formattedApplications[] = [
                    'id' => $app->id,
                    'status_id' => $app->status_id,
                    'status_name' => $status->name,
                    'status_color' => $statusColor,
                    'job' => [
                        'id' => $vacancy->id,
                        'title' => $vacancy->title,
                        'company' => $vacancy->company ? $vacancy->company->name : 'Unknown',
                        'location' => $vacancy->location ?: 'Location not specified',
                        'type' => $vacancy->vacancyType ? $vacancy->vacancyType->name : 'Unknown',
                    ],
                    'applied_at' => $app->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $latestHistory->created_at->format('Y-m-d H:i:s'),
                    'history' => [
                        'id' => $latestHistory->id,
                        'is_qualified' => $latestHistory->is_qualified,
                        'created_at' => $latestHistory->created_at->format('Y-m-d H:i:s'),
                    ]
                ];
            }
            
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
     * Detail status aplikasi
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
                    'status_color' => $this->getStatusColor($status->name),
                    'is_qualified' => $history->is_qualified,
                    'created_at' => $history->created_at->format('Y-m-d H:i:s'),
                    'notes' => $this->getHistoryNotes($history, $status->name),
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
     * Helper method untuk mendapatkan warna status
     */
    private function getStatusColor($statusName)
    {
        $statusName = strtolower($statusName);
        
        switch ($statusName) {
            case 'administrasi':
                return '#3498db'; // biru
            case 'psikotes':
            case 'psikologi':
                return '#9b59b6'; // ungu
            case 'interview hr':
            case 'interview user':
                return '#e67e22'; // oranye
            case 'medical checkup':
                return '#2ecc71'; // hijau
            case 'penawaran':
            case 'offering':
                return '#1abc9c'; // turquoise
            case 'ditolak':
            case 'rejected':
                return '#e74c3c'; // merah
            case 'diterima':
            case 'accepted':
                return '#27ae60'; // hijau tua
            default:
                return '#7f8c8d'; // abu-abu
        }
    }
    
    /**
     * Helper method untuk mendapatkan catatan berdasarkan stage
     */
    private function getHistoryNotes($history, $stageName)
    {
        $stageName = strtolower($stageName);
        
        switch ($stageName) {
            case 'administrasi':
                return $history->admin_notes ?? 'Saat ini lamaran Anda sedang dalam proses verifikasi administrasi.';
            case 'psikotes':
            case 'psikologi':
                if ($history->test_scheduled_at) {
                    return "Anda dijadwalkan untuk mengikuti psikotes pada " . 
                        \Carbon\Carbon::parse($history->test_scheduled_at)->format('d M Y, H:i');
                }
                return $history->test_notes ?? 'Menunggu jadwal psikotes.';
            case 'interview hr':
            case 'interview user':
                if ($history->interview_scheduled_at) {
                    return "Anda dijadwalkan untuk interview pada " . 
                        \Carbon\Carbon::parse($history->interview_scheduled_at)->format('d M Y, H:i');
                }
                return $history->interview_notes ?? 'Menunggu jadwal interview.';
            case 'medical checkup':
                return 'Anda diharapkan untuk menjalani medical checkup.';
            case 'penawaran':
            case 'offering':
                return 'Selamat! Anda akan mendapatkan penawaran dari tim HR kami.';
            case 'ditolak':
            case 'rejected':
                return $history->rejection_reason ?? 'Maaf, lamaran Anda belum berhasil pada tahap ini.';
            case 'diterima':
            case 'accepted':
                return 'Selamat! Anda telah diterima.';
            default:
                return '';
        }
    }
}
