<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactMessagesController extends Controller
{
    /**
     * Display a listing of the contact messages.
     */
    public function index()
    {
        $messages = ContactMessage::orderBy('created_at', 'desc')
            ->paginate(10);
            
        return Inertia::render('Admin/ContactMessages/Index', [
            'messages' => $messages,
        ]);
    }

    /**
     * Display the specified contact message.
     */
    public function show(ContactMessage $contactMessage)
    {
        // Mark as read when viewed
        if (!$contactMessage->is_read) {
            $contactMessage->update(['is_read' => true]);
        }
        
        return Inertia::render('Admin/ContactMessages/Show', [
            'message' => $contactMessage,
        ]);
    }

    /**
     * Remove the specified contact message from storage.
     */
    public function destroy(ContactMessage $contactMessage)
    {
        $contactMessage->delete();
        
        return redirect()->route('admin.contact-messages.index')
            ->with('success', 'Pesan berhasil dihapus');
    }
    
    /**
     * Mark message as read
     */
    public function markAsRead(ContactMessage $contactMessage)
    {
        $contactMessage->update(['is_read' => true]);
        
        return redirect()->back()
            ->with('success', 'Pesan berhasil ditandai sebagai telah dibaca');
    }

    /**
     * Store a newly created contact message in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string'
        ]);

        try {
            ContactMessage::create($validated);
            
            return back()->with('success', 'Pesan berhasil dikirim!');
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan saat mengirim pesan.');
        }
    }
}
