<?php
// @phpstan-ignore-file

use App\Enums\UserRole;
use App\Http\Controllers\VacanciesController;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\JobsController;
use App\Http\Controllers\ApplicationHistoryController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Http\Controllers\ResetPasswordController;
use App\Models\AboutUs;
use App\Http\Controllers\ContactsController;
use App\Http\Controllers\PersonalDataController;
use App\Http\Controllers\AboutUsController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\ContactMessagesController;
use App\Models\Applications;
use App\Models\ApplicationHistory;
use App\Enums\CandidatesStage;

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');
Route::get('/job-hiring-landing-page', [VacanciesController::class, 'getVacanciesLandingPage'])->name('job-hiring-landing-page');
Route::post('/reset-password', [ResetPasswordController::class, 'update'])->name('password.update');

// Authenticated routes for job access
Route::middleware(['auth'])->group(function() {
    // Make /job-hiring redirect to /candidate/jobs for consistency
    Route::get('/job-hiring', function() {
        return redirect()->route('candidate.jobs.index');
    })->name('job-hiring');

    Route::get('/job-detail/{id}', [JobsController::class, 'detail'])->name('job.detail');
});

Route::get('/ContactPerson', function () {
    return Inertia::render('ContactPerson');
})->name('ContactPerson');

Route::get('/data-pribadi', function () {
        return Inertia::render('DataPribadiForm');
    })->name('data.pribadi');

Route::get('/contact', [ContactsController::class, 'index'])->name('contact');
Route::post('/contact', [ContactsController::class, 'store'])->name('contact.store');
Route::post('/contact/submit', [ContactMessagesController::class, 'store'])->name('contact.submit');

Route::get('/about-us', [AboutUsController::class, 'index'])->name('about-us');

// API routes untuk AJAX requests
Route::middleware(['auth'])->group(function () {
    // Route untuk get majors
    Route::get('/api/majors', function () {
        try {
            $majors = \App\Models\MasterMajor::orderBy('name', 'asc')->get();
            return response()->json($majors);
        } catch (\Exception $e) {
            Log::error('Error fetching majors: ' . $e->getMessage());
            return response()->json([
                'error' => 'Gagal mengambil data program studi'
            ], 500);
        }
    });


    Route::get('/api/candidate/education', [CandidateController::class, 'getEducation']);
    Route::post('/api/candidate/education', [CandidateController::class, 'storeEducation']);


    Route::get('/api/candidate/profile-image', [CandidateController::class, 'getProfileImage'])
        ->name('candidate.profile-image.get');
    Route::post('/api/candidate/profile-image', [CandidateController::class, 'uploadProfileImage'])
        ->name('candidate.profile-image.upload');

    // Tambahkan route untuk get educations
    Route::get('/api/candidate/educations', [CandidateController::class, 'getAllEducations']);
    Route::post('/api/candidate/education', [CandidateController::class, 'storeEducation']);
    Route::put('/api/candidate/education/{id}', [CandidateController::class, 'updateEducation']);
    Route::delete('/api/candidate/education/{id}', [CandidateController::class, 'deleteEducation']);

    // API routes for work experience
    Route::get('/api/candidate/work-experience', [CandidateController::class, 'getWorkExperiences']);
    Route::post('/api/candidate/work-experience', [CandidateController::class, 'storeWorkExperience']);
    Route::put('/api/candidate/work-experience/{id}', [CandidateController::class, 'updateWorkExperience']);
    Route::delete('/api/candidate/work-experience/{id}', [CandidateController::class, 'deleteWorkExperience']);

    // API routes for organization
    Route::get('/api/candidate/organization', [CandidateController::class, 'getOrganizations']);
    Route::post('/api/candidate/organization', [CandidateController::class, 'storeOrganization']);
    Route::put('/api/candidate/organization/{id}', [CandidateController::class, 'updateOrganization']);
    Route::delete('/api/candidate/organization/{id}', [CandidateController::class, 'deleteOrganization']);

    // API routes for achievement
    Route::get('/api/candidate/achievement', [CandidateController::class, 'getAchievements']);
    Route::post('/api/candidate/achievement', [CandidateController::class, 'storeAchievement']);
    Route::put('/api/candidate/achievement/{id}', [CandidateController::class, 'updateAchievement']);
    Route::delete('/api/candidate/achievement/{id}', [CandidateController::class, 'deleteAchievement']);

    // API routes for social media
    Route::get('/api/candidate/social-media', [CandidateController::class, 'getSocialMedia']);
    Route::post('/api/candidate/social-media', [CandidateController::class, 'storeSocialMedia']);
    Route::put('/api/candidate/social-media/{id}', [CandidateController::class, 'updateSocialMedia']);
    Route::delete('/api/candidate/social-media/{id}', [CandidateController::class, 'deleteSocialMedia']);

    // Add this new route for education levels
    Route::get('/api/education-levels', function () {
        try {
            $educationLevels = \App\Models\EducationLevel::orderBy('name', 'asc')->get();
            return response()->json($educationLevels);
        } catch (\Exception $e) {
            Log::error('Error fetching education levels: ' . $e->getMessage());
            return response()->json([
                'error' => 'Gagal mengambil data tingkat pendidikan'
            ], 500);
        }
    });
});


