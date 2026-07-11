<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'created_at' => $u->created_at,
            ]);

        return response()->json($users);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,'.$user->id,
            'role' => 'sometimes|in:user,admin',
            'password' => 'sometimes|nullable|string|min:8',
        ]);

        // Prevent removing last admin
        if (
            isset($request->role) &&
            $request->role === 'user' &&
            $user->role === 'admin' &&
            User::where('role', 'admin')->count() <= 1
        ) {
            return response()->json([
                'message' => 'Cannot remove the last administrator.',
            ], 422);
        }

        $data = $request->only(['name', 'email', 'role']);

        if ($request->filled('password')) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->update($data);
        // $user->update($request->only(['name', 'email', 'role']));

        return response()->json(['message' => 'User updated.', 'user' => $user]);
    }

    public function destroy(User $user)
    {
        // Prevent deleting last admin
        if (
            $user->role === 'admin' &&
            User::where('role', 'admin')->count() <= 1
        ) {
            return response()->json([
                'message' => 'Cannot delete the last administrator.',
            ], 422);
        }

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'You cannot delete your own account from here.',
            ], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted.']);
    }
}
