<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        ContactMessage::create($request->only('name', 'email', 'subject', 'message'));

        return response()->json(['message' => 'Message received.'], 201);
    }

    public function index()
    {
        return response()->json(
            ContactMessage::orderByDesc('created_at')->get()
        );
    }

    public function update(Request $request, ContactMessage $contact)
    {
        $request->validate(['status' => 'required|in:unread,read,replied']);
        $contact->update(['status' => $request->status]);

        return response()->json(['message' => 'Updated.', 'contact' => $contact]);
    }
}