Route::middleware(['auth'])->get('/redirect', function () {
    return Auth::user()->role === UserRole::HR
    ? redirect()->route('admin.dashboard')
    : redirect()->route('welcome'); // Changed from dashboard to welcome
})->name('dashboard');

// Add a new beranda route that points to welcome
Route::get('/beranda', function () {
    return redirect()->route('welcome');
})->name('beranda');

Route::get('/confirm-data', function () {
    return Inertia::render('candidate/profile/confirm-data');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/candidate/applicant-completeness', [CandidateController::class, 'checkApplicationDataCompleteness'])
        ->name('candidate.applicant-completeness');
});


Route::post('/candidate/data-pribadi', [CandidateController::class, 'storeDataPribadi'])
    ->name('candidate.data-pribadi.store');

Route::middleware(['auth'])->group(function () {
    // Route untuk form data pribadi (GET)
    Route::get('/candidate/data-pribadi', [CandidateController::class, 'profile'])
        ->name('candidate.data-pribadi');


    Route::post('/candidate/work-experience', [CandidateController::class, 'storeWorkExperience'])
        ->name('candidate.work-experience.store');

    // Update pengalaman kerja (PUT)
    Route::put('/candidate/work-experience/{id}', [CandidateController::class, 'updateWorkExperience'])
        ->name('candidate.work-experience.update');

    // Ambil semua pengalaman kerja (GET)
    Route::get('/candidate/work-experience', [CandidateController::class, 'getWorkExperiences'])
        ->name('candidate.work-experience.index');

    // Ambil satu pengalaman kerja (GET)
    Route::get('/candidate/work-experience/{id}', [CandidateController::class, 'showWorkExperience'])
        ->name('candidate.work-experience.show');


    Route::delete('/candidate/work-experience/{id}', [CandidateController::class, 'deleteWorkExperience'])
        ->name('candidate.work-experience.delete');
    Route::get('/candidate/work-experiences', [CandidateController::class, 'indexWorkExperiences'])
        ->name('candidate.work-experiences');


    Route::get('/candidate/work-experience/{id}/edit', [CandidateController::class, 'editWorkExperience'])
        ->name('candidate.work-experience.edit');


    Route::get('/candidate/achievements', [CandidateController::class, 'indexAchievements'])
        ->name('candidate.achievements');
    Route::post('/candidate/achievement', [CandidateController::class, 'storeAchievement'])
        ->name('candidate.achievement.store');
    Route::put('/candidate/achievement/{id}', [CandidateController::class, 'updateAchievement'])
        ->name('candidate.achievement.update');
    Route::delete('/candidate/achievement/{id}', [CandidateController::class, 'deleteAchievement'])
        ->name('candidate.achievement.delete');
});

// Profile routes
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [CandidateController::class, 'profile'])->name('user.profile');
});



// Organization routes
Route::middleware(['auth'])->group(function () {
    Route::get('/candidate/organizations', [CandidateController::class, 'indexOrganizations'])
        ->name('candidate.organizations');
    Route::post('/candidate/organization', [CandidateController::class, 'storeOrganization'])
        ->name('candidate.organization.store');
    Route::put('/candidate/organization/{id}', [CandidateController::class, 'updateOrganization'])
        ->name('candidate.organization.update');
    // Add this new route
    Route::delete('/candidate/organization/{id}', [CandidateController::class, 'deleteOrganization'])
        ->name('candidate.organization.delete');
});

// Social Media routes
Route::middleware(['auth'])->group(function () {
    Route::get('/candidate/social-media', [CandidateController::class, 'indexSocialMedia']);
    Route::post('/candidate/social-media', [CandidateController::class, 'storeSocialMedia']);
    Route::put('/candidate/social-media/{id}', [CandidateController::class, 'updateSocialMedia']);
    // Add this new route
    Route::delete('/candidate/social-media/{id}', [CandidateController::class, 'deleteSocialMedia']);
});

