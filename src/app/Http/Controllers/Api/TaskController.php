<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // GET /api/projects/{project}/tasks
    public function index(Project $project)
    {
        $tasks = $project->tasks()->with('assignee:id,name,email')->latest()->get();
        return response()->json($tasks, 200);
    }

    // POST /api/projects/{project}/tasks
    public function store(Request $request, Project $project)
    {
        $fields = $request->validate([
            'title'       => 'required|string|max:255',
            'status'      => 'nullable|in:todo,in_progress,done',
            'priority'    => 'nullable|in:low,medium,high',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date'    => 'nullable|date',
        ]);

        $task = $project->tasks()->create([
            'title'       => $fields['title'],
            'status'      => $fields['status'] ?? 'todo',
            'priority'    => $fields['priority'] ?? 'medium',
            'assigned_to' => $fields['assigned_to'] ?? null,
            'due_date'    => $fields['due_date'] ?? null,
        ]);

        return response()->json($task->load('assignee:id,name,email'), 201);
    }

    // PATCH /api/tasks/{task}
    public function update(Request $request, Task $task)
    {
        $fields = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'status'      => 'sometimes|required|in:todo,in_progress,done',
            'priority'    => 'sometimes|required|in:low,medium,high',
            'assigned_to' => 'nullable|exists:users,id',
            'due_date'    => 'nullable|date',
        ]);

        $task->update($fields);

        return response()->json($task->load('assignee:id,name,email'), 200);
    }

    // DELETE /api/tasks/{task}
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->json(['message' => 'Task deleted successfully.'], 200);
    }
}