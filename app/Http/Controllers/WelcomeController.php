<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Vacancies;
use App\Models\Contacts;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    public function index()
    {
        try {
            $companies = Company::select('id', 'name', 'description', 'logo')
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

            $contacts = Contacts::select('email', 'phone', 'address')->first();

            return Inertia::render('welcome', [
                'companies' => $companies,
                'vacancies' => Vacancies::with('company:id,name')
                    ->latest()
                    ->take(6)
                    ->get(),
                'contacts' => $contacts
            ]);

        } catch (\Exception $e) {
            Log::error('Error in WelcomeController: ' . $e->getMessage());
            return Inertia::render('welcome', [
                'companies' => [],
                'vacancies' => [],
                'contacts' => null
            ]);
        }
    }
}