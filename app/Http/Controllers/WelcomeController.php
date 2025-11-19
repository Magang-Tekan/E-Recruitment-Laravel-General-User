<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Vacancies;
use App\Models\Contacts;
use App\Models\MasterMajor;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        try {
            // Get featured companies for the main content, fallback to all companies if none are featured
            $featuredCompanies = Company::select('id', 'name', 'description', 'logo', 'website', 'email', 'phone', 'address', 'featured', 'display_order')
                ->where('featured', true)
                ->orderBy('display_order')
                ->orderBy('id')
                ->get();

            // If no featured companies, get all companies
            if ($featuredCompanies->isEmpty()) {
                $featuredCompanies = Company::select('id', 'name', 'description', 'logo', 'website', 'email', 'phone', 'address', 'featured', 'display_order')
                    ->orderBy('id')
                    ->get();
            }

            $featuredCompanies = $featuredCompanies->map(function($company) {
                return [
                    'id' => $company->id,
                    'name' => $company->name,
                    'description' => $company->description,
                    'logo' => $company->getLogoUrl(),
                    'website' => $company->website,
                    'email' => $company->email,
                    'phone' => $company->phone,
                    'address' => $company->address
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

            // Log the data being sent

            return Inertia::render('welcome', [
                'companies' => $featuredCompanies,
                'mainCompany' => $mainCompany,
                'footerCompanies' => $footerCompanies,
                'vacancies' => $this->getFormattedVacancies(),
                'contacts' => $contacts
            ]);

        } catch (\Exception $e) {
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
            return [];
        }
    }
}
