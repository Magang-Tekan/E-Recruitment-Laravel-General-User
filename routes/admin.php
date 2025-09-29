    <?php

use App\Enums\UserRole;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VacanciesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

// Admin route
Route::middleware(['auth', 'role:'.UserRole::HR->value])
    ->prefix('dashboard')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('dashboard');

        // Contact Messages routes
        Route::prefix('contact-messages')
            ->name('contact-messages.')
            ->controller(\App\Http\Controllers\ContactMessagesController::class)
            ->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('/{contactMessage}', 'show')->name('show');
                Route::delete('/{contactMessage}', 'destroy')->name('destroy');
                Route::patch('/{contactMessage}/mark-read', 'markAsRead')->name('mark-read');
            });

        Route::prefix('users')
            ->name('users.')
            ->group(function () {
                Route::get('/', [UserController::class, 'store'])->name('info');
                Route::post('/', [UserController::class, 'create'])->name('create');
                Route::get('/list', [UserController::class, 'getUsers'])->name('users.list');
                Route::put('/{user}', [UserController::class, 'update'])->name('update');
                Route::delete('/{user}', [UserController::class, 'destroy'])->name('remove');
            });
        Route::prefix('jobs')
            ->name('jobs.')
            ->group(function () {
                Route::get('/', [VacanciesController::class, 'store'])->name('info');
                Route::post('/', [VacanciesController::class, 'create'])->name('create');
                Route::put('/{job}', [VacanciesController::class, 'update'])->name('update');
                Route::delete('/{job}', [VacanciesController::class, 'destroy'])->name('delete');
            });
        Route::prefix('candidates')
            ->name('candidates.')
            ->group(function () {
                Route::get('/', [UserController::class, 'store'])->name('info');
                Route::post('/', [UserController::class, 'create'])->name('create');
                Route::put('/{candidate}', [UserController::class, 'update'])->name('update');
                Route::delete('/{candidate}', [UserController::class, 'destroy'])->name('remove');
                Route::prefix('questions')
                    ->name('questions.')
                    ->group(function () {
                        Route::get('/', [QuestionController::class, 'store'])->name('info');
                    });
            });

        Route::prefix('questions')
            ->name('questions.')
            ->group(function () {
                Route::get('/', [QuestionController::class, 'store'])->name('info');
                Route::get('/add-questions', [QuestionController::class, 'create'])->name('create');
                Route::get('/edit/{questionPack}', [QuestionController::class, 'edit'])->name('edit');
                Route::post('/', [QuestionController::class, 'store'])->name('store');
                Route::put('/{questionPack}', [QuestionController::class, 'update'])->name('update');
                Route::delete('/{question}', [QuestionController::class, 'destroy'])->name('remove');

                // Route::post('/debug-update/{questionPack}', function(Request $request, QuestionPacks $questionPack) {
                //     Log::info('Debug update received for question pack: ' . $questionPack->id, [
                //         'request' => $request->all()
                //     ]);
                //     return response()->json([
                //         'status' => 'received',
                //         'question_pack_id' => $questionPack->id,
                //         'data' => $request->all()
                //     ]);
                // })->name('debug.update');
            });
    });
