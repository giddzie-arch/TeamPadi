<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|string|email|max:255|unique:users',
            'password'              => 'required|string|min:6|confirmed',
            'company_name'          => 'required|string|max:255',
            'industry'              => 'nullable|string|max:255',
            'team_size'             => 'nullable|string|max:50',
            'default_methodology'   => 'nullable|in:kanban,scrum,waterfall,simple',
        ]);

        // Wrap in a transaction so either both user and organization are created or neither is
        $result = DB::transaction(function () use ($fields) {
            $organization = Organization::create([
                'name'                => $fields['company_name'],
                'industry'            => $fields['industry'] ?? null,
                'team_size'           => $fields['team_size'] ?? '1-5',
                'default_methodology' => $fields['default_methodology'] ?? 'kanban',
            ]);

            $user = User::create([
                'name'     => $fields['name'],
                'email'    => $fields['email'],
                'password' => $fields['password'],
            ]);

            // Assign registering user as organization owner
            $organization->users()->attach($user->id, ['role' => 'owner']);

            return [
                'user'         => $user->load('organizations'),
                'organization' => $organization,
                'token'        => $user->createToken('api-token')->plainTextToken,
            ];
        });

        return response()->json($result, 201);
    }

    public function login(Request $request)
    {
        $fields = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::with('organizations')->where('email', $fields['email'])->first();

        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json([
                'message' => 'The provided credentials do not match our records.'
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
    }
}