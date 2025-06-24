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
                'footerCompanies' => [],
                'vacancies' => [],
                'contacts' => null
            ]);
        }
    }
}