<?php

namespace App\Http\Controllers;

use App\Models\Contacts;
use App\Models\Company;
use Inertia\Inertia;

class ContactsController extends Controller
{
    public function index()
    {
        $contacts = Contacts::all();
        $companies = Company::all();

        return Inertia::render('landing-page/contact', [
            'contacts' => $contacts,
            'companies' => $companies
        ]);
    }
}
