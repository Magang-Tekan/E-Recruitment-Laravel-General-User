<?php

namespace App\Http\Controllers;

use App\Models\Companies;
use Inertia\Inertia;

class AboutUsController extends Controller
{
    public function index()
    {
        // Ambil semua data perusahaan
        $companies = Companies::all();

        return Inertia::render('landing-page/about-us', [
            'companies' => $companies,
        ]);
    }
}