// Skills routes
Route::middleware(['auth'])->group(function () {
    Route::get('/candidate/skills', [CandidateController::class, 'indexSkills'])
        ->name('candidate.skills.index');
    Route::post('/candidate/skills', [CandidateController::class, 'storeSkill'])
        ->name('candidate.skills.store');
    Route::get('/candidate/skills/{id}', [CandidateController::class, 'showSkill'])
        ->name('candidate.skills.show');
    Route::put('/candidate/skills/{id}', [CandidateController::class, 'updateSkill'])
        ->name('candidate.skills.update');
    Route::delete('/candidate/skills/{id}', [CandidateController::class, 'deleteSkill'])
        ->name('candidate.skills.delete');
});

// Languages routes
Route::middleware(['auth'])->group(function () {
    Route::get('/candidate/languages', [CandidateController::class, 'indexLanguages'])
        ->name('candidate.languages.index');
    Route::post('/candidate/languages', [CandidateController::class, 'storeLanguage'])
        ->name('candidate.languages.store');
    Route::put('/candidate/languages/{id}', [CandidateController::class, 'updateLanguage'])
        ->name('candidate.languages.update');
    Route::delete('/candidate/languages/{id}', [CandidateController::class, 'deleteLanguage'])
        ->name('candidate.languages.delete');
});

// Courses routes
Route::middleware(['auth'])->group(function () {
    Route::get('/candidate/courses', [CandidateController::class, 'indexCourses'])
        ->name('candidate.courses.index');
    Route::post('/candidate/courses', [CandidateController::class, 'storeCourse'])
        ->name('candidate.courses.store');
    Route::put('/candidate/courses/{id}', [CandidateController::class, 'updateCourse'])  // Add this line
        ->name('candidate.courses.update');
    Route::delete('/candidate/courses/{id}', [CandidateController::class, 'deleteCourse'])
        ->name('candidate.courses.delete');
});

// Certifications routes
Route::middleware(['auth'])->group(function () {
    Route::get('/candidate/certifications', [CandidateController::class, 'indexCertifications'])
        ->name('candidate.certifications.index');
    Route::post('/candidate/certifications', [CandidateController::class, 'storeCertification'])
        ->name('candidate.certifications.store');
    Route::put('/candidate/certifications/{id}', [CandidateController::class, 'updateCertification'])  // Add this line
        ->name('candidate.certifications.update');
    Route::delete('/candidate/certifications/{id}', [CandidateController::class, 'deleteCertification'])
        ->name('candidate.certifications.delete');
});


// CV Generation routes
Route::middleware(['auth'])->group(function () {
    Route::get('/candidate/data-completeness', [CandidateController::class, 'checkDataCompleteness'])
        ->name('candidate.data-completeness');
    Route::get('/candidate/cv/generate', [CandidateController::class, 'generateCV'])
        ->name('candidate.cv.generate');
    Route::get('/candidate/cv/download/{id?}', [CandidateController::class, 'downloadCV'])
        ->name('candidate.cv.download');
    Route::get('/candidate/cvs', [CandidateController::class, 'listUserCVs'])
        ->name('candidate.cvs.list');
    Route::delete('/candidate/cv/{id}', [CandidateController::class, 'deleteCV'])
        ->name('candidate.cv.delete');
    Route::get('/candidate/cv/test', [CandidateController::class, 'testPDF'])
        ->name('candidate.cv.test');
});

// Job Recommendations route
Route::get('/candidate/job-recommendations', [CandidateController::class, 'jobRecommendations'])->middleware('auth');

// Tambahkan route untuk apply lowongan
Route::middleware(['auth', 'role:candidate'])->group(function () {
    // Routes untuk personal data dan application history
    Route::get('/personal-data', [PersonalDataController::class, 'index'])->name('candidate.personal-data');
    Route::post('/personal-data/update', [PersonalDataController::class, 'update'])->name('candidate.personal-data.update');
});

// Routes untuk kandidat
Route::middleware(['auth', 'role:candidate'])->prefix('candidate')->group(function () {
    // Detail job dan apply
    Route::get('/job/{id}', [JobsController::class, 'detail'])->name('candidate.job.detail');

    // API untuk apply job dari frontend
    Route::post('/api/jobs/{id}/apply', [JobsController::class, 'applyJob']);

    // Endpoint untuk proses apply setelah confirm data
    Route::post('/candidate/apply/{id}', [JobsController::class, 'apply'])->name('candidate.apply');


    // Route untuk submit psychotest
    Route::post('/tests/psychotest/submit', [CandidateController::class, 'submitPsychotest'])
        ->name('candidate.tests.psychotest.submit');
});

