<?php

namespace App\Http\Controllers;

use App\Models\Companies;
use Inertia\Inertia;

class AboutUsController extends Controller
{
    public function index()
    {
        try {
            $aboutUs = \App\Models\AboutUs::with('company')->get();
            
            return Inertia::render('landing-page/about-us', [
                'aboutUs' => $aboutUs
            ]);
        } catch (\Exception $e) {
            \Log::error('Error loading about us data: ' . $e->getMessage());
            
            // Return empty array if error occurs
            return Inertia::render('landing-page/about-us', [
                'aboutUs' => []
            ]);
        }
    }
}
