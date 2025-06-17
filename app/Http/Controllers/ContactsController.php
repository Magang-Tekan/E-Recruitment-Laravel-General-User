<?php

namespace App\Http\Controllers;

use App\Models\Contacts;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactsController extends Controller
{
    // Tampilkan halaman kontak dengan data dari database
    public function index()
    {
        $contacts = Contacts::all();
        return Inertia::render('landing-page/contact', [
            'contacts' => $contacts,
        ]);
    }

    // Simpan data kontak baru (untuk Admin)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:contacts,email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        $contact = Contacts::create($validated);

        return redirect()->back()->with('success', 'Kontak berhasil ditambahkan!');
    }

    // Menangani pengiriman pesan dari form kontak
    public function submitMessage(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        // Simpan pesan ke database
        $contactMessage = \App\Models\ContactMessage::create($validated);

        // Kirim email notifikasi ke HR/Admin
        try {
            $hrEmail = config('mail.admin_email', 'autentik.info@gmail.com');
            \Mail::to($hrEmail)->send(new \App\Mail\ContactFormSubmission($contactMessage));

            return response()->json([
                'success' => true,
                'message' => 'Pesan Anda berhasil dikirim! Kami akan menghubungi Anda segera.'
            ]);
        } catch (\Exception $e) {
            \Log::error('Error sending contact form email: ' . $e->getMessage());

            return response()->json([
                'success' => true, // Still return success to user even if email fails
                'message' => 'Pesan Anda berhasil dikirim! Kami akan menghubungi Anda segera.'
            ]);
        }
    }
}
