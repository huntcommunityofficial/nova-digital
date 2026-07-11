<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\ChatSession;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Get or create the logged-in user's chat session.
     */
    public function getSession()
    {
        $session = ChatSession::firstOrCreate(
            ['user_id' => auth()->id(), 'status' => 'open'],
        );

        return response()->json(['session_id' => $session->id]);
    }

    /**
     * Get messages for the user's session.
     * Supports ?last_id=X to only return new messages (for polling).
     */
    public function messages(Request $request)
    {
        $session = ChatSession::where('user_id', auth()->id())
            ->where('status', 'open')
            ->first();

        if (! $session) {
            return response()->json(['messages' => []]);
        }

        $query = $session->messages()->orderBy('id');

        if ($request->filled('last_id')) {
            $query->where('id', '>', (int) $request->last_id);
        }

        $messages = $query->get(['id', 'sender', 'message', 'created_at']);

        // Mark admin messages as read
        $session->messages()
            ->where('sender', 'admin')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['messages' => $messages]);
    }

    /**
     * Send a message from the user.
     */
    public function send(Request $request)
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $session = ChatSession::firstOrCreate(
            ['user_id' => auth()->id(), 'status' => 'open'],
        );

        $message = ChatMessage::create([
            'session_id' => $session->id,
            'sender' => 'user',
            'message' => $request->message,
        ]);

        return response()->json(['message' => $message], 201);
    }

    /**
     * Get or create order-specific chat session, then return messages.
     * Supports ?last_id=X for polling.
     */
    public function orderMessages(Request $request, \App\Models\Order $order)
    {
        // Make sure this order belongs to the logged-in user
        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $session = ChatSession::firstOrCreate([
            'user_id' => auth()->id(),
            'order_id' => $order->id,
        ], ['status' => 'open']);

        $query = $session->messages()->orderBy('id');

        if ($request->filled('last_id')) {
            $query->where('id', '>', (int) $request->last_id);
        }

        $messages = $query->get(['id', 'sender', 'message', 'created_at']);

        // Mark admin messages as read
        $session->messages()
            ->where('sender', 'admin')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'session_id' => $session->id,
            'messages' => $messages,
        ]);
    }

    /**
     * User sends a message in an order chat.
     */
    public function orderSend(Request $request, \App\Models\Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate(['message' => 'required|string|max:1000']);

        $session = ChatSession::firstOrCreate([
            'user_id' => auth()->id(),
            'order_id' => $order->id,
        ], ['status' => 'open']);

        $message = ChatMessage::create([
            'session_id' => $session->id,
            'sender' => 'user',
            'message' => $request->message,
        ]);

        $session->touch();

        return response()->json(['message' => $message], 201);
    }
}
