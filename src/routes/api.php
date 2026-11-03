<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\InvitationController; // <-- MUST BE IMPORTED
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Authenticated Sanctum routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user/profile', function (Request $request) {
        return response()->json($request->user()->load('organizations'));
    });

    Route::apiResource('projects', ProjectController::class);

    // Task endpoints
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
    Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);
    Route::patch('/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);

    // Team & Invitations
    Route::get('/organization/members', [InvitationController::class, 'members']);
    Route::post('/organization/invitations', [InvitationController::class, 'invite']);
});