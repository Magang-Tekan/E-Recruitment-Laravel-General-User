<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Vacancies;
use App\Models\Contacts;
use App\Models\MasterMajor;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        try {
            // Get all companies for the main content
            $allCompanies = Company::select('id', 'name', 'description', 'logo')
                ->orderBy('id')
                ->get()
                ->map(function($company) {
                    return [
                        'id' => $company->id,
                        'name' => $company->name,
                        'description' => $company->description,
                        'logo' => asset('storage/' . $company->logo)
                    ];
                });

            // Get companies with ID 2 for the footer first column
            $mainCompany = Company::select('id', 'name', 'description')
                ->where('id', 2)
                ->first();

            // Get only companies with ID 2 and 3 for footer
            $footerCompanies = Company::select('id', 'name')
                ->whereIn('id', [2, 3])
                ->get()
                ->map(function($company) {
                    return [
                        'id' => $company->id,
                        'name' => $company->name
                    ];
                });

            $contacts = Contacts::select('email', 'phone', 'address')->first();

            return Inertia::render('welcome', [
                'companies' => $allCompanies,
                'mainCompany' => $mainCompany,
                'footerCompanies' => $footerCompanies,
                'vacancies' => $this->getFormattedVacancies(),
                'contacts' => $contacts
            ]);

        } catch (\Exception $e) {
            Log::error('Error in WelcomeController: ' . $e->getMessage());
            return Inertia::render('welcome', [
                'companies' => [],
                'footerCompanies' => [],
                'vacancies' => [],
                'contacts' => null
            ]);
        }
    }

    /**
     * Get formatted vacancies with the same structure as JobsController
     */
    private function getFormattedVacancies()
    {
        try {
            // Get vacancies with the same relations as JobsController
            $jobs = Vacancies::with(['company', 'department', 'vacancyType', 'major'])
                ->latest()
                ->take(6) // Limit to 6 for welcome page
                ->get();

            // Transform job data to match expected format (same as JobsController)
            return $jobs->map(function($job) {
                // Get deadline from periods
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

                // Check if expired
                $isExpired = $period && now()->isAfter($period->end_time);

                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'company' => [
                        'name' => $job->company ? $job->company->name : 'Unknown',
                        'id' => $job->company ? $job->company->id : null
                    ],
                    'description' => $job->job_description ?: 'No description available',
                    'location' => $job->location,
                    'type' => $job->vacancyType ? $job->vacancyType->name : 'Unknown',
                    'department' => $job->department ? $job->department->name : 'Unknown',
                    'endTime' => $period ? $period->end_time : null,
                    'deadline' => $period ? $period->end_time : 'Open',
                    'isExpired' => $isExpired,
                    'requirements' => $requirements,
                    'benefits' => $benefits,
                    'salary' => $job->salary,
                    'major_id' => $job->major_id,
                    'major_name' => $majorName,
                    'created_at' => $job->created_at ? $job->created_at->format('Y-m-d H:i:s') : null,
                    'updated_at' => $job->updated_at ? $job->updated_at->format('Y-m-d H:i:s') : null
                ];
            });
        } catch (\Exception $e) {
            Log::error('Error formatting vacancies for welcome page: ' . $e->getMessage());
            return [];
        }
    }
}
