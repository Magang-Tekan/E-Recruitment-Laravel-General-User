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
            $companies = Company::whereIn('id', [2, 3])
                ->select('id', 'name', 'description')
                ->get();
            
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
            \Log::error('Error loading about us data: ' . $e->getMessage());
            return Inertia::render('landing-page/about-us', [
                'aboutUsData' => null,
                'companies' => [],
                'contacts' => null
            ]);
        }
    }
}
