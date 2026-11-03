<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    public function members(Request $request)
    {
        $user = $request->user()->load('organizations');
        $org = $user->organizations->first();

        if (!$org) {
            return response()->json([], 200);
        }

        $members = $org->users()->select('users.id', 'users.name', 'users.email')->get();
        return response()->json($members, 200);
    }

    public function invite(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|email',
            'role'  => 'nullable|in:admin,member',
        ]);

        $user = $request->user()->load('organizations');
        $org = $user->organizations->first();

        if (!$org) {
            return response()->json(['message' => 'No active organization.'], 422);
        }

        $callerRole = $org->pivot->role ?? 'member';
        if (!in_array($callerRole, ['owner', 'admin'])) {
            return response()->json(['message' => 'Unauthorized. Only admins can invite members.'], 403);
        }

        if ($org->users()->where('email', $fields['email'])->exists()) {
            return response()->json(['message' => 'User is already a member of this organization.'], 422);
        }

        $token = Str::random(40);

        $invitation = Invitation::updateOrCreate(
            ['organization_id' => $org->id, 'email' => $fields['email']],
            ['role' => $fields['role'] ?? 'member', 'token' => $token, 'accepted_at' => null]
        );

        $existingUser = User::where('email', $fields['email'])->first();
        if ($existingUser) {
            $org->users()->syncWithoutDetaching([$existingUser->id => ['role' => $invitation->role]]);
            $invitation->update(['accepted_at' => now()]);
            return response()->json(['message' => "User {$existingUser->name} added to team directly."], 201);
        }

        return response()->json([
            'message' => 'Invitation generated successfully.',
            'invitation_token' => $token,
        ], 201);
    }
}