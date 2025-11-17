<?php

namespace App\Http\Controllers;

use App\Models\Vacancies;
use App\Models\Company;
use App\Models\MasterMajor;
use App\Models\CandidatesProfiles;
use App\Models\CandidatesEducations;
use App\Models\CandidatesWorkExperiences;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class VacanciesController extends Controller
{
    public function index()
    {
        try {
            $vacancies = Vacancies::with(['company', 'department', 'vacancyType', 'periods'])
                ->latest()
                ->take(6)
                ->get()
                ->map(function ($vacancy) {
                    // Get the first period's end time
                    $endTime = $vacancy->periods->first()?->end_time;

                    return [
                        'id' => $vacancy->id,
                        'title' => $vacancy->title,
                        'company' => [
                            'name' => $vacancy->company ? $vacancy->company->name : 'N/A'
                        ],
                        'department' => $vacancy->department ? $vacancy->department->name : 'N/A',
                        'type' => $vacancy->vacancyType ? $vacancy->vacancyType->name : 'Full Time',
                        'location' => $vacancy->location,
                        'requirements' => is_array($vacancy->requirements)
                            ? $vacancy->requirements
                            : (is_string($vacancy->requirements) ? json_decode($vacancy->requirements, true) : []) ?? [],
                        'endTime' => $endTime
                            ? \Carbon\Carbon::parse($endTime)->locale('id')->isoFormat('D MMMM Y')
                            : null,
                        'isExpired' => $endTime
                            ? now()->gt(\Carbon\Carbon::parse($endTime))
                            : true
                    ];
                });

            // Debug final data being sent to view

            return Inertia::render('welcome', [
                'vacancies' => $vacancies,
                'companies' => Company::select('id', 'name', 'description', 'logo')->get()
            ]);

        } catch (\Exception $e) {
            return Inertia::render('welcome', [
                'vacancies' => [],
                'companies' => []
            ]);
        }
    }

    public function store()
    {
        $vacancies = Vacancies::all();

        return Inertia::render('admin/jobs/jobs-management', [
            'vacancies' => $vacancies,
        ]);
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'requirements' => 'required|array',
            'benefits' => 'nullable|array',
        ]);

        $user_id = Auth::user()->id;
        $job = Vacancies::create([
            'user_id' => $user_id,
            'title' => $validated['title'],
            'department' => $validated['department'],
            'location' => $validated['location'],
            'requirements' => $validated['requirements'],
            'benefits' => $validated['benefits'] ?? [],
        ]);

        return response()->json([
            'message' => 'Job created successfully',
            'job' => $job,
        ], 201);
    }

    public function update(Request $request, Vacancies $job)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'department' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'requirements' => 'required|array',
            'benefits' => 'nullable|array',
        ]);

        $job->update([
            'title' => $validated['title'],
            'department' => $validated['department'],
            'location' => $validated['location'],
            'requirements' => $validated['requirements'],
            'benefits' => $validated['benefits'] ?? [],
        ]);

        return response()->json([
            'message' => 'Job updated successfully',
            'job' => $job,
        ]);
    }

    public function destroy(Vacancies $job)
    {
        $job->delete();

        return response()->json([
            'message' => 'Job deleted successfully',
        ]);
    }

    public function getVacancies(Request $request)
    {
        $userId = Auth::id();

        // Ambil data kandidat
        $profile = CandidatesProfiles::where('user_id', $userId)->first();
        $education = CandidatesEducations::where('user_id', $userId)->first();
        $workExperiences = CandidatesWorkExperiences::where('user_id', $userId)->get();

        // Ambil jurusan kandidat
        $majorId = $education?->major_id;

        // Ambil semua lowongan
        $vacancies = Vacancies::with(['company', 'jobType', 'department'])->get()->map(function ($vacancy) {
            return [
                'id' => $vacancy->id,
                'title' => $vacancy->title,
                'company' => [
                    'name' => $vacancy->company ? $vacancy->company->name : 'N/A',
                ],
                'description' => $vacancy->job_description ?? $vacancy->description,
                'location' => $vacancy->location,
                'type' => $vacancy->jobType ? $vacancy->jobType->name : 'N/A',
                'deadline' => $vacancy->deadline ? $vacancy->deadline->format('d F Y') : 'Open',
                'department' => $vacancy->department ? $vacancy->department->name : 'N/A',
                'requirements' => $vacancy->requirements,
            ];
        });

        // Rekomendasi berdasarkan jurusan kandidat
        $recommendations = [];
        if ($majorId) {
            $recommendedVacancies = Vacancies::with(['company', 'jobType', 'department'])
                ->where('major_id', $majorId)
                ->get();

            foreach ($recommendedVacancies as $vacancy) {
                $recommendations[] = [
                    'vacancy' => [
                        'id' => $vacancy->id,
                        'title' => $vacancy->title,
                        'company' => [
                            'name' => $vacancy->company ? $vacancy->company->name : 'N/A',
                        ],
                        'description' => $vacancy->job_description ?? $vacancy->description,
                        'location' => $vacancy->location,
                        'type' => $vacancy->jobType ? $vacancy->jobType->name : 'N/A',
                        'deadline' => $vacancy->deadline ? $vacancy->deadline->format('d F Y') : 'Open',
                        'department' => $vacancy->department ? $vacancy->department->name : 'N/A',
                    ],
                    'score' => 100, // Atau logika penilaian lain jika ingin
                ];
            }
        }

        $companies = Companies::pluck('name')->toArray();

        // Ambil nama jurusan kandidat untuk frontend
        $candidateMajor = $education && $education->major ? $education->major->name : null;

        return Inertia::render('candidate/jobs/job-hiring', [
            'jobs' => $vacancies,
            'recommendations' => $recommendations,
            'companies' => $companies,
            'candidateMajor' => $candidateMajor,
        ]);
    }

    public function getVacanciesLandingPage(Request $request)
    {
        try {
            // Get vacancies with the same relations as JobsController and WelcomeController
            $query = Vacancies::with(['company', 'department', 'vacancyType', 'major'])
                ->orderBy('created_at', 'desc');

            // Filter by company if provided
            if ($request->has('company') && $request->company !== 'all') {
                $query->whereHas('company', function ($q) use ($request) {
                    $q->where('name', $request->company);
                });
            }

            // Transform job data to match the same format as WelcomeController
            $jobs = $query->get()->map(function($job) {
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

            // Get list of companies for filtering
            $companies = Company::pluck('name')->toArray();

            // Render the view with enhanced data structure
            return Inertia::render('landing-page/job-hiring-landing-page', [
                'jobs' => $jobs,
                'companies' => $companies,
            ]);
        } catch (\Exception $e) {
            // Log error and return empty data with error message
            return Inertia::render('landing-page/job-hiring-landing-page', [
                'jobs' => [],
                'companies' => [],
                'error' => 'Failed to load job vacancies',
            ]);
        }
    }

    public function show($id)
    {
        $job = Vacancies::with('company')->findOrFail($id);

        return Inertia::render('candidate/detail-job/detail-job', [
            'job' => [
                'title' => $job->title,
                'company' => [
                    'name' => $job->company->name,
                ],
                'job_description' => $job->job_description,
                'requirements' => $job->requirements,
                'benefits' => $job->benefits,
            ],
        ]);
    }
}