// Routes untuk Psychotest (tanpa middleware role)
Route::middleware(['auth'])->group(function () {
    Route::get('/candidate/tests/psychotest/{application_id?}', [CandidateController::class, 'showPsychotest'])
        ->name('candidate.tests.psychotest');
});

// Routes untuk serve achievement files
Route::middleware(['auth'])->group(function () {
    Route::get('/storage/achievements/{filename}', [CandidateController::class, 'serveAchievementFile'])
        ->name('achievement.file.serve');
});

// ApplicationHistory routes
Route::middleware(['auth', 'role:candidate'])->prefix('candidate')->group(function () {
    Route::get('/application-history', [ApplicationHistoryController::class, 'index'])
        ->name('candidate.application-history');

    Route::get('/application/{id}/status', [ApplicationHistoryController::class, 'applicationStatus'])
        ->name('candidate.application-status');
});

// No redirect needed as the route is defined above and in candidate.php

// Redirect /lowongan ke /job-hiring-landing-page untuk konsistensi
Route::get('/lowongan', function() {
    return redirect('/job-hiring-landing-page');
});

Route::middleware(['auth'])->group(function () {
    // Route confirm-data dengan parameter job_id
    Route::get('/candidate/confirm-data/{job_id?}', [CandidateController::class, 'showConfirmData'])
        ->name('candidate.confirm-data');

    // Route yang sudah ada...
});

// Route untuk debugging - tambahkan dalam grup middleware auth
Route::get('/debug/psychotest/{application_id}', function($application_id) {
    $user = Auth::user();
    $application = Applications::findOrFail($application_id);

    // Keamanan: pastikan hanya pemilik aplikasi yang bisa melihat
    if ($application->user_id != $user->id && !in_array($user->role->value, ['super_admin', 'hr'])) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    // Cari history psikotes
    $psychotest = ApplicationHistory::where('application_id', $application_id)
        ->whereHas('status', function ($query) {
            $query->where('stage', CandidatesStage::PSYCHOTEST->value)
                ->orWhere('name', 'like', '%Psiko%')
                ->orWhere('name', 'like', '%Psychological%');
        })
        ->with('status')
        ->first();

    return response()->json([
        'application' => $application,
        'psychotest_history' => $psychotest,
        'psychotest_status' => $psychotest ? [
            'name' => $psychotest->status->name,
            'stage' => $psychotest->status->stage,
            'is_active' => $psychotest->is_active,
            'completed_at' => $psychotest->completed_at,
            'processed_at' => $psychotest->processed_at
        ] : null
    ]);
})->name('debug.psychotest');

// Tambahkan di web.php
Route::get('/debug/application/{id}/histories', function($id) {
    $application = \App\Models\Applications::findOrFail($id);
    $histories = \App\Models\ApplicationHistory::where('application_id', $id)
        ->with('status')
        ->get()
        ->map(function($h) {
            return [
                'id' => $h->id,
                'application_id' => $h->application_id,
                'status_id' => $h->status_id,
                'status_name' => $h->status->name,
                'is_active' => (bool)$h->is_active,
                'completed_at' => $h->completed_at,
                'processed_at' => $h->processed_at,
                'scheduled_at' => $h->scheduled_at,
            ];
        });

    return response()->json([
        'application' => [
            'id' => $application->id,
            'user_id' => $application->user_id,
            'status_id' => $application->status_id
        ],
        'histories' => $histories
    ]);
})->middleware('auth');

// Tambahkan di web.php di dalam grup middleware auth
Route::get('/debug/application-data', function() {
    $user = Auth::user();
    $applications = \App\Models\Applications::with(['applicationHistories.status'])
        ->where('user_id', $user->id)
        ->get()
        ->map(function($application) {
            $histories = $application->applicationHistories->map(function($history) {
                return [
                    'id' => $history->id,
                    'application_id' => $history->application_id,
                    'status_id' => $history->status_id,
                    'status_name' => $history->status->name,
                    'is_active' => (bool)$history->is_active,
                    'completed_at' => $history->completed_at,
                    'processed_at' => $history->processed_at,
                    'scheduled_at' => $history->scheduled_at,
                ];
            });

            return [
                'application_id' => $application->id,
                'user_id' => $application->user_id,
                'status_id' => $application->status_id,
                'histories' => $histories
            ];
        });

    return response()->json([
        'user_id' => $user->id,
        'applications' => $applications
    ]);
})->middleware('auth');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/candidate.php';
require __DIR__.'/admin.php';

