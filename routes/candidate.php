<?php

use App\Enums\UserRole;
use App\Http\Controllers\CandidateController;
use App\Http\Controllers\JobsController;
use App\Http\Controllers\CandidateEducationController;
use App\Http\Controllers\ApplicationHistoryController;
use Illuminate\Support\Facades\Route;


// User route
Route::middleware(['auth'])
    ->prefix('candidate')
    ->group(function () {
        Route::get('/', [CandidateController::class, 'index'])->name('user.info');
        Route::get('/profile', [CandidateController::class, 'profile'])->name('user.profile');
        Route::post('/profile/data-pribadi', [CandidateController::class, 'storeDataPribadi'])->name('candidate.profile.store');
        Route::get('/dashboard', [CandidateController::class, 'dashboard'])->name('user.dashboard');

        Route::prefix('jobs')
            ->name('candidate.jobs.')
            ->group(function () {
                Route::get('/', [JobsController::class, 'index'])->name('index');
                Route::post('/{id}/apply', [JobsController::class, 'apply'])->name('apply');
            });

        Route::get('/job/{id}', [JobsController::class, 'detail'])->name('candidate.job.detail');
        Route::get('/application-history', [ApplicationHistoryController::class, 'index'])->name('candidate.application-history');
        Route::get('/application/{id}/status', [ApplicationHistoryController::class, 'applicationStatus'])->name('candidate.application.status');
        Route::get('/confirm-data/{job_id?}', [JobsController::class, 'confirmData'])->name('candidate.confirm-data');
        Route::get('/check-profile-complete', [JobsController::class, 'checkProfileCompleteEndpoint'])->name('candidate.check-profile-complete');
        Route::get('/check-relationships', [ApplicationHistoryController::class, 'checkRelationships'])->name('candidate.check-relationships');
        Route::post('/apply/{id}', [JobsController::class, 'apply'])->name('candidate.apply');
        Route::get('/check-profile-complete', [JobsController::class, 'checkProfileCompleteEndpoint'])->name('candidate.check-profile-complete');
    });

// Route::middleware(['auth'])->group(function () {
//     Route::get('/candidate/education', [CandidateEducationController::class, 'getEducation']);
// });
