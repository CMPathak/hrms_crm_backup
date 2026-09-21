<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    private function authorizeAdmin(Request $request): void
    {
        $user = $request->user();
        if (!$user || !$user->isAdmin()) {
            abort(403, 'Unauthorized. Only Super Admin and Admin can access User Management modification.');
        }
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        if (!$user || (!$user->isAdmin() && !$user->hasRole('sales_manager'))) {
            abort(403, 'Unauthorized. Only Admin and Sales Manager can view Users.');
        }

        $currentTab = strtolower($request->input('tab', 'all'));
        $search = $request->input('search', '');

        // Base user query with role
        $query = User::with('role')->orderBy('id', 'desc');

        if ($request->user() && $request->user()->hasRole('sales_manager')) {
            $query->whereHas('role', function ($q) {
                $q->where('role_name', 'sales');
            });
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Tab Filtering
        if ($currentTab === 'developers') {
            $query->whereHas('role', function ($q) {
                $q->whereIn('role_name', ['developer', 'developer_manager', 'designer']);
            });
        } elseif ($currentTab === 'seo') {
            $query->whereHas('role', function ($q) {
                $q->whereIn('role_name', ['seo_executive', 'seo_manager', 'google_ads_executive']);
            });
        } elseif ($currentTab === 'sales') {
            $query->whereHas('role', function ($q) {
                $q->whereIn('role_name', ['sales', 'sales_manager']);
            });
        } elseif ($currentTab === 'admins') {
            $query->whereHas('role', function ($q) {
                $q->whereIn('role_name', ['super_admin', 'admin', 'hr', 'accounts']);
            });
        }

        $users = $query->get()->map(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'status' => $u->status ?? 'active',
                'role_id' => $u->role_id,
                'role' => $u->role ? [
                    'id' => $u->role->id,
                    'role_name' => $u->role->role_name,
                    'display_name' => $u->role->display_name,
                ] : null,
                'created_at' => $u->created_at ? Carbon::parse($u->created_at)->format('M d, Y') : '—',
            ];
        });

        // Metrics for Header Cards
        $developerTeamCount = User::whereHas('role', function ($q) {
            $q->whereIn('role_name', ['developer', 'developer_manager', 'designer']);
        })->count();

        $seoTeamCount = User::whereHas('role', function ($q) {
            $q->whereIn('role_name', ['seo_executive', 'seo_manager', 'google_ads_executive']);
        })->count();

        $salesTeamCount = User::whereHas('role', function ($q) {
            $q->whereIn('role_name', ['sales', 'sales_manager']);
        })->count();

        $visibleUsersCount = User::where('status', 'active')->count();

        // Roles list for dropdown
        $roles = Role::orderBy('display_name', 'asc')->get(['id', 'role_name', 'display_name', 'description']);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'metrics' => [
                'developer_count' => $developerTeamCount,
                'seo_count' => $seoTeamCount,
                'sales_count' => $salesTeamCount,
                'visible_count' => $visibleUsersCount,
                'total_filtered' => $users->count(),
            ],
            'currentTab' => $currentTab,
            'search' => $search,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'password' => 'required|string|min:6',
            'status' => 'required|in:active,inactive',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role_id' => $validated['role_id'],
            'password' => Hash::make($validated['password']),
            'status' => $validated['status'],
            'created_at' => now(),
        ]);

        return back()->with('success', "User {$validated['name']} created successfully!");
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'role_id' => 'required|exists:roles,id',
            'password' => 'nullable|string|min:6',
            'status' => 'required|in:active,inactive',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role_id' => $validated['role_id'],
            'status' => $validated['status'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return back()->with('success', "User {$user->name} updated successfully!");
    }

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAdmin($request);

        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot change your own active status.');
        }

        $newStatus = ($user->status === 'active') ? 'inactive' : 'active';
        $user->update(['status' => $newStatus]);

        return back()->with('success', "User {$user->name} status changed to {$newStatus}!");
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAdmin($request);
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        // Clean up or reassign dependencies before deleting
        DB::transaction(function () use ($user) {
            // Null out assignment references in project_assignments
            DB::table('project_assignments')->where('developer_id', $user->id)->update(['developer_id' => null]);
            DB::table('project_assignments')->where('designer_id', $user->id)->update(['designer_id' => null]);
            DB::table('project_assignments')->where('seo_executive_id', $user->id)->update(['seo_executive_id' => null]);

            // Reassign or delete tasks assigned to user
            DB::table('tasks')->where('assigned_to', $user->id)->delete();
            DB::table('tasks')->where('assigned_by', $user->id)->update(['assigned_by' => auth()->id() ?? 1]);

            // Delete associated employee record if any
            DB::table('employees')->where('user_id', $user->id)->delete();

            // Finally delete the user
            $user->delete();
        });

        return back()->with('success', "User deleted successfully!");
    }
}
