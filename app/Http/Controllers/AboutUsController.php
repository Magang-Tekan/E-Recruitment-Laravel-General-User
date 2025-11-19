<?php

namespace App\Http\Controllers;

use App\Models\AboutUs;
use App\Models\Company;
use App\Models\Contacts; // Changed from Contact to Contacts
use Inertia\Inertia;

class AboutUsController extends Controller
{
    public function index()
    {
        try {
            $aboutUs = AboutUs::where('company_id', 1)->first();
            
            // Ambil semua data company termasuk website dan logo
            // Ambil company yang featured atau fallback ke ID 2 dan 3
            $allCompanies = Company::where(function($query) {
                    $query->where('featured', true)
                          ->orWhereIn('id', [2, 3]);
                })
                ->select('id', 'name', 'description', 'website', 'logo', 'email', 'phone', 'address', 'display_order')
                ->orderBy('display_order', 'asc')
                ->orderBy('id', 'asc')
                ->get();
            
            // Jika tidak ada yang featured, ambil semua company
            if ($allCompanies->isEmpty()) {
                $allCompanies = Company::select('id', 'name', 'description', 'website', 'logo', 'email', 'phone', 'address', 'display_order')
                    ->orderBy('display_order', 'asc')
                    ->orderBy('id', 'asc')
                    ->get();
            }
            
            \Log::info('Companies found in database:', [
                'count' => $allCompanies->count(),
                'ids' => $allCompanies->pluck('id')->toArray(),
                'names' => $allCompanies->pluck('name')->toArray()
            ]);
            
            $companies = $allCompanies->map(function ($company) {
                return [
                    'id' => $company->id,
                    'name' => $company->name,
                    'description' => $company->description,
                    'website' => $company->website,
                    'logo' => $company->getLogoUrl(),
                    'email' => $company->email,
                    'phone' => $company->phone,
                    'address' => $company->address,
                ];
            })->values()->toArray(); // Convert to array to ensure proper JSON serialization
            
            \Log::info('Companies formatted for frontend:', [
                'count' => count($companies),
                'companies' => $companies
            ]);
            
            // Changed Contact to Contacts
            $contacts = Contacts::first();
            if ($contacts) {
                $contacts->phone = 'Rudy Alfiansyah: 082137384029<br />Deden Dermawan: 081807700111';
            }

            return Inertia::render('landing-page/about-us', [
                'aboutUsData' => $aboutUs,
                'companies' => $companies,
                'contacts' => $contacts
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in AboutUsController::index: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return Inertia::render('landing-page/about-us', [
                'aboutUsData' => null,
                'companies' => [],
                'contacts' => null
            ]);
        }
    }
}
