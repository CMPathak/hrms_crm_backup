<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $currentUser = $request->user();
        $isManager = $currentUser->isAdmin();
        $today = Carbon::today()->toDateString();

        // Filters
        $search = $request->input('search');
        $status = $request->input('status');
        $priority = $request->input('priority');
        $projectId = $request->input('project_id');
        $assignedTo = $request->input('assigned_to');

        // Base Query
        $query = Task::with([
            'project:id,project_name',
            'assignee:id,name,email',
            'assigner:id,name',
        ]);

        if (!$isManager) {
            $query->where('assigned_to', $currentUser->id);
        } elseif ($assignedTo) {
            $query->where('assigned_to', $assignedTo);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        if ($priority) {
            $query->where('priority', $priority);
        }

        if ($status) {
            if ($status === 'Today') {
                $query->whereDate('due_date', $today);
            } elseif ($status === 'Overdue') {
                $query->where('due_date', '<', $today)->where('status', '!=', 'Completed');
            } elseif ($status === 'Upcoming') {
                $query->where('due_date', '>', $today)->where('status', '!=', 'Completed');
            } else {
                $query->where('status', $status);
            }
        }

        $tasks = $query->orderBy('due_date', 'asc')->orderBy('id', 'desc')->get();

        // Stats calculation
        $baseStatQuery = Task::query();
        if (!$isManager) {
            $baseStatQuery->where('assigned_to', $currentUser->id);
        }

        $stats = [
            'today' => (clone $baseStatQuery)->whereDate('due_date', $today)->count(),
            'pending' => (clone $baseStatQuery)->where('status', 'Pending')->count(),
            'completed' => (clone $baseStatQuery)->where('status', 'Completed')->count(),
            'overdue' => (clone $baseStatQuery)->where('due_date', '<', $today)->where('status', '!=', 'Completed')->count(),
            'upcoming' => (clone $baseStatQuery)->where('due_date', '>', $today)->where('status', '!=', 'Completed')->count(),
            'total' => (clone $baseStatQuery)->count(),
        ];

        $projects = Project::select('id', 'project_name')->orderBy('project_name')->get();
        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'stats' => $stats,
            'projects' => $projects,
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
                'priority' => $priority ?? '',
                'project_id' => $projectId ?? '',
                'assigned_to' => $assignedTo ?? '',
            ],
            'isManager' => $isManager,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $input = $request->all();
        if (empty($input['project_id'])) {
            $input['project_id'] = null;
        }

        $validated = validator($input, [
            'title' => 'required|string|max:255',
            'project_id' => 'nullable|exists:projects,id',
            'assigned_to' => 'required|exists:users,id',
            'due_date' => 'required|date',
            'priority' => 'required|in:High,Medium,Low',
            'status' => 'nullable|in:Today,Pending,Completed,Overdue,Upcoming',
            'description' => 'nullable|string',
        ])->validate();

        $validated['assigned_by'] = $request->user()->id;
        $validated['status'] = $validated['status'] ?? 'Pending';
        $validated['project_id'] = !empty($validated['project_id']) ? $validated['project_id'] : null;

        Task::create($validated);

        return back()->with('success', 'Task assigned successfully!');
    }

    public function update(Request $request, Task $task): RedirectResponse
    {
        $input = $request->all();
        if (empty($input['project_id'])) {
            $input['project_id'] = null;
        }

        $validated = validator($input, [
            'title' => 'required|string|max:255',
            'project_id' => 'nullable|exists:projects,id',
            'assigned_to' => 'required|exists:users,id',
            'due_date' => 'required|date',
            'priority' => 'required|in:High,Medium,Low',
            'status' => 'required|in:Today,Pending,Completed,Overdue,Upcoming',
            'description' => 'nullable|string',
        ])->validate();

        $validated['project_id'] = !empty($validated['project_id']) ? $validated['project_id'] : null;

        $task->update($validated);

        return back()->with('success', 'Task updated successfully!');
    }

    public function updateStatus(Request $request, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:Today,Pending,Completed,Overdue,Upcoming',
        ]);

        $task->update(['status' => $validated['status']]);

        return back()->with('success', "Task marked as {$validated['status']}!");
    }

    public function destroy(Task $task): RedirectResponse
    {
        $task->delete();

        return back()->with('success', 'Task deleted successfully!');
    }
}
