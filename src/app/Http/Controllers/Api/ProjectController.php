<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $projects = $request->user()
            ->projects()
            ->with(['user:id,name,email', 'tasks.assignee:id,name,email'])
            ->latest()
            ->paginate(10);

        return response()->json($projects, Response::HTTP_OK);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $request->user()->projects()->create($request->validated());

        return response()->json([
            'message' => 'Project created successfully.',
            'data'    => $project,
        ], Response::HTTP_CREATED);
    }

    public function show(Project $project): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        return response()->json($project->load('tasks'), Response::HTTP_OK);
    }

    public function destroy(Project $project): JsonResponse
    {
        if ($project->user_id !== auth()->id()) {
            return response()->json(['message' => 'Forbidden.'], Response::HTTP_FORBIDDEN);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted.'], Response::HTTP_OK);
    }
}