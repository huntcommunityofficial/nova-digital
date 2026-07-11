<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\ChatSession;
use Illuminate\Http\Request;

class AdminChatController extends Controller
{
    /**
     * List all open chat sessions with unread count and last message.
     */
    public function sessions()
    {
        $sessions = ChatSession::with(['user:id,name,email'])
            ->withCount(['messages as unread_count' => function ($q) {
                $q->where('sender', 'user')->whereNull('read_at');
            }])
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'status' => $s->status,
                'user' => $s->user,
                'unread_count' => $s->unread_count,
                'last_message' => $s->messages()->latest()->value('message'),
                'updated_at' => $s->updated_at,
            ]);

        return response()->json($sessions);
    }

    /**
     * Get all messages in a session.
     * Supports ?last_id=X for polling.
     */
    public function messages(Request $request, ChatSession $session)
    {
        $query = $session->messages()->orderBy('id');

        if ($request->filled('last_id')) {
            $query->where('id', '>', (int) $request->last_id);
        }

        $messages = $query->get(['id', 'sender', 'message', 'created_at']);

        // Mark user messages as read
        $session->messages()
            ->where('sender', 'user')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['messages' => $messages]);
    }

    /**
     * Admin sends a reply.
     */
    public function reply(Request $request, ChatSession $session)
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $message = ChatMessage::create([
            'session_id' => $session->id,
            'sender' => 'admin',
            'message' => $request->message,
        ]);

        // Touch session so it bubbles to top of list
        $session->touch();

        return response()->json(['message' => $message], 201);
    }

    /**
     * Close a chat session.
     */
    public function close(ChatSession $session)
    {
        $session->update(['status' => 'closed']);

        return response()->json(['message' => 'Session closed.']);
    }

    /**
     * Total unread count across all sessions (for badge).
     */
    public function unreadCount()
    {
        $count = ChatMessage::where('sender', 'user')
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    public function reopen(ChatSession $session)
    {
        $session->update(['status' => 'open']);

        return response()->json(['message' => 'Session reopened.']);
    }

    /**
     * Admin gets messages for a specific order's chat.
     */
    public function orderMessages(Request $request, \App\Models\Order $order)
    {
        $session = ChatSession::where('order_id', $order->id)->first();

        if (! $session) {
            return response()->json(['session_id' => null, 'messages' => []]);
        }

        $query = $session->messages()->orderBy('id');

        if ($request->filled('last_id')) {
            $query->where('id', '>', (int) $request->last_id);
        }

        $messages = $query->get(['id', 'sender', 'message', 'created_at']);

        // Mark user messages as read
        $session->messages()
            ->where('sender', 'user')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'session_id' => $session->id,
            'messages' => $messages,
        ]);
    }

    /**
     * Admin replies in an order chat.
     */
    public function orderReply(Request $request, \App\Models\Order $order)
    {
        $request->validate(['message' => 'required|string|max:1000']);

        // Create session if it doesn't exist yet (admin initiates)
        $session = ChatSession::firstOrCreate([
            'order_id' => $order->id,
        ], [
            'user_id' => $order->user_id,
            'status' => 'open',
        ]);

        $message = ChatMessage::create([
            'session_id' => $session->id,
            'sender' => 'admin',
            'message' => $request->message,
        ]);

        $session->touch();

        return response()->json(['message' => $message], 201);
    }
}
